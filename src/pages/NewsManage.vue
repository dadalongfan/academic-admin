<template>
  <div class="news-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新闻列表</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加新闻
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="团队建设" value="团队建设" />
            <el-option label="学术交流" value="学术交流" />
            <el-option label="科研成果" value="科研成果" />
          </el-select>
        </el-form-item>

        <el-form-item label="年份">
          <el-select v-model="searchForm.year" placeholder="请选择" clearable>
            <el-option label="全部" value="" />
            <el-option label="2024" :value="2024" />
            <el-option label="2023" :value="2023" />
            <el-option label="2022" :value="2022" />
            <el-option label="2021" :value="2021" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadNewsList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 新闻表格 -->
      <el-table :data="newsList" border stripe v-loading="loading">
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
        @size-change="loadNewsList"
        @current-change="loadNewsList"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入新闻标题" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="团队建设" value="团队建设" />
            <el-option label="学术交流" value="学术交流" />
            <el-option label="科研成果" value="科研成果" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布日期" prop="publishDate">
          <el-date-picker
            v-model="form.publishDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="editorConfig"
            />
            <Editor
              style="height: 400px; overflow-y: auto"
              v-model="editorContent"
              :defaultConfig="editorConfig"
              @onCreated="editorRef = $event"
              @onChange="handleEditorChange"
            />
          </div>
        </el-form-item>

        <el-form-item label="重要新闻">
          <el-switch v-model="form.isImportant" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">上架</el-radio>
            <el-radio :value="0">下架</el-radio>
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
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '../utils/api'
// 导入WangEditor
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

// 搜索表单
const searchForm = reactive({
  category: '',
  year: null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 新闻列表
const newsList = ref([])
const loading = ref(false)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑新闻' : '添加新闻')
const formRef = ref(null)

// 表单数据
const form = reactive({
  id: null,
  title: '',
  content: '',
  category: '',
  isImportant: false,
  publishDate: '',
  status: 1
})

// WangEditor 配置
const editorRef = ref(null)
const editorContent = ref('')
const editorConfig = {
  placeholder: '请输入新闻内容...',
  MENU_CONF: {
    uploadImage: {
      server: `${request.defaults.baseURL}/upload/image`,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      // 自定义上传成功处理
      customInsert(res, insertFn) {
        // 从后端返回的结果中获取图片URL
        const url = res.data.url
        // 使用insertFn插入图片
        insertFn(url)
      },
      onSuccess: (result, file) => {
        console.log('上传成功', result, file)
      },
      onFailed: (result, file) => {
        console.error('上传失败', result, file)
        ElMessage.error('图片上传失败：' + (result?.message || '未知错误'))
      }
    }
  }
}

// 监听编辑器内容变化
const handleEditorChange = (editor) => {
  editorContent.value = editor.getHtml()
  // 将内容同步到form中
  form.content = editorContent.value
}

// 监听form.content变化，更新编辑器内容
watch(
  () => form.content,
  (newVal) => {
    if (newVal !== editorContent.value && editorRef.value) {
      editorContent.value = newVal
      // 延迟更新，确保编辑器实例已创建
      nextTick(() => {
        const editor = editorRef.value
        if (editor) {
          editor.setHtml(newVal || '')
        }
      })
    }
  }
)

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  publishDate: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

// 加载新闻列表
const loadNewsList = async () => {
  try {
    loading.value = true
    const res = await request.get('/news/list', {
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    })

    // 如果是分页数据
    if (res.data.records) {
      newsList.value = res.data.records
      pagination.total = res.data.total
    } else {
      newsList.value = res.data || []
      pagination.total = newsList.value.length
    }
  } catch (error) {
    console.error('加载新闻列表失败:', error)
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
  Object.assign(form, row)
  dialogVisible.value = true
  // 等待对话框打开和编辑器初始化完成后，手动设置编辑器内容
  nextTick(() => {
    // 直接设置editorContent，触发编辑器更新
    editorContent.value = row.content
    // 延迟一下，确保编辑器实例已经创建
    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.setHtml(row.content || '')
      }
    })
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (form.id) {
      await request.put(`/news/${form.id}`, form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/news', form)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    loadNewsList()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 删除新闻
const handleDelete = async (id) => {
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

// 重置搜索
const resetSearch = () => {
  searchForm.category = ''
  searchForm.year = null
  pagination.page = 1
  loadNewsList()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: null,
    title: '',
    content: '',
    category: '',
    isImportant: false,
    publishDate: '',
    status: 1
  })
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
