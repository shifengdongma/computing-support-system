import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { setupRouterGuard } from './guard'
import dashboardRoutes from './modules/dashboard'
import resourceRoutes from './modules/resources'
import jobRoutes from './modules/jobs'
import userRoutes from './modules/users'
import monitorRoutes from './modules/monitor'
import imageRoutes from './modules/images'
import workspaceRoutes from './modules/workspace'
import settingsRoutes from './modules/settings'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      ...dashboardRoutes,
      ...resourceRoutes,
      ...jobRoutes,
      ...userRoutes,
      ...monitorRoutes,
      ...imageRoutes,
      ...workspaceRoutes,
      ...settingsRoutes,
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '404', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupRouterGuard(router)

export default router
