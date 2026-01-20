<template>
  <div class="members-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成员管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加成员
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="指导教师" value="指导教师" />
            <el-option label="专任教师" value="专任教师" />
            <el-option label="研究生" value="研究生" />
            <el-option label="校友" value="校友" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="在读" :value="false" />
            <el-option label="毕业" :value="true" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadMembersList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 成员表格 -->
      <el-table :data="membersList" border stripe v-loading="loading">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.avatarUrl"
              :src="row.avatarUrl"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 50%"
              :preview-src-list="[row.avatarUrl]"
            />
            <el-avatar v-else :size="50">{{ row.name?.charAt(0) || '成' }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column prop="email" label="邮箱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="researchDirection" label="研究方向" min-width="150" show-overflow-tooltip />
        <el-table-column prop="isGraduated" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isGraduated" type="info">毕业</el-tag>
            <el-tag v-else type="success">在读</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="启用" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">是</el-tag>
            <el-tag v-else type="danger">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadMembersList"
        @current-change="loadMembersList"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="指导教师" value="指导教师" />
            <el-option label="专任教师" value="专任教师" />
            <el-option label="研究生" value="研究生" />
            <el-option label="校友" value="校友" />
          </el-select>
        </el-form-item>

        <el-form-item label="头像" prop="avatarUrl">
          <el-upload
            class="avatar-uploader"
            :action="uploadAction"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>

        <el-form-item label="年级" prop="grade" v-if="form.role === '研究生'">
          <el-input-number v-model="form.grade" :min="2000" :max="2030" placeholder="请输入年级" />
        </el-form-item>

        <el-form-item label="是否毕业" v-if="form.role === '研究生'">
          <el-switch v-model="form.isGraduated" />
        </el-form-item>

        <el-form-item label="荣誉标记" prop="honors">
          <el-input v-model="form.honors" placeholder="如：国家奖学金、优秀毕业生等" />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="form.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item label="研究方向" prop="researchDirection">
          <el-input v-model="form.researchDirection" placeholder="请输入研究方向" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../utils/api'

// 文件上传地址
const uploadAction = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api'}/upload/avatar`
})

// 搜索表单
const searchForm = reactive({
  role: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 成员列表
const membersList = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑成员' : '添加成员')
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  name: '',
  role: '',
  avatarUrl: '',
  email: '',
  phone: '',
  grade: null,
  isGraduated: false,
  honors: '',
  bio: '',
  researchDirection: '',
  status: 1
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 获取角色标签类型
const getRoleTagType = (role) => {
  const typeMap = {
    '指导教师': 'danger',
    '专任教师': 'warning',
    '研究生': 'success',
    '校友': 'info'
  }
  return typeMap[role] || 'info'
}

// 加载成员列表
const loadMembersList = async () => {
  try {
    loading.value = true
    const res = await request.get('/members/list')

    // 过滤数据
    let filteredData = res.data || []

    if (searchForm.role) {
      filteredData = filteredData.filter(m => m.role === searchForm.role)
    }

    if (searchForm.status !== '') {
      const isGraduated = searchForm.status === true
      filteredData = filteredData.filter(m => m.isGraduated === isGraduated)
    }

    // 前端分页
    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    membersList.value = filteredData.slice(start, end)
  } catch (error) {
    console.error('加载成员列表失败:', error)
    ElMessage.error('加载成员列表失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const openAddDialog = () => {
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (row) => {
  Object.assign(form, {
    ...row,
    grade: row.grade ? Number(row.grade) : null
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const submitData = { ...form }

    if (submitData.id) {
      await request.put(`/members/${submitData.id}`, submitData)
      ElMessage.success('更新成功')
    } else {
      await request.post('/members', submitData)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    loadMembersList()
  } catch (error) {
    console.error('提交失败:', error)
    if (error !== false) {
      ElMessage.error('操作失败，请检查输入')
    }
  }
}

// 删除成员
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/members/${id}`)
    ElMessage.success('删除成功')
    loadMembersList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.role = ''
  searchForm.status = ''
  pagination.page = 1
  loadMembersList()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: null,
    name: '',
    role: '',
    avatarUrl: '',
    email: '',
    phone: '',
    grade: null,
    isGraduated: false,
    honors: '',
    bio: '',
    researchDirection: '',
    status: 1
  })
}

// 头像上传成功
const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    form.avatarUrl = response.data.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGOrPNG) {
    ElMessage.error('头像图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

onMounted(() => {
  loadMembersList()
})
</script>

<style scoped>
.members-manage {
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

/* 头像上传样式 */
.avatar-uploader {
  display: inline-block;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>
