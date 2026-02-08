<template>
  <div class="news-manage">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 新闻列表 -->
      <el-tab-pane label="新闻列表" name="news">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>新闻列表</span>
              <el-button type="primary" @click="openNewsDialog">
                <el-icon><Plus /></el-icon>
                添加新闻
              </el-button>
            </div>
          </template>

          <!-- 搜索表单 -->
          <el-form :inline="true" class="search-form">
            <el-form-item label="分类">
              <el-select v-model="newsSearchForm.category" placeholder="请选择" clearable>
                <el-option label="全部" value="" />
                <el-option label="团队建设" value="团队建设" />
                <el-option label="学术交流" value="学术交流" />
                <el-option label="科研成果" value="科研成果" />
              </el-select>
            </el-form-item>

            <el-form-item label="年份">
              <el-select v-model="newsSearchForm.year" placeholder="请选择" clearable>
                <el-option label="全部" value="" />
                <el-option label="2024" :value="2024" />
                <el-option label="2023" :value="2023" />
                <el-option label="2022" :value="2022" />
                <el-option label="2021" :value="2021" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="loadNewsList">搜索</el-button>
              <el-button @click="resetNewsSearch">重置</el-button>
            </el-form-item>
          </el-form>

          <!-- 新闻表格 -->
          <el-table :data="newsList" border stripe v-loading="newsLoading">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="publishDate" label="发布日期" width="120" />
            <el-table-column prop="isImportant" label="重要" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.isImportant" type="danger">是</el-tag>
                <el-tag v-else type="info">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.status === 1" type="success">上架</el-tag>
                <el-tag v-else type="info">下架</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openNewsDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteNews(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="newsPagination.page"
            v-model:page-size="newsPagination.pageSize"
            :total="newsPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadNewsList"
            @current-change="loadNewsList"
            style="margin-top: 20px; justify-content: center"
          />
        </el-card>
      </el-tab-pane>

      <!-- 年度大事件 -->
      <el-tab-pane label="年度大事件" name="events">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>年度大事件</span>
              <el-button type="primary" @click="openEventDialog">
                <el-icon><Plus /></el-icon>
                添加年度事件
              </el-button>
            </div>
          </template>

          <!-- 年度事件表格 -->
          <el-table :data="eventsList" border stripe v-loading="eventsLoading">
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="year" label="年份" width="120" />
            <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip>
              <template #default="{ row }">
                <div v-html="row.content" class="content-preview"></div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.status === 1" type="success">上架</el-tag>
                <el-tag v-else type="info">下架</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="openEventDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDeleteEvent(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 新闻添加/编辑对话框 -->
    <el-dialog
      v-model="newsDialogVisible"
      :title="newsDialogTitle"
      width="800px"
      @close="resetNewsForm"
    >
      <el-form :model="newsForm" :rules="newsRules" ref="newsFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="newsForm.title" placeholder="请输入新闻标题" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="newsForm.category" placeholder="请选择分类">
            <el-option label="团队建设" value="团队建设" />
            <el-option label="学术交流" value="学术交流" />
            <el-option label="科研成果" value="科研成果" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布日期" prop="publishDate">
          <el-date-picker
            v-model="newsForm.publishDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="newsEditorRef"
              :defaultConfig="toolbarConfig"
            />
            <Editor
              v-model="newsEditorContent"
              :defaultConfig="editorConfig"
              @onCreated="handleNewsEditorCreated"
              @onChange="handleNewsEditorChange"
            />
          </div>
        </el-form-item>

        <el-form-item label="重要新闻">
          <el-switch v-model="newsForm.isImportant" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="newsForm.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="newsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleNewsSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 年度大事件添加/编辑对话框 -->
    <el-dialog
      v-model="eventDialogVisible"
      :title="eventDialogTitle"
      width="800px"
      @close="resetEventForm"
    >
      <el-form :model="eventForm" :rules="eventRules" ref="eventFormRef" label-width="100px">
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="eventYear"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            @change="handleYearChange"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="eventEditorRef"
              :defaultConfig="toolbarConfig"
            />
            <Editor
              v-model="eventEditorContent"
              :defaultConfig="editorConfig"
              @onCreated="handleEventEditorCreated"
              @onChange="handleEventEditorChange"
            />
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="eventForm.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="eventDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEventSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../utils/api'
// 导入WangEditor
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
// 引入公共编辑器配置
import { toolbarConfig, editorConfig, imageManager } from '../utils/editorConfig'

// ========== Tab 切换 ==========
const activeTab = ref('news')

const handleTabChange = (tabName) => {
  if (tabName === 'news') {
    loadNewsList()
  } else if (tabName === 'events') {
    loadEventsList()
  }
}

// ========== 新闻管理 ==========
const newsSearchForm = reactive({
  category: '',
  year: null
})

const newsPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const newsList = ref([])
const newsLoading = ref(false)

const newsDialogVisible = ref(false)
const newsDialogTitle = computed(() => newsForm.id ? '编辑新闻' : '添加新闻')
const newsFormRef = ref(null)

const newsForm = reactive({
  id: null,
  title: '',
  content: '',
  category: '',
  isImportant: false,
  publishDate: '',
  status: 1
})

// WangEditor 配置
const newsEditorRef = ref(null)
const newsEditorContent = ref('')

const handleNewsEditorChange = (editor) => {
  newsEditorContent.value = editor.getHtml()
  newsForm.content = newsEditorContent.value
}

watch(
  () => newsForm.content,
  (newVal) => {
    // 只有在编辑器已初始化，且内容确实不同时才更新
    if (newsEditorRef.value && newVal !== newsEditorContent.value) {
      newsEditorContent.value = newVal
      nextTick(() => {
        const editor = newsEditorRef.value
        if (editor && editor.getHtml() !== newVal) {
          editor.setHtml(newVal || '')
        }
      })
    }
  }
)

const newsRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  publishDate: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

const loadNewsList = async () => {
  try {
    newsLoading.value = true
    const res = await request.get('/news/list', {
      params: {
        page: newsPagination.page,
        pageSize: newsPagination.pageSize,
        category: newsSearchForm.category || undefined,
        year: newsSearchForm.year || undefined
      }
    })

    if (res.data.records) {
      newsList.value = res.data.records
      newsPagination.total = res.data.total
    } else {
      newsList.value = res.data || []
      newsPagination.total = newsList.value.length
    }
  } catch (error) {
    console.error('加载新闻列表失败:', error)
  } finally {
    newsLoading.value = false
  }
}

const openNewsDialog = (row = null) => {
  if (row) {
    Object.assign(newsForm, row)
    // 先设置编辑器内容，确保对话框打开时有内容
    newsEditorContent.value = row.content || ''
  } else {
    // 添加新闻时，清空内容
    newsEditorContent.value = ''
  }
  newsDialogVisible.value = true
}

const handleNewsEditorCreated = (editor) => {
  newsEditorRef.value = editor
  // 编辑器创建完成后，设置内容
  nextTick(() => {
    if (newsEditorContent.value) {
      editor.setHtml(newsEditorContent.value)
    }
    imageManager.checkImagesDeletion(editor)
  })
}

const handleNewsSubmit = async () => {
  if (!newsFormRef.value) return

  try {
    await newsFormRef.value.validate()

    imageManager.checkImagesDeletion(newsEditorRef.value)

    if (newsForm.id) {
      await request.put(`/news/${newsForm.id}`, newsForm)
      ElMessage.success('更新成功')
    } else {
      await request.post('/news', newsForm)
      ElMessage.success('添加成功')
    }

    newsDialogVisible.value = false
    loadNewsList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDeleteNews = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条新闻吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/news/${id}`)
    ElMessage.success('删除成功')
    loadNewsList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const resetNewsSearch = () => {
  newsSearchForm.category = ''
  newsSearchForm.year = null
  newsPagination.page = 1
  loadNewsList()
}

const resetNewsForm = () => {
  if (newsFormRef.value) {
    newsFormRef.value.resetFields()
  }
  Object.assign(newsForm, {
    id: null,
    title: '',
    content: '',
    category: '',
    isImportant: false,
    publishDate: '',
    status: 1
  })
  newsEditorContent.value = ''
}

// ========== 年度大事件管理 ==========
const eventsList = ref([])
const eventsLoading = ref(false)

const eventDialogVisible = ref(false)
const eventDialogTitle = computed(() => eventForm.id ? '编辑年度事件' : '添加年度事件')
const eventFormRef = ref(null)

const eventForm = reactive({
  id: null,
  content: '',
  year: null,
  status: 1
})

const eventYear = ref('')

// WangEditor 配置
const eventEditorRef = ref(null)
const eventEditorContent = ref('')

const handleEventEditorChange = (editor) => {
  eventEditorContent.value = editor.getHtml()
  eventForm.content = eventEditorContent.value
}

const handleYearChange = (value) => {
  eventForm.year = parseInt(value)
}

watch(
  () => eventForm.content,
  (newVal) => {
    // 只有在编辑器已初始化，且内容确实不同时才更新
    if (eventEditorRef.value && newVal !== eventEditorContent.value) {
      eventEditorContent.value = newVal
      nextTick(() => {
        const editor = eventEditorRef.value
        if (editor && editor.getHtml() !== newVal) {
          editor.setHtml(newVal || '')
        }
      })
    }
  }
)

const eventRules = {
  year: [{ required: true, message: '请选择年份', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const loadEventsList = async () => {
  try {
    eventsLoading.value = true
    const res = await request.get('/annual-events/admin/list')
    eventsList.value = res.data || []
  } catch (error) {
    console.error('加载年度事件列表失败:', error)
  } finally {
    eventsLoading.value = false
  }
}

const openEventDialog = (row = null) => {
  if (row) {
    Object.assign(eventForm, row)
    eventYear.value = row.year ? row.year.toString() : ''
    // 先设置编辑器内容，确保对话框打开时有内容
    eventEditorContent.value = row.content || ''
  } else {
    // 添加新事件时，清空表单
    resetEventForm()
    eventEditorContent.value = ''
  }
  eventDialogVisible.value = true
}

const handleEventEditorCreated = (editor) => {
  eventEditorRef.value = editor
  // 编辑器创建完成后，设置内容
  nextTick(() => {
    if (eventEditorContent.value) {
      editor.setHtml(eventEditorContent.value)
    }
    imageManager.checkImagesDeletion(editor)
  })
}

const handleEventSubmit = async () => {
  if (!eventFormRef.value) return

  try {
    await eventFormRef.value.validate()

    imageManager.checkImagesDeletion(eventEditorRef.value)

    if (eventForm.id) {
      await request.put(`/annual-events/${eventForm.id}`, eventForm)
      ElMessage.success('更新成功')
    } else {
      await request.post('/annual-events', eventForm)
      ElMessage.success('添加成功')
    }

    eventDialogVisible.value = false
    loadEventsList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleDeleteEvent = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条年度事件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await request.delete(`/annual-events/${id}`)
    ElMessage.success('删除成功')
    loadEventsList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const resetEventForm = () => {
  if (eventFormRef.value) {
    eventFormRef.value.resetFields()
  }
  Object.assign(eventForm, {
    id: null,
    content: '',
    year: null,
    status: 1
  })
  eventYear.value = ''
  eventEditorContent.value = ''
}

onMounted(() => {
  loadNewsList()
})
</script>

<style scoped>
.news-manage {
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

.content-preview {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 编辑器容器样式 */
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

/* 编辑器工具栏样式 */
:deep(.w-e-toolbar) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

/* 编辑器内容区域样式 */
:deep(.w-e-text-container) {
  background-color: white;
  height: 400px;
  overflow-y: auto;
}

/* 编辑器按钮样式 */
:deep(.w-e-bar-item) {
  transition: all 0.3s;
}

:deep(.w-e-bar-item:hover) {
  background-color: rgba(220, 224, 229, 0.6);
}
</style>
