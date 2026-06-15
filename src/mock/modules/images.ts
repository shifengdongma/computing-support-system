import type { SystemImage, AiFrameworkImage, CustomImage, PaginatedData, PageParams } from '@/types'

function paginate<T>(list: T[], params: PageParams): PaginatedData<T> {
  const start = (params.page - 1) * params.pageSize
  const paged = list.slice(start, start + params.pageSize)
  return { list: paged, total: list.length, page: params.page, pageSize: params.pageSize }
}

export function getMockSystemImages(params: PageParams): PaginatedData<SystemImage> {
  const osList = ['Ubuntu 20.04', 'Ubuntu 22.04', 'CentOS 7.9', 'Rocky Linux 8.6']
  const statuses: Array<'ready' | 'building' | 'error'> = ['ready', 'ready', 'ready', 'building', 'error']
  const images: SystemImage[] = Array.from({ length: 15 }, (_, i) => ({
    id: `sys_img_${i + 1}`,
    name: `system-image-${i + 1}`,
    version: `1.${i}.0`,
    os: osList[i % 4],
    kernel: `5.${10 + i}.0`,
    size: `${5 + i * 2}GB`,
    type: 'system' as const,
    status: statuses[i % 5],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: `系统镜像 ${i + 1} 描述`,
  }))
  return paginate(images, params)
}

export function getMockAiFrameworkImages(params: PageParams): PaginatedData<AiFrameworkImage> {
  const frameworks = ['PyTorch', 'TensorFlow', 'JAX', 'PaddlePaddle']
  const statuses: Array<'ready' | 'building' | 'error'> = ['ready', 'ready', 'ready', 'building', 'error']
  const images: AiFrameworkImage[] = Array.from({ length: 20 }, (_, i) => ({
    id: `ai_img_${i + 1}`,
    name: `ai-image-${i + 1}`,
    version: `2.${i}.0`,
    framework: frameworks[i % 4],
    frameworkVersion: `${1 + (i % 3)}.${i % 10}.0`,
    cudaVersion: ['11.8', '12.1', '12.2'][i % 3],
    pythonVersion: '3.10',
    size: `${8 + i * 2}GB`,
    type: 'ai-framework' as const,
    status: statuses[i % 5],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: `AI框架镜像 ${i + 1}`,
    includedPackages: ['cuda', 'cudnn', 'nccl', 'transformers', 'torchvision'],
  }))
  return paginate(images, params)
}

export function getMockCustomImages(params: PageParams): PaginatedData<CustomImage> {
  const statuses: Array<'ready' | 'building' | 'error'> = ['ready', 'ready', 'building', 'error']
  const images: CustomImage[] = Array.from({ length: 10 }, (_, i) => ({
    id: `custom_img_${i + 1}`,
    name: `custom-image-${i + 1}`,
    version: `1.${i}.0`,
    baseImage: 'system-image-1',
    owner: `user${(i % 5) + 1}`,
    size: `${3 + i}GB`,
    type: 'custom' as const,
    status: statuses[i % 4],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: `自定义镜像 ${i + 1}`,
    dockerfile: `FROM base:1.0\nRUN pip install torch\nCOPY . /workspace`,
  }))
  return paginate(images, params)
}
