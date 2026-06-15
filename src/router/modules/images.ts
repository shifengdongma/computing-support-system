import type { RouteRecordRaw } from 'vue-router'

const imageRoutes: RouteRecordRaw[] = [
  {
    path: '/images',
    name: 'Images',
    redirect: '/images/system',
    meta: {
      title: '镜像环境',
      icon: 'Picture',
    },
    children: [
      {
        path: 'system',
        name: 'SystemImages',
        component: () => import('@/views/images/SystemImages.vue'),
        meta: { title: '系统镜像' },
      },
      {
        path: 'ai-framework',
        name: 'AiFrameworkImages',
        component: () => import('@/views/images/AiFrameworkImages.vue'),
        meta: { title: 'AI框架镜像' },
      },
      {
        path: 'custom',
        name: 'CustomImages',
        component: () => import('@/views/images/CustomImages.vue'),
        meta: { title: '自定义镜像' },
      },
    ],
  },
]

export default imageRoutes
