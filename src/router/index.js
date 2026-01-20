import { createRouter, createWebHistory } from 'vue-router'
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
    meta: { title: '科研管理', requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'ProjectsManage',
    component: () => import('../pages/ProjectsManage.vue'),
    meta: { title: '项目管理', requiresAuth: true }
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
  history: createWebHistory('/admin.html'),
  routes
})

// 全局前置守卫
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
      window.location.href = '/'
    }
  } else {
    // 不需要认证，直接放行
    next()
  }
})

export default router
