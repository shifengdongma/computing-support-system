import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  getNodeMetrics,
  getAlertRules,
  getAlertNotifications,
  acknowledgeAlert,
  getAuditLogs,
} from '@/api/modules/monitor'
import type { NodeMetrics, AlertRule, AlertNotification, AuditLog, PageParams } from '@/types'

export const useMonitorStore = defineStore('monitor', () => {
  const metrics = ref<NodeMetrics | null>(null)
  const metricsLoading = ref(false)

  const alertRules = ref<AlertRule[]>([])
  const alertRulesLoading = ref(false)

  const alertNotifications = ref<AlertNotification[]>([])
  const alertTotal = ref(0)
  const alertLoading = ref(false)

  const auditLogs = ref<AuditLog[]>([])
  const auditLogsTotal = ref(0)
  const auditLogsLoading = ref(false)

  async function fetchMetrics(nodeId?: string, timeRange: string = '1h') {
    metricsLoading.value = true
    try {
      const res = await getNodeMetrics(nodeId || '', timeRange)
      metrics.value = res.data
    } finally {
      metricsLoading.value = false
    }
  }

  async function fetchAlertRules(params: PageParams = { page: 1, pageSize: 10 }) {
    alertRulesLoading.value = true
    try {
      const res = await getAlertRules(params)
      alertRules.value = res.data.list
    } finally {
      alertRulesLoading.value = false
    }
  }

  async function fetchAlertNotifications(params: PageParams = { page: 1, pageSize: 10 }) {
    alertLoading.value = true
    try {
      const res = await getAlertNotifications(params)
      alertNotifications.value = res.data.list
      alertTotal.value = res.data.total
    } finally {
      alertLoading.value = false
    }
  }

  async function fetchAuditLogs(params: PageParams = { page: 1, pageSize: 10 }) {
    auditLogsLoading.value = true
    try {
      const res = await getAuditLogs(params)
      auditLogs.value = res.data.list
      auditLogsTotal.value = res.data.total
    } finally {
      auditLogsLoading.value = false
    }
  }

  async function doAcknowledgeAlert(alertId: string) {
    await acknowledgeAlert(alertId)
    ElMessage.success('告警已确认')
  }

  return {
    metrics, metricsLoading, fetchMetrics,
    alertRules, alertRulesLoading, fetchAlertRules,
    alertNotifications, alertTotal, alertLoading, fetchAlertNotifications,
    auditLogs, auditLogsTotal, auditLogsLoading, fetchAuditLogs,
    doAcknowledgeAlert,
  }
})
