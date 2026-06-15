// Workspace types
export interface MyJob {
  id: string
  name: string
  status: 'running' | 'queued' | 'completed' | 'failed'
  partition: string
  nodes: number
  cpus: number
  gpus: number
  submitTime: string
  elapsed: string
  output: string
}

export interface MyQuota {
  maxJobs: number
  runningJobs: number
  maxCpus: number
  usedCpus: number
  maxGpus: number
  usedGpus: number
  maxStorage: string
  usedStorage: string
  maxWalltime: string
}

export interface SshKey {
  id: string
  name: string
  fingerprint: string
  type: 'rsa' | 'ed25519' | 'ecdsa'
  bits: number
  createTime: string
  lastUsed: string
}

export interface Notification {
  id: string
  title: string
  content: string
  type: 'system' | 'alert' | 'job' | 'quota'
  read: boolean
  time: string
}
