// Dashboard types
export interface ClusterResource {
  total: number
  used: number
  unit: string
  usageRate: number
  trend: number // percentage change
}

export interface DashboardResources {
  cpu: ClusterResource
  gpu: ClusterResource
  memory: ClusterResource
  storage: ClusterResource
}

export interface JobStats {
  running: number
  queued: number
  completed: number
  failed: number
}

export interface JobTrendItem {
  date: string
  submitted: number
  completed: number
  failed: number
}

export interface AlertItem {
  id: string
  level: 'critical' | 'warning' | 'info'
  message: string
  source: string
  time: string
  acknowledged: boolean
}

export interface DashboardData {
  resources: DashboardResources
  jobStats: JobStats
  jobTrends: JobTrendItem[]
  alerts: AlertItem[]
  clusterUtilization: number
  onlineNodes: number
  totalNodes: number
}
