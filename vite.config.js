import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载当前模式的环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const API_BASE_URL = env.VITE_API_BASE_URL

  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL 环境变量未设置，请在 .env 文件中配置')
  }

  // 提取纯服务器地址（不含 /api 后缀）用于代理
  const SERVER_URL = API_BASE_URL.replace(/\/api$/, '')

  return {
    base: './',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      port: 8083,
      proxy: {
        '/api': {
          target: SERVER_URL,
          changeOrigin: true
        },
        '/uploads': {
          target: API_BASE_URL,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html')
        }
      }
    },
    // 定义全局常量替换
    define: {
      '__API_BASE_URL__': JSON.stringify(API_BASE_URL)
    }
  }
})
