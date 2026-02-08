# 首页管理模块 (HomeManage)

> **模块路径**: `src/pages/HomeManage.vue`
> **最后更新**: 2025-01-08 17:12:45

[根目录](../../CLAUDE.md) > [pages](../) > **首页管理模块**

---

## 模块职责

首页管理模块负责管理学术主页的首页展示内容，包括：

- **幻灯片管理**：首页轮播图的图片、标题、描述和排序
- **负责人信息管理**：团队负责人基本信息（姓名、职称、联系方式等）
- **个人简介与团队简介**：富文本编辑的内容管理
- **教育经历管理**：负责人的教育背景
- **工作经历管理**：负责人的工作经历

---

## 入口与启动

### 路由配置

```javascript
// src/router/index.js
{
  path: '/home',
  name: 'HomeManage',
  component: () => import('../pages/HomeManage.vue'),
  meta: { title: '首页管理', requiresAuth: true }
}
```

### 访问路径

- **相对路径**: `/home`
- **完整路径**: `http://localhost:8083/admin.html#/home`

---

## 对外接口

### 模块结构

```vue
<template>
  <div class="home-manage">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 幻灯片管理 -->
      <el-tab-pane label="幻灯片管理" name="slideshow">
        <!-- 幻灯片列表与编辑 -->
      </el-tab-pane>

      <!-- 负责人信息管理 -->
      <el-tab-pane label="负责人信息" name="leader">
        <!-- 负责人基本信息、教育经历、工作经历 -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

### 主要功能接口

#### 1. 幻灯片管理

| 功能 | 方法 | API 端点 |
|------|------|----------|
| 获取幻灯片列表 | `loadSlideshowData()` | `GET /slideshow/list/all` |
| 添加幻灯片 | `handleSubmitSlideshow()` | `POST /slideshow` |
| 更新幻灯片 | `handleSubmitSlideshow()` | `PUT /slideshow/{id}` |
| 删除幻灯片 | `handleDeleteSlideshow()` | `DELETE /slideshow/{id}` |
| 上传图片 | `handleImageUploadSuccess()` | `POST /upload/image` |

#### 2. 负责人信息管理

| 功能 | 方法 | API 端点 |
|------|------|----------|
| 获取负责人信息 | `loadLeaderInfo()` | `GET /leader/info` |
| 保存负责人信息 | `saveLeaderInfo()` | `PUT /leader` |
| 上传头像 | `handleAvatarUploadSuccess()` | `POST /upload/avatar` |

#### 3. 教育经历管理

| 功能 | 方法 | API 端点 |
|------|------|----------|
| 获取教育经历列表 | `loadEducationList()` | `GET /leader/education` |
| 保存教育经历 | `saveEducation()` | `POST /leader/education` |
| 删除教育经历 | `deleteEducation()` | `DELETE /leader/education/{id}` |

#### 4. 工作经历管理

| 功能 | 方法 | API 端点 |
|------|------|----------|
| 获取工作经历列表 | `loadWorkExperienceList()` | `GET /leader/work-experience` |
| 保存工作经历 | `saveWorkExperience()` | `POST /leader/work-experience` |
| 删除工作经历 | `deleteWorkExperience()` | `DELETE /leader/work-experience/{id}` |

---

## 关键依赖与配置

### 依赖组件

```javascript
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { toolbarConfig, editorConfig, imageManager } from '../utils/editorConfig'
```

### 编辑器配置

模块使用了两个富文本编辑器实例：

1. **个人简介编辑器** (`introductionEditorRef`)
   - 用于编辑负责人个人简介
   - 支持图片上传与管理
   - 自动清理未使用的图片

2. **团队简介编辑器** (`teamIntroductionEditorRef`)
   - 用于编辑团队简介
   - 配置与个人简介编辑器相同

### 图片上传配置

```javascript
// 开发环境
const uploadUrl = '/api/upload/image'

