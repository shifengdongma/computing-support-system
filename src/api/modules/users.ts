import request from '../request'
import type { User, Quota, PriorityPolicy, PaginatedData, PageParams } from '@/types'
import { getMockUsers, getMockQuotas, getMockPriorityPolicies } from '@/mock/modules/users'

export function getUsers(params: PageParams): Promise<{ data: PaginatedData<User> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockUsers(params) })
  }
  return request.get('/users', { params })
}

export function createUser(data: Partial<User>): Promise<{ data: User }> {
  return request.post('/users', data)
}

export function updateUser(id: string, data: Partial<User>): Promise<{ data: User }> {
  return request.put(`/users/${id}`, data)
}

export function getQuotas(params: PageParams): Promise<{ data: PaginatedData<Quota> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockQuotas(params) })
  }
  return request.get('/users/quotas', { params })
}

export function getPriorityPolicies(params: PageParams): Promise<{ data: PaginatedData<PriorityPolicy> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockPriorityPolicies(params) })
  }
  return request.get('/users/policies', { params })
}
