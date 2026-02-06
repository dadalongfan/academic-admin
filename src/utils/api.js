import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from './auth'

// 使用 Vite 注入的全局常量
if (typeof __API_BASE_URL__ === 'undefined') {
  throw new Error('__API_BASE_URL__ 未定义，请检查 vite.config.js 配置')
}

const API_BASE_URL = __API_BASE_URL__

// 获取完整的图片URL用于预览
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

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
})

// 导出配置和工具函数
export { API_BASE_URL, getFullImageUrl }

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加Token到请求头
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

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data

    // 如果返回的状态码不是200，说明接口有问题
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401: 未授权，跳转到登录页
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

    // 处理网络错误
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

export default request
