<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的配额</h2>
      <p class="page-desc">查看当前资源配额和使用情况</p>
    </div>

    <el-row :gutter="20" v-loading="loading">
      <el-col :span="12">
        <el-card shadow="never" class="quota-card">
          <template #header>
            <span class="quota-title">作业配额</span>
          </template>
          <div class="quota-content">
            <div class="quota-info">
              <span class="quota-used">{{ quota.runningJobs }}</span>
              <span class="quota-separator"> / </span>
              <span class="quota-total">{{ quota.maxJobs }}</span>
              <span class="quota-unit"> 个</span>
            </div>
            <el-progress
              :percentage="jobPercentage"
              :status="jobPercentage >= 90 ? 'exception' : jobPercentage >= 70 ? 'warning' : 'success'"
              :stroke-width="16"
              :text-inside="true"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="quota-card">
          <template #header>
            <span class="quota-title">CPU 配额</span>
          </template>
          <div class="quota-content">
            <div class="quota-info">
              <span class="quota-used">{{ quota.usedCpus }}</span>
              <span class="quota-separator"> / </span>
              <span class="quota-total">{{ quota.maxCpus }}</span>
              <span class="quota-unit"> 核</span>
            </div>
            <el-progress
              :percentage="cpuPercentage"
              :status="cpuPercentage >= 90 ? 'exception' : cpuPercentage >= 70 ? 'warning' : 'success'"
              :stroke-width="16"
              :text-inside="true"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="quota-card">
          <template #header>
            <span class="quota-title">GPU 配额</span>
          </template>
          <div class="quota-content">
            <div class="quota-info">
              <span class="quota-used">{{ quota.usedGpus }}</span>
              <span class="quota-separator"> / </span>
              <span class="quota-total">{{ quota.maxGpus }}</span>
              <span class="quota-unit"> 块</span>
            </div>
            <el-progress
              :percentage="gpuPercentage"
              :status="gpuPercentage >= 90 ? 'exception' : gpuPercentage >= 70 ? 'warning' : 'success'"
              :stroke-width="16"
              :text-inside="true"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="quota-card">
          <template #header>
            <span class="quota-title">存储配额</span>
          </template>
          <div class="quota-content">
            <div class="quota-info">
              <span class="quota-used">{{ quota.usedStorage }}</span>
              <span class="quota-separator"> / </span>
              <span class="quota-total">{{ quota.maxStorage }}</span>
            </div>
            <el-progress
              :percentage="storagePercentage"
              :status="storagePercentage >= 90 ? 'exception' : storagePercentage >= 70 ? 'warning' : 'success'"
              :stroke-width="16"
              :text-inside="true"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="quota-card">
          <template #header>
            <span class="quota-title">作业时长限制</span>
          </template>
          <div class="quota-content">
            <div class="quota-info quota-walltime">
              <el-icon :size="28" color="#409eff"><Timer /></el-icon>
              <span class="walltime-value">{{ quota.maxWalltime }}</span>
            </div>
            <div class="walltime-desc">
              单次作业最大运行时长
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Timer } from '@element-plus/icons-vue'
import type { MyQuota } from '@/types'
import { getMyQuota } from '@/api/modules/workspace'

const quota = ref<MyQuota>({
  maxJobs: 0,
  runningJobs: 0,
  maxCpus: 0,
  usedCpus: 0,
  maxGpus: 0,
  usedGpus: 0,
  maxStorage: '',
  usedStorage: '',
  maxWalltime: '',
})
const loading = ref(false)

const jobPercentage = computed(() => {
  if (quota.value.maxJobs === 0) return 0
  return Math.round((quota.value.runningJobs / quota.value.maxJobs) * 100)
})

const cpuPercentage = computed(() => {
  if (quota.value.maxCpus === 0) return 0
  return Math.round((quota.value.usedCpus / quota.value.maxCpus) * 100)
})

const gpuPercentage = computed(() => {
  if (quota.value.maxGpus === 0) return 0
  return Math.round((quota.value.usedGpus / quota.value.maxGpus) * 100)
})

const storagePercentage = computed(() => {
  if (!quota.value.maxStorage) return 0
  const used = parseStorage(quota.value.usedStorage)
  const max = parseStorage(quota.value.maxStorage)
  if (max === 0) return 0
  return Math.round((used / max) * 100)
})

function parseStorage(val: string): number {
  const num = parseFloat(val)
  if (val.endsWith('TB')) return num * 1024
  return num
}

onMounted(async () => {
  await fetchQuota()
})

async function fetchQuota() {
  loading.value = true
  try {
    const res = await getMyQuota()
    quota.value = res.data
  } catch {
    ElMessage.error('获取配额信息失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: #303133;
  }

  .page-desc {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }
}

.quota-card {
  margin-bottom: 20px;

  .quota-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .quota-content {
    padding: 8px 0;
  }

  .quota-info {
    margin-bottom: 14px;
    font-size: 16px;

    &.quota-walltime {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
  }

  .quota-used {
    font-size: 28px;
    font-weight: 700;
    color: #409eff;
  }

  .quota-separator {
    font-size: 20px;
    color: #c0c4cc;
  }

  .quota-total {
    font-size: 20px;
    color: #606266;
  }

  .quota-unit {
    font-size: 14px;
    color: #909399;
  }

  .walltime-value {
    font-size: 28px;
    font-weight: 700;
    color: #409eff;
  }

  .walltime-desc {
    font-size: 13px;
    color: #909399;
    padding-left: 40px;
  }
}
</style>
