<template>
  <div class="partners-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog"><el-icon><Plus /></el-icon>添加合作伙伴</el-button>
    </div>
    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="name" label="合作单位名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="cooperationType" label="合作类型" width="120" />
      <el-table-column prop="website" label="官网" width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }"><el-tag v-if="row.status === 1" type="success">启用</el-tag><el-tag v-else type="info">禁用</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }"><el-button size="small" @click="openEditDialog(row)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="单位名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Logo URL"><el-input v-model="form.logoUrl" /></el-form-item>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../../utils/api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const list = ref([])

const form = reactive({ id: null, name: '', logoUrl: '', description: '', website: '', cooperationType: '', status: 1 })
const rules = { name: [{ required: true, message: '请输入单位名称', trigger: 'blur' }] }

const loadData = async () => {
  try { loading.value = true; const res = await request.get('/partners/list/all'); list.value = res.data || [] } catch (error) { ElMessage.error('加载失败') } finally { loading.value = false }
}

const openAddDialog = () => { dialogTitle.value = '添加合作伙伴'; dialogVisible.value = true }
const openEditDialog = (row) => { dialogTitle.value = '编辑合作伙伴'; Object.assign(form, row); dialogVisible.value = true }
const handleSubmit = async () => {
  if (!formRef.value) return
  try { await formRef.value.validate(); if (form.id) { await request.put(`/partners/${form.id}`, form) } else { await request.post('/partners', form) } ElMessage.success('操作成功'); dialogVisible.value = false; loadData() } catch (error) { console.error(error) }
}
const handleDelete = async (id) => { try { await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }); await request.delete(`/partners/${id}`); ElMessage.success('删除成功'); loadData() } catch (error) { if (error !== 'cancel') ElMessage.error('删除失败') } }
const resetForm = () => { if (formRef.value) formRef.value.resetFields(); Object.assign(form, { id: null, name: '', logoUrl: '', description: '', website: '', cooperationType: '', status: 1 }) }

onMounted(() => loadData())
</script>

<style scoped>
.partners-manage { padding: 20px; }
.table-header { margin-bottom: 20px; }
</style>
