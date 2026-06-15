import request from '../request'
import type { DashboardData } from '@/types'
import { getMockDashboardData } from '@/mock/modules/dashboard'

export function getDashboardData(): Promise<{ data: DashboardData }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockDashboardData() })
  }
  return request.get('/dashboard/overview')
}
