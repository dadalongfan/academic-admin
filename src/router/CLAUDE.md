# 路由模块 (router)

> **模块路径**: `src/router/`
> **最后更新**: 2025-01-08 17:12:45

[根目录](../../CLAUDE.md) > [src](../) > **router** > **路由模块**

---

## 模块职责

路由模块负责管理整个应用的页面路由，包括：

- **路由配置**：定义所有页面的路由规则
- **权限守卫**：验证用户登录状态
- **页面标题**：动态设置页面标题
- **懒加载**：按需加载页面组件

---

## 路由配置

### 路由列表

| 路径 | 名称 | 组件 | 页面标题 | 需要认证 |
|------|------|------|----------|----------|
| `/` | - | 重定向到 `/home` | - | - |
| `/home` | HomeManage | HomeManage.vue | 首页管理 | ✅ |
| `/leader` | LeaderManage | LeaderManage.vue | 负责人管理 | ✅ |
| `/news` | NewsManage | NewsManage.vue | 新闻管理 | ✅ |
| `/members` | MembersManage | MembersManage.vue | 成员管理 | ✅ |
| `/publications` | PublicationsManage | PublicationsManage.vue | 研究管理 | ✅ |
| `/projects` | ProjectsManage | ProjectsManage.vue | 应用开发管理 | ✅ |
| `/gallery` | GalleryManage | GalleryManage.vue | 相册管理 | ✅ |
| `/recruitment` | RecruitmentManage | RecruitmentManage.vue | 招聘管理 | ✅ |

