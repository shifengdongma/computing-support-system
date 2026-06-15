import type { MyJob, MyQuota, SshKey, Notification, PaginatedData, PageParams } from '@/types'

function paginate<T>(list: T[], params: PageParams): PaginatedData<T> {
  const start = (params.page - 1) * params.pageSize
  const paged = list.slice(start, start + params.pageSize)
  return { list: paged, total: list.length, page: params.page, pageSize: params.pageSize }
}

export function getMockMyJobs(params: PageParams): PaginatedData<MyJob> {
  const statuses: Array<'running' | 'queued' | 'completed' | 'failed'> = ['running', 'running', 'queued', 'completed', 'failed']
  const jobs: MyJob[] = Array.from({ length: 25 }, (_, i) => ({
    id: `my_job_${i + 1}`,
    name: `my_training_${i + 1}`,
    status: statuses[i % 5],
    partition: ['gpu', 'cpu'][i % 2],
    nodes: 1 + (i % 2),
    cpus: 8 + (i % 4) * 4,
    gpus: i % 2 === 0 ? 1 + (i % 4) : 0,
    submitTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    elapsed: statuses[i % 5] === 'running' ? `${Math.floor(Math.random() * 24)}:00:00` : '-',
    output: `my_job_${i + 1}.out`,
  }))
  return paginate(jobs, params)
}

export function getMockMyQuota(): MyQuota {
  return {
    maxJobs: 50,
    runningJobs: 12,
    maxCpus: 128,
    usedCpus: 64,
    maxGpus: 8,
    usedGpus: 4,
    maxStorage: '500GB',
    usedStorage: '156GB',
    maxWalltime: '168:00:00',
  }
}

export function getMockSshKeys(): SshKey[] {
  return [
    { id: 'ssh_1', name: 'work-laptop', fingerprint: 'SHA256:abc123...', type: 'ed25519', bits: 256, createTime: '2024-01-15', lastUsed: '2024-06-01' },
    { id: 'ssh_2', name: 'home-desktop', fingerprint: 'SHA256:def456...', type: 'rsa', bits: 4096, createTime: '2024-03-20', lastUsed: '2024-06-05' },
    { id: 'ssh_3', name: 'jump-server', fingerprint: 'SHA256:ghi789...', type: 'ecdsa', bits: 521, createTime: '2024-05-10', lastUsed: '2024-06-08' },
  ]
}

export function getMockNotifications(params: PageParams): PaginatedData<Notification> {
  const types: Array<'system' | 'alert' | 'job' | 'quota'> = ['system', 'alert', 'job', 'quota']
  const notifications: Notification[] = Array.from({ length: 40 }, (_, i) => ({
    id: `notif_${i + 1}`,
    title: `通知${i + 1}`,
    content: `您有一条新通知：作业${i + 1}已完成运行`,
    type: types[i % 4],
    read: i > 5,
    time: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  }))
  return paginate(notifications, params)
}
