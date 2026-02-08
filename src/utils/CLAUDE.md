# 工具模块 (utils)

> **模块路径**: `src/utils/`
> **最后更新**: 2025-01-08 17:12:45

[根目录](../../CLAUDE.md) > [src](../) > **utils** > **工具模块**

---

## 模块职责

工具模块提供项目中通用的工具函数和配置，包括：

- **HTTP 客户端**：Axios 实例配置、请求/响应拦截器
- **认证管理**：Token 存储与管理
- **编辑器配置**：富文本编辑器配置与图片管理

---

## 模块索引

| 文件 | 职责描述 |
|------|----------|
| `api.js` | Axios HTTP 客户端配置、请求/响应拦截器、图片 URL 处理 |
| `auth.js` | Token 存储、获取、删除 |
| `editorConfig.js` | WangEditor 富文本编辑器配置、图片上传管理 |

---

## api.js - HTTP 客户端

### 功能说明

提供统一的 HTTP 请求接口，配置 Axios 实例、拦截器和错误处理。

### 核心配置

```javascript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './auth'

// 创建 axios 实例
const request = axios.create({
  baseURL: __API_BASE_URL__,  // 从环境变量获取
  timeout: 30000
})

// 导出配置和工具函数
export { API_BASE_URL, getFullImageUrl }
```

### 请求拦截器

```javascript
request.interceptors.request.use(
  config => {
    // 添加 Token 到请求头
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)
```

### 响应拦截器

```javascript
request.interceptors.response.use(
  response => {
    const res = response.data

    // 状态码检查
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401 未授权，跳转到登录页
      if (res.code === 401) {
        removeToken()
        window.location.href = '/'
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  error => {
    console.error('响应错误:', error)

    // 网络错误处理
    if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请重试')
    } else if (error.message.includes('Network Error')) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)
```

### 工具函数

#### getFullImageUrl(url)

获取完整的图片 URL 用于预览。

```javascript
const getFullImageUrl = (url) => {
  if (!url) return ''
  // 如果已经是完整URL则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 生产环境使用完整的后端服务URL
  if (import.meta.env.PROD) {
    return `${API_BASE_URL}${url}`
  }
  // 开发环境使用相对路径，通过vite代理访问
  return url
}
```

**使用场景**：
- 图片预览（el-image 组件）
- 头像显示
- 幻灯片图片显示

### 导出内容

```javascript
export { API_BASE_URL, getFullImageUrl }
export default request
```

---

## auth.js - 认证管理

### 功能说明

管理用户认证 Token 的存储、获取和删除。

### 常量定义

```javascript
const TOKEN_KEY = 'academic_admin_token'
```

### API 接口

#### getToken()

获取存储的 Token。

```javascript
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
```

#### setToken(token)

保存 Token 到 localStorage。

```javascript
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}
```

#### removeToken()

删除存储的 Token。

```javascript
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}
```

#### isLoggedIn()

检查用户是否已登录。

```javascript
export function isLoggedIn() {
  return !!getToken()
}
```

### 使用示例

```javascript
import { getToken, setToken, removeToken, isLoggedIn } from '../utils/auth'

// 登录成功后保存 Token
setToken(response.data.token)

// 检查登录状态
if (isLoggedIn()) {
  // 已登录
}

// 退出登录时删除 Token
removeToken()
```

---

## editorConfig.js - 编辑器配置

### 功能说明

配置 WangEditor 富文本编辑器，提供工具栏配置和图片管理功能。

### 配置项

#### toolbarConfig

工具栏配置，排除不需要的工具按钮。

```javascript
export const toolbarConfig = {
  excludeKeys: ['fullScreen', 'code', 'codeBlock']
}
```

**排除的工具**：
- `fullScreen`: 全屏模式
- `code`: 代码块
- `codeBlock`: 行内代码

#### editorConfig

编辑器核心配置。

```javascript
export const editorConfig = {
  placeholder: '请输入内容...',
  // 编辑器错误处理
  onError: (errorType, detail) => {
    console.error('编辑器错误:', errorType, detail);
    if (errorType.includes('Cannot find a descendant at path')) {
      console.log('忽略编辑器路径访问错误，避免崩溃:', errorType);
      return;
    }
  },
  // 内容变更前的处理
  beforeChange: (context) => {
    // 检查并修复编辑器状态
  },
  // 监听内容变化事件
  onchange: (editor) => {
    imageManager.checkImagesDeletion(editor)
  },
  MENU_CONF: {
    uploadImage: {
      server: `${request.defaults.baseURL}/upload/image`,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024,  // 5MB
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      customInsert: function(res, insertFn) {
        // 自定义插入逻辑
      },
      onSuccess: (result, file) => {
        console.log('上传成功', result, file)
      },
      onFailed: (result, file) => {
        ElMessage.error('图片上传失败：' + (result?.message || '未知错误'))
      }
    }
  }
}
```

