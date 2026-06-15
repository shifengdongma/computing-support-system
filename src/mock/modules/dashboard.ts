import type { DashboardData, AlertItem, JobTrendItem, JobStats } from '@/types'

export function getMockDashboardData(): DashboardData {
  const resources = {
    cpu: { total: 1024, used: 756, unit: '核', usageRate: 73.8, trend: 5.2 },
    gpu: { total: 256, used: 198, unit: '卡', usageRate: 77.3, trend: -2.1 },
    memory: { total: 4096, used: 2890, unit: 'GB', usageRate: 70.6, trend: 3.4 },
    storage: { total: 50, used: 32.5, unit: 'TB', usageRate: 65.0, trend: 8.7 },
  }

  const jobStats: JobStats = {
    running: 156,
    queued: 42,
    completed: 8934,
    failed: 23,
  }

  const jobTrends: JobTrendItem[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 29 + i)
    const dateStr = date.toISOString().split('T')[0]
    return {
      date: dateStr,
      submitted: Math.floor(Math.random() * 50) + 20,
      completed: Math.floor(Math.random() * 40) + 15,
      failed: Math.floor(Math.random() * 5),
    }
  })

  const alertSources = ['node-gpu-01', 'node-cpu-03', 'storage-nfs-01', 'network-ib-02', 'node-mem-05']
  const alertMessages = [
    'GPU温度超过85°C阈值',
    'CPU使用率持续超过90%',
    'NFS存储IO延迟超过100ms',
    'InfiniBand网络丢包率超过1%',
    '节点内存使用率超过95%',
    '磁盘空间不足，剩余容量低于10%',
    '作业队列积压超过50个',
    'LDAP认证服务响应超时',
  ]
  const levels: Array<'critical' | 'warning' | 'info'> = ['critical', 'warning', 'warning', 'info']

  const alerts: AlertItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: `alert_${i + 1}`,
    level: levels[i % 4],
    message: alertMessages[i % alertMessages.length],
    source: alertSources[i % alertSources.length],
    time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    acknowledged: i % 3 === 0,
  }))

  return {
    resources,
    jobStats,
    jobTrends,
    alerts,
    clusterUtilization: 72.5,
    onlineNodes: 48,
    totalNodes: 52,
  }
}
