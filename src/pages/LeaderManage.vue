<template>
  <div class="leader-manage">
    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div class="section-card">
          <h3 class="section-title">负责人基本信息</h3>
          <el-form :model="leaderInfo" :rules="leaderInfoRules" ref="leaderInfoRef" label-width="150px">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="leaderInfo.name" placeholder="请输入负责人姓名" />
            </el-form-item>
            <el-form-item label="职称" prop="title">
              <el-input v-model="leaderInfo.title" placeholder="请输入职称" />
            </el-form-item>
            <el-form-item label="所属单位" prop="institution">
              <el-input v-model="leaderInfo.institution" placeholder="请输入所属单位" />
            </el-form-item>
            <el-form-item label="联系邮箱" prop="email">
              <el-input v-model="leaderInfo.email" type="email" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="leaderInfo.phone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="头像URL">
              <el-upload
                class="image-uploader"
                :action="uploadUrl"
                :show-file-list="false"
                :on-success="handleAvatarUploadSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <el-button size="small" type="primary">
                  <el-icon><Upload /></el-icon>
                  上传头像
                </el-button>
              </el-upload>
              <el-input v-model="leaderInfo.avatarUrl" placeholder="或直接输入头像URL" style="margin-top: 10px;" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input
                v-model="leaderInfo.introduction"
                type="textarea"
                :rows="10"
                placeholder="请输入个人简介" />
            </el-form-item>
            <el-form-item label="团队简介">
              <el-input
                v-model="leaderInfo.teamIntroduction"
                type="textarea"
                :rows="10"
                placeholder="请输入团队简介" />
            </el-form-item>
            <el-form-item label="研究方向">
              <el-input
                v-model="leaderInfo.researchAreas"
                type="textarea"
                :rows="5"
                placeholder="请输入研究方向" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveLeaderInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 教育经历 -->
      <el-tab-pane label="教育经历" name="education">
        <div class="section-header">
          <el-button type="primary" @click="openEducationDialog">
            <el-icon><Plus /></el-icon>
            添加教育经历
          </el-button>
        </div>
        <div class="section-card">
          <el-table :data="educationList" border stripe v-loading="educationLoading">
            <el-table-column prop="institution" label="学校/机构" min-width="200" />
            <el-table-column prop="degree" label="学位" width="100" />
            <el-table-column prop="major" label="专业" width="150" />
            <el-table-column prop="startDate" label="开始日期" width="120" />
            <el-table-column prop="endDate" label="结束日期" width="120" />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEducationDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteEducation(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 教育经历编辑对话框 -->
        <el-dialog
          v-model="educationDialogVisible"
          :title="educationDialogTitle"
          width="600px"
          @close="resetEducationForm"
        >
          <el-form :model="educationForm" :rules="educationRules" ref="educationFormRef" label-width="150px">
            <el-form-item label="学校/机构" prop="institution">
              <el-input v-model="educationForm.institution" placeholder="请输入学校/机构名称" />
            </el-form-item>
            <el-form-item label="学位" prop="degree">
              <el-input v-model="educationForm.degree" placeholder="请输入学位，如：学士、硕士、博士" />
            </el-form-item>
            <el-form-item label="专业" prop="major">
              <el-input v-model="educationForm.major" placeholder="请输入专业名称" />
            </el-form-item>
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="educationForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择开始日期"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="educationForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择结束日期（留空表示至今）"
              />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="educationForm.description"
                type="textarea"
                :rows="5"
                placeholder="请输入描述信息" />
            </el-form-item>
            <el-form-item label="排序顺序">
              <el-input-number v-model="educationForm.sortOrder" :min="0" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="educationDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveEducation">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <!-- 工作经历 -->
      <el-tab-pane label="工作经历" name="work">
        <div class="section-header">
          <el-button type="primary" @click="openWorkExperienceDialog">
            <el-icon><Plus /></el-icon>
            添加工作经历
          </el-button>
        </div>
        <div class="section-card">
          <el-table :data="workExperienceList" border stripe v-loading="workExperienceLoading">
            <el-table-column prop="company" label="公司/机构" min-width="200" />
            <el-table-column prop="position" label="职位" width="150" />
            <el-table-column prop="startDate" label="开始日期" width="120" />
            <el-table-column prop="endDate" label="结束日期" width="120" />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openWorkExperienceDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteWorkExperience(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 工作经历编辑对话框 -->
        <el-dialog
          v-model="workExperienceDialogVisible"
          :title="workExperienceDialogTitle"
          width="600px"
          @close="resetWorkExperienceForm"
        >
          <el-form :model="workExperienceForm" :rules="workExperienceRules" ref="workExperienceFormRef" label-width="150px">
            <el-form-item label="公司/机构" prop="company">
              <el-input v-model="workExperienceForm.company" placeholder="请输入公司/机构名称" />
            </el-form-item>
            <el-form-item label="职位" prop="position">
              <el-input v-model="workExperienceForm.position" placeholder="请输入职位" />
            </el-form-item>
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="workExperienceForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择开始日期"
              />
            </el-form-item>
            <el-form-item label="结束日期">
              <el-date-picker
                v-model="workExperienceForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择结束日期（留空表示至今）"
              />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="workExperienceForm.description"
                type="textarea"
                :rows="5"
                placeholder="请输入描述信息" />
            </el-form-item>
            <el-form-item label="排序顺序">
              <el-input-number v-model="workExperienceForm.sortOrder" :min="0" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="workExperienceDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveWorkExperience">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Plus } from '@element-plus/icons-vue'
import request from '../utils/api'

const activeTab = ref('basic')

// 上传配置
const uploadUrl = ref(`${request.defaults.baseURL}/upload/image`)

// 负责人基本信息
const leaderInfo = reactive({
  id: null,
  name: '',
  title: '',
  institution: '',
  email: '',
  phone: '',
  avatarUrl: '',
  introduction: '',
  teamIntroduction: '',
  researchAreas: ''
})

const leaderInfoRules = {
  name: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  institution: [{ required: true, message: '请输入所属单位', trigger: 'blur' }]
}

const leaderInfoRef = ref(null)

// 教育经历
const educationList = ref([])
const educationLoading = ref(false)
const educationDialogVisible = ref(false)
const educationDialogTitle = ref('添加教育经历')
const educationFormRef = ref(null)
const educationForm = reactive({
  id: null,
  leaderId: 1,
  degree: '',
  major: '',
  institution: '',
  startDate: '',
  endDate: '',
  description: '',
  sortOrder: 0
})

const educationRules = {
  degree: [{ required: true, message: '请输入学位', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  institution: [{ required: true, message: '请输入学校/机构', trigger: 'blur' }],
  startDate: [{ required: true, message: '请输入开始日期', trigger: 'change' }]
}

// 工作经历
const workExperienceList = ref([])
const workExperienceLoading = ref(false)
const workExperienceDialogVisible = ref(false)
const workExperienceDialogTitle = ref('添加工作经历')
const workExperienceFormRef = ref(null)
const workExperienceForm = reactive({
  id: null,
  leaderId: 1,
  position: '',
  company: '',
  startDate: '',
  endDate: '',
  description: '',
  sortOrder: 0
})

const workExperienceRules = {
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司/机构', trigger: 'blur' }],
  startDate: [{ required: true, message: '请输入开始日期', trigger: 'change' }]
}

// 加载负责人基本信息
const loadLeaderInfo = async () => {
  try {
    const res = await request.get('/leader/info')
    const data = res.data || {}
    Object.keys(leaderInfo).forEach(key => {
      if (data[key] !== undefined) {
        leaderInfo[key] = data[key]
      }
    })
  } catch (error) {
    console.error('加载负责人信息失败:', error)
    ElMessage.error('加载负责人信息失败')
  }
}

// 加载教育经历
const loadEducationList = async () => {
  try {
    educationLoading.value = true
    const res = await request.get('/leader/education')
    educationList.value = res.data || []
  } catch (error) {
    console.error('加载教育经历失败:', error)
    ElMessage.error('加载教育经历失败')
  } finally {
    educationLoading.value = false
  }
}

// 加载工作经历
const loadWorkExperienceList = async () => {
  try {
    workExperienceLoading.value = true
    const res = await request.get('/leader/work-experience')
    workExperienceList.value = res.data || []
  } catch (error) {
    console.error('加载工作经历失败:', error)
    ElMessage.error('加载工作经历失败')
  } finally {
    workExperienceLoading.value = false
  }
}

// 保存负责人基本信息
const saveLeaderInfo = async () => {
  try {
    if (!leaderInfoRef.value) return
    await leaderInfoRef.value.validate()
    
    const res = await request.put('/leader', leaderInfo)
    if (res.code === 200) {
      ElMessage.success('保存成功')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 头像上传成功处理
const handleAvatarUploadSuccess = (response) => {
  if (response.code === 200) {
    leaderInfo.avatarUrl = response.data.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败：' + (response.message || '未知错误'))
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片格式文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('头像大小不能超过5MB')
    return false
  }
  return true
}

// 打开教育经历对话框
const openEducationDialog = (row = null) => {
  educationDialogTitle.value = row ? '编辑教育经历' : '添加教育经历'
  if (row) {
    Object.assign(educationForm, row)
  } else {
    resetEducationForm()
  }
  educationDialogVisible.value = true
}

// 保存教育经历
const saveEducation = async () => {
  try {
    if (!educationFormRef.value) return
    await educationFormRef.value.validate()
    
    const res = await request.post('/leader/education', educationForm)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      educationDialogVisible.value = false
      loadEducationList()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 删除教育经历
const deleteEducation = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条教育经历吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await request.delete(`/leader/education/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadEducationList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置教育经历表单
const resetEducationForm = () => {
  if (educationFormRef.value) {
    educationFormRef.value.resetFields()
  }
  Object.assign(educationForm, {
    id: null,
    leaderId: leaderInfo.id || 1,
    degree: '',
    major: '',
    institution: '',
    startDate: '',
    endDate: '',
    description: '',
    sortOrder: 0
  })
}

// 打开工作经历对话框
const openWorkExperienceDialog = (row = null) => {
  workExperienceDialogTitle.value = row ? '编辑工作经历' : '添加工作经历'
  if (row) {
    Object.assign(workExperienceForm, row)
  } else {
    resetWorkExperienceForm()
  }
  workExperienceDialogVisible.value = true
}

// 保存工作经历
const saveWorkExperience = async () => {
  try {
    if (!workExperienceFormRef.value) return
    await workExperienceFormRef.value.validate()
    
    const res = await request.post('/leader/work-experience', workExperienceForm)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      workExperienceDialogVisible.value = false
      loadWorkExperienceList()
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

// 删除工作经历
const deleteWorkExperience = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条工作经历吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await request.delete(`/leader/work-experience/${id}`)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadWorkExperienceList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置工作经历表单
const resetWorkExperienceForm = () => {
  if (workExperienceFormRef.value) {
    workExperienceFormRef.value.resetFields()
  }
  Object.assign(workExperienceForm, {
    id: null,
    leaderId: leaderInfo.id || 1,
    position: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    sortOrder: 0
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadLeaderInfo()
  loadEducationList()
  loadWorkExperienceList()
})
</script>

<style scoped>
.leader-manage {
  padding: 20px;
}

.section-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 20px;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  padding-bottom: 12px;
  border-bottom: 2px solid var(--primary-light);
}

.section-header {
  margin-bottom: 20px;
}

.image-uploader {
  margin-bottom: 10px;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}
</style>
