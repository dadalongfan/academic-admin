<template>
  <div class="achievements-manage">
    <div class="table-header">
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加阶段成就
      </el-button>
    </div>

    <!-- 成就列表 -->
    <el-table :data="achievementsList" border stripe v-loading="loading">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="{ row }">
          <span style="font-size: 32px">{{ row.icon || '🎯' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="成就标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
      <el-table-column prop="tags" label="标签" width="250">
        <template #default="{ row }">
          <el-tag v-if="row.tags" v-for="tag in row.tags.split(',')" :key="tag" size="small" style="margin-right: 5px">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
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
      width="600px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="成就标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入成就标题" />
        </el-form-item>

        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入emoji图标，如：🎯">
            <template #append>
              <el-button @click="showEmojiPicker = !showEmojiPicker">选择</el-button>
            </template>
          </el-input>
          <div v-if="showEmojiPicker" class="emoji-picker">
            <span
              v-for="emoji in emojiList"
              :key="emoji"
              @click="form.icon = emoji; showEmojiPicker = false"
              class="emoji-item"
            >
              {{ emoji }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="成就描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入成就描述"
          />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="请输入标签，用逗号分隔，如：中试验证,万吨级示范" />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
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
import request from '../../utils/api'

const loading = ref(false)
const dialogVisible = ref(false)
const showEmojiPicker = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

const emojiList = ['🎯', '🔬', '⚙️', '🏆', '📚', '💡', '🚀', '⭐', '🔥', '💪']

const form = reactive({
  id: null,
  title: '',
  description: '',
  icon: '🎯',
  tags: '',
  sortOrder: 0,
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入成就标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入成就描述', trigger: 'blur' }]
}

const achievementsList = ref([])

// 加载成就列表
const loadAchievements = async () => {
  try {
    loading.value = true
    const res = await request.get('/achievements/list/all')
    achievementsList.value = res.data || []
  } catch (error) {
    console.error('加载成就列表失败:', error)
    ElMessage.error('加载成就列表失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加阶段成就'
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  dialogTitle.value = '编辑阶段成就'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.id) {
      await request.put(`/achievements/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/achievements', form)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    loadAchievements()
  } catch (error) {
    console.error('提交失败:', error)
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  }
}

// 删除成就
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个成就吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/achievements/${id}`)
    ElMessage.success('删除成功')
    loadAchievements()
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
    description: '',
    icon: '🎯',
    tags: '',
    sortOrder: 0,
    status: 1
  })
  showEmojiPicker.value = false
}

onMounted(() => {
  loadAchievements()
})
</script>

<style scoped>
.achievements-manage {
  padding: 20px;
}

.table-header {
  margin-bottom: 20px;
}

.emoji-picker {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s;
}

.emoji-item:hover {
  background-color: #f5f7fa;
  transform: scale(1.2);
}
</style>
