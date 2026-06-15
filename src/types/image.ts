// Image types
export interface SystemImage {
  id: string
  name: string
  version: string
  os: string
  kernel: string
  size: string
  type: 'system'
  status: 'ready' | 'building' | 'error'
  createTime: string
  updateTime: string
  description: string
}

export interface AiFrameworkImage {
  id: string
  name: string
  version: string
  framework: string
  frameworkVersion: string
  cudaVersion: string
  pythonVersion: string
  size: string
  type: 'ai-framework'
  status: 'ready' | 'building' | 'error'
  createTime: string
  updateTime: string
  description: string
  includedPackages: string[]
}

export interface CustomImage {
  id: string
  name: string
  version: string
  baseImage: string
  owner: string
  size: string
  type: 'custom'
  status: 'ready' | 'building' | 'error'
  createTime: string
  updateTime: string
  description: string
  dockerfile: string
}
