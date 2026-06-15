import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import {
  submitJob,
  getRunningJobs,
  getQueuedJobs,
  getJobHistory,
  getQueueStats,
  cancelJob,
} from '@/api/modules/jobs'
import type { Job, JobSubmission, JobQueueStats, JobHistoryFilter } from '@/types'

export const useJobsStore = defineStore('jobs', () => {
  const runningJobs = ref<Job[]>([])
  const runningTotal = ref(0)
  const runningLoading = ref(false)

  const queuedJobs = ref<Job[]>([])
  const queuedTotal = ref(0)
  const queuedLoading = ref(false)

  const historyJobs = ref<Job[]>([])
  const historyTotal = ref(0)
  const historyLoading = ref(false)

  const queueStats = ref<JobQueueStats[]>([])
  const queueStatsLoading = ref(false)

  async function fetchRunningJobs(params: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    runningLoading.value = true
    try {
      const res = await getRunningJobs(params)
      runningJobs.value = res.data.list
      runningTotal.value = res.data.total
    } finally {
      runningLoading.value = false
    }
  }

  async function fetchQueuedJobs(params: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    queuedLoading.value = true
    try {
      const res = await getQueuedJobs(params)
      queuedJobs.value = res.data.list
      queuedTotal.value = res.data.total
    } finally {
      queuedLoading.value = false
    }
  }

  async function fetchJobHistory(filter: JobHistoryFilter) {
    historyLoading.value = true
    try {
      const res = await getJobHistory(filter)
      historyJobs.value = res.data.list
      historyTotal.value = res.data.total
    } finally {
      historyLoading.value = false
    }
  }

  async function fetchQueueStats() {
    queueStatsLoading.value = true
    try {
      const res = await getQueueStats()
      queueStats.value = res.data
    } finally {
      queueStatsLoading.value = false
    }
  }

  async function doSubmitJob(data: JobSubmission) {
    await submitJob(data)
    ElMessage.success('作业已提交')
  }

  async function doCancelJob(jobId: string) {
    await cancelJob(jobId)
    ElMessage.success('作业已取消')
  }

  return {
    runningJobs, runningTotal, runningLoading, fetchRunningJobs,
    queuedJobs, queuedTotal, queuedLoading, fetchQueuedJobs,
    historyJobs, historyTotal, historyLoading, fetchJobHistory,
    queueStats, queueStatsLoading, fetchQueueStats,
    doSubmitJob, doCancelJob,
  }
})
