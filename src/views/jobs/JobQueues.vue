<template>
  <div class="page-container">
    <div class="page-header">
      <h2>作业队列</h2>
      <p class="page-desc">查看各分区队列的统计信息</p>
    </div>

    <el-row :gutter="16" class="summary-cards">
      <el-col :span="8">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value running">{{ summary.running }}</div>
          <div class="summary-label">运行中作业</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value queued">{{ summary.queued }}</div>
          <div class="summary-label">排队中作业</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value partitions">{{ summary.partitions }}</div>
          <div class="summary-label">分区总数</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="data-card">
      <el-table
        :data="queueData"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="partition" label="分区" min-width="140" />
        <el-table-column prop="total" label="总数" width="100" align="center" />
        <el-table-column prop="running" label="运行" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.running }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="queued" label="排队" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="small">{{ row.queued }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="nodes" label="节点" min-width="120" />
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.state" :status-map="QUEUE_STATUS_MAP" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { JobQueueStats } from '@/types'
import { getQueueStats } from '@/api/modules/jobs'
import StatusTag from '@/components/StatusTag.vue'

const QUEUE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  up: { label: '在线', color: '#67c23a' },
  down: { label: '离线', color: '#f56c6c' },
  drain: { label: '排空', color: '#e6a23c' },
}

const queueData = ref<JobQueueStats[]>([])
const loading = ref(false)

const summary = computed(() => {
  const running = queueData.value.reduce((sum, q) => sum + q.running, 0)
  const queued = queueData.value.reduce((sum, q) => sum + q.queued, 0)
  const partitions = queueData.value.length
  return { running, queued, partitions }
})

onMounted(async () => {
  await fetchQueueData()
})

async function fetchQueueData() {
  loading.value = true
  try {
    const res = await getQueueStats()
    queueData.value = res.data
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

.summary-cards {
  margin-bottom: 24px;
}

.summary-card {
  text-align: center;

  .summary-value {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 8px;

    &.running {
      color: #67c23a;
    }

    &.queued {
      color: #e6a23c;
    }

    &.partitions {
      color: #409eff;
    }
  }

  .summary-label {
    font-size: 14px;
    color: #909399;
  }
}

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }
}
</style>
