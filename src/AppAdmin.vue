<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <h2 v-if="!isCollapse">介质过程强化团队</h2>
        <h2 v-else>团</h2>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        class="menu"
        router
        unique-opened
      >
        <el-menu-item index="/home" class="menu-item">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-menu-item index="/news" class="menu-item">
          <el-icon><Document /></el-icon>
          <template #title>新闻动态</template>
        </el-menu-item>

        <el-menu-item index="/members" class="menu-item">
          <el-icon><User /></el-icon>
          <template #title>团队成员</template>
        </el-menu-item>

        <el-menu-item index="/publications" class="menu-item">
          <el-icon><Reading /></el-icon>
          <template #title>研究</template>
        </el-menu-item>

        <el-menu-item index="/projects" class="menu-item">
          <el-icon><Briefcase /></el-icon>
          <template #title>应用开发</template>
        </el-menu-item>

        <el-sub-menu index="culture" class="sub-menu">
          <template #title>
            <el-icon><Picture /></el-icon>
            <span>文化</span>
          </template>
          <el-menu-item index="/research-journeys" class="sub-menu-item">研究征途</el-menu-item>
          <el-menu-item index="/daily-moments" class="sub-menu-item">研途趣事</el-menu-item>
          <el-menu-item index="/culture" class="sub-menu-item">团队风采</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/recruitment" class="menu-item">
          <el-icon><Tickets /></el-icon>
          <template #title>招贤纳士</template>
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
  Fold,
  ArrowDown
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
      window.location.href = './index.html'
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
  font-family: 'Georgia', 'Times New Roman', serif;
}

/* ========== 侧边栏 ========== */
.sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #1a252f 100%);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

/* ========== Logo 区域 ========== */
.logo {
  height: 70px;
  line-height: 70px;
  text-align: center;
  color: white;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.logo::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3498db, #2ecc71, #3498db);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.logo h2 {
  margin: 0;
  padding: 0 12px;
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  position: relative;
  z-index: 1;
}

/* ========== 菜单基础样式 ========== */
.menu {
  border-right: none;
  background: transparent;
  padding: 12px 0;
}

/* ========== 菜单项统一样式 ========== */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.75) !important;
  background: transparent !important;
  font-size: 14px;
  height: 52px;
  line-height: 52px;
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  letter-spacing: 0.5px;
}

/* ========== 菜单项悬停效果 ========== */
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: rgba(52, 152, 219, 0.15) !important;
  color: #ffffff !important;
  transform: translateX(4px);
}

:deep(.el-menu-item:hover .el-icon),
:deep(.el-sub-menu__title:hover .el-icon) {
  color: #3498db !important;
  transform: scale(1.1);
}

/* ========== 菜单项激活状态 ========== */
:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  border: 1px solid rgba(52, 152, 219, 0.3);
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: linear-gradient(180deg, #2ecc71, #27ae60);
  border-radius: 0 4px 4px 0;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff !important;
}

/* ========== 子菜单样式 ========== */
:deep(.el-sub-menu .el-menu) {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 0;
}

:deep(.el-sub-menu .el-menu-item) {
  min-height: 44px;
  height: 44px;
  line-height: 44px;
  margin: 2px 12px;
  padding-left: 60px !important;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65) !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background: rgba(52, 152, 219, 0.1) !important;
  color: #ffffff !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background: rgba(52, 152, 219, 0.25) !important;
  color: #3498db !important;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

:deep(.el-sub-menu .el-menu-item.is-active::before) {
  display: none;
}

/* ========== 图标样式 ========== */
:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  margin-right: 10px;
  transition: all 0.3s ease;
}

/* ========== 子菜单展开图标 ========== */
:deep(.el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

:deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  color: #3498db;
  transform: rotateZ(90deg);
}

/* ========== 菜单宽度 ========== */
.menu:not(.el-menu--collapse) {
  width: 220px;
}

/* ========== 折叠状态 ========== */
:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu--collapse .el-menu-item),
:deep(.el-menu--collapse .el-sub-menu__title) {
  margin: 4px 8px;
  padding: 0 !important;
}

/* ========== 主容器 ========== */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* ========== 顶部导航栏 ========== */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e1e8ed;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

:deep(.header .el-button) {
  border: 1px solid #e1e8ed;
  background: white;
  color: #2c3e50;
  transition: all 0.3s ease;
}

:deep(.header .el-button:hover) {
  background: #3498db;
  border-color: #3498db;
  color: white;
  transform: rotate(180deg);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 24px;
  transition: all 0.3s ease;
  color: #2c3e50;
  font-weight: 500;
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  border: 1px solid transparent;
}

.user-dropdown:hover {
  background: rgba(52, 152, 219, 0.1);
  border-color: rgba(52, 152, 219, 0.2);
}

:deep(.user-dropdown .el-icon) {
  color: #3498db;
  font-size: 20px;
}

/* ========== 内容区域 ========== */
.content {
  background: transparent;
  padding: 24px;
  overflow-y: auto;
}

/* ========== 滚动条样式 ========== */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(52, 152, 219, 0.3);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(52, 152, 219, 0.5);
}

/* ========== 全局卡片样式 ========== */
:deep(.el-card) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  background: white;
  overflow: hidden;
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1e8ed;
  font-weight: 600;
  font-size: 15px;
  color: #2c3e50;
  padding: 16px 20px;
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  letter-spacing: 0.5px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* ========== 按钮样式 ========== */
:deep(.el-button--primary) {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
  background: linear-gradient(135deg, #2980b9 0%, #1f6dad 100%);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
  transform: translateY(-2px);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

:deep(.el-button--danger:hover),
:deep(.el-button--danger:focus) {
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
  transform: translateY(-2px);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

:deep(.el-button--success:hover),
:deep(.el-button--success:focus) {
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  box-shadow: 0 6px 16px rgba(46, 204, 113, 0.4);
  transform: translateY(-2px);
}

/* ========== 表格样式 ========== */
:deep(.el-table) {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.el-table__header-wrapper th) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  letter-spacing: 0.5px;
}

:deep(.el-table__body-wrapper tr:hover > td) {
  background-color: rgba(52, 152, 219, 0.05);
}

:deep(.el-table__body-wrapper td) {
  border-bottom: 1px solid #f1f3f5;
}

/* ========== 输入框样式 ========== */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

:deep(.el-input__wrapper:hover) {
  border-color: #3498db;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

/* ========== 对话框样式 ========== */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e1e8ed;
  padding: 20px 24px;
}

:deep(.el-dialog__title) {
  font-family: 'Georgia', 'Microsoft YaHei', serif;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/* ========== 标签样式 ========== */
:deep(.el-tag) {
  border-radius: 16px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* ========== 分页样式 ========== */
:deep(.el-pagination) {
  font-family: 'Georgia', 'Microsoft YaHei', serif;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  border-radius: 8px;
}

/* ========== 空状态样式 ========== */
:deep(.el-empty) {
  padding: 60px 20px;
}

:deep(.el-empty__description) {
  color: #7f8c8d;
  font-family: 'Georgia', 'Microsoft YaHei', serif;
}
</style>
