import request from '../request'
import type { MyJob, MyQuota, SshKey, Notification, PaginatedData, PageParams } from '@/types'
import { getMockMyJobs, getMockMyQuota, getMockSshKeys, getMockNotifications } from '@/mock/modules/workspace'

export function getMyJobs(params: PageParams): Promise<{ data: PaginatedData<MyJob> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockMyJobs(params) })
  }
  return request.get('/workspace/jobs', { params })
}

export function getMyQuota(): Promise<{ data: MyQuota }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockMyQuota() })
  }
  return request.get('/workspace/quota')
}

export function getSshKeys(): Promise<{ data: SshKey[] }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockSshKeys() })
  }
  return request.get('/workspace/ssh-keys')
}

export function createSshKey(data: { name: string; type: string }): Promise<{ data: SshKey }> {
  return request.post('/workspace/ssh-keys', data)
}

export function getNotifications(params: PageParams): Promise<{ data: PaginatedData<Notification> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockNotifications(params) })
  }
  return request.get('/workspace/notifications', { params })
}
