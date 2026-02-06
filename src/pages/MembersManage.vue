<template>
  <div class="members-manage">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 成员管理 -->
      <el-tab-pane label="成员管理" name="members">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>成员管理</span>
              <el-button type="primary" @click="openMemberDialog()">
                <el-icon><Plus /></el-icon>
                添加成员
              </el-button>
            </div>
          </template>

          <!-- 搜索表单 -->
          <el-form :inline="true" class="search-form">
            <el-form-item label="角色">
              <el-select v-model="searchForm.roleId" placeholder="请选择" clearable>
                <el-option label="全部" value="" />
                <el-option
                  v-for="role in rolesList"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
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
          <el-table :data="membersList" border stripe v-loading="memberLoading">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column label="头像" width="80">
              <template #default="{ row }">
                <el-image
                  v-if="row.avatarUrl"
                  :src="getFullImageUrl(row.avatarUrl)"
                  fit="cover"
                  style="width: 50px; height: 50px; border-radius: 50%"
                  :preview-src-list="[getFullImageUrl(row.avatarUrl)]"
                />
                <el-avatar v-else :size="50">{{ row.name?.charAt(0) || '成' }}</el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="roleName" label="角色" width="120">
              <template #default="{ row }">
                <el-tag :type="getRoleTagType(row.roleName)">{{ row.roleName || '未分配' }}</el-tag>
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
                <el-button size="small" @click="openMemberDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteMember(row.id)">删除</el-button>
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
      </el-tab-pane>

      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="roles">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>角色管理</span>
              <el-button type="primary" @click="openRoleDialog()">
                <el-icon><Plus /></el-icon>
                添加角色
              </el-button>
            </div>
          </template>

          <!-- 角色表格 -->
          <el-table :data="rolesList" border stripe v-loading="roleLoading" row-key="id">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="name" label="角色名称" min-width="150" />
            <el-table-column prop="sortOrder" label="排序" width="100" />
            <el-table-column prop="isVisible" label="显示" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.isVisible"
                  @change="(val) => handleVisibilityChange(row.id, val)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 1" type="success">启用</el-tag>
                <el-tag v-else type="danger">禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="成员数量" width="100">
              <template #default="{ row }">
                <el-tag type="info">{{ memberCounts[row.id] || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="250" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="moveUp(row)" :disabled="isFirst(row)">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button size="small" @click="moveDown(row)" :disabled="isLast(row)">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <el-button size="small" @click="openRoleDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteRole(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="tips">
            <el-alert
              title="提示"
              type="info"
              description="点击上下箭头调整角色显示顺序。角色下有成员时无法删除。"
              show-icon
              :closable="false"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 成员编辑对话框 -->
    <el-dialog
      v-model="memberDialogVisible"
      :title="memberDialogTitle"
      width="700px"
      @close="resetMemberForm"
    >
      <el-form :model="memberForm" :rules="memberRules" ref="memberFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="memberForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="角色" prop="roleId">
          <el-select v-model="memberForm.roleId" placeholder="请选择角色" clearable>
            <el-option
              v-for="role in rolesList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
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
            <img v-if="memberForm.avatarUrl" :src="getFullImageUrl(memberForm.avatarUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入电话" />
        </el-form-item>

        <el-form-item label="年级" prop="grade">
          <el-input-number v-model="memberForm.grade" :min="2000" :max="2030" placeholder="请输入年级" />
        </el-form-item>

        <el-form-item label="是否毕业">
          <el-switch v-model="memberForm.isGraduated" />
        </el-form-item>

        <el-form-item label="荣誉标记" prop="honors">
          <el-input v-model="memberForm.honors" placeholder="如：国家奖学金、优秀毕业生等" />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="memberForm.bio"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>

        <el-form-item label="研究方向" prop="researchDirection">
          <el-input v-model="memberForm.researchDirection" placeholder="请输入研究方向" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="memberForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitMember">确定</el-button>
      </template>
    </el-dialog>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="roleDialogTitle"
      width="500px"
      @close="resetRoleForm"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="roleForm.sortOrder" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="是否显示">
          <el-switch v-model="roleForm.isVisible" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getFullImageUrl, API_BASE_URL } from '../utils/api'
import { memberApi, memberRoleApi } from '../api'

// 当前激活的标签页
const activeTab = ref('members')

// 文件上传地址
const uploadAction = computed(() => {
  if (import.meta.env.PROD) {
    return `${API_BASE_URL}/upload/avatar`
  }
  return '/api/upload/avatar'
})

// ==================== 成员管理 ====================
const memberLoading = ref(false)
const membersList = ref([])
const memberDialogVisible = ref(false)
const memberDialogTitle = computed(() => memberForm.id ? '编辑成员' : '添加成员')
const memberFormRef = ref(null)

const memberForm = reactive({
  id: null,
  name: '',
  roleId: null,
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

const memberRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
}

const searchForm = reactive({
  roleId: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// ==================== 角色管理 ====================
const roleLoading = ref(false)
const rolesList = ref([])
const memberCounts = ref({})
const roleDialogVisible = ref(false)
const roleDialogTitle = computed(() => roleForm.id ? '编辑角色' : '添加角色')
const roleFormRef = ref(null)

const roleForm = reactive({
  id: null,
  name: '',
  sortOrder: 0,
  isVisible: true,
  status: 1
})

const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

// ==================== 方法 ====================

// 标签页切换
const handleTabChange = (tab) => {
  if (tab === 'members') {
    loadMembersList()
  } else if (tab === 'roles') {
    loadRolesList()
  }
}

// 加载角色列表
const loadRolesList = async () => {
  roleLoading.value = true
  try {
    const res = await memberRoleApi.getList()
    if (res.code === 200) {
      rolesList.value = res.data || []
      await loadMemberCounts()
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    roleLoading.value = false
  }
}

// 加载成员数量
const loadMemberCounts = async () => {
  for (const role of rolesList.value) {
    try {
      const res = await memberRoleApi.getMemberCount(role.id)
      if (res.code === 200) {
        memberCounts.value[role.id] = res.data.count
      }
    } catch (error) {
      console.error(`获取角色 ${role.id} 成员数量失败:`, error)
    }
  }
}

// 加载成员列表
const loadMembersList = async () => {
  memberLoading.value = true
  try {
    const res = await memberApi.getList()
    let filteredData = res.data || []

    if (searchForm.roleId) {
      const roleId = parseInt(searchForm.roleId)
      filteredData = filteredData.filter(m => m.roleId === roleId)
    }

    if (searchForm.status !== '') {
      const isGraduated = searchForm.status === true
      filteredData = filteredData.filter(m => m.isGraduated === isGraduated)
    }

    pagination.total = filteredData.length
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    membersList.value = filteredData.slice(start, end)
  } catch (error) {
    console.error('加载成员列表失败:', error)
    ElMessage.error('加载成员列表失败')
  } finally {
    memberLoading.value = false
  }
}

// 获取角色标签类型
const getRoleTagType = (roleName) => {
  const typeMap = {
    '指导教师': 'danger',
    '专任教师': 'warning',
    '研究生': 'success',
    '校友': 'info'
  }
  return typeMap[roleName] || 'info'
}

// ==================== 成员管理方法 ====================

const openMemberDialog = (row = null) => {
  if (row) {
    Object.assign(memberForm, {
      ...row,
      roleId: row.roleId,
      grade: row.grade ? Number(row.grade) : null
    })
  } else {
    resetMemberForm()
  }
  memberDialogVisible.value = true
}

const resetMemberForm = () => {
  memberFormRef.value?.resetFields()
  Object.assign(memberForm, {
    id: null,
    name: '',
    roleId: null,
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

const handleSubmitMember = async () => {
  try {
    await memberFormRef.value.validate()
    const submitData = { ...memberForm }

    if (submitData.id) {
      await memberApi.update(submitData.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await memberApi.create(submitData)
      ElMessage.success('添加成功')
    }

    memberDialogVisible.value = false
    loadMembersList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDeleteMember = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个成员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await memberApi.delete(id)
    ElMessage.success('删除成功')
    loadMembersList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const resetSearch = () => {
  searchForm.roleId = ''
  searchForm.status = ''
  pagination.page = 1
  loadMembersList()
}

const handleAvatarSuccess = (response) => {
  if (response.code === 200) {
    memberForm.avatarUrl = response.data.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

const beforeAvatarUpload = async (file) => {
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

  if (memberForm.avatarUrl) {
    try {
      await memberApi.delete(`/upload/file?url=${encodeURIComponent(memberForm.avatarUrl)}`)
    } catch (error) {
      console.error('删除旧头像时发生错误:', error)
    }
  }

  return true
}

// ==================== 角色管理方法 ====================

const isFirst = (row) => {
  const index = rolesList.value.findIndex(item => item.id === row.id)
  return index === 0
}

const isLast = (row) => {
  const index = rolesList.value.findIndex(item => item.id === row.id)
  return index === rolesList.value.length - 1
}

const moveUp = async (row) => {
  const index = rolesList.value.findIndex(item => item.id === row.id)
  if (index > 0) {
    const prevRole = rolesList.value[index - 1]
    const updateData = [
      { id: row.id, sortOrder: prevRole.sortOrder },
      { id: prevRole.id, sortOrder: row.sortOrder }
    ]

    try {
      const res = await memberRoleApi.updateSort(updateData)
      if (res.code === 200) {
        ElMessage.success('排序更新成功')
        await loadRolesList()
      }
    } catch (error) {
      console.error('更新排序失败:', error)
    }
  }
}

const moveDown = async (row) => {
  const index = rolesList.value.findIndex(item => item.id === row.id)
  if (index < rolesList.value.length - 1) {
    const nextRole = rolesList.value[index + 1]
    const updateData = [
      { id: row.id, sortOrder: nextRole.sortOrder },
      { id: nextRole.id, sortOrder: row.sortOrder }
    ]

    try {
      const res = await memberRoleApi.updateSort(updateData)
      if (res.code === 200) {
        ElMessage.success('排序更新成功')
        await loadRolesList()
      }
    } catch (error) {
      console.error('更新排序失败:', error)
    }
  }
}

const handleVisibilityChange = async (id, isVisible) => {
  try {
    const res = await memberRoleApi.toggleVisibility(id, isVisible)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    }
  } catch (error) {
    console.error('切换显示状态失败:', error)
    await loadRolesList()
  }
}

const openRoleDialog = (row = null) => {
  if (row) {
    roleForm.id = row.id
    roleForm.name = row.name
    roleForm.sortOrder = row.sortOrder
    roleForm.isVisible = row.isVisible
    roleForm.status = row.status
  } else {
    resetRoleForm()
    roleForm.sortOrder = rolesList.value.length + 1
  }
  roleDialogVisible.value = true
}

const resetRoleForm = () => {
  roleFormRef.value?.resetFields()
  roleForm.id = null
  roleForm.name = ''
  roleForm.sortOrder = 0
  roleForm.isVisible = true
  roleForm.status = 1
}

const handleSubmitRole = async () => {
  try {
    await roleFormRef.value.validate()

    const data = {
      name: roleForm.name,
      sortOrder: roleForm.sortOrder,
      isVisible: roleForm.isVisible,
      status: roleForm.status
    }

    let res
    if (roleForm.id) {
      res = await memberRoleApi.update(roleForm.id, data)
    } else {
      res = await memberRoleApi.create(data)
    }

    if (res.code === 200) {
      ElMessage.success(roleForm.id ? '更新成功' : '添加成功')
      roleDialogVisible.value = false
      await loadRolesList()
    }
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDeleteRole = async (row) => {
  const count = memberCounts.value[row.id] || 0
  if (count > 0) {
    ElMessage.warning(`该角色下有 ${count} 个成员，无法删除`)
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const res = await memberRoleApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await loadRolesList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 初始化
onMounted(() => {
  loadRolesList()
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

.tips {
  margin-top: 20px;
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
