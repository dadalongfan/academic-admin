<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>学术主页管理系统</h1>
        <p>请登录以继续</p>
      </div>

      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from './utils/api'
import { setToken, getToken } from './utils/auth'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

// 检查是否已登录
onMounted(() => {
  if (getToken()) {
    // 已登录，直接跳转到管理后台
    // hash 模式会自动路由到 /home
    window.location.href = './admin.html'
  }
})

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const res = await request.post('/auth/login', {
      username: loginForm.username,
      password: loginForm.password
    })

    // 保存Token
    setToken(res.data.token)

    ElMessage.success('登录成功')

    // 跳转到管理后台
    setTimeout(() => {
      window.location.href = './admin.html'
    }, 500)

  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  padding-top: 10vh;
  justify-content: flex-end;
  padding: 10vh 120px 0 120px;
  background: url('/logo.jpg') no-repeat center center;
  background-size: cover;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.login-card {
  width: 400px;
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.3);
  border-top: 4px solid #409eff;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.35);
  transform: translateY(-2px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 26px;
  color: #1a3a5c;
  margin-bottom: 12px;
  font-weight: bold;
  letter-spacing: 1px;
}

.login-header p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  opacity: 0.9;
}

.login-form {
  margin-top: 24px;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: rgba(224, 231, 255, 0.8);
  background-color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.95);
}

:deep(.el-input__prefix-inner .el-icon) {
  color: #409eff;
  font-size: 18px;
}

.login-button {
  width: 100%;
  background-color: #409eff;
  border-color: #409eff;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.login-button:hover),
:deep(.login-button:focus) {
  background-color: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 加载状态样式 */
:deep(.el-button--loading) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
</style>
