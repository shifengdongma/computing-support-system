/**
 * 算力支撑管理系统 — Mock 后端服务
 * 端口: 8080 | 零依赖 | 响应格式: { code: 0, message: 'success', data: <T> }
 * nginx 已剥离 /api 前缀，所有路径不含 /api
 */
const http = require('http')

// ============================================================
// 工具函数
// ============================================================

function success(data) {
  return JSON.stringify({ code: 0, message: 'success', data })
}

function fail(message, code = 1) {
  return JSON.stringify({ code, message, data: null })
}

function paginate(list, page, pageSize) {
  const p = Math.max(1, parseInt(page) || 1)
  const ps = Math.max(1, parseInt(pageSize) || 20)
  const start = (p - 1) * ps
  const paged = list.slice(start, start + ps)
  return { list: paged, total: list.length, page: p, pageSize: ps }
}

function getQueryParams(url) {
  const idx = url.indexOf('?')
  if (idx === -1) return {}
  const qs = url.slice(idx + 1)
  const params = {}
  for (const part of qs.split('&')) {
    const [k, v] = part.split('=')
    if (k) params[decodeURIComponent(k)] = v != null ? decodeURIComponent(v) : ''
  }
  return params
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch { resolve({}) }
    })
  })
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function isoDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - (daysAgo || 0))
  return d.toISOString()
}

// ============================================================
// Mock 数据生成函数
// ============================================================

// --- Dashboard ---

