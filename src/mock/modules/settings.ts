import type { AuthConfig, SchedulePolicy, SystemAnnouncement, PaginatedData, PageParams } from '@/types'

function paginate<T>(list: T[], params: PageParams): PaginatedData<T> {
  const start = (params.page - 1) * params.pageSize
  const paged = list.slice(start, start + params.pageSize)
  return { list: paged, total: list.length, page: params.page, pageSize: params.pageSize }
}

export function getMockAuthConfigs(): AuthConfig[] {
  return [
    { id: 'auth_1', type: 'ldap', name: '企业LDAP', server: 'ldap.example.com', port: 389, baseDn: 'dc=example,dc=com', bindDn: 'cn=admin,dc=example,dc=com', enabled: true, createTime: '2024-01-01', updateTime: '2024-06-01' },
    { id: 'auth_2', type: 'oauth2', name: 'GitHub OAuth', server: 'github.com', port: 443, baseDn: '', bindDn: '', enabled: true, createTime: '2024-02-15', updateTime: '2024-05-20' },
    { id: 'auth_3', type: 'saml', name: '企业SAML SSO', server: 'sso.example.com', port: 443, baseDn: '', bindDn: '', enabled: false, createTime: '2024-03-01', updateTime: '2024-04-10' },
  ]
}

export function getMockSchedulePolicies(params: PageParams): PaginatedData<SchedulePolicy> {
  const types: Array<'backfill' | 'gang' | 'preemption' | 'reservation'> = ['backfill', 'gang', 'preemption', 'reservation']
  const policies: SchedulePolicy[] = Array.from({ length: 10 }, (_, i) => ({
    id: `schedule_${i + 1}`,
    name: `调度策略${i + 1}`,
    type: types[i % 4],
    priority: i * 10,
    config: { maxJobs: 100, timeout: 3600 },
    enabled: i < 4,
    createTime: new Date(Date.now() - Math.random() * 31536000000).toISOString(),
    updateTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }))
  return paginate(policies, params)
}

export function getMockAnnouncements(params: PageParams): PaginatedData<SystemAnnouncement> {
  const priorities: Array<'high' | 'normal' | 'low'> = ['high', 'normal', 'low']
  const announcements: SystemAnnouncement[] = Array.from({ length: 12 }, (_, i) => ({
    id: `announce_${i + 1}`,
    title: `系统公告${i + 1}`,
    content: `系统将于周六进行维护升级，预计停机2小时。`,
    priority: priorities[i % 3],
    published: i < 8,
    publishTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    expireTime: new Date(Date.now() + Math.random() * 86400000 * 30).toISOString(),
    createTime: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
  }))
  return paginate(announcements, params)
}
