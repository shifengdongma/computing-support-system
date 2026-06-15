// Job types
export interface Job {
  id: string
  name: string
  user: string
  partition: string
  project: string
  status: 'running' | 'queued' | 'completed' | 'failed' | 'cancelled'
  priority: number
  nodes: number
  cpus: number
  gpus: number
  memory: string
  walltime: string
  submitTime: string
  startTime: string
  endTime: string
  elapsed: string
  remaining: string
  output: string
}

export interface JobSubmission {
  name: string
  script: string
  partition: string
  nodes: number
  cpus: number
  gpus: number
  memory: string
  walltime: string
  outputDir: string
  errorDir: string
}

export interface JobQueueStats {
  partition: string
  total: number
  running: number
  queued: number
  nodes: string
  state: 'up' | 'down' | 'drain'
}

export interface JobHistoryFilter {
  user?: string
  status?: string
  startDate?: string
  endDate?: string
  keyword?: string
  page: number
  pageSize: number
}
