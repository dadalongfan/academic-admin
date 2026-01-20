<template>
  <div class="papers-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加论文
      </el-button>
    </div>

    <el-table :data="papersList" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="title" label="论文标题" min-width="250" show-overflow-tooltip />
      <el-table-column prop="authors" label="作者" width="200" show-overflow-tooltip />
      <el-table-column prop="journal" label="期刊" width="150" show-overflow-tooltip />
      <el-table-column prop="year" label="年份" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">启用</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="论文标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入论文标题" />
        </el-form-item>
        <el-form-item label="作者" prop="authors">
          <el-input v-model="form.authors" placeholder="请输入作者列表" />
        </el-form-item>
        <el-form-item label="期刊名称" prop="journal">
          <el-input v-model="form.journal" placeholder="请输入期刊名称" />
        </el-form-item>
        <el-form-item label="发表年份">
          <el-input-number v-model="form.year" :min="1990" :max="2030" />
        </el-form-item>
        <el-form-item label="卷号">
          <el-input v-model="form.volume" placeholder="卷号" />
        </el-form-item>
        <el-form-item label="期号">
          <el-input v-model="form.issue" placeholder="期号" />
        </el-form-item>
        <el-form-item label="页码">
          <el-input v-model="form.pages" placeholder="页码" />
        </el-form-item>
        <el-form-item label="DOI">
          <el-input v-model="form.doi" placeholder="DOI" />
        </el-form-item>
        <el-form-item label="PDF文件">
          <el-upload
            class="file-uploader"
            :action="uploadUrl"
            :show-file-list="true"
            :on-success="handlePdfUploadSuccess"
            :before-upload="beforePdfUpload"
            :limit="1"
          >
            <el-button size="small" type="primary">
              <el-icon><Upload /></el-icon>
              上传PDF
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传PDF格式文件，大小不超过10MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.pdfUrl" class="pdf-url">
                <el-link :href="form.pdfUrl" target="_blank" type="primary">
                  {{ form.pdfUrl.split('/').pop() }}
                </el-link>
            <el-button 
              size="small" 
              type="danger" 
              plain 
              @click.stop="removePdf"
              style="margin-left: 10px"
            >
              删除
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="期刊论文" value="journal" />
            <el-option label="会议论文" value="conference" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import request from '../../utils/api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const papersList = ref([])

// PDF上传配置
const uploadUrl = ref(`${request.defaults.baseURL}/upload/file`)

// PDF上传成功处理
const handlePdfUploadSuccess = (response) => {
  if (response.code === 200) {
    form.pdfUrl = response.data.url
    ElMessage.success('PDF上传成功')
  } else {
    ElMessage.error('PDF上传失败：' + (response.message || '未知错误'))
  }
}

// PDF上传前验证
const beforePdfUpload = (file) => {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    ElMessage.error('只能上传PDF格式文件')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('PDF文件大小不能超过10MB')
    return false
  }
  return true
}

// 删除PDF
const removePdf = () => {
  form.pdfUrl = ''
  ElMessage.success('PDF已删除')
}

const form = reactive({
  id: null,
  title: '',
  authors: '',
  journal: '',
  year: null,
  volume: '',
  issue: '',
  pages: '',
  doi: '',
  pdfUrl: '',
  type: 'journal',
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入论文标题', trigger: 'blur' }],
  authors: [{ required: true, message: '请输入作者', trigger: 'blur' }]
}

const loadPapers = async () => {
  try {
    loading.value = true
    const res = await request.get('/papers/list/all')
    papersList.value = res.data || []
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  dialogTitle.value = '添加论文'
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  dialogTitle.value = '编辑论文'
  Object.assign(form, { ...row, year: row.year ? Number(row.year) : null })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (form.id) {
      await request.put(`/papers/${form.id}`, form)
    } else {
      await request.post('/papers', form)
    }
    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadPapers()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' })
    await request.delete(`/papers/${id}`)
    ElMessage.success('删除成功')
    loadPapers()
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
}

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  Object.assign(form, {
    id: null, title: '', authors: '', journal: '', year: null,
    volume: '', issue: '', pages: '', doi: '', pdfUrl: '',
    type: 'journal', status: 1
  })
}

onMounted(() => loadPapers())
</script>

<style scoped>
.papers-manage { padding: 20px; }
.table-header { margin-bottom: 20px; }

/* PDF上传样式 */
.file-uploader {
  margin-bottom: 10px;
}

.pdf-url {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.pdf-url .el-link {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
