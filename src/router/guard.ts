import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'

const whiteList = ['/login']

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('token')
    if (token) {
      if (to.path === '/login') {
        next('/')
      } else {
        next()
      }
    } else {
      if (whiteList.includes(to.path)) {
        next()
      } else {
        // For development, allow access without login
        if (import.meta.env.VITE_USE_MOCK === 'true') {
          next()
        } else {
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  })
}
