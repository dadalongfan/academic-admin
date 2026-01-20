<template>
  <div class="gallery-manage">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 分类管理 -->
      <el-tab-pane label="分类管理" name="categories">
        <div class="section-header">
          <el-button type="primary" @click="openCategoryDialog">
            <el-icon><Plus /></el-icon>
            添加分类
          </el-button>
        </div>

        <!-- 分类列表 -->
        <el-table :data="categories" border stripe v-loading="loading">
          <el-table-column type="index" label="#" width="60" />
          <el-table-column prop="name" label="分类名称" min-width="150" />
          <el-table-column prop="description" label="分类描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="sortOrder" label="排序" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="success">启用</el-tag>
              <el-tag v-else type="info">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openCategoryDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteCategory(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分类编辑对话框 -->
        <el-dialog
          v-model="categoryDialogVisible"
          :title="categoryDialogTitle"
          width="500px"
          @close="resetCategoryForm"
        >
          <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="name">
              <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
            </el-form-item>
            <el-form-item label="分类描述">
              <el-input v-model="categoryForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
            </el-form-item>
            <el-form-item label="排序顺序">
              <el-input-number v-model="categoryForm.sortOrder" :min="0" />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="categoryForm.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="categoryDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitCategory">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 图片管理 -->
      <el-tab-pane label="图片管理" name="images">
        <div class="section-header">
          <el-button type="primary" @click="openImageDialog()">
            <el-icon><Plus /></el-icon>
            添加图片
          </el-button>
        </div>

        <div class="filter-bar">
          <el-select v-model="filterCategoryId" placeholder="选择分类" clearable style="width: 200px; margin-right: 10px" @change="loadImages">
            <el-option label="全部分类" value="" />
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </div>

        <div class="image-grid" v-loading="imageLoading">
          <el-empty v-if="images.length === 0" description="暂无图片" />

          <div v-for="image in images" :key="image.id" class="image-item">
            <div class="image-preview">
              <img :src="image.imageUrl" :alt="image.description" @error="handleImageError" />
            </div>
            <div class="image-info">
              <h4 class="image-title">{{ image.description || '无标题' }}</h4>
              <p class="image-category">{{ getCategoryName(image.categoryId) }}</p>
              <div class="image-actions">
                <el-button size="small" @click="openImageDialog(image)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteImage(image.id)">删除</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 图片编辑对话框 -->
        <el-dialog
          v-model="imageDialogVisible"
          :title="imageDialogTitle"
          width="600px"
          @close="resetImageForm"
        >
          <el-form :model="imageForm" :rules="imageRules" ref="imageFormRef" label-width="100px">
            <el-form-item label="图片" prop="imageUrl">
              <el-upload
                class="image-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleImageUploadSuccess"
                :before-upload="beforeImageUpload"
              >
                <el-button size="small" type="primary">
                  <el-icon><Upload /></el-icon>
                  上传图片
                </el-button>
              </el-upload>
              <div class="image-preview-container" v-if="imageForm.imageUrl">
                <img :src="imageForm.imageUrl" :alt="imageForm.description" style="max-width: 100%; max-height: 300px; margin-top: 10px;" />
                <el-button
                  size="small"
                  type="danger"
                  plain
                  @click.stop="removeImage"
                  style="margin-top: 10px"
                >
                  <el-icon><Delete /></el-icon>
                  删除图片
                </el-button>
              </div>
              <el-input v-model="imageForm.imageUrl" placeholder="或直接输入图片URL" style="margin-top: 10px;" />
            </el-form-item>
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="imageForm.categoryId" placeholder="请选择分类">
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="图片描述">
              <el-input
                v-model="imageForm.description"
                type="textarea"
                :rows="4"
                placeholder="请输入图片描述"
              />
            </el-form-item>
            <el-form-item label="上传日期">
              <el-date-picker
                v-model="imageForm.uploadDate"
                value-format="YYYY-MM-DD"
                placeholder="选择上传日期"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="imageForm.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="imageDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitImage">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Delete } from '@element-plus/icons-vue'
import request from '../utils/api'

const activeTab = ref('categories')
const loading = ref(false)
const imageLoading = ref(false)
const categoryDialogVisible = ref(false)
const imageDialogVisible = ref(false)
const categoryDialogTitle = ref('')
const imageDialogTitle = ref('')
const categoryFormRef = ref(null)
const imageFormRef = ref(null)

// 分类相关
const categories = ref([])
const categoryForm = reactive({
  id: null,
  name: '',
  description: '',
  sortOrder: 0,
  status: 1
})

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 图片上传配置
const uploadUrl = ref(`${request.defaults.baseURL}/upload/image`)

// 图片相关
const images = ref([])
const filterCategoryId = ref('')
const imageForm = reactive({
  id: null,
  imageUrl: '',
  categoryId: null,
  description: '',
  uploadDate: '',
  status: 1
})

const imageRules = {
  imageUrl: [{ required: true, message: '请上传图片或输入图片URL', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

// 图片上传成功处理
const handleImageUploadSuccess = (response) => {
  if (response.code === 200) {
    imageForm.imageUrl = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败：' + (response.message || '未知错误'))
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片格式文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB')
    return false
  }
  return true
}

// 删除图片
const removeImage = () => {
  imageForm.imageUrl = ''
  ElMessage.success('图片已删除')
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

// 切换标签页
const handleTabChange = (tabName) => {
  if (tabName === 'categories') {
    loadCategories()
  } else if (tabName === 'images') {
    loadCategories()
    loadImages()
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    loading.value = true
    const res = await request.get('/gallery-categories/list/all')
    categories.value = res.data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

// 加载图片列表
const loadImages = async () => {
  try {
    imageLoading.value = true
    let url = '/gallery-images/list/all'
    if (filterCategoryId.value) {
      url = `/gallery-images/category/${filterCategoryId.value}`
    }
    const res = await request.get(url)
    images.value = res.data || []
  } catch (error) {
    ElMessage.error('加载图片失败')
  } finally {
    imageLoading.value = false
  }
}

// 打开分类对话框
const openCategoryDialog = (row = null) => {
  categoryDialogTitle.value = row ? '编辑分类' : '添加分类'
  if (row) {
    Object.assign(categoryForm, row)
  } else {
    resetCategoryForm()
  }
  categoryDialogVisible.value = true
}

// 提交分类表单
const handleSubmitCategory = async () => {
  if (!categoryFormRef.value) return

  try {
    await categoryFormRef.value.validate()

    if (categoryForm.id) {
      await request.put(`/gallery-categories/${categoryForm.id}`, categoryForm)
    } else {
      await request.post('/gallery-categories', categoryForm)
    }

    ElMessage.success('操作成功')
    categoryDialogVisible.value = false
    loadCategories()
  } catch (error) {
    console.error(error)
  }
}

// 删除分类
const handleDeleteCategory = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？删除后相关图片的分类ID将为空', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/gallery-categories/${id}`)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置分类表单
const resetCategoryForm = () => {
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields()
  }
  Object.assign(categoryForm, {
    id: null,
    name: '',
    description: '',
    sortOrder: 0,
    status: 1
  })
}

// 打开图片对话框
const openImageDialog = (row) => {
  imageDialogTitle.value = row ? '编辑图片' : '添加图片'
  if (row) {
    Object.assign(imageForm, {
      ...row,
      categoryId: row.categoryId
    })
  } else {
    resetImageForm()
  }
  imageDialogVisible.value = true
}

// 提交图片表单
const handleSubmitImage = async () => {
  if (!imageFormRef.value) return

  try {
    await imageFormRef.value.validate()

    if (imageForm.id) {
      await request.put(`/gallery-images/${imageForm.id}`, imageForm)
    } else {
      await request.post('/gallery-images', imageForm)
    }

    ElMessage.success('操作成功')
    imageDialogVisible.value = false
    loadImages()
  } catch (error) {
    console.error(error)
  }
}

// 删除图片
const handleDeleteImage = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个图片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/gallery-images/${id}`)
    ElMessage.success('删除成功')
    loadImages()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置图片表单
const resetImageForm = () => {
  if (imageFormRef.value) {
    imageFormRef.value.resetFields()
  }
  Object.assign(imageForm, {
    id: null,
    imageUrl: '',
    categoryId: null,
    description: '',
    uploadDate: '',
    status: 1
  })
}

// 图片加载失败处理
const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/300x200/cccccc/666666?text=Image+Error'
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.gallery-manage {
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.filter-bar {
  margin-bottom: 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.image-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.image-preview {
  position: relative;
  padding-top: 66.67%; /* 3:2 比例 */
  background: #f5f5f5;
}

.image-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 15px;
}

.image-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-category {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.image-actions {
  display: flex;
  gap: 8px;
}

.image-uploader {
  margin-bottom: 10px;
}

.image-preview-container {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}
</style>