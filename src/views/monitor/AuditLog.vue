<template>
  <div class="page-container">
    <div class="page-header">
      <h2>审计日志</h2>
      <p class="page-desc">查看系统操作审计记录</p>
    </div>

    <el-card shadow="never">
      <!-- Search Bar -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" size="default">
          <el-form-item label="用户">
            <el-input
              v-model="searchForm.user"
              placeholder="输入用户"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="操作">
            <el-input
              v-model="searchForm.action"
              placeholder="输入操作"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="结果">
            <el-select
              v-model="searchForm.result"
              placeholder="全部"
              clearable
              style="width: 110px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="failure" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 340px"
              @change="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- Table -->
      <el-table :data="tableData" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="action" label="操作" width="130" />
        <el-table-column prop="resource" label="资源" min-width="160" show-overflow-tooltip />
        <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="140" />
        <el-table-column prop="time" label="时间" width="170" />
        <el-table-column prop="result" label="结果" width="80" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.result" :status-map="RESULT_MAP" />
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAuditLogs } from '@/api/modules/monitor'
import type { AuditLog, PageParams } from '@/types'
import StatusTag from '@/components/StatusTag.vue'

const RESULT_MAP: Record<string, { label: string; color: string }> = {
  success: { label: '成功', color: '#67c23a' },
  failure: { label: '失败', color: '#f56c6c' },
}

const loading = ref(false)
const tableData = ref<AuditLog[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10 })

const searchForm = reactive({
  user: '',
  action: '',
  result: '',
  dateRange: null as [string, string] | null,
})

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    }
    if (searchForm.user) params.user = searchForm.user
    if (searchForm.action) params.action = searchForm.action
    if (searchForm.result) params.result = searchForm.result
    if (searchForm.dateRange) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    const res = await getAuditLogs(params as unknown as PageParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取审计日志失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  searchForm.user = ''
  searchForm.action = ''
  searchForm.result = ''
  searchForm.dateRange = null
  pageParams.page = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
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
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
