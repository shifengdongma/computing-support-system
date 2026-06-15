import request from '../request'
import type { Job, JobSubmission, JobQueueStats, JobHistoryFilter, PaginatedData } from '@/types'
import { getMockRunningJobs, getMockQueuedJobs, getMockJobHistory, getMockQueueStats } from '@/mock/modules/jobs'

export function submitJob(data: JobSubmission): Promise<{ data: { jobId: string } }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: { jobId: `job_${Date.now()}` } })
  }
  return request.post('/jobs/submit', data)
}

export function getRunningJobs(params: { page: number; pageSize: number }): Promise<{ data: PaginatedData<Job> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockRunningJobs(params) })
  }
  return request.get('/jobs/running', { params })
}

export function getQueuedJobs(params: { page: number; pageSize: number }): Promise<{ data: PaginatedData<Job> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockQueuedJobs(params) })
  }
  return request.get('/jobs/queued', { params })
}

export function getJobHistory(filter: JobHistoryFilter): Promise<{ data: PaginatedData<Job> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockJobHistory(filter) })
  }
  return request.get('/jobs/history', { params: filter })
}

export function getQueueStats(): Promise<{ data: JobQueueStats[] }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockQueueStats() })
  }
  return request.get('/jobs/queues')
}

export function cancelJob(jobId: string): Promise<{ data: null }> {
  return request.post(`/jobs/${jobId}/cancel`)
}
