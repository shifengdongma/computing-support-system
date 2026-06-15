import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getAuthConfigs, getSchedulePolicies, getAnnouncements } from '@/api/modules/settings'
import type { AuthConfig, SchedulePolicy, SystemAnnouncement, PageParams } from '@/types'

export const useSettingsStore = defineStore('settings', () => {
  const authConfigs = ref<AuthConfig[]>([])
  const authConfigsLoading = ref(false)

  const schedulePolicies = ref<SchedulePolicy[]>([])
  const schedulePoliciesTotal = ref(0)
  const schedulePoliciesLoading = ref(false)

  const announcements = ref<SystemAnnouncement[]>([])
  const announcementsTotal = ref(0)
  const announcementsLoading = ref(false)

  async function fetchAuthConfigs() {
    authConfigsLoading.value = true
    try {
      const res = await getAuthConfigs()
      authConfigs.value = res.data
    } finally {
      authConfigsLoading.value = false
    }
  }

  async function fetchSchedulePolicies(params: PageParams = { page: 1, pageSize: 10 }) {
    schedulePoliciesLoading.value = true
    try {
      const res = await getSchedulePolicies(params)
      schedulePolicies.value = res.data.list
      schedulePoliciesTotal.value = res.data.total
    } finally {
      schedulePoliciesLoading.value = false
    }
  }

  async function fetchAnnouncements(params: PageParams = { page: 1, pageSize: 10 }) {
    announcementsLoading.value = true
    try {
      const res = await getAnnouncements(params)
      announcements.value = res.data.list
      announcementsTotal.value = res.data.total
    } finally {
      announcementsLoading.value = false
    }
  }

  return {
    authConfigs, authConfigsLoading, fetchAuthConfigs,
    schedulePolicies, schedulePoliciesTotal, schedulePoliciesLoading, fetchSchedulePolicies,
    announcements, announcementsTotal, announcementsLoading, fetchAnnouncements,
  }
})
