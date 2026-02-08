# 成员管理模块 (MembersManage)

> **模块路径**: `src/pages/MembersManage.vue`
> **最后更新**: 2025-01-08 17:12:45

[根目录](../../CLAUDE.md) > [pages](../) > **成员管理模块**

---

## 模块职责

成员管理模块负责管理学术团队的所有成员信息，包括：

- **成员信息管理**：成员基本信息、联系方式、研究方向等
- **角色管理**：成员角色（指导教师、专任教师、研究生、校友等）
- **角色排序**：调整角色显示顺序
- **成员头像管理**：上传和管理成员头像
- **毕业状态管理**：标记成员是否已毕业

---

## 入口与启动

### 路由配置

```javascript
// src/router/index.js
{
  path: '/members',
  name: 'MembersManage',
  component: () => import('../pages/MembersManage.vue'),
  meta: { title: '成员管理', requiresAuth: true }
}
```

### 访问路径

- **相对路径**: `/members`
- **完整路径**: `http://localhost:8083/admin.html#/members`

---

## 对外接口

### 模块结构

```vue
<template>
  <div class="members-manage">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- 成员管理 -->
      <el-tab-pane label="成员管理" name="members">
        <!-- 成员列表与编辑 -->
      </el-tab-pane>

      <!-- 角色管理 -->
      <el-tab-pane label="角色管理" name="roles">
        <!-- 角色列表与编辑 -->
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

### 主要功能接口

#### 1. 成员管理 API

| 功能 | 方法 | API 端点 |
|------|------|----------|
| 获取成员列表 | `loadMembersList()` | `GET /members/list` |
| 按角色获取成员 | `loadMembersList()` | `GET /members/list/by-role` |
| 获取成员详情 | `openMemberDialog()` | `GET /members/{id}` |
| 添加成员 | `handleSubmitMember()` | `POST /members` |
| 更新成员 | `handleSubmitMember()` | `PUT /members/{id}` |
| 删除成员 | `handleDeleteMember()` | `DELETE /members/{id}` |
| 上传头像 | `handleAvatarSuccess()` | `POST /upload/avatar` |
| 删除旧头像 | `beforeAvatarUpload()` | `DELETE /upload/file?url={url}` |

#### 2. 角色管理 API

| 功能 | 方法 | API 端点 |
|------|------|----------|
| 获取角色列表 | `loadRolesList()` | `GET /member-roles/list` |
| 获取可见角色 | `loadRolesList()` | `GET /member-roles/visible` |
| 获取角色详情 | `openRoleDialog()` | `GET /member-roles/{id}` |
| 添加角色 | `handleSubmitRole()` | `POST /member-roles` |
| 更新角色 | `handleSubmitRole()` | `PUT /member-roles/{id}` |
| 删除角色 | `handleDeleteRole()` | `DELETE /member-roles/{id}` |
| 更新排序 | `moveUp/moveDown` | `PUT /member-roles/sort` |
| 切换显示状态 | `handleVisibilityChange()` | `PUT /member-roles/{id}/visibility?isVisible={bool}` |
| 获取成员数量 | `loadMemberCounts()` | `GET /member-roles/{id}/member-count` |

---

## 关键依赖与配置

### API 导入

```javascript
import { memberApi, memberRoleApi } from '../api'
```

### API 模块结构

```javascript
// src/api/index.js
export const memberApi = {
  getList: () => request.get('/members/list'),
  getListByRole: () => request.get('/members/list/by-role'),
  getByRoleId: (roleId) => request.get(`/members/role/${roleId}`),
  getById: (id) => request.get(`/members/${id}`),
  create: (data) => request.post('/members', data),
  update: (id, data) => request.put(`/members/${id}`, data),
  delete: (id) => request.delete(`/members/${id}`),
  getSupervisors: () => request.get('/members/supervisors'),
  getTeachers: () => request.get('/members/teachers'),
  getCurrentGraduates: () => request.get('/members/graduates/current'),
  getGraduatedStudents: () => request.get('/members/graduates/completed')
}

