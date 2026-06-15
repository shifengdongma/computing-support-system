import request from '../request'
import type { AuthConfig, SchedulePolicy, SystemAnnouncement, PaginatedData, PageParams } from '@/types'
import { getMockAuthConfigs, getMockSchedulePolicies, getMockAnnouncements } from '@/mock/modules/settings'

export function getAuthConfigs(): Promise<{ data: AuthConfig[] }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockAuthConfigs() })
  }
  return request.get('/settings/auth')
}

export function getSchedulePolicies(params: PageParams): Promise<{ data: PaginatedData<SchedulePolicy> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockSchedulePolicies(params) })
  }
  return request.get('/settings/schedule-policies', { params })
}

export function getAnnouncements(params: PageParams): Promise<{ data: PaginatedData<SystemAnnouncement> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockAnnouncements(params) })
  }
  return request.get('/settings/announcements', { params })
}
