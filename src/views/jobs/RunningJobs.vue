<template>
  <div class="page-container">
    <div class="page-header">
      <h2>运行中作业</h2>
      <p class="page-desc">查看当前正在运行的作业列表</p>
    </div>

    <el-card shadow="never" class="search-bar">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="keyword"
            placeholder="搜索作业名称或用户"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="partitionFilter"
            placeholder="分区筛选"
            clearable
            style="width: 100%"
            @change="handleSearch"
          >
            <el-option label="CPU分区" value="cpu" />
            <el-option label="GPU分区" value="gpu" />
            <el-option label="高性能分区" value="high-perf" />
            <el-option label="大数据分区" value="big-data" />
          </el-select>
        </el-col>
        <el-col :span="10">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
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
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="partition" label="分区" width="110" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="JOB_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center" />
        <el-table-column prop="nodes" label="节点数" width="80" align="center" />
        <el-table-column prop="cpus" label="CPUs" width="80" align="center" />
        <el-table-column prop="gpus" label="GPUs" width="80" align="center" />
        <el-table-column prop="memory" label="内存" width="100" align="center" />
        <el-table-column prop="submitTime" label="提交时间" width="170" />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="elapsed" label="已运行" width="100" align="center" />
        <el-table-column prop="remaining" label="剩余时间" width="100" align="center" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">
              查看详情
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              取消作业
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
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Job } from '@/types'
import { getRunningJobs, cancelJob } from '@/api/modules/jobs'
import { JOB_STATUS_MAP } from '@/utils/constants'
import StatusTag from '@/components/StatusTag.vue'

const keyword = ref('')
const partitionFilter = ref('')

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
    const res = await getRunningJobs({
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    })
    const data = res.data
    // Apply client-side filtering if search params are set
    let list = data.list
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      list = list.filter(
        (j) => j.name.toLowerCase().includes(kw) || j.user.toLowerCase().includes(kw),
      )
    }
    if (partitionFilter.value) {
      list = list.filter((j) => j.partition === partitionFilter.value)
    }
    jobList.value = list
    total.value = data.total
  } catch {
    ElMessage.error('获取运行中作业列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  keyword.value = ''
  partitionFilter.value = ''
  pageParams.page = 1
  fetchData()
}

function handleView(row: Job) {
  ElMessage.info(`查看作业详情: ${row.name} (ID: ${row.id})`)
}

async function handleCancel(row: Job) {
  try {
    await ElMessageBox.confirm(
      `确定要取消作业 "${row.name}" (ID: ${row.id}) 吗？`,
      '取消确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    await cancelJob(row.id)
    ElMessage.success('作业已取消')
    await fetchData()
  } catch {
    // cancelled by user or error
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
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
