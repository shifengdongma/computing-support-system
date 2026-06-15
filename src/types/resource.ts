// Resource types
export interface PhysicalNode {
  id: string
  name: string
  ip: string
  cpuModel: string
  cpuCores: number
  memory: string
  gpuType: string
  gpuCount: number
  diskSize: string
  status: 'online' | 'offline' | 'maintenance'
  healthScore: number
  uptime: string
  createTime: string
}

export interface GpuResource {
  id: string
  nodeId: string
  nodeName: string
  gpuType: string
  total: number
  allocated: number
  available: number
  utilizationRate: number
  memoryTotal: string
  memoryUsed: string
  temperature: number
  powerDraw: string
}

export interface CpuMemoryResource {
  id: string
  nodeId: string
  nodeName: string
  cpuAllocated: number
  cpuTotal: number
  cpuUsage: number
  memoryAllocated: string
  memoryTotal: string
  memoryUsage: number
  runningJobs: number
}

export interface StorageResource {
  id: string
  name: string
  type: 'nfs' | 'lustre' | 'local' | 'ceph'
  totalSize: string
  usedSize: string
  mountPoint: string
  iops: number
  throughput: string
  status: 'healthy' | 'degraded' | 'error'
}

export interface NetworkResource {
  id: string
  name: string
  type: 'infiniband' | 'ethernet'
  bandwidth: string
  currentThroughput: string
  latency: number
  packetLoss: number
  status: 'normal' | 'congested' | 'error'
}
