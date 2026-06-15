import type { RouteRecordRaw } from 'vue-router'

const jobRoutes: RouteRecordRaw[] = [
  {
    path: '/jobs',
    name: 'Jobs',
    redirect: '/jobs/submit',
    meta: {
      title: '作业调度',
      icon: 'Operation',
    },
    children: [
      {
        path: 'submit',
        name: 'JobSubmit',
        component: () => import('@/views/jobs/JobSubmit.vue'),
        meta: { title: '提交作业' },
      },
      {
        path: 'queues',
        name: 'JobQueues',
        component: () => import('@/views/jobs/JobQueues.vue'),
        meta: { title: '作业队列' },
      },
      {
        path: 'running',
        name: 'RunningJobs',
        component: () => import('@/views/jobs/RunningJobs.vue'),
        meta: { title: '运行中作业' },
      },
      {
        path: 'queued',
        name: 'QueuedJobs',
        component: () => import('@/views/jobs/QueuedJobs.vue'),
        meta: { title: '排队中作业' },
      },
      {
        path: 'history',
        name: 'HistoryJobs',
        component: () => import('@/views/jobs/HistoryJobs.vue'),
        meta: { title: '历史作业' },
      },
    ],
  },
]

export default jobRoutes
