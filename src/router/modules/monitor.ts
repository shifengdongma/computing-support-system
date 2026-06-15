import type { RouteRecordRaw } from 'vue-router'

const monitorRoutes: RouteRecordRaw[] = [
  {
    path: '/monitor',
    name: 'Monitor',
    redirect: '/monitor/realtime',
    meta: {
      title: '监控告警',
      icon: 'Bell',
    },
    children: [
      {
        path: 'realtime',
        name: 'RealTimeMonitor',
        component: () => import('@/views/monitor/RealTimeMonitor.vue'),
        meta: { title: '实时监控' },
      },
      {
        path: 'alert-rules',
        name: 'AlertRules',
        component: () => import('@/views/monitor/AlertRules.vue'),
        meta: { title: '告警规则' },
      },
      {
        path: 'alert-notifications',
        name: 'AlertNotification',
        component: () => import('@/views/monitor/AlertNotification.vue'),
        meta: { title: '告警通知' },
      },
      {
        path: 'audit-log',
        name: 'AuditLog',
        component: () => import('@/views/monitor/AuditLog.vue'),
        meta: { title: '审计日志' },
      },
    ],
  },
]

export default monitorRoutes
