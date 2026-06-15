// Settings types
export interface AuthConfig {
  id: string
  type: 'ldap' | 'oauth2' | 'saml' | 'local'
  name: string
  server: string
  port: number
  baseDn: string
  bindDn: string
  enabled: boolean
  createTime: string
  updateTime: string
}

export interface SchedulePolicy {
  id: string
  name: string
  type: 'backfill' | 'gang' | 'preemption' | 'reservation'
  priority: number
  config: Record<string, unknown>
  enabled: boolean
  createTime: string
  updateTime: string
}

export interface SystemAnnouncement {
  id: string
  title: string
  content: string
  priority: 'high' | 'normal' | 'low'
  published: boolean
  publishTime: string
  expireTime: string
  createTime: string
}
