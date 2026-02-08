<template>
  <div class="daily-moment-manage">
    <div class="section-header">
      <h2>研途趣事管理</h2>
      <el-button type="primary" @click="openMomentDialog()">
        <el-icon><Plus /></el-icon>
        添加趣事
      </el-button>
    </div>

    <!-- 图片网格展示 -->
    <div class="moments-grid" v-loading="loading">
      <el-empty v-if="moments.length === 0" description="暂无趣事照片" />

      <div v-for="moment in moments" :key="moment.id" class="moment-item">
        <div class="moment-preview">
          <img :src="getFullImageUrl(moment.image)" :alt="moment.title" @error="handleImageError" />
        </div>
        <div class="moment-info">
          <h4 class="moment-title">{{ moment.title }}</h4>
          <div class="moment-meta">
            <el-tag v-if="moment.status === 1" type="success" size="small">上架</el-tag>
            <el-tag v-else type="info" size="small">下架</el-tag>
            <span class="sort-order">排序: {{ moment.sortOrder }}</span>
          </div>
          <div class="moment-actions">
            <el-button size="small" @click="openMomentDialog(moment)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteMoment(moment.id)">删除</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 趣事编辑对话框 -->
    <el-dialog
      v-model="momentDialogVisible"
      :title="momentDialogTitle"
      width="600px"
      @close="resetMomentForm"
    >
      <el-form :model="momentForm" :rules="momentRules" ref="momentFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="momentForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            ref="uploadRef"
            class="image-uploader"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
          >
            <el-button size="small" type="primary">
              <el-icon><Upload /></el-icon>
              上传图片
            </el-button>
          </el-upload>
          <div class="image-preview-container" v-if="imagePreviewUrl || momentForm.image">
            <img :src="imagePreviewUrl || getFullImageUrl(momentForm.image)" :alt="momentForm.title" style="max-width: 100%; max-height: 300px; margin-top: 10px;" />
            <el-button
              size="small"
              type="danger"
              @click.stop="removeImage"
              style="margin-top: 10px;"
            >
              <el-icon><Delete /></el-icon>
              删除图片
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="momentForm.sortOrder" :min="0" :max="9999" />
          <span style="margin-left: 10px; color: #909399; font-size: 12px;">数值越大越靠前</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="momentForm.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="momentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMoment">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Delete } from '@element-plus/icons-vue'
import request, { getFullImageUrl } from '../utils/api'

const loading = ref(false)
const momentDialogVisible = ref(false)
const momentDialogTitle = ref('')
const momentFormRef = ref(null)
const uploadRef = ref(null)

// 本地文件处理
const selectedFile = ref(null)
const imagePreviewUrl = ref('')

// 趣事列表
const moments = ref([])

// 趣事表单
const momentForm = reactive({
  id: null,
  title: '',
  image: '',
  sortOrder: 0,
  status: 1
})

const momentRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
}

// 文件选择处理
const handleFileChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片格式文件')
    return false
  }
  const isLt10M = file.raw.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过10MB')
    return false
  }

  // 保存选中的文件
  selectedFile.value = file.raw

  // 生成本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreviewUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)

  return false
}

// 删除图片
const removeImage = async () => {
  if (momentForm.image && !selectedFile.value) {
    try {
      // 调用删除 API 删除服务器上的图片
      const response = await request.delete(`/upload/file?url=${encodeURIComponent(momentForm.image)}`)
      if (response.code === 200) {
        console.log('图片删除成功:', momentForm.image)
      } else {
        console.error('图片删除失败:', response.message)
      }
    } catch (error) {
      console.error('删除图片时发生错误:', error)
    }
  }
  // 清空本地状态
  selectedFile.value = null
  imagePreviewUrl.value = ''
  momentForm.image = ''
  ElMessage.success('图片已删除')
}

// 加载趣事列表
const loadMoments = async () => {
  try {
    loading.value = true
    const res = await request.get('/daily-moments/admin/list')
    moments.value = res.data || []
  } catch (error) {
    ElMessage.error('加载趣事列表失败')
  } finally {
    loading.value = false
  }
}

// 打开趣事对话框
const openMomentDialog = (row = null) => {
  momentDialogTitle.value = row ? '编辑趣事' : '添加趣事'
  if (row) {
    Object.assign(momentForm, row)
  } else {
    resetMomentForm()
  }
  momentDialogVisible.value = true
}

// 提交趣事表单
const handleSubmitMoment = async () => {
  if (!momentFormRef.value) return

  try {
    await momentFormRef.value.validate()

    // 检查是否有图片
    if (!selectedFile.value && !momentForm.image) {
      ElMessage.error('请上传图片')
      return
    }

    // 如果有新选择的文件，先上传图片
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      // 上传图片
      const uploadResponse = await request.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (uploadResponse.code === 200) {
        // 上传成功，获取图片URL
        momentForm.image = uploadResponse.data.url
      } else {
        ElMessage.error('图片上传失败：' + (uploadResponse.message || '未知错误'))
        return
      }
    }

    // 提交数据
    if (momentForm.id) {
      await request.put(`/daily-moments/${momentForm.id}`, momentForm)
    } else {
      await request.post('/daily-moments', momentForm)
    }

    ElMessage.success('操作成功')
    momentDialogVisible.value = false
    loadMoments()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败：' + (error.message || '未知错误'))
  }
}

// 删除趣事
const handleDeleteMoment = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个趣事吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/daily-moments/${id}`)
    ElMessage.success('删除成功')
    loadMoments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置趣事表单
const resetMomentForm = () => {
  if (momentFormRef.value) {
    momentFormRef.value.resetFields()
  }
  Object.assign(momentForm, {
    id: null,
    title: '',
    image: '',
    sortOrder: 0,
    status: 1
  })
  // 清空本地文件和预览
  selectedFile.value = null
  imagePreviewUrl.value = ''
}

// 图片加载失败处理
const handleImageError = (event) => {
  event.target.src = 'https://placehold.co/600x400/cccccc/666666?text=Image+Error'
}

onMounted(() => {
  loadMoments()
})
</script>

<style scoped>
.daily-moment-manage {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

/* 图片网格展示 */
.moments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.moment-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.moment-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.moment-preview {
  position: relative;
  padding-top: 66.67%; /* 3:2 比例 */
  background: #f5f5f5;
}

.moment-preview img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.moment-info {
  padding: 15px;
}

.moment-title {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.moment-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
}

.sort-order {
  color: #909399;
}

.moment-actions {
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
</style>
