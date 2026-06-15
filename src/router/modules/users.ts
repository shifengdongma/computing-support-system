import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    name: 'Users',
    redirect: '/users/management',
    meta: {
      title: '用户与配额',
      icon: 'User',
    },
    children: [
      {
        path: 'management',
        name: 'UserManagement',
        component: () => import('@/views/users/UserManagement.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'quota',
        name: 'QuotaManagement',
        component: () => import('@/views/users/QuotaManagement.vue'),
        meta: { title: '配额管理' },
      },
      {
        path: 'priority',
        name: 'PriorityPolicy',
        component: () => import('@/views/users/PriorityPolicy.vue'),
        meta: { title: '优先级策略' },
      },
    ],
  },
]

export default userRoutes
