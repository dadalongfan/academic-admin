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
    window.location.href = '/admin.html'
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
      window.location.href = '/admin.html'
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a3a5c 0%, #3a6ea5 100%);
  font-family: 'Times New Roman', serif;
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  border-top: 4px solid #5089c6;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  color: #1a3a5c;
  margin-bottom: 12px;
  font-weight: bold;
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
}

.login-form {
  margin-top: 24px;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
  border-radius: 4px;
  border-color: #e8f4fc;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  border-color: #5089c6;
  box-shadow: 0 0 0 2px rgba(80, 137, 198, 0.1);
}

:deep(.el-input__prefix-inner .el-icon) {
  color: #5089c6;
}

.login-button {
  width: 100%;
  background-color: #3a6ea5;
  border-color: #3a6ea5;
  height: 42px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.login-button:hover),
:deep(.login-button:focus) {
  background-color: #5089c6;
  border-color: #5089c6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(80, 137, 198, 0.3);
}

/* 加载状态样式 */
:deep(.el-button--loading) {
  background-color: #5089c6;
  border-color: #5089c6;
}
</style>
