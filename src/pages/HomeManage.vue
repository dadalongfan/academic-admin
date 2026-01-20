<template>
  <div class="home-manage">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 幻灯片管理 -->
      <el-tab-pane label="幻灯片管理" name="slideshow">
        <div class="tab-content">
          <div class="table-header">
            <el-button type="primary" @click="openAddSlideshowDialog">
              <el-icon><Plus /></el-icon>
              添加幻灯片
            </el-button>
          </div>

          <!-- 幻灯片列表 -->
          <el-table :data="slideshowList" border stripe v-loading="slideshowLoading">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column label="图片预览" width="120">
              <template #default="{ row }">
                <el-image
                  v-if="row.imageUrl"
                  :src="getFullImageUrl(row.imageUrl)"
                  :preview-src-list="[getFullImageUrl(row.imageUrl)]"
                  fit="cover"
                  class="slideshow-preview"
                />
                <span v-else class="text-gray-400">无图片</span>
              </template>
            </el-table-column>
            <el-table-column prop="imageUrl" label="图片URL" min-width="300" show-overflow-tooltip />
            <el-table-column prop="title" label="标题" width="150" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.status === 1" type="success">启用</el-tag>
                <el-tag v-else type="info">禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEditSlideshowDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteSlideshow(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 添加/编辑幻灯片对话框 -->
          <el-dialog
            v-model="slideshowDialogVisible"
            :title="slideshowDialogTitle"
            width="700px"
            @close="resetSlideshowForm"
          >
            <el-form :model="slideshowForm" :rules="slideshowRules" ref="slideshowFormRef" label-width="100px">
              <el-form-item label="幻灯片图片" prop="imageUrl">
                <el-upload
                  class="avatar-uploader"
                  :action="uploadUrl"
                  :show-file-list="false"
                  :on-success="handleImageUploadSuccess"
                  :before-upload="beforeImageUpload"
                >
                  <img v-if="slideshowForm.imageUrl" :src="getFullImageUrl(slideshowForm.imageUrl)" class="uploaded-image" />
                  <el-icon v-else class="upload-icon"><Plus /></el-icon>
                </el-upload>
                <el-input
                  v-model="slideshowForm.imageUrl"
                  placeholder="图片URL（上传后自动填充）"
                  class="mt-2"
                  readonly
                />
              </el-form-item>

              <el-form-item label="标题">
                <el-input v-model="slideshowForm.title" placeholder="请输入标题" />
              </el-form-item>

              <el-form-item label="描述">
                <el-input
                  v-model="slideshowForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入描述"
                />
              </el-form-item>

              <el-form-item label="排序">
                <el-input-number v-model="slideshowForm.sortOrder" :min="0" :precision="0" :step="1" />
              </el-form-item>

              <el-form-item label="状态">
                <el-radio-group v-model="slideshowForm.status">
                  <el-radio :value="1">启用</el-radio>
                  <el-radio :value="0">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>

            <template #footer>
              <el-button @click="slideshowDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSubmitSlideshow">确定</el-button>
            </template>
          </el-dialog>
        </div>
      </el-tab-pane>
      <!-- 负责人信息管理 -->
      <el-tab-pane label="负责人信息" name="leader">
        <div class="tab-content">
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
              <el-form-item label="地址">
                <el-input v-model="leaderInfo.address" placeholder="请输入地址" />
              </el-form-item>
              <el-form-item label="邮编">
                <el-input v-model="leaderInfo.postcode" placeholder="请输入邮编" />
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
                <div class="editor-container">
                  <Toolbar
                    :editor="introductionEditorRef"
                    :default-config="toolbarConfig"
                    :mode="'default'"
                  />
                  <Editor
                    v-model="leaderInfo.introduction"
                    :default-config="editorConfig"
                    :mode="'default'"
                    @onCreated="handleIntroductionEditorCreated"
                  />
                </div>
              </el-form-item>
              <el-form-item label="团队简介">
                <div class="editor-container">
                  <Toolbar
                    :editor="teamIntroductionEditorRef"
                    :default-config="toolbarConfig"
                    :mode="'default'"
                  />
                  <Editor
                    v-model="leaderInfo.teamIntroduction"
                    :default-config="editorConfig"
                    :mode="'default'"
                    @onCreated="handleTeamIntroductionEditorCreated"
                  />
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveLeaderInfo">保存</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 教育经历管理 -->
          <div class="section-card">
            <div class="section-header">
              <h3 class="section-title">教育经历</h3>
              <el-button type="primary" @click="openEducationDialog">
                <el-icon><Plus /></el-icon>
                添加教育经历
              </el-button>
            </div>
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

          <!-- 工作经历管理 -->
          <div class="section-card">
            <div class="section-header">
              <h3 class="section-title">工作经历</h3>
              <el-button type="primary" @click="openWorkExperienceDialog">
                <el-icon><Plus /></el-icon>
                添加工作经历
              </el-button>
            </div>
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import request from '../utils/api'
import { toolbarConfig, editorConfig } from '../utils/editorConfig'

const activeTab = ref('slideshow')

// 幻灯片管理
const slideshowLoading = ref(false)
const slideshowDialogVisible = ref(false)
const slideshowDialogTitle = ref('')
const slideshowFormRef = ref(null)
const slideshowList = ref([])

const slideshowForm = reactive({
  id: null,
  imageUrl: '',
  title: '',
  description: '',
  sortOrder: 0,
  status: 1
})

// 图片上传相关配置
const uploadUrl = ref(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api'}/upload/image`)

// 图片上传成功处理
const handleImageUploadSuccess = (response) => {
  if (response.code === 200) {
    slideshowForm.imageUrl = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败：' + response.message)
  }
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB')
    return false
  }
  return true
}

// 获取完整的图片URL用于预览
const getFullImageUrl = (url) => {
  if (!url) return ''
  // 如果已经是完整URL则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则拼接完整URL
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api'}${url}`
}

const slideshowRules = {
  imageUrl: [{ required: true, message: '请输入图片URL', trigger: 'blur' }]
}

// 负责人信息管理
const leaderInfo = reactive({
  id: null,
  name: '',
  title: '',
  institution: '',
  email: '',
  phone: '',
  address: '',
  postcode: '',
  avatarUrl: '',
  introduction: '',
  teamIntroduction: ''
})

const leaderInfoRules = {
  name: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  institution: [{ required: true, message: '请输入所属单位', trigger: 'blur' }]
}

const leaderInfoRef = ref(null)

// WangEditor 配置
const introductionEditorRef = ref(null)
const teamIntroductionEditorRef = ref(null)

// 编辑器创建成功回调
const handleIntroductionEditorCreated = (editor) => {
  introductionEditorRef.value = editor
}

const handleTeamIntroductionEditorCreated = (editor) => {
  teamIntroductionEditorRef.value = editor
}

// 组件销毁前销毁编辑器实例
onBeforeUnmount(() => {
  const introductionEditor = introductionEditorRef.value
  const teamIntroductionEditor = teamIntroductionEditorRef.value
  
  if (introductionEditor) {
    introductionEditor.destroy()
  }
  
  if (teamIntroductionEditor) {
    teamIntroductionEditor.destroy()
  }
})

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

// 加载幻灯片列表
const loadSlideshowData = async () => {
  try {
    slideshowLoading.value = true
    const res = await request.get('/slideshow/list/all')
    slideshowList.value = res.data || []
  } catch (error) {
    ElMessage.error('加载幻灯片失败')
  } finally {
    slideshowLoading.value = false
  }
}

// 打开添加幻灯片对话框
const openAddSlideshowDialog = () => {
  slideshowDialogTitle.value = '添加幻灯片'
  slideshowDialogVisible.value = true
}

// 打开编辑幻灯片对话框
const openEditSlideshowDialog = (row) => {
  slideshowDialogTitle.value = '编辑幻灯片'
  Object.assign(slideshowForm, {
    ...row
  })
  slideshowDialogVisible.value = true
}

// 提交幻灯片表单
const handleSubmitSlideshow = async () => {
  if (!slideshowFormRef.value) return

  try {
    await slideshowFormRef.value.validate()

    if (slideshowForm.id) {
      await request.put(`/slideshow/${slideshowForm.id}`, slideshowForm)
    } else {
      await request.post('/slideshow', slideshowForm)
    }

    ElMessage.success('操作成功')
    slideshowDialogVisible.value = false
    loadSlideshowData()
  } catch (error) {
    console.error(error)
  }
}

// 删除幻灯片
const handleDeleteSlideshow = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这张幻灯片吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/slideshow/${id}`)
    ElMessage.success('删除成功')
    loadSlideshowData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 重置幻灯片表单
const resetSlideshowForm = () => {
  if (slideshowFormRef.value) {
    slideshowFormRef.value.resetFields()
  }
  Object.assign(slideshowForm, {
    id: null,
    imageUrl: '',
    title: '',
    description: '',
    sortOrder: 0,
    status: 1
  })
}

onMounted(() => {
  loadSlideshowData()
  loadLeaderInfo()
  loadEducationList()
  loadWorkExperienceList()
})
</script>

<style scoped>
.home-manage {
  padding: 20px;
}

.tab-content {
  padding: 20px;
}

.table-header {
  margin-bottom: 20px;
}

/* 图片上传样式 */
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 10px;
}

.uploaded-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  margin-bottom: 10px;
}

.mt-2 {
  margin-top: 10px;
}

/* 幻灯片列表预览样式 */
.slideshow-preview {
  width: 80px;
  height: 50px;
  border-radius: 4px;
}

/* 负责人信息样式 */
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

.image-uploader {
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* WangEditor 编辑器样式 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

:deep(.w-e-toolbar) {
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

:deep(.w-e-text-container) {
  height: 300px !important;
  overflow-y: auto;
}

:deep(.w-e-text) {
  padding: 10px;
}

:deep(.w-e-text p) {
  margin-bottom: 10px;
  line-height: 1.6;
}
</style>