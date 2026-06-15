import type { RouteRecordRaw } from 'vue-router'

const workspaceRoutes: RouteRecordRaw[] = [
  {
    path: '/workspace',
    name: 'Workspace',
    redirect: '/workspace/my-jobs',
    meta: {
      title: '个人工作区',
      icon: 'HomeFilled',
    },
    children: [
      {
        path: 'my-jobs',
        name: 'MyJobs',
        component: () => import('@/views/workspace/MyJobs.vue'),
        meta: { title: '我的作业' },
      },
      {
        path: 'my-quota',
        name: 'MyQuota',
        component: () => import('@/views/workspace/MyQuota.vue'),
        meta: { title: '我的配额' },
      },
      {
        path: 'ssh-keys',
        name: 'MySshKeys',
        component: () => import('@/views/workspace/MySshKeys.vue'),
        meta: { title: 'SSH密钥' },
      },
      {
        path: 'notifications',
        name: 'MyNotifications',
        component: () => import('@/views/workspace/MyNotifications.vue'),
        meta: { title: '消息通知' },
      },
    ],
  },
]

export default workspaceRoutes
