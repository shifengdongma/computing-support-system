// Monitor types
export interface MetricPoint {
  time: string
  value: number
}

export interface NodeMetrics {
  nodeId: string
  nodeName: string
  cpuUsage: MetricPoint[]
  memoryUsage: MetricPoint[]
  gpuUsage: MetricPoint[]
  gpuMemory: MetricPoint[]
  diskIO: number
  networkIO: number
  temperature: number
  powerUsage: string
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  duration: string
  severity: 'critical' | 'warning' | 'info'
  enabled: boolean
  notifyGroup: string[]
  createTime: string
}

export interface AlertNotification {
  id: string
  ruleId: string
  ruleName: string
  level: 'critical' | 'warning' | 'info'
  message: string
  nodeName: string
  metricValue: string
  threshold: string
  time: string
  acknowledged: boolean
  acknowledgedBy: string
  acknowledgedTime: string
}

export interface AuditLog {
  id: string
  user: string
  action: string
  resource: string
  detail: string
  ip: string
  time: string
  result: 'success' | 'failure'
}
