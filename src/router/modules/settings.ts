import type { RouteRecordRaw } from 'vue-router'

const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: 'Settings',
    redirect: '/settings/auth',
    meta: {
      title: '系统设置',
      icon: 'Setting',
    },
    children: [
      {
        path: 'auth',
        name: 'AuthConfig',
        component: () => import('@/views/settings/AuthConfig.vue'),
        meta: { title: '认证配置' },
      },
      {
        path: 'schedule-policy',
        name: 'SchedulePolicy',
        component: () => import('@/views/settings/SchedulePolicy.vue'),
        meta: { title: '调度策略' },
      },
      {
        path: 'audit-log',
        name: 'SettingsAuditLog',
        component: () => import('@/views/settings/AuditLog.vue'),
        meta: { title: '审计日志' },
      },
      {
        path: 'announcement',
        name: 'SystemAnnouncement',
        component: () => import('@/views/settings/SystemAnnouncement.vue'),
        meta: { title: '系统公告' },
      },
    ],
  },
]

export default settingsRoutes
