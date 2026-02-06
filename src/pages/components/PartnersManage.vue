<template>
  <div class="partners-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog"><el-icon><Plus /></el-icon>添加合作伙伴</el-button>
    </div>
    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="Logo" width="100">
        <template #default="{ row }">
          <div class="logo-preview">
            <img v-if="row.logoUrl" :src="getFullImageUrl(row.logoUrl)" alt="logo" />
            <div v-else class="logo-placeholder">{{ row.name?.charAt(0) || '合' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="合作单位名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="cooperationType" label="合作类型" width="120" />
      <el-table-column prop="website" label="官网" width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }"><el-tag v-if="row.status === 1" type="success">启用</el-tag><el-tag v-else type="info">禁用</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }"><el-button size="small" @click="openEditDialog(row)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="单位名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Logo">
          <el-upload
            class="logo-uploader"
            :action="uploadAction"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="form.logoUrl" :src="getFullImageUrl(form.logoUrl)" class="logo-preview-img" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>
        <el-form-item label="合作描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="官网链接"><el-input v-model="form.website" /></el-form-item>
        <el-form-item label="合作类型"><el-input v-model="form.cooperationType" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio :value="1">启用</el-radio><el-radio :value="0">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../../utils/api'
import { API_BASE_URL } from '../../utils/api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const list = ref([])

// 保存旧的Logo URL，用于删除
const oldLogoUrl = ref('')

const form = reactive({ id: null, name: '', logoUrl: '', description: '', website: '', cooperationType: '', status: 1 })
const rules = { name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }] }

// 文件上传地址
const uploadAction = computed(() => {
  if (import.meta.env.PROD) {
    return `${API_BASE_URL}/upload/avatar`
  }
  return '/api/upload/avatar'
})

// 获取完整图片URL
const getFullImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${API_BASE_URL}${url}`
}

// 删除MinIO中的文件
const deleteMinioFile = async (url) => {
  if (!url) return
  try {
    await request.delete(`/upload/file?url=${encodeURIComponent(url)}`)
    console.log('删除MinIO文件成功:', url)
  } catch (error) {
    console.error('删除MinIO文件失败:', error)
  }
}

const loadData = async () => {
  try { loading.value = true; const res = await request.get('/partners/list/all'); list.value = res.data || [] } catch (error) { ElMessage.error('加载失败') } finally { loading.value = false }
}

const openAddDialog = () => { 
  dialogTitle.value = '添加合作伙伴'
  oldLogoUrl.value = ''
  dialogVisible.value = true 
}

const openEditDialog = (row) => { 
  dialogTitle.value = '编辑合作伙伴'
  Object.assign(form, row)
  oldLogoUrl.value = row.logoUrl || ''
  dialogVisible.value = true 
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try { 
    await formRef.value.validate()
    if (form.id) { 
      await request.put(`/partners/${form.id}`, form) 
      // 如果Logo更换了，删除旧的Logo
      if (oldLogoUrl.value && oldLogoUrl.value !== form.logoUrl) {
        await deleteMinioFile(oldLogoUrl.value)
      }
    } else { 
      await request.post('/partners', form) 
    } 
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData() 
  } catch (error) { 
    console.error(error) 
  }
}

const handleDelete = async (row) => { 
  try { 
    await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' })
    await request.delete(`/partners/${row.id}`)
    // 删除MinIO中的Logo文件
    if (row.logoUrl) {
      await deleteMinioFile(row.logoUrl)
    }
    ElMessage.success('删除成功')
    loadData() 
  } catch (error) { 
    if (error !== 'cancel') ElMessage.error('删除失败') 
  } 
}

const resetForm = () => { 
  if (formRef.value) formRef.value.resetFields()
  Object.assign(form, { id: null, name: '', logoUrl: '', description: '', website: '', cooperationType: '', status: 1 })
  oldLogoUrl.value = ''
}

// Logo上传成功
const handleLogoSuccess = (response) => {
  if (response.code === 200) {
    // 如果之前有Logo，删除旧的
    if (form.logoUrl) {
      deleteMinioFile(form.logoUrl)
    }
    form.logoUrl = response.data.url
    ElMessage.success('Logo上传成功')
  } else {
    ElMessage.error(response.message || 'Logo上传失败')
  }
}

// Logo上传前验证
const beforeLogoUpload = async (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('Logo图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Logo图片大小不能超过 2MB!')
    return false
  }

  return true
}

onMounted(() => loadData())
</script>

<style scoped>
.partners-manage { padding: 20px; }
.table-header { margin-bottom: 20px; }

/* Logo预览 */
.logo-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color, #3a6ea5) 0%, var(--primary-light, #5089c6) 100%);
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
}

/* Logo上传 */
.logo-uploader {
  display: inline-block;
}

.logo-uploader .logo-preview-img {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
}

.logo-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
