<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的作业</h2>
      <p class="page-desc">查看和管理您提交的所有作业</p>
    </div>

    <el-row :gutter="16" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value running">{{ summary.running }}</div>
          <div class="summary-label">运行中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value queued">{{ summary.queued }}</div>
          <div class="summary-label">排队中</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value completed">{{ summary.completed }}</div>
          <div class="summary-label">已完成</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-value failed">{{ summary.failed }}</div>
          <div class="summary-label">已失败</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="data-card">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索作业名称"
          clearable
          style="width: 280px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <el-table :data="jobList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="作业名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="JOB_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="partition" label="分区" width="90" align="center" />
        <el-table-column prop="nodes" label="节点数" width="80" align="center" />
        <el-table-column prop="cpus" label="CPUs" width="80" align="center" />
        <el-table-column prop="gpus" label="GPUs" width="80" align="center" />
        <el-table-column prop="submitTime" label="提交时间" width="170" />
        <el-table-column prop="elapsed" label="运行时长" width="110" align="center" />
        <el-table-column label="输出" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ truncateText(row.output, 30) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'running' || row.status === 'queued'"
              type="danger"
              link
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchJobs"
          @current-change="fetchJobs"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { MyJob, PageParams } from '@/types'
import { getMyJobs } from '@/api/modules/workspace'
import StatusTag from '@/components/StatusTag.vue'
import { JOB_STATUS_MAP } from '@/utils/constants'

const jobList = ref<MyJob[]>([])
const loading = ref(false)
const total = ref(0)
const searchKeyword = ref('')

const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 20,
})

const summary = computed(() => {
  const running = jobList.value.filter((j) => j.status === 'running').length
  const queued = jobList.value.filter((j) => j.status === 'queued').length
  const completed = jobList.value.filter((j) => j.status === 'completed').length
  const failed = jobList.value.filter((j) => j.status === 'failed').length
  return { running, queued, completed, failed }
})

onMounted(() => {
  fetchJobs()
})

function truncateText(text: string, maxLen: number): string {
  if (!text) return '-'
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
}

function handleSearch() {
  pageParams.page = 1
  fetchJobs()
}

async function fetchJobs() {
  loading.value = true
  try {
    const params: PageParams & { keyword?: string } = { ...pageParams }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    const res = await getMyJobs(params)
    jobList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取作业列表失败')
  } finally {
    loading.value = false
  }
}

function handleViewDetail(row: MyJob) {
  ElMessage.info(`查看作业详情: ${row.name}`)
}

function handleCancel(row: MyJob) {
  ElMessageBox.confirm(`确定要取消作业 "${row.name}" 吗？`, '取消确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success(`作业 "${row.name}" 已取消`)
    fetchJobs()
  }).catch(() => {
    // cancelled
  })
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

  .summary-card {
    text-align: center;

    .summary-value {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 8px;

      &.running {
        color: #67c23a;
      }

      &.queued {
        color: #e6a23c;
      }

      &.completed {
        color: #909399;
      }

      &.failed {
        color: #f56c6c;
      }
    }

    .summary-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
