import type { PhysicalNode, GpuResource, CpuMemoryResource, StorageResource, NetworkResource, PaginatedData, PageParams } from '@/types'

function paginate<T>(list: T[], params: PageParams): PaginatedData<T> {
  const start = (params.page - 1) * params.pageSize
  const paged = list.slice(start, start + params.pageSize)
  return { list: paged, total: list.length, page: params.page, pageSize: params.pageSize }
}

export function getMockPhysicalNodes(params: PageParams): PaginatedData<PhysicalNode> {
  const cpuModels = ['Intel Xeon Gold 6248R', 'AMD EPYC 7742', 'Intel Xeon Platinum 8380']
  const gpuTypes = ['NVIDIA A100', 'NVIDIA V100', 'NVIDIA H100', 'NVIDIA A40']
  const statuses: Array<'online' | 'offline' | 'maintenance'> = ['online', 'online', 'online', 'online', 'online', 'offline', 'maintenance']

  const nodes: PhysicalNode[] = Array.from({ length: 52 }, (_, i) => ({
    id: `node_${String(i + 1).padStart(3, '0')}`,
    name: `compute-${String(i + 1).padStart(2, '0')}`,
    ip: `10.0.${Math.floor(i / 10)}.${(i % 10) + 1}`,
    cpuModel: cpuModels[i % 3],
    cpuCores: 64 + (i % 4) * 32,
    memory: `${256 + (i % 3) * 256}GB`,
    gpuType: gpuTypes[i % 4],
    gpuCount: 4 + (i % 3) * 4,
    diskSize: `${1 + (i % 3)}TB`,
    status: statuses[i % 7],
    healthScore: 85 + Math.floor(Math.random() * 15),
    uptime: `${Math.floor(Math.random() * 30) + 1}天`,
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
  }))

  return paginate(nodes, params)
}

export function getMockGpuPools(params: PageParams): PaginatedData<GpuResource> {
  const pools: GpuResource[] = Array.from({ length: 52 }, (_, i) => ({
    id: `gpu_${i + 1}`,
    nodeId: `node_${String(i + 1).padStart(3, '0')}`,
    nodeName: `compute-${String(i + 1).padStart(2, '0')}`,
    gpuType: ['NVIDIA A100', 'NVIDIA V100', 'NVIDIA H100', 'NVIDIA A40'][i % 4],
    total: 8,
    allocated: 3 + (i % 6),
    available: 8 - (3 + (i % 6)),
    utilizationRate: 35 + Math.floor(Math.random() * 55),
    memoryTotal: '80GB',
    memoryUsed: `${20 + Math.floor(Math.random() * 50)}GB`,
    temperature: 55 + Math.floor(Math.random() * 30),
    powerDraw: `${200 + Math.floor(Math.random() * 200)}W`,
  }))
  return paginate(pools, params)
}

export function getMockCpuMemory(params: PageParams): PaginatedData<CpuMemoryResource> {
  const list: CpuMemoryResource[] = Array.from({ length: 52 }, (_, i) => ({
    id: `cpu_${i + 1}`,
    nodeId: `node_${String(i + 1).padStart(3, '0')}`,
    nodeName: `compute-${String(i + 1).padStart(2, '0')}`,
    cpuAllocated: 40 + Math.floor(Math.random() * 40),
    cpuTotal: 128,
    cpuUsage: 45 + Math.floor(Math.random() * 45),
    memoryAllocated: `${128 + Math.floor(Math.random() * 256)}GB`,
    memoryTotal: '512GB',
    memoryUsage: 40 + Math.floor(Math.random() * 50),
    runningJobs: Math.floor(Math.random() * 20),
  }))
  return paginate(list, params)
}

export function getMockStorage(params: PageParams): PaginatedData<StorageResource> {
  const types: Array<'nfs' | 'lustre' | 'local' | 'ceph'> = ['nfs', 'lustre', 'local', 'ceph']
  const statuses: Array<'healthy' | 'degraded' | 'error'> = ['healthy', 'healthy', 'healthy', 'degraded', 'error']
  const list: StorageResource[] = Array.from({ length: 12 }, (_, i) => ({
    id: `storage_${i + 1}`,
    name: `storage-${types[i % 4]}-${String(i + 1).padStart(2, '0')}`,
    type: types[i % 4],
    totalSize: `${10 + (i % 5) * 10}TB`,
    usedSize: `${5 + Math.floor(Math.random() * 15)}TB`,
    mountPoint: `/data/${types[i % 4]}${Math.floor(i / 4) + 1}`,
    iops: 1000 + Math.floor(Math.random() * 5000),
    throughput: `${100 + Math.floor(Math.random() * 900)}MB/s`,
    status: statuses[i % 5],
  }))
  return paginate(list, params)
}

export function getMockNetwork(params: PageParams): PaginatedData<NetworkResource> {
  const types: Array<'infiniband' | 'ethernet'> = ['infiniband', 'ethernet']
  const statuses: Array<'normal' | 'congested' | 'error'> = ['normal', 'normal', 'congested', 'error']
  const list: NetworkResource[] = Array.from({ length: 8 }, (_, i) => ({
    id: `net_${i + 1}`,
    name: `net-${types[i % 2]}-${String(i + 1).padStart(2, '0')}`,
    type: types[i % 2],
    bandwidth: types[i % 2] === 'infiniband' ? '100Gbps' : '25Gbps',
    currentThroughput: `${20 + Math.floor(Math.random() * 70)}Gbps`,
    latency: types[i % 2] === 'infiniband' ? 0.5 + Math.random() * 2 : 1 + Math.random() * 5,
    packetLoss: Math.random() * 0.5,
    status: statuses[i % 4],
  }))
  return paginate(list, params)
}
