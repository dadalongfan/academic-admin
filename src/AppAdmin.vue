<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo">
        <h2 v-if="!isCollapse">Academic管理</h2>
        <h2 v-else>A1</h2>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        class="menu"
        router
      >
        <el-menu-item index="/home">
          <el-icon><HomeFilled /></el-icon>
          <span>首页管理</span>
        </el-menu-item>

        <el-menu-item index="/news">
          <el-icon><Document /></el-icon>
          <span>新闻管理</span>
        </el-menu-item>

        <el-menu-item index="/members">
          <el-icon><User /></el-icon>
          <span>成员管理</span>
        </el-menu-item>

        <el-menu-item index="/publications">
          <el-icon><Reading /></el-icon>
          <span>科研管理</span>
        </el-menu-item>

        <el-menu-item index="/projects">
          <el-icon><Briefcase /></el-icon>
          <span>项目管理</span>
        </el-menu-item>

        <el-menu-item index="/gallery">
          <el-icon><Picture /></el-icon>
          <span>相册管理</span>
        </el-menu-item>

        <el-menu-item index="/recruitment">
          <el-icon><Tickets /></el-icon>
          <span>招聘管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="isCollapse ? Expand : Fold"
            circle
            @click="toggleCollapse"
          />
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-icon><UserFilled /></el-icon>
              <span>{{ username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import router from './router'
import {
  HomeFilled,
  Document,
  User,
  Reading,
  Briefcase,
  Picture,
  Tickets,
  UserFilled,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import { removeToken } from './utils/auth'

const route = useRoute()

const isCollapse = ref(false)
const username = ref('管理员')

// 当前激活的菜单
const activeMenu = computed(() => route?.path ?? '')

// 切换侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      removeToken()
      ElMessage.success('已退出登录')
      window.location.href = '/'
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.admin-container {
  height: 100vh;
  display: flex;
  font-family: 'Times New Roman', serif;
}

.sidebar {
  background-color: #1a3a5c;
  transition: width 0.3s;
  overflow-x: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  background-color: #0d2a47;
  border-bottom: 2px solid #3a6ea5;
}

.menu {
  border-right: none;
  background-color: #1a3a5c;
  color: #e6f7ff;
}

:deep(.el-menu-item) {
  color: #e6f7ff !important;
  background-color: #1a3a5c !important;
  font-size: 14px;
  height: 50px;
  line-height: 50px;
  transition: all 0.3s ease;
}

:deep(.el-menu-item:hover) {
  background-color: #2a5a8c !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #3a6ea5 !important;
  color: #ffffff !important;
  border-right: 4px solid #5089c6;
}

:deep(.el-menu-item .el-icon) {
  color: #5089c6 !important;
  font-size: 16px;
  margin-right: 8px;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff !important;
}

.menu:not(.el-menu--collapse) {
  width: 200px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fafafa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  border-bottom: 1px solid #e8f4fc;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  color: #1a3a5c;
  font-weight: 500;
}

.user-dropdown:hover {
  background-color: #e8f4fc;
}

:deep(.user-dropdown .el-icon) {
  color: #3a6ea5;
}

.content {
  background-color: #fafafa;
  padding: 24px;
  overflow-y: auto;
}

/* 页面标题样式 */
:deep(.el-card__header) {
  background-color: #ffffff;
  border-bottom: 1px solid #e8f4fc;
  font-weight: bold;
  font-size: 16px;
  color: #1a3a5c;
}

/* 按钮样式 */
:deep(.el-button--primary) {
  background-color: #3a6ea5;
  border-color: #3a6ea5;
}

:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
  background-color: #5089c6;
  border-color: #5089c6;
}

:deep(.el-button--danger) {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
}

:deep(.el-button--danger:hover),
:deep(.el-button--danger:focus) {
  background-color: #ff8787;
  border-color: #ff8787;
}

/* 表格样式 */
:deep(.el-table) {
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

:deep(.el-table__header-wrapper th) {
  background-color: #f0f8ff;
  color: #1a3a5c;
  font-weight: bold;
  border-bottom: 2px solid #e8f4fc;
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: #f0f8ff;
}
</style>
