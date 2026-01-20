<template>
  <div class="recruitment-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加招聘信息
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-bar">
      <el-select v-model="filterCategory" placeholder="信息类别" clearable style="width: 150px; margin-right: 10px" @change="loadData">
        <el-option label="招生专业" value="招生专业" />
        <el-option label="课题组优势" value="课题组优势" />
        <el-option label="招生要求" value="招生要求" />
        <el-option label="申请流程" value="申请流程" />
      </el-select>
    </div>

    <!-- 招聘信息列表 -->
    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="category" label="信息类别" width="120">
        <template #default="{ row }">
          <el-tag type="primary">{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="250" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">启用</el-tag>
          <el-tag v-else type="info">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="信息类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择信息类别">
            <el-option label="招生专业" value="招生专业" />
            <el-option label="课题组优势" value="课题组优势" />
            <el-option label="招生要求" value="招生要求" />
            <el-option label="申请流程" value="申请流程" />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入内容（支持HTML）"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :precision="0" :step="1" />
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
import { Plus } from '@element-plus/icons-vue'
import request from '../utils/api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const list = ref([])

// 筛选条件
const filterCategory = ref('')

const form = reactive({
  id: null,
  category: '',
  title: '',
  content: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  category: [{ required: true, message: '请选择信息类别', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// 加载招聘信息列表
const loadData = async () => {
  try {
    loading.value = true
    const res = await request.get('/recruitment/list/all')
    let data = res.data || []

    // 前端筛选
    if (filterCategory.value) {
      data = data.filter(item => item.category === filterCategory.value)
    }

    list.value = data
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加招聘信息'
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑招聘信息'
  Object.assign(form, {
    ...row
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.id) {
      await request.put(`/recruitment/${form.id}`, form)
    } else {
      await request.post('/recruitment', form)
    }

    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

// 删除招聘信息
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条招聘信息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/recruitment/${id}`)
    ElMessage.success('删除成功')
    loadData()
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
    category: '',
    title: '',
    content: '',
    sortOrder: 0,
    status: 1
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.recruitment-manage {
  padding: 20px;
}

.table-header {
  margin-bottom: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
</style>