function getDashboardData() {
  const resources = {
    cpu: { total: 1024, used: 756, unit: '核', usageRate: 73.8, trend: 5.2 },
    gpu: { total: 256, used: 198, unit: '卡', usageRate: 77.3, trend: -2.1 },
    memory: { total: 4096, used: 2890, unit: 'GB', usageRate: 70.6, trend: 3.4 },
    storage: { total: 50, used: 32.5, unit: 'TB', usageRate: 65.0, trend: 8.7 },
  }

  const jobStats = {
    running: 156,
    queued: 42,
    completed: 8934,
    failed: 23,
  }

  const jobTrends = Array.from({ length: 30 }, (_, i) => {
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
  const levels = ['critical', 'warning', 'warning', 'info']

  const alerts = Array.from({ length: 12 }, (_, i) => ({
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

// --- Resources ---

function getPhysicalNodes(params) {
  const cpuModels = ['Intel Xeon Gold 6248R', 'AMD EPYC 7742', 'Intel Xeon Platinum 8380']
  const gpuTypes = ['NVIDIA A100', 'NVIDIA V100', 'NVIDIA H100', 'NVIDIA A40']
  const statuses = ['online', 'online', 'online', 'online', 'online', 'offline', 'maintenance']

  const nodes = Array.from({ length: 52 }, (_, i) => ({
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
  return paginate(nodes, params.page, params.pageSize)
}

function getGpuPools(params) {
  const pools = Array.from({ length: 52 }, (_, i) => ({
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
  return paginate(pools, params.page, params.pageSize)
}

function getCpuMemory(params) {
  const list = Array.from({ length: 52 }, (_, i) => ({
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
  return paginate(list, params.page, params.pageSize)
}

function getStorage(params) {
  const types = ['nfs', 'lustre', 'local', 'ceph']
  const statuses = ['healthy', 'healthy', 'healthy', 'degraded', 'error']
  const list = Array.from({ length: 12 }, (_, i) => ({
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
  return paginate(list, params.page, params.pageSize)
}

function getNetwork(params) {
  const types = ['infiniband', 'ethernet']
  const statuses = ['normal', 'normal', 'congested', 'error']
  const list = Array.from({ length: 8 }, (_, i) => ({
    id: `net_${i + 1}`,
    name: `net-${types[i % 2]}-${String(i + 1).padStart(2, '0')}`,
    type: types[i % 2],
    bandwidth: types[i % 2] === 'infiniband' ? '100Gbps' : '25Gbps',
    currentThroughput: `${20 + Math.floor(Math.random() * 70)}Gbps`,
    latency: types[i % 2] === 'infiniband' ? 0.5 + Math.random() * 2 : 1 + Math.random() * 5,
    packetLoss: Math.random() * 0.5,
    status: statuses[i % 4],
  }))
  return paginate(list, params.page, params.pageSize)
}

// --- Jobs ---

function generateJob(index, statuses) {
  const status = statuses[index % statuses.length]
  const partitions = ['gpu', 'cpu', 'high-mem', 'debug']
  return {
    id: `job_${String(index + 1).padStart(4, '0')}`,
    name: `training_task_${index + 1}`,
    user: `user_${(index % 20) + 1}`,
    partition: partitions[index % 4],
    project: `project_${(index % 5) + 1}`,
    status,
    priority: 1 + (index % 10),
    nodes: 1 + (index % 4),
    cpus: 8 + (index % 8) * 4,
    gpus: 1 + (index % 8),
    memory: `${32 + (index % 8) * 32}GB`,
    walltime: '24:00:00',
    submitTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    startTime: status !== 'queued' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : '-',
    endTime: ['completed', 'failed', 'cancelled'].includes(status) ? new Date(Date.now() - Math.random() * 86400000).toISOString() : '-',
    elapsed: status === 'running' ? `${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00` : '-',
    remaining: status === 'running' ? `${Math.floor(Math.random() * 12)}:00:00` : '-',
    output: `job_${index + 1}.out`,
  }
}

function getRunningJobs(params) {
  const list = Array.from({ length: 156 }, (_, i) => generateJob(i, ['running']))
  return paginate(list, params.page, params.pageSize)
}

function getQueuedJobs(params) {
  const list = Array.from({ length: 42 }, (_, i) => generateJob(i, ['queued']))
  return paginate(list, params.page, params.pageSize)
}

function getJobHistory(params) {
  const statuses = ['completed', 'completed', 'completed', 'failed', 'cancelled']
  let list = Array.from({ length: 250 }, (_, i) => generateJob(i, statuses))
  if (params.status) {
    list = list.filter(j => j.status === params.status)
  }
  if (params.user) {
    list = list.filter(j => j.user.includes(params.user))
  }
  return paginate(list, params.page, params.pageSize)
}

function getQueueStats() {
  return [
    { partition: 'gpu', total: 120, running: 90, queued: 30, nodes: 'node[001-030]', state: 'up' },
    { partition: 'cpu', total: 50, running: 35, queued: 15, nodes: 'node[031-050]', state: 'up' },
    { partition: 'high-mem', total: 20, running: 18, queued: 2, nodes: 'node[051-055]', state: 'drain' },
    { partition: 'debug', total: 16, running: 13, queued: 3, nodes: 'node[056-059]', state: 'up' },
  ]
}

// --- Users ---

function getUsers(params) {
  const departments = ['AI研究院', '大数据部', '基础架构部', '算法中台', '风控部']
  const roles = ['admin', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'user', 'viewer']
  const statuses = ['active', 'active', 'active', 'active', 'active', 'disabled', 'locked']

  const users = Array.from({ length: 85 }, (_, i) => ({
    id: `user_${String(i + 1).padStart(3, '0')}`,
    username: `user${i + 1}`,
    realName: `用户${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: departments[i % 5],
    role: roles[i % 10],
    status: statuses[i % 7],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    lastLogin: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  }))
  return paginate(users, params.page, params.pageSize)
}

function getQuotas(params) {
  const quotas = Array.from({ length: 85 }, (_, i) => ({
    id: `quota_${i + 1}`,
    userId: `user_${String(i + 1).padStart(3, '0')}`,
    username: `user${i + 1}`,
    maxJobs: 10 + (i % 5) * 10,
    runningJobs: Math.floor(Math.random() * 15),
    maxCpus: 32 + (i % 4) * 32,
    usedCpus: Math.floor(Math.random() * 64),
    maxGpus: 4 + (i % 3) * 4,
    usedGpus: Math.floor(Math.random() * 8),
    maxStorage: `${100 + (i % 5) * 100}GB`,
    usedStorage: `${20 + Math.floor(Math.random() * 180)}GB`,
    maxWalltime: '168:00:00',
    validFrom: '2024-01-01',
    validTo: '2025-12-31',
  }))
  return paginate(quotas, params.page, params.pageSize)
}

function getPriorityPolicies(params) {
  const types = ['fairshare', 'fifo', 'priority', 'custom']
  const policies = Array.from({ length: 8 }, (_, i) => ({
    id: `policy_${i + 1}`,
    name: `策略${i + 1}`,
    type: types[i % 4],
    weight: 1 + i * 10,
    description: `优先级调度策略${i + 1}`,
    enabled: i < 4,
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }))
  return paginate(policies, params.page, params.pageSize)
}

// --- Monitor ---

function generateMetricPoints(count) {
  return Array.from({ length: count }, (_, i) => ({
    time: new Date(Date.now() - (count - i) * 60000).toISOString(),
    value: 30 + Math.random() * 60,
  }))
}

function getNodeMetrics(params) {
  const nodeId = params.nodeId || 'node_001'
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

function getAlertRules(params) {
  const metrics = ['cpu_usage', 'gpu_temp', 'memory_usage', 'disk_usage', 'network_packet_loss']
  const severities = ['critical', 'warning', 'info']
  const conditions = ['gt', 'lt', 'eq']

  const rules = Array.from({ length: 15 }, (_, i) => ({
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
  return paginate(rules, params.page, params.pageSize)
}

function getAlertNotifications(params) {
  const levels = ['critical', 'warning', 'warning', 'info']
  const alerts = Array.from({ length: 30 }, (_, i) => ({
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
  return paginate(alerts, params.page, params.pageSize)
}

function getAuditLogs(params) {
  const users = ['admin', 'user1', 'user2', 'ops', 'system']
  const actions = ['登录系统', '提交作业', '修改配额', '创建用户', '删除镜像', '修改告警规则', '查看日志', '重启节点']
  const resources = ['用户管理', '作业调度', '配额管理', '镜像管理', '告警规则', '节点管理']
  const results = ['success', 'success', 'success', 'failure']

  const logs = Array.from({ length: 120 }, (_, i) => ({
    id: `log_${String(i + 1).padStart(4, '0')}`,
    user: users[i % 5],
    action: actions[i % 8],
    resource: resources[i % 6],
    detail: `操作详情 ${i + 1}`,
    ip: `192.168.${Math.floor(i / 50)}.${(i % 50) + 1}`,
    time: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    result: results[i % 4],
  }))
  return paginate(logs, params.page, params.pageSize)
}

// --- Images ---

function getSystemImages(params) {
  const osList = ['Ubuntu 20.04', 'Ubuntu 22.04', 'CentOS 7.9', 'Rocky Linux 8.6']
  const statuses = ['ready', 'ready', 'ready', 'building', 'error']
  const images = Array.from({ length: 15 }, (_, i) => ({
    id: `sys_img_${i + 1}`,
    name: `system-image-${i + 1}`,
    version: `1.${i}.0`,
    os: osList[i % 4],
    kernel: `5.${10 + i}.0`,
    size: `${5 + i * 2}GB`,
    type: 'system',
    status: statuses[i % 5],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: `系统镜像 ${i + 1} 描述`,
  }))
  return paginate(images, params.page, params.pageSize)
}

function getAiFrameworkImages(params) {
  const frameworks = ['PyTorch', 'TensorFlow', 'JAX', 'PaddlePaddle']
  const statuses = ['ready', 'ready', 'ready', 'building', 'error']
  const images = Array.from({ length: 20 }, (_, i) => ({
    id: `ai_img_${i + 1}`,
    name: `ai-image-${i + 1}`,
    version: `2.${i}.0`,
    framework: frameworks[i % 4],
    frameworkVersion: `${1 + (i % 3)}.${i % 10}.0`,
    cudaVersion: ['11.8', '12.1', '12.2'][i % 3],
    pythonVersion: '3.10',
    size: `${8 + i * 2}GB`,
    type: 'ai-framework',
    status: statuses[i % 5],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: `AI框架镜像 ${i + 1}`,
    includedPackages: ['cuda', 'cudnn', 'nccl', 'transformers', 'torchvision'],
  }))
  return paginate(images, params.page, params.pageSize)
}

function getCustomImages(params) {
  const statuses = ['ready', 'ready', 'building', 'error']
  const images = Array.from({ length: 10 }, (_, i) => ({
    id: `custom_img_${i + 1}`,
    name: `custom-image-${i + 1}`,
    version: `1.${i}.0`,
    baseImage: 'system-image-1',
    owner: `user${(i % 5) + 1}`,
    size: `${3 + i}GB`,
    type: 'custom',
    status: statuses[i % 4],
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    description: `自定义镜像 ${i + 1}`,
    dockerfile: `FROM base:1.0\nRUN pip install torch\nCOPY . /workspace`,
  }))
  return paginate(images, params.page, params.pageSize)
}

// --- Workspace ---

function getMyJobs(params) {
  const statuses = ['running', 'running', 'queued', 'completed', 'failed']
  const jobs = Array.from({ length: 25 }, (_, i) => ({
    id: `my_job_${i + 1}`,
    name: `my_training_${i + 1}`,
    status: statuses[i % 5],
    partition: ['gpu', 'cpu'][i % 2],
    nodes: 1 + (i % 2),
    cpus: 8 + (i % 4) * 4,
    gpus: i % 2 === 0 ? 1 + (i % 4) : 0,
    submitTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    elapsed: statuses[i % 5] === 'running' ? `${Math.floor(Math.random() * 24)}:00:00` : '-',
    output: `my_job_${i + 1}.out`,
  }))
  return paginate(jobs, params.page, params.pageSize)
}

function getMyQuota() {
  return {
    maxJobs: 50,
    runningJobs: 12,
    maxCpus: 128,
    usedCpus: 64,
    maxGpus: 8,
    usedGpus: 4,
    maxStorage: '500GB',
    usedStorage: '156GB',
    maxWalltime: '168:00:00',
  }
}

function getSshKeys() {
  return [
    { id: 'ssh_1', name: 'work-laptop', fingerprint: 'SHA256:abc123...', type: 'ed25519', bits: 256, createTime: '2024-01-15', lastUsed: '2024-06-01' },
    { id: 'ssh_2', name: 'home-desktop', fingerprint: 'SHA256:def456...', type: 'rsa', bits: 4096, createTime: '2024-03-20', lastUsed: '2024-06-05' },
    { id: 'ssh_3', name: 'jump-server', fingerprint: 'SHA256:ghi789...', type: 'ecdsa', bits: 521, createTime: '2024-05-10', lastUsed: '2024-06-08' },
  ]
}

function getNotifications(params) {
  const types = ['system', 'alert', 'job', 'quota']
  const notifications = Array.from({ length: 40 }, (_, i) => ({
    id: `notif_${i + 1}`,
    title: `通知${i + 1}`,
    content: `您有一条新通知：作业${i + 1}已完成运行`,
    type: types[i % 4],
    read: i > 5,
    time: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  }))
  return paginate(notifications, params.page, params.pageSize)
}

// --- Settings ---

function getAuthConfigs() {
  return [
    { id: 'auth_1', type: 'ldap', name: '企业LDAP', server: 'ldap.example.com', port: 389, baseDn: 'dc=example,dc=com', bindDn: 'cn=admin,dc=example,dc=com', enabled: true, createTime: '2024-01-01', updateTime: '2024-06-01' },
    { id: 'auth_2', type: 'oauth2', name: 'GitHub OAuth', server: 'github.com', port: 443, baseDn: '', bindDn: '', enabled: true, createTime: '2024-02-15', updateTime: '2024-05-20' },
    { id: 'auth_3', type: 'saml', name: '企业SAML SSO', server: 'sso.example.com', port: 443, baseDn: '', bindDn: '', enabled: false, createTime: '2024-03-01', updateTime: '2024-04-10' },
  ]
}

function getSchedulePolicies(params) {
  const types = ['backfill', 'gang', 'preemption', 'reservation']
  const policies = Array.from({ length: 10 }, (_, i) => ({
    id: `schedule_${i + 1}`,
    name: `调度策略${i + 1}`,
    type: types[i % 4],
    priority: i * 10,
    config: { maxJobs: 100, timeout: 3600 },
    enabled: i < 4,
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }))
  return paginate(policies, params.page, params.pageSize)
}

function getAnnouncements(params) {
  const priorities = ['high', 'normal', 'low']
  const announcements = Array.from({ length: 12 }, (_, i) => ({
    id: `announce_${i + 1}`,
    title: `系统公告${i + 1}`,
    content: `系统将于周六进行维护升级，预计停机2小时。`,
    priority: priorities[i % 3],
    published: i < 8,
    publishTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    expireTime: new Date(Date.now() + Math.random() * 86400000 * 30).toISOString(),
    createTime: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
  }))
  return paginate(announcements, params.page, params.pageSize)
}

// ============================================================
// 路由匹配与处理
// ============================================================

function matchRoute(method, pathname) {
  // 静态路径 (完全匹配优先)
  const staticRoutes = {
    'GET /dashboard/overview': () => getDashboardData(),
    'GET /jobs/queues': () => getQueueStats(),
    'GET /workspace/quota': () => getMyQuota(),
    'GET /workspace/ssh-keys': () => getSshKeys(),
    'GET /settings/auth': () => getAuthConfigs(),
  }

  // Regex 路径
  const regexRoutes = [
    { method: 'GET',  regex: /^\/resources\/nodes$/,                     handler: (qp) => getPhysicalNodes(qp) },
    { method: 'GET',  regex: /^\/resources\/gpu$/,                       handler: (qp) => getGpuPools(qp) },
    { method: 'GET',  regex: /^\/resources\/cpu-memory$/,                handler: (qp) => getCpuMemory(qp) },
    { method: 'GET',  regex: /^\/resources\/storage$/,                   handler: (qp) => getStorage(qp) },
    { method: 'GET',  regex: /^\/resources\/network$/,                   handler: (qp) => getNetwork(qp) },
    { method: 'GET',  regex: /^\/jobs\/running$/,                        handler: (qp) => getRunningJobs(qp) },
    { method: 'GET',  regex: /^\/jobs\/queued$/,                         handler: (qp) => getQueuedJobs(qp) },
    { method: 'GET',  regex: /^\/jobs\/history$/,                        handler: (qp) => getJobHistory(qp) },
    { method: 'POST', regex: /^\/jobs\/submit$/,                         handler: (qp, b) => ({ jobId: `job_${Date.now()}` }) },
    { method: 'POST', regex: /^\/jobs\/([^/]+)\/cancel$/,                handler: (qp, b) => ({ success: true }) },
    { method: 'GET',  regex: /^\/users$/,                                handler: (qp) => getUsers(qp) },
    { method: 'POST', regex: /^\/users$/,                                handler: (qp, body) => createMockUser(body) },
    { method: 'PUT',  regex: /^\/users\/([^/]+)$/,                       handler: (qp, body, match) => updateMockUser(match[1], body) },
    { method: 'GET',  regex: /^\/users\/quotas$/,                        handler: (qp) => getQuotas(qp) },
    { method: 'GET',  regex: /^\/users\/policies$/,                      handler: (qp) => getPriorityPolicies(qp) },
    { method: 'GET',  regex: /^\/monitor\/metrics$/,                     handler: (qp) => getNodeMetrics(qp) },
    { method: 'GET',  regex: /^\/monitor\/alert-rules$/,                 handler: (qp) => getAlertRules(qp) },
    { method: 'GET',  regex: /^\/monitor\/alerts$/,                      handler: (qp) => getAlertNotifications(qp) },
    { method: 'POST', regex: /^\/monitor\/alerts\/([^/]+)\/acknowledge$/,handler: (qp, b) => ({ success: true }) },
    { method: 'GET',  regex: /^\/monitor\/audit-logs$/,                  handler: (qp) => getAuditLogs(qp) },
    { method: 'GET',  regex: /^\/images\/system$/,                       handler: (qp) => getSystemImages(qp) },
    { method: 'GET',  regex: /^\/images\/ai-framework$/,                 handler: (qp) => getAiFrameworkImages(qp) },
    { method: 'GET',  regex: /^\/images\/custom$/,                       handler: (qp) => getCustomImages(qp) },
    { method: 'GET',  regex: /^\/workspace\/jobs$/,                      handler: (qp) => getMyJobs(qp) },
    { method: 'POST', regex: /^\/workspace\/ssh-keys$/,                  handler: (qp, body) => ({
      id: `ssh_${Date.now()}`, name: body.name || 'new-key', fingerprint: `SHA256:${Math.random().toString(36).slice(2, 10)}...`, type: body.type || 'ed25519', bits: 256, createTime: new Date().toISOString().split('T')[0], lastUsed: '-',
    }) },
    { method: 'GET',  regex: /^\/workspace\/notifications$/,             handler: (qp) => getNotifications(qp) },
    { method: 'GET',  regex: /^\/settings\/schedule-policies$/,          handler: (qp) => getSchedulePolicies(qp) },
    { method: 'GET',  regex: /^\/settings\/announcements$/,              handler: (qp) => getAnnouncements(qp) },
  ]

  const staticKey = `${method} ${pathname}`
  if (staticRoutes[staticKey]) {
    return (qp, body) => staticRoutes[staticKey]()
  }

  for (const r of regexRoutes) {
    if (r.method !== method) continue
    const m = pathname.match(r.regex)
    if (m) {
      return (qp, body) => r.handler(qp, body, m)
    }
  }

  return null
}

function createMockUser(data) {
  const now = new Date().toISOString()
  return {
    id: `user_${String(randomInt(100, 999)).padStart(3, '0')}`,
    username: data.username || 'newuser',
    realName: data.realName || '新用户',
    email: data.email || 'newuser@example.com',
    department: data.department || 'AI研究院',
    role: data.role || 'user',
    status: 'active',
    createTime: now,
    lastLogin: now,
  }
}

function updateMockUser(id, data) {
  const now = new Date().toISOString()
  return {
    id,
    username: data.username || 'updateduser',
    realName: data.realName || '已更新',
    email: data.email || 'updated@example.com',
    department: data.department || 'AI研究院',
    role: data.role || 'user',
    status: data.status || 'active',
    createTime: isoDate(365),
    lastLogin: now,
  }
}

// ============================================================
// HTTP 服务器
// ============================================================

const PORT = 8080

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname
  const method = req.method

  // 根路径 / => OK
  if (pathname === '/' && method === 'GET') {
    res.writeHead(200)
    res.end(JSON.stringify({ code: 0, message: 'Mock backend is running', data: null }))
    return
  }

  const handler = matchRoute(method, pathname)

  if (!handler) {
    res.writeHead(404)
    res.end(fail(`Not found: ${method} ${pathname}`))
    return
  }

  try {
    const queryParams = getQueryParams(req.url)
    let body = {}

    if (method === 'POST' || method === 'PUT') {
      body = await parseJsonBody(req)
    }

    const data = handler(queryParams, body)

    res.writeHead(200)
    res.end(success(data))
  } catch (err) {
    console.error(`[ERROR] ${method} ${pathname}:`, err.message)
    res.writeHead(500)
    res.end(fail('Internal server error: ' + err.message))
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Mock Backend] 服务已启动 → http://127.0.0.1:${PORT}`)
  console.log(`[Mock Backend] 33个路由已注册`)
})

// 优雅退出
process.on('SIGTERM', () => { server.close(); process.exit(0) })
process.on('SIGINT', () => { server.close(); process.exit(0) })
