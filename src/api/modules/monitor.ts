import request from '../request'
import type { NodeMetrics, AlertRule, AlertNotification, AuditLog, PaginatedData, PageParams } from '@/types'
import { getMockNodeMetrics, getMockAlertRules, getMockAlertNotifications, getMockAuditLogs } from '@/mock/modules/monitor'

export function getNodeMetrics(nodeId: string, timeRange: string): Promise<{ data: NodeMetrics }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockNodeMetrics(nodeId) })
  }
  return request.get('/monitor/metrics', { params: { nodeId, timeRange } })
}

export function getAlertRules(params: PageParams): Promise<{ data: PaginatedData<AlertRule> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockAlertRules(params) })
  }
  return request.get('/monitor/alert-rules', { params })
}

export function getAlertNotifications(params: PageParams): Promise<{ data: PaginatedData<AlertNotification> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockAlertNotifications(params) })
  }
  return request.get('/monitor/alerts', { params })
}

export function acknowledgeAlert(id: string): Promise<{ data: null }> {
  return request.post(`/monitor/alerts/${id}/acknowledge`)
}

export function getAuditLogs(params: PageParams): Promise<{ data: PaginatedData<AuditLog> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockAuditLogs(params) })
  }
  return request.get('/monitor/audit-logs', { params })
}
