<template>
  <div class="page-container">
    <div class="page-header">
      <h2>审计日志</h2>
      <p class="page-desc">查看系统操作审计记录，追踪用户行为和系统变更</p>
    </div>

    <el-card shadow="never" class="data-card">
      <div class="search-bar">
        <el-input
          v-model="userFilter"
          placeholder="用户"
          clearable
          style="width: 160px"
          @clear="handleFilterChange"
          @keyup.enter="handleFilterChange"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="actionFilter"
          placeholder="操作"
          clearable
          style="width: 160px"
          @clear="handleFilterChange"
          @keyup.enter="handleFilterChange"
        >
          <template #prefix>
            <el-icon><Operation /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="resultFilter"
          placeholder="结果"
          clearable
          style="width: 130px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failure" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
          @change="handleFilterChange"
        />
        <el-button type="primary" @click="handleFilterChange">搜索</el-button>
      </div>

      <el-table :data="logList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="user" label="用户" width="130" />
        <el-table-column prop="action" label="操作" width="140" />
        <el-table-column prop="resource" label="资源" min-width="160" show-overflow-tooltip />
        <el-table-column prop="detail" label="详情" min-width="240" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="time" label="时间" width="170" />
        <el-table-column label="结果" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'" size="small">
              {{ row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
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
          @size-change="fetchLogs"
          @current-change="fetchLogs"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Operation } from '@element-plus/icons-vue'
import type { AuditLog, PageParams } from '@/types'
import { getAuditLogs } from '@/api/modules/monitor'

const logList = ref<AuditLog[]>([])
const loading = ref(false)
const total = ref(0)
const userFilter = ref('')
const actionFilter = ref('')
const resultFilter = ref('')
const dateRange = ref<string[]>([])

const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 20,
})

onMounted(() => {
  fetchLogs()
})

function handleFilterChange() {
  pageParams.page = 1
  fetchLogs()
}

async function fetchLogs() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { ...pageParams }
    if (userFilter.value) params.user = userFilter.value
    if (actionFilter.value) params.action = actionFilter.value
    if (resultFilter.value) params.result = resultFilter.value
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res = await getAuditLogs(params as unknown as PageParams)
    logList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取审计日志失败')
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

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
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
