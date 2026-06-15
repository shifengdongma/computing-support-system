import type { Job, JobQueueStats, PaginatedData, JobHistoryFilter } from '@/types'

function paginate<T>(list: T[], page: number, pageSize: number): PaginatedData<T> {
  const start = (page - 1) * pageSize
  const paged = list.slice(start, start + pageSize)
  return { list: paged, total: list.length, page, pageSize }
}

function generateJob(index: number, statuses: Array<'running' | 'queued' | 'completed' | 'failed' | 'cancelled'>): Job {
  const status = statuses[index % statuses.length]
  const partitions = ['gpu', 'cpu', 'high-mem', 'debug']
  return {
    id: `job_${String(index + 1).padStart(4, '0')}`,
    name: `training_task_${index + 1}`,
    user: `user_${(index % 20) + 1}`,
    partition: partitions[index % 4],
    project: `project_${(index % 5) + 1}`,
    status,
    priority: 1 + (index % 10),
    nodes: 1 + (index % 4),
    cpus: 8 + (index % 8) * 4,
    gpus: 1 + (index % 8),
    memory: `${32 + (index % 8) * 32}GB`,
    walltime: '24:00:00',
    submitTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    startTime: status !== 'queued' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : '-',
    endTime: ['completed', 'failed', 'cancelled'].includes(status) ? new Date(Date.now() - Math.random() * 86400000).toISOString() : '-',
    elapsed: status === 'running' ? `${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00` : '-',
    remaining: status === 'running' ? `${Math.floor(Math.random() * 12)}:00:00` : '-',
    output: `job_${index + 1}.out`,
  }
}

export function getMockRunningJobs(params: { page: number; pageSize: number }): PaginatedData<Job> {
  const list = Array.from({ length: 156 }, (_, i) => generateJob(i, ['running']))
  return paginate(list, params.page, params.pageSize)
}

export function getMockQueuedJobs(params: { page: number; pageSize: number }): PaginatedData<Job> {
  const list = Array.from({ length: 42 }, (_, i) => generateJob(i, ['queued']))
  return paginate(list, params.page, params.pageSize)
}

export function getMockJobHistory(filter: JobHistoryFilter): PaginatedData<Job> {
  const statuses: Array<'completed' | 'failed' | 'cancelled'> = ['completed', 'completed', 'completed', 'failed', 'cancelled']
  let list = Array.from({ length: 250 }, (_, i) => generateJob(i, statuses))
  if (filter.status) {
    list = list.filter(j => j.status === filter.status)
  }
  if (filter.user) {
    list = list.filter(j => j.user.includes(filter.user!))
  }
  return paginate(list, filter.page, filter.pageSize)
}

export function getMockQueueStats(): JobQueueStats[] {
  return [
    { partition: 'gpu', total: 120, running: 90, queued: 30, nodes: 'node[001-030]', state: 'up' },
    { partition: 'cpu', total: 50, running: 35, queued: 15, nodes: 'node[031-050]', state: 'up' },
    { partition: 'high-mem', total: 20, running: 18, queued: 2, nodes: 'node[051-055]', state: 'drain' },
    { partition: 'debug', total: 16, running: 13, queued: 3, nodes: 'node[056-059]', state: 'up' },
  ]
}
