import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['localhost', '218.78.28.69'],
    // 在云服务器中使用轮询模式监听文件变更，避免 inotify 失效
    watch: {
      usePolling: true,
    },
    proxy: {
      // 仅代理以 /api/ 开头的请求，避免拦截静态资源和 Vite 内部请求
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 双重保险：非 /api 前缀的请求一律跳过代理
        bypass(req) {
          if (!req.url?.startsWith('/api')) {
            return false
          }
        },
        configure: (proxy) => {
          proxy.on('error', (err, req) => {
            console.warn(`[Vite Proxy] 后端 8080 不可达 (${req.url}):`, err.message)
          })
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`,
      },
    },
  },
})
