import type { NodeMetrics, AlertRule, AlertNotification, AuditLog, PaginatedData, PageParams } from '@/types'

function paginate<T>(list: T[], params: PageParams): PaginatedData<T> {
  const start = (params.page - 1) * params.pageSize
  const paged = list.slice(start, start + params.pageSize)
  return { list: paged, total: list.length, page: params.page, pageSize: params.pageSize }
}

function generateMetricPoints(count: number): { time: string; value: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(Date.now() - (count - i) * 60000).toISOString(),
    value: 30 + Math.random() * 60,
  }))
}

export function getMockNodeMetrics(nodeId: string): NodeMetrics {
  return {
    nodeId,
    nodeName: `compute-${nodeId.replace('node_', '')}`,
    cpuUsage: generateMetricPoints(60),
    memoryUsage: generateMetricPoints(60),
    gpuUsage: generateMetricPoints(30),
    gpuMemory: generateMetricPoints(30),
    diskIO: Math.floor(Math.random() * 500),
    networkIO: Math.floor(Math.random() * 100),
    temperature: 55 + Math.floor(Math.random() * 30),
    powerUsage: `${200 + Math.floor(Math.random() * 200)}W`,
  }
}

export function getMockAlertRules(params: PageParams): PaginatedData<AlertRule> {
  const metrics = ['cpu_usage', 'gpu_temp', 'memory_usage', 'disk_usage', 'network_packet_loss']
  const severities: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'info']
  const conditions: Array<'gt' | 'lt' | 'eq'> = ['gt', 'lt', 'eq']

  const rules: AlertRule[] = Array.from({ length: 15 }, (_, i) => ({
    id: `rule_${i + 1}`,
    name: `告警规则${i + 1}`,
    metric: metrics[i % 5],
    condition: conditions[i % 3],
    threshold: [90, 85, 95, 80, 5][i % 5],
    duration: '5m',
    severity: severities[i % 3],
    enabled: i % 3 !== 0,
    notifyGroup: ['admin@example.com', 'ops@example.com'],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
  }))
  return paginate(rules, params)
}

export function getMockAlertNotifications(params: PageParams): PaginatedData<AlertNotification> {
  const levels: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'warning', 'info']
  const alerts: AlertNotification[] = Array.from({ length: 30 }, (_, i) => ({
    id: `notification_${i + 1}`,
    ruleId: `rule_${(i % 15) + 1}`,
    ruleName: `告警规则${(i % 15) + 1}`,
    level: levels[i % 4],
    message: `节点 compute-${String(i + 1).padStart(2, '0')} 触发告警，指标超过阈值`,
    nodeName: `compute-${String(i + 1).padStart(2, '0')}`,
    metricValue: `${80 + Math.floor(Math.random() * 20)}%`,
    threshold: '90%',
    time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    acknowledged: i % 4 === 0,
    acknowledgedBy: i % 4 === 0 ? 'admin' : '',
    acknowledgedTime: i % 4 === 0 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : '',
  }))
  return paginate(alerts, params)
}

export function getMockAuditLogs(params: PageParams): PaginatedData<AuditLog> {
  const users = ['admin', 'user1', 'user2', 'ops', 'system']
  const actions = ['登录系统', '提交作业', '修改配额', '创建用户', '删除镜像', '修改告警规则', '查看日志', '重启节点']
  const resources = ['用户管理', '作业调度', '配额管理', '镜像管理', '告警规则', '节点管理']
  const results: Array<'success' | 'failure'> = ['success', 'success', 'success', 'failure']

  const logs: AuditLog[] = Array.from({ length: 120 }, (_, i) => ({
    id: `log_${String(i + 1).padStart(4, '0')}`,
    user: users[i % 5],
    action: actions[i % 8],
    resource: resources[i % 6],
    detail: `操作详情 ${i + 1}`,
    ip: `192.168.${Math.floor(i / 50)}.${(i % 50) + 1}`,
    time: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    result: results[i % 4],
  }))
  return paginate(logs, params)
}
