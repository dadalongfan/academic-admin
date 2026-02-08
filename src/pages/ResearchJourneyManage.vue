<template>
  <div class="journey-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>研究征途列表</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加征途
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadJourneyList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 征途表格 -->
      <el-table :data="journeyList" border stripe v-loading="loading">
        <el-table-column type="index" label="#" width="60" />

        <el-table-column label="封面图片" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="getFullImageUrl(row.coverImage)"
              :preview-src-list="[getFullImageUrl(row.coverImage)]"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px"
            />
            <span v-else style="color: #999; font-size: 12px">无封面</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

        <el-table-column prop="summary" label="摘要" min-width="250" show-overflow-tooltip />

        <el-table-column prop="createdAt" label="创建日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else type="info">下架</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="封面图片">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleCoverChange"
            :show-file-list="false"
            accept="image/*"
          >
            <el-button size="small" type="primary">
              <el-icon><Upload /></el-icon>
              上传封面图
            </el-button>
          </el-upload>
          <div v-if="coverPreview || form.coverImage" class="cover-preview">
            <img :src="coverPreview || getFullImageUrl(form.coverImage)" alt="封面预览" />
            <el-button
              size="small"
              type="danger"
              @click="removeCover"
              style="margin-top: 10px"
            >
              <el-icon><Delete /></el-icon>
              删除封面
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入摘要（列表页显示）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
            />
            <Editor
              v-model="editorContent"
              :defaultConfig="editorConfig"
              @onCreated="handleEditorCreated"
              @onChange="handleEditorChange"
            />
          </div>
        </el-form-item>

        <el-form-item label="排序权重">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
          <span style="margin-left: 10px; color: #999; font-size: 12px">数值越大越靠前</span>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Delete } from '@element-plus/icons-vue'
import request, { getFullImageUrl, API_BASE_URL } from '../utils/api'
// 导入WangEditor
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
// 引入公共编辑器配置
import { toolbarConfig, editorConfig, imageManager } from '../utils/editorConfig'

// 搜索表单
const searchForm = reactive({
  status: ''
})

// 征途列表
const journeyList = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑征途' : '添加征途')
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  title: '',
  coverImage: '',
  summary: '',
  content: '',
  status: 1,
  sortOrder: 0
})

// 封面图预览
const uploadRef = ref(null)
const selectedCoverFile = ref(null)
const coverPreview = ref('')

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// WangEditor 配置
const editorRef = ref(null)
const editorContent = ref('')

// 监听编辑器内容变化
const handleEditorChange = (editor) => {
  editorContent.value = editor.getHtml()
  form.content = editorContent.value
}

// 编辑器创建完成
const handleEditorCreated = (editor) => {
  editorRef.value = editor
}

// 加载征途列表
const loadJourneyList = async () => {
  try {
    loading.value = true
    const params = {}
    if (searchForm.status !== '') {
      params.status = searchForm.status
    }
    const res = await request.get('/research-journeys/list', { params })
    if (res.code === 200) {
      journeyList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载征途列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.status = ''
  loadJourneyList()
}

// 打开添加对话框
const openAddDialog = () => {
  resetForm()
  dialogVisible.value = true
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.setHtml('')
    }
  })
}

// 打开编辑对话框
const openEditDialog = (row) => {
  Object.assign(form, row)
  editorContent.value = row.content || ''
  dialogVisible.value = true
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.setHtml(editorContent.value)
    }
  })
}

// 封面图文件选择
const handleCoverChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片格式文件')
    return false
  }
  const isLt5M = file.raw.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }

  selectedCoverFile.value = file.raw

  // 生成本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)

  return false
}

// 删除封面图
const removeCover = async () => {
  if (form.coverImage && !selectedCoverFile.value) {
    try {
      await request.delete(`/upload/file?url=${encodeURIComponent(form.coverImage)}`)
      console.log('封面图删除成功:', form.coverImage)
    } catch (error) {
      console.error('删除封面图失败:', error)
    }
  }
  selectedCoverFile.value = null
  coverPreview.value = ''
  form.coverImage = ''
  ElMessage.success('封面图已删除')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 如果有新选择的封面图，先上传
    if (selectedCoverFile.value) {
      const formData = new FormData()
      formData.append('file', selectedCoverFile.value)

      const uploadResponse = await request.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (uploadResponse.code === 200) {
        form.coverImage = uploadResponse.data.url
      } else {
        ElMessage.error('封面图上传失败：' + (uploadResponse.message || '未知错误'))
        return
      }
    }

    // 提交数据
    if (form.id) {
      await request.put(`/research-journeys/${form.id}`, form)
    } else {
      await request.post('/research-journeys', form)
    }

    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadJourneyList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除征途
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个征途吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/research-journeys/${id}`)
    ElMessage.success('删除成功')
    loadJourneyList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: null,
    title: '',
    coverImage: '',
    summary: '',
    content: '',
    status: 1,
    sortOrder: 0
  })
  editorContent.value = ''
  selectedCoverFile.value = null
  coverPreview.value = ''
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadJourneyList()
})
</script>

<style scoped>
.journey-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.cover-preview {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: inline-block;
}

.cover-preview img {
  max-width: 200px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.w-e-text-container) {
  min-height: 400px !important;
}
</style>
