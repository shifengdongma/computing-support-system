import type { RouteRecordRaw } from 'vue-router'

const resourceRoutes: RouteRecordRaw[] = [
  {
    path: '/resources',
    name: 'Resources',
    redirect: '/resources/physical-nodes',
    meta: {
      title: '资源管理',
      icon: 'Monitor',
    },
    children: [
      {
        path: 'physical-nodes',
        name: 'PhysicalNodes',
        component: () => import('@/views/resources/PhysicalNodes.vue'),
        meta: { title: '物理节点' },
      },
      {
        path: 'gpu-pool',
        name: 'GpuResourcePool',
        component: () => import('@/views/resources/GpuResourcePool.vue'),
        meta: { title: 'GPU资源池' },
      },
      {
        path: 'cpu-memory',
        name: 'CpuMemoryResources',
        component: () => import('@/views/resources/CpuMemoryResources.vue'),
        meta: { title: 'CPU与内存' },
      },
      {
        path: 'storage',
        name: 'StorageResources',
        component: () => import('@/views/resources/StorageResources.vue'),
        meta: { title: '存储资源' },
      },
      {
        path: 'network',
        name: 'NetworkResources',
        component: () => import('@/views/resources/NetworkResources.vue'),
        meta: { title: '网络资源' },
      },
    ],
  },
]

export default resourceRoutes
