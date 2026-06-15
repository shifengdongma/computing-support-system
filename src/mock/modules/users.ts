import type { User, Quota, PriorityPolicy, PaginatedData, PageParams } from '@/types'

function paginate<T>(list: T[], params: PageParams): PaginatedData<T> {
  const start = (params.page - 1) * params.pageSize
  const paged = list.slice(start, start + params.pageSize)
  return { list: paged, total: list.length, page: params.page, pageSize: params.pageSize }
}

export function getMockUsers(params: PageParams): PaginatedData<User> {
  const departments = ['AI研究院', '大数据部', '基础架构部', '算法中台', '风控部']
  const roles: Array<'admin' | 'user' | 'viewer'> = ['admin', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'viewer']
  const statuses: Array<'active' | 'disabled' | 'locked'> = ['active', 'active', 'active', 'active', 'active', 'disabled', 'locked']

  const users: User[] = Array.from({ length: 85 }, (_, i) => ({
    id: `user_${String(i + 1).padStart(3, '0')}`,
    username: `user${i + 1}`,
    realName: `用户${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: departments[i % 5],
    role: roles[i % 10],
    status: statuses[i % 7],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    lastLogin: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  }))
  return paginate(users, params)
}

export function getMockQuotas(params: PageParams): PaginatedData<Quota> {
  const quotas: Quota[] = Array.from({ length: 85 }, (_, i) => ({
    id: `quota_${i + 1}`,
    userId: `user_${String(i + 1).padStart(3, '0')}`,
    username: `user${i + 1}`,
    maxJobs: 10 + (i % 5) * 10,
    runningJobs: Math.floor(Math.random() * 15),
    maxCpus: 32 + (i % 4) * 32,
    usedCpus: Math.floor(Math.random() * 64),
    maxGpus: 4 + (i % 3) * 4,
    usedGpus: Math.floor(Math.random() * 8),
    maxStorage: `${100 + (i % 5) * 100}GB`,
    usedStorage: `${20 + Math.floor(Math.random() * 180)}GB`,
    maxWalltime: '168:00:00',
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
  }))
  return paginate(quotas, params)
}

export function getMockPriorityPolicies(params: PageParams): PaginatedData<PriorityPolicy> {
  const types: Array<'fairshare' | 'fifo' | 'priority' | 'custom'> = ['fairshare', 'fifo', 'priority', 'custom']
  const policies: PriorityPolicy[] = Array.from({ length: 8 }, (_, i) => ({
    id: `policy_${i + 1}`,
    name: `策略${i + 1}`,
    type: types[i % 4],
    weight: 1 + i * 10,
    description: `优先级调度策略${i + 1}`,
    enabled: i < 4,
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }))
  return paginate(policies, params)
}
