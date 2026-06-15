import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  getMyJobs,
  getMyQuota,
  getSshKeys,
  createSshKey,
  getNotifications,
} from '@/api/modules/workspace'
import type { MyJob, MyQuota, SshKey, Notification, PageParams } from '@/types'

export const useWorkspaceStore = defineStore('workspace', () => {
  const myJobs = ref<MyJob[]>([])
  const myJobsTotal = ref(0)
  const myJobsLoading = ref(false)

  const myQuota = ref<MyQuota | null>(null)
  const myQuotaLoading = ref(false)

  const sshKeys = ref<SshKey[]>([])
  const sshKeysLoading = ref(false)

  const notifications = ref<Notification[]>([])
  const notificationsTotal = ref(0)
  const notificationsLoading = ref(false)

  async function fetchMyJobs(params: PageParams = { page: 1, pageSize: 10 }) {
    myJobsLoading.value = true
    try {
      const res = await getMyJobs(params)
      myJobs.value = res.data.list
      myJobsTotal.value = res.data.total
    } finally {
      myJobsLoading.value = false
    }
  }

  async function fetchMyQuota() {
    myQuotaLoading.value = true
    try {
      const res = await getMyQuota()
      myQuota.value = res.data
    } finally {
      myQuotaLoading.value = false
    }
  }

  async function fetchSshKeys() {
    sshKeysLoading.value = true
    try {
      const res = await getSshKeys()
      sshKeys.value = res.data
    } finally {
      sshKeysLoading.value = false
    }
  }

  async function fetchNotifications(params: PageParams = { page: 1, pageSize: 10 }) {
    notificationsLoading.value = true
    try {
      const res = await getNotifications(params)
      notifications.value = res.data.list
      notificationsTotal.value = res.data.total
    } finally {
      notificationsLoading.value = false
    }
  }

  async function doCreateSshKey(name: string, publicKey: string) {
    await createSshKey({ name, type: publicKey })
    ElMessage.success('SSH密钥创建成功')
    await fetchSshKeys()
  }

  return {
    myJobs, myJobsTotal, myJobsLoading, fetchMyJobs,
    myQuota, myQuotaLoading, fetchMyQuota,
    sshKeys, sshKeysLoading, fetchSshKeys,
    notifications, notificationsTotal, notificationsLoading, fetchNotifications,
    doCreateSshKey,
  }
})
