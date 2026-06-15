export const JOB_STATUS_MAP: Record<string, { label: string; color: string }> = {
  running: { label: '运行中', color: '#67c23a' },
  queued: { label: '排队中', color: '#e6a23c' },
  completed: { label: '已完成', color: '#909399' },
  failed: { label: '已失败', color: '#f56c6c' },
  cancelled: { label: '已取消', color: '#c0c4cc' },
}

export const NODE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  online: { label: '在线', color: '#67c23a' },
  offline: { label: '离线', color: '#f56c6c' },
  maintenance: { label: '维护中', color: '#e6a23c' },
}

export const ALERT_LEVEL_MAP: Record<string, { label: string; color: string }> = {
  critical: { label: '严重', color: '#f56c6c' },
  warning: { label: '警告', color: '#e6a23c' },
  info: { label: '信息', color: '#909399' },
}

export const STORAGE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  healthy: { label: '健康', color: '#67c23a' },
  degraded: { label: '降级', color: '#e6a23c' },
  error: { label: '故障', color: '#f56c6c' },
}

export const NETWORK_STATUS_MAP: Record<string, { label: string; color: string }> = {
  normal: { label: '正常', color: '#67c23a' },
  congested: { label: '拥塞', color: '#e6a23c' },
  error: { label: '异常', color: '#f56c6c' },
}

export const IMAGE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  ready: { label: '就绪', color: '#67c23a' },
  building: { label: '构建中', color: '#409eff' },
  error: { label: '失败', color: '#f56c6c' },
}