### 路由结构

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '../utils/auth'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'HomeManage',
    component: () => import('../pages/HomeManage.vue'),
    meta: { title: '首页管理', requiresAuth: true }
  },
  {
    path: '/leader',
    name: 'LeaderManage',
    component: () => import('../pages/LeaderManage.vue'),
    meta: { title: '负责人管理', requiresAuth: true }
  },
  {
    path: '/news',
    name: 'NewsManage',
    component: () => import('../pages/NewsManage.vue'),
    meta: { title: '新闻管理', requiresAuth: true }
  },
  {
    path: '/members',
    name: 'MembersManage',
    component: () => import('../pages/MembersManage.vue'),
    meta: { title: '成员管理', requiresAuth: true }
  },
  {
    path: '/publications',
    name: 'PublicationsManage',
    component: () => import('../pages/PublicationsManage.vue'),
    meta: { title: '研究管理', requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'ProjectsManage',
    component: () => import('../pages/ProjectsManage.vue'),
    meta: { title: '应用开发管理', requiresAuth: true }
  },
  {
    path: '/gallery',
    name: 'GalleryManage',
    component: () => import('../pages/GalleryManage.vue'),
    meta: { title: '相册管理', requiresAuth: true }
  },
  {
    path: '/recruitment',
    name: 'RecruitmentManage',
    component: () => import('../pages/RecruitmentManage.vue'),
    meta: { title: '招聘管理', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
```

---

## 路由守卫

### 全局前置守卫

```javascript
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - Academic管理` : 'Academic管理'

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (getToken()) {
      // 已登录，放行
      next()
    } else {
      // 未登录，跳转到登录页
      window.location.href = './index.html'
    }
  } else {
    // 不需要认证，直接放行
    next()
  }
})
```

### 守卫逻辑

1. **页面标题设置**：
   - 根据路由的 `meta.title` 动态设置页面标题
   - 格式：`{页面标题} - Academic管理`

2. **认证检查**：
   - 检查路由的 `meta.requiresAuth` 字段
   - 如果需要认证，检查用户是否已登录
   - 未登录则跳转到登录页面

3. **登录判断**：
   - 调用 `getToken()` 检查是否存在 Token
   - Token 存在 → 放行
   - Token 不存在 → 跳转登录页

---

## 路由模式

### Hash 模式

```javascript
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
```

**使用原因**：
- 不需要服务器配置支持
- 部署简单，适用于静态文件托管
- URL 格式：`http://localhost:8083/admin.html#/home`

**URL 示例**：
- 登录页：`http://localhost:8083/index.html`
- 管理后台：`http://localhost:8083/admin.html#/home`
- 成员管理：`http://localhost:8083/admin.html#/members`

---

## 导航菜单

### 侧边栏菜单配置

侧边栏菜单在 `src/AppAdmin.vue` 中配置：

```vue
<el-menu :default-active="activeMenu" :collapse="isCollapse" router>
  <el-menu-item index="/home">
    <el-icon><HomeFilled /></el-icon>
    <span>首页</span>
  </el-menu-item>

  <el-menu-item index="/news">
    <el-icon><Document /></el-icon>
    <span>新闻动态</span>
  </el-menu-item>

  <el-menu-item index="/members">
    <el-icon><User /></el-icon>
    <span>团队成员</span>
  </el-menu-item>

  <el-menu-item index="/publications">
    <el-icon><Reading /></el-icon>
    <span>研究</span>
  </el-menu-item>

  <el-menu-item index="/projects">
    <el-icon><Briefcase /></el-icon>
    <span>应用开发</span>
  </el-menu-item>

  <el-menu-item index="/gallery">
    <el-icon><Picture /></el-icon>
    <span>相册</span>
  </el-menu-item>

  <el-menu-item index="/recruitment">
    <el-icon><Tickets /></el-icon>
    <span>招贤纳士</span>
  </el-menu-item>
</el-menu>
```

### 菜单图标

| 菜单项 | 图标 | Element Plus 图标组件 |
|--------|------|----------------------|
| 首页 | 🏠 | HomeFilled |
| 新闻动态 | 📄 | Document |
| 团队成员 | 👤 | User |
| 研究 | 📖 | Reading |
| 应用开发 | 💼 | Briefcase |
| 相册 | 🖼️ | Picture |
| 招贤纳士 | 🎫 | Tickets |

---

## 编程式导航

### 跳转到指定路由

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到首页
router.push('/home')

// 跳转到新闻管理
router.push('/news')

// 带参数跳转
router.push({ path: '/members', query: { roleId: 1 } })
```

### 返回上一页

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回上一页
router.back()
```

### 替换当前路由

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 替换当前路由（不保留历史记录）
router.replace('/home')
```

---

## 懒加载

所有页面组件都使用懒加载（动态导入）：

```javascript
component: () => import('../pages/HomeManage.vue')
```

**优势**：
- 减少初始加载体积
- 按需加载页面组件
- 提高首屏加载速度

**构建结果**：
每个页面会被打包成单独的 chunk 文件。

---

## 测试与质量

### 路由测试检查清单

- [ ] 所有路由都能正常访问
- [ ] 未登录用户无法访问需要认证的页面
- [ ] 登录后自动跳转到管理后台
- [ ] 退出登录后清除认证信息
- [ ] 页面标题正确显示
- [ ] 路由参数正确传递
- [ ] 懒加载组件正常加载

### 常见问题排查

1. **路由跳转不生效**：
   - 检查路由路径是否正确
   - 检查是否使用了 `router` 属性
   - 检查路由是否已注册

2. **权限守卫失效**：
   - 检查 `getToken()` 是否正常工作
   - 检查 `meta.requiresAuth` 是否设置
   - 检查登录页面路径是否正确

3. **页面标题不显示**：
   - 检查 `meta.title` 是否设置
   - 检查浏览器是否支持动态修改标题

---

## 常见问题 (FAQ)

### Q1: 如何添加新的路由？

A: 在 `routes` 数组中添加新路由：

```javascript
{
  path: '/newpage',
  name: 'NewPageManage',
  component: () => import('../pages/NewPageManage.vue'),
  meta: { title: '新页面管理', requiresAuth: true }
}
```

### Q2: 如何修改默认首页？

A: 修改根路由的重定向目标：

```javascript
{
  path: '/',
  redirect: '/news'  // 修改为新闻管理
}
```

### Q3: 如何实现路由嵌套？

A: 使用 `children` 配置子路由：

```javascript
{
  path: '/parent',
  component: ParentComponent,
  children: [
    {
      path: 'child',
      component: ChildComponent
    }
  ]
}
```

### Q4: 如何获取路由参数？

A: 使用 `useRoute` 获取路由信息：

```javascript
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取 query 参数
const id = route.query.id

// 获取 params 参数
const id = route.params.id
```

### Q5: 为什么使用 Hash 模式而不是 History 模式？

A: Hash 模式不需要服务器配置，部署更简单。如果需要使用 History 模式，需要修改路由配置并在服务器上设置回退路由。

---

## 相关文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/router/index.js` | 路由配置主文件 |
| `src/AppAdmin.vue` | 管理后台主组件（包含侧边栏菜单） |
| `src/AppLogin.vue` | 登录页面组件 |
| `src/utils/auth.js` | Token 认证管理 |

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-01-08 | 1.0.0 | 初始化路由模块文档 |

---

**文档生成时间**: 2025-01-08 17:12:45
