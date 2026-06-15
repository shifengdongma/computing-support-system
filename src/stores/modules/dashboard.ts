import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getDashboardData } from '@/api/modules/dashboard'
import type { DashboardData } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardData | null>(null)
  const loading = ref(false)

  async function fetchData() {
    loading.value = true
    try {
      const res = await getDashboardData()
      data.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { data, loading, fetchData }
})