export const memberRoleApi = {
  getList: () => request.get('/member-roles/list'),
  getVisibleList: () => request.get('/member-roles/visible'),
  getById: (id) => request.get(`/member-roles/${id}`),
  create: (data) => request.post('/member-roles', data),
  update: (id, data) => request.put(`/member-roles/${id}`, data),
  delete: (id) => request.delete(`/member-roles/${id}`),
  updateSort: (data) => request.put('/member-roles/sort', data),
  toggleVisibility: (id, isVisible) => request.put(`/member-roles/${id}/visibility?isVisible=${isVisible}`),
  getMemberCount: (roleId) => request.get(`/member-roles/${roleId}/member-count`)
}
```

### 图片上传配置

```javascript
const uploadAction = computed(() => {
  if (import.meta.env.PROD) {
    return `${API_BASE_URL}/upload/avatar`
  }
  return '/api/upload/avatar'
})
```

**上传限制**：
- 文件类型：JPEG/PNG
- 文件大小：最大 2MB

---

## 数据模型

### 成员数据结构

```javascript
const memberForm = {
  id: null,                  // 成员 ID
  name: '',                  // 姓名
  roleId: null,              // 角色 ID
  avatarUrl: '',             // 头像 URL
  email: '',                 // 邮箱
  phone: '',                 // 电话
  grade: null,               // 年份（如 2024）
  isGraduated: false,        // 是否毕业
  honors: '',                // 荣誉标记
  bio: '',                   // 个人简介
  researchDirection: '',     // 研究方向
  status: 1                  // 状态（1=启用，0=禁用）
}
```

### 角色数据结构

```javascript
const roleForm = {
  id: null,              // 角色 ID
  name: '',              // 角色名称（如"指导教师"、"研究生"）
  sortOrder: 0,          // 排序顺序
  isVisible: true,       // 是否显示
  status: 1              // 状态（1=启用，0=禁用）
}
```

### 预定义角色类型

系统支持以下角色类型，使用不同颜色标签区分：

| 角色名称 | 标签颜色 | 说明 |
|---------|---------|------|
| 指导教师 | danger (红色) | 团队负责人/导师 |
| 专任教师 | warning (橙色) | 团队教师 |
| 研究生 | success (绿色) | 在读研究生 |
| 校友 | info (灰色) | 已毕业成员 |

---

## 测试与质量

### 表单验证规则

#### 成员信息验证

```javascript
const memberRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
}
```

#### 角色信息验证

```javascript
const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}
```

### 角色删除保护

```javascript
const handleDeleteRole = async (row) => {
  const count = memberCounts.value[row.id] || 0
  if (count > 0) {
    ElMessage.warning(`该角色下有 ${count} 个成员，无法删除`)
    return
  }
  // 执行删除...
}
```

**保护机制**：角色下有成员时无法删除，需先将成员移除或更改角色。

### 头像上传前处理

```javascript
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

  // 删除旧头像
  if (memberForm.avatarUrl) {
    try {
      await request.delete(`/upload/file?url=${encodeURIComponent(memberForm.avatarUrl)}`)
    } catch (error) {
      console.error('删除旧头像时发生错误:', error)
    }
  }

  return true
}
```

---

## 常见问题 (FAQ)

### Q1: 如何调整角色显示顺序？

A: 在角色管理页面，使用"上移"/"下移"按钮调整角色顺序。排序会自动交换相邻角色的 `sortOrder` 值。

### Q2: 如何标记成员已毕业？

A: 编辑成员信息，将"是否毕业"开关切换为"是"。已毕业成员会在列表中显示"毕业"标签。

### Q3: 角色无法删除怎么办？

A: 检查该角色下是否还有成员。如果有成员，需要先将成员的角色更改为其他角色，或删除这些成员后才能删除角色。

### Q4: 成员列表如何按角色筛选？

A: 在成员管理页面，使用"角色"下拉框选择要筛选的角色，点击"搜索"按钮即可。

### Q5: 头像上传失败怎么办？

A: 检查以下几点：
1. 图片格式是否为 JPG 或 PNG
2. 图片大小是否超过 2MB
3. 后端服务是否正常运行
4. 上传接口配置是否正确

---

## 相关文件清单

| 文件路径 | 说明 |
|---------|------|
| `src/pages/MembersManage.vue` | 成员管理主组件 |
| `src/api/index.js` | 成员和角色 API 封装 |
| `src/utils/api.js` | HTTP 客户端配置 |
| `src/utils/auth.js` | Token 认证管理 |

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|----------|
| 2025-01-08 | 1.0.0 | 初始化模块文档 |

---

**文档生成时间**: 2025-01-08 17:12:45
