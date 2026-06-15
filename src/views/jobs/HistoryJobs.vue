<template>
  <div class="page-container">
    <div class="page-header">
      <h2>历史作业</h2>
      <p class="page-desc">查看已完成的作业历史记录</p>
    </div>

    <el-card shadow="never" class="search-bar">
      <el-form :model="filterForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="filterForm.user"
            placeholder="请输入用户名"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="(item, key) in JOB_STATUS_MAP"
              :key="key"
              :label="item.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filterForm.keyword"
            placeholder="作业名称/ID"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="data-card">
      <el-table
        :data="jobList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="作业名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="user" label="用户" width="110" />
        <el-table-column prop="partition" label="分区" width="100" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="JOB_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="cpus" label="CPUs" width="70" align="center" />
        <el-table-column prop="gpus" label="GPUs" width="70" align="center" />
        <el-table-column prop="memory" label="内存" width="90" align="center" />
        <el-table-column prop="submitTime" label="提交时间" width="165" />
        <el-table-column prop="startTime" label="开始时间" width="165" />
        <el-table-column prop="endTime" label="结束时间" width="165" />
        <el-table-column prop="elapsed" label="执行时长" width="100" align="center" />
        <el-table-column label="输出" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="output-text">{{ truncateText(row.output, 60) }}</span>
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
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Job, JobHistoryFilter } from '@/types'
import { getJobHistory } from '@/api/modules/jobs'
import { JOB_STATUS_MAP } from '@/utils/constants'
import StatusTag from '@/components/StatusTag.vue'

const dateRange = ref<[string, string] | null>(null)

const filterForm = reactive({
  user: '',
  status: '',
  keyword: '',
})

const jobList = ref<Job[]>([])
const total = ref(0)
const loading = ref(false)

const pageParams = reactive({
  page: 1,
  pageSize: 20,
})

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const filter: JobHistoryFilter = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    }
    if (filterForm.user) filter.user = filterForm.user
    if (filterForm.status) filter.status = filterForm.status
    if (filterForm.keyword) filter.keyword = filterForm.keyword
    if (dateRange.value) {
      filter.startDate = dateRange.value[0]
      filter.endDate = dateRange.value[1]
    }

    const res = await getJobHistory(filter)
    jobList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取历史作业列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  filterForm.user = ''
  filterForm.status = ''
  filterForm.keyword = ''
  dateRange.value = null
  pageParams.page = 1
  fetchData()
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '-'
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text
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

.search-bar {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }

  .output-text {
    font-family: monospace;
    font-size: 12px;
    color: #606266;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
