<template>
  <div class="projects-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加项目
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-bar">
      <el-select v-model="filterType" placeholder="项目类型" clearable style="width: 150px; margin-right: 10px" @change="loadData">
        <el-option label="国家级" value="国家级" />
        <el-option label="省部级" value="省部级" />
        <el-option label="部委级" value="部委级" />
        <el-option label="横向" value="横向" />
      </el-select>
      <el-select v-model="filterRole" placeholder="承担角色" clearable style="width: 150px; margin-right: 10px" @change="loadData">
        <el-option label="主持" value="主持" />
        <el-option label="参与" value="参与" />
      </el-select>
    </div>

    <!-- 项目列表 -->
    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="项目名称" min-width="250" show-overflow-tooltip />
      <el-table-column prop="type" label="项目类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.type === '国家级'" type="danger">国家级</el-tag>
          <el-tag v-else-if="row.type === '省部级'" type="warning">省部级</el-tag>
          <el-tag v-else-if="row.type === '部委级'" type="success">部委级</el-tag>
          <el-tag v-else type="info">横向</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="funding" label="经费（万元）" width="120" align="right" />
      <el-table-column prop="role" label="角色" width="80" />
      <el-table-column prop="projectNumber" label="项目编号" width="150" show-overflow-tooltip />
      <el-table-column prop="startDate" label="开始日期" width="110" />
      <el-table-column prop="endDate" label="结束日期" width="110" />
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>

        <el-form-item label="项目类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择项目类型">
            <el-option label="国家级" value="国家级" />
            <el-option label="省部级" value="省部级" />
            <el-option label="部委级" value="部委级" />
            <el-option label="横向" value="横向" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目经费">
          <el-input-number v-model="form.funding" :min="0" :precision="2" :step="1" />
          <span style="margin-left: 10px">万元</span>
        </el-form-item>

        <el-form-item label="项目编号">
          <el-input v-model="form.projectNumber" placeholder="请输入项目编号" />
        </el-form-item>

        <el-form-item label="承担角色">
          <el-radio-group v-model="form.role">
            <el-radio value="主持">主持</el-radio>
            <el-radio value="参与">参与</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="开始日期">
          <el-date-picker
            v-model="form.startDate"
            value-format="YYYY-MM-DD"
            placeholder="选择开始日期"
          />
        </el-form-item>

        <el-form-item label="结束日期">
          <el-date-picker
            v-model="form.endDate"
            value-format="YYYY-MM-DD"
            placeholder="选择结束日期"
          />
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
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
const filterType = ref('')
const filterRole = ref('')

const form = reactive({
  id: null,
  name: '',
  type: '',
  funding: null,
  startDate: '',
  endDate: '',
  role: '主持',
  projectNumber: '',
  description: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }]
}

// 加载项目列表
const loadData = async () => {
  try {
    loading.value = true
    const res = await request.get('/projects/list/all')
    let data = res.data || []

    // 前端筛选
    if (filterType.value) {
      data = data.filter(item => item.type === filterType.value)
    }
    if (filterRole.value) {
      data = data.filter(item => item.role === filterRole.value)
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
  dialogTitle.value = '添加项目'
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑项目'
  Object.assign(form, {
    ...row,
    funding: row.funding ? Number(row.funding) : null
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.id) {
      await request.put(`/projects/${form.id}`, form)
    } else {
      await request.post('/projects', form)
    }

    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

// 删除项目
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/projects/${id}`)
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
    name: '',
    type: '',
    funding: null,
    startDate: '',
    endDate: '',
    role: '主持',
    projectNumber: '',
    description: '',
    status: 1
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.projects-manage {
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
