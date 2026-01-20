<template>
  <div class="honors-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog"><el-icon><Plus /></el-icon>添加荣誉</el-button>
    </div>
    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="title" label="奖励名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="awardLevel" label="奖励级别" width="120" />
      <el-table-column prop="awardDate" label="获奖日期" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }"><el-tag v-if="row.status === 1" type="success">启用</el-tag><el-tag v-else type="info">禁用</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }"><el-button size="small" @click="openEditDialog(row)">编辑</el-button><el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="奖励名称" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="奖励描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="奖励级别"><el-select v-model="form.awardLevel" placeholder="请选择"><el-option label="国家级" value="国家级" /><el-option label="省部级" value="省部级" /><el-option label="校级" value="校级" /></el-select></el-form-item>
        <el-form-item label="获奖日期"><el-date-picker v-model="form.awardDate" value-format="YYYY-MM-DD" /></el-form-item>
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

const form = reactive({ id: null, title: '', description: '', awardLevel: '', awardDate: '', status: 1 })
const rules = { title: [{ required: true, message: '请输入奖励名称', trigger: 'blur' }] }

const loadData = async () => {
  try { loading.value = true; const res = await request.get('/honors/list/all'); list.value = res.data || [] } catch (error) { ElMessage.error('加载失败') } finally { loading.value = false }
}

const openAddDialog = () => { dialogTitle.value = '添加荣誉'; dialogVisible.value = true }
const openEditDialog = (row) => { dialogTitle.value = '编辑荣誉'; Object.assign(form, row); dialogVisible.value = true }
const handleSubmit = async () => {
  if (!formRef.value) return
  try { await formRef.value.validate(); if (form.id) { await request.put(`/honors/${form.id}`, form) } else { await request.post('/honors', form) } ElMessage.success('操作成功'); dialogVisible.value = false; loadData() } catch (error) { console.error(error) }
}
const handleDelete = async (id) => { try { await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning' }); await request.delete(`/honors/${id}`); ElMessage.success('删除成功'); loadData() } catch (error) { if (error !== 'cancel') ElMessage.error('删除失败') } }
const resetForm = () => { if (formRef.value) formRef.value.resetFields(); Object.assign(form, { id: null, title: '', description: '', awardLevel: '', awardDate: '', status: 1 }) }

onMounted(() => loadData())
</script>

<style scoped>
.honors-manage { padding: 20px; }
.table-header { margin-bottom: 20px; }
</style>
