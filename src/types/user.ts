// User types
export interface User {
  id: string
  username: string
  realName: string
  email: string
  department: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'disabled' | 'locked'
  createTime: string
  lastLogin: string
}

export interface Quota {
  id: string
  userId: string
  username: string
  maxJobs: number
  runningJobs: number
  maxCpus: number
  usedCpus: number
  maxGpus: number
  usedGpus: number
  maxStorage: string
  usedStorage: string
  maxWalltime: string
  validFrom: string
  validTo: string
}

export interface PriorityPolicy {
  id: string
  name: string
  type: 'fairshare' | 'fifo' | 'priority' | 'custom'
  weight: number
  description: string
  enabled: boolean
  createTime: string
  updateTime: string
}
