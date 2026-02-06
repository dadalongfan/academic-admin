<template>
  <div class="research-directions-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加研究方向
      </el-button>
    </div>

    <!-- 研究方向列表 -->
    <el-table :data="list" border stripe v-loading="loading" row-key="id">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="研究方向名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success">显示</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row, $index }">
          <el-button size="small" @click="moveUp($index)" :disabled="$index === 0">上移</el-button>
          <el-button size="small" @click="moveDown($index)" :disabled="$index === list.length - 1">下移</el-button>
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="研究方向" prop="name">
          <el-input v-model="form.name" placeholder="请输入研究方向名称" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入研究方向描述"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :step="1" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">显示</el-radio>
            <el-radio :value="0">隐藏</el-radio>
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
import request from '../../utils/api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const list = ref([])

const form = reactive({
  id: null,
  name: '',
  description: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入研究方向名称', trigger: 'blur' }]
}

// 加载研究方向列表
const loadData = async () => {
  try {
    loading.value = true
    const res = await request.get('/research-directions/list/all')
    list.value = res.data || []
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加研究方向'
  // 自动设置排序值为当前最大值+1
  const maxSort = list.value.length > 0 ? Math.max(...list.value.map(item => item.sortOrder || 0)) : 0
  form.sortOrder = maxSort + 1
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑研究方向'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.id) {
      await request.put(`/research-directions/${form.id}`, form)
    } else {
      await request.post('/research-directions', form)
    }

    ElMessage.success('操作成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

// 删除研究方向
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个研究方向吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/research-directions/${id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 上移
const moveUp = async (index) => {
  if (index === 0) return
  const current = list.value[index]
  const prev = list.value[index - 1]

  // 交换排序值
  const tempSort = current.sortOrder
  current.sortOrder = prev.sortOrder
  prev.sortOrder = tempSort

  // 更新数据库
  try {
    await Promise.all([
      request.put(`/research-directions/${current.id}`, current),
      request.put(`/research-directions/${prev.id}`, prev)
    ])
    ElMessage.success('排序更新成功')
    loadData()
  } catch (error) {
    ElMessage.error('排序更新失败')
  }
}

// 下移
const moveDown = async (index) => {
  if (index === list.value.length - 1) return
  const current = list.value[index]
  const next = list.value[index + 1]

  // 交换排序值
  const tempSort = current.sortOrder
  current.sortOrder = next.sortOrder
  next.sortOrder = tempSort

  // 更新数据库
  try {
    await Promise.all([
      request.put(`/research-directions/${current.id}`, current),
      request.put(`/research-directions/${next.id}`, next)
    ])
    ElMessage.success('排序更新成功')
    loadData()
  } catch (error) {
    ElMessage.error('排序更新失败')
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) formRef.value.resetFields()
  Object.assign(form, {
    id: null,
    name: '',
    description: '',
    sortOrder: 0,
    status: 1
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.research-directions-manage {
  padding: 0;
}

.table-header {
  margin-bottom: 20px;
}
</style>