// 生产环境
const uploadUrl = `${API_BASE_URL}/upload/image`
```

**上传限制**：
- 文件类型：图片（image/*）
- 文件大小：最大 5MB

---

## 数据模型

### 幻灯片数据结构

```javascript
const slideshowForm = {
  id: null,              // 幻灯片 ID
  imageUrl: '',          // 图片 URL
  title: '',             // 标题
  description: '',       // 描述
  sortOrder: 0,          // 排序顺序
  status: 1              // 状态（1=启用，0=禁用）
}
```

### 负责人信息数据结构

```javascript
const leaderInfo = {
  id: null,                  // 负责人 ID
  name: '',                  // 姓名
  title: '',                 // 职称
  institution: '',           // 所属单位
  email: '',                 // 联系邮箱
  phone: '',                 // 联系电话
  address: '',               // 地址
  postcode: '',              // 邮编
  avatarUrl: '',             // 头像 URL
  introduction: '',          // 个人简介（HTML）
  teamIntroduction: ''       // 团队简介（HTML）
}
```

### 教育经历数据结构

```javascript
const educationForm = {
  id: null,              // ID
  leaderId: 1,           // 负责人 ID
  degree: '',            // 学位（学士、硕士、博士）
  major: '',             // 专业
  institution: '',       // 学校/机构
  startDate: '',         // 开始日期（YYYY-MM-DD）
  endDate: '',           // 结束日期（YYYY-MM-DD，可为空）
  description: '',       // 描述
  sortOrder: 0           // 排序顺序
}
```

### 工作经历数据结构

```javascript
const workExperienceForm = {
  id: null,              // ID
  leaderId: 1,           // 负责人 ID
  position: '',          // 职位
  company: '',           // 公司/机构
  startDate: '',         // 开始日期（YYYY-MM-DD）
  endDate: '',           // 结束日期（YYYY-MM-DD，可为空）
  description: '',       // 描述
  sortOrder: 0           // 排序顺序
}
```

---

## 测试与质量

### 表单验证规则

#### 负责人信息验证

```javascript
const leaderInfoRules = {
  name: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入职称', trigger: 'blur' }],
  institution: [{ required: true, message: '请输入所属单位', trigger: 'blur' }]
}
```

#### 教育经历验证

```javascript
const educationRules = {
  degree: [{ required: true, message: '请输入学位', trigger: 'blur' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  institution: [{ required: true, message: '请输入学校/机构', trigger: 'blur' }],
  startDate: [{ required: true, message: '请输入开始日期', trigger: 'change' }]
}
```

#### 工作经历验证

```javascript
const workExperienceRules = {
  position: [{ required: true, message: '请输入职位', trigger: 'blur' }],
  company: [{ required: true, message: '请输入公司/机构', trigger: 'blur' }],
  startDate: [{ required: true, message: '请输入开始日期', trigger: 'change' }]
}
```

### 错误处理

```javascript
// API 错误处理
try {
  const res = await request.get('/slideshow/list/all')
  slideshowList.value = res.data || []
} catch (error) {
  ElMessage.error('加载幻灯片失败')
} finally {
  slideshowLoading.value = false
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
```

---

## 常见问题 (FAQ)

### Q1: 如何修改幻灯片显示顺序？

A: 在幻灯片列表中，通过编辑每个幻灯片的"排序"字段来调整显示顺序。数值越小，显示越靠前。

### Q2: 编辑器中上传的图片如何管理？

A: 编辑器自动管理图片：
- 上传时自动插入图片
- 删除图片时自动调用 API 删除服务器文件
- 使用 `imageManager` 工具类进行图片生命周期管理

### Q3: 如何设置教育/工作经历的"至今"状态？

A: 将"结束日期"字段留空即可表示"至今"。

### Q4: 头像上传失败怎么办？

A: 检查以下几点：
1. 图片格式是否为 JPG/PNG
2. 图片大小是否超过 5MB
3. 后端服务是否正常运行
4. 网络连接是否正常

---

## 相关文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/pages/HomeManage.vue` | 首页管理主组件 |
| `src/utils/api.js` | HTTP 客户端配置 |
| `src/utils/editorConfig.js` | 富文本编辑器配置 |
| `src/router/index.js` | 路由配置 |

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-01-08 | 1.0.0 | 初始化模块文档 |

---

**文档生成时间**: 2025-01-08 17:12:45