### 图片管理器 (imageManager)

管理编辑器中的图片生命周期。

#### 核心方法

##### checkImagesDeletion(editor)

检查并删除编辑器中已移除的图片。

```javascript
checkImagesDeletion: (editor) => {
  if (!editor) return

  const html = editor.getHtml()
  const newImages = []
  // 从 HTML 中提取所有图片 URL
  // ...

  // 检测被删除的图片
  const deletedImages = oldImages.filter(img => !newImages.includes(img))

  // 调用后端 API 删除本地文件
  if (deletedImages.length > 0) {
    deletedImages.forEach(imgUrl => {
      request.delete(`/upload/file?url=${encodeURIComponent(imgUrl)}`)
    })
  }

  // 更新图片列表
  imageManager.editorImagesMap.set(editor, newImages)
}
```

##### initEditorImages(editor)

初始化编辑器的图片列表。

```javascript
initEditorImages: (editor) => {
  if (!editor) return

  const html = editor.getHtml()
  const newImages = []
  // 从 HTML 中提取所有图片 URL
  // ...

  imageManager.editorImagesMap.set(editor, newImages)
}
```

##### resetImages(editor)

重置指定编辑器的图片列表。

```javascript
resetImages: (editor) => {
  if (editor) {
    imageManager.editorImagesMap.delete(editor)
  }
}
```

### 使用示例

```vue
<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { toolbarConfig, editorConfig, imageManager } from '../utils/editorConfig'

const editorRef = ref(null)

const handleEditorCreated = (editor) => {
  editorRef.value = editor
  // 初始化图片列表
  imageManager.initEditorImages(editor)
}

const handleSubmit = async () => {
  // 检查并删除编辑器中移除的图片
  imageManager.checkImagesDeletion(editorRef.value)
  // 提交数据...
}

onBeforeUnmount(() => {
  if (editorRef.value) {
    editorRef.value.destroy()
  }
})
</script>
```

---

## 测试与质量

### 错误处理策略

1. **请求错误**：
   - 超时：提示"请求超时，请重试"
   - 网络错误：提示"网络错误，请检查网络连接"
   - 其他错误：显示错误消息

2. **响应错误**：
   - 401 未授权：清除 Token 并跳转登录页
   - 其他错误码：显示后端返回的错误消息

3. **编辑器错误**：
   - 忽略路径访问错误，避免编辑器崩溃
   - 提供错误日志用于调试

### 安全性考虑

1. **Token 管理**：
   - 存储在 localStorage（可考虑迁移到 httpOnly cookie）
   - 每次请求自动添加到 Authorization 头
   - 401 响应自动清除 Token

2. **图片上传**：
   - 限制文件大小（5MB）
   - 限制文件类型（image/*）
   - 自动删除未使用的图片

---

## 常见问题 (FAQ)

### Q1: 如何修改 API 基础地址？

A: 编辑项目根目录的 `.env` 文件，修改 `VITE_API_BASE_URL` 变量。

### Q2: 为什么请求时提示 401 错误？

A: 检查以下几点：
1. Token 是否已设置
2. Token 是否已过期
3. 请求头中是否包含 Authorization 字段

### Q3: 如何自定义请求超时时间？

A: 编辑 `src/utils/api.js`，修改 `timeout` 配置：

```javascript
const request = axios.create({
  baseURL: __API_BASE_URL__,
  timeout: 60000  // 修改为 60 秒
})
```

### Q4: 编辑器图片上传失败怎么办？

A: 检查以下几点：
1. 后端上传接口是否正常
2. 图片大小是否超过 5MB
3. 网络连接是否正常
4. 服务器配置是否正确

### Q5: 如何清除所有登录信息？

A: 调用 `removeToken()` 清除 Token，浏览器会自动跳转到登录页。

---

## 相关文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/utils/api.js` | HTTP 客户端配置 |
| `src/utils/auth.js` | 认证管理 |
| `src/utils/editorConfig.js` | 编辑器配置 |
| `src/api/index.js` | API 接口封装 |
| `.env` | 环境变量配置 |

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-01-08 | 1.0.0 | 初始化工具模块文档 |

---

**文档生成时间**: 2025-01-08 17:12:45
