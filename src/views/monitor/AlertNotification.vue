<template>
  <div class="page-container">
    <div class="page-header">
      <h2>告警通知</h2>
      <p class="page-desc">查看和管理系统告警通知</p>
    </div>

    <el-card shadow="never">
      <!-- Search Bar -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" size="default">
          <el-form-item label="级别">
            <el-select
              v-model="searchForm.level"
              placeholder="全部级别"
              clearable
              style="width: 130px"
              @change="handleSearch"
            >
              <el-option
                v-for="(item, key) in ALERT_LEVEL_MAP"
                :key="key"
                :label="item.label"
                :value="key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="确认状态">
            <el-select
              v-model="searchForm.acknowledged"
              placeholder="全部"
              clearable
              style="width: 130px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="已确认" value="true" />
              <el-option label="未确认" value="false" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="规则名称/节点/消息"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
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
        <el-table-column prop="ruleName" label="规则名称" min-width="130" />
        <el-table-column prop="level" label="级别" width="80" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.level" :status-map="ALERT_LEVEL_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="message" label="告警信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="nodeName" label="节点" width="130" />
        <el-table-column prop="metricValue" label="指标值" width="90" align="center" />
        <el-table-column prop="threshold" label="阈值" width="90" align="center" />
        <el-table-column prop="time" label="时间" width="170" />
        <el-table-column prop="acknowledged" label="确认状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.acknowledged" type="success" size="small">已确认</el-tag>
            <el-tag v-else type="warning" size="small">未确认</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="acknowledgedBy" label="确认人" width="100" align="center" />
        <el-table-column prop="acknowledgedTime" label="确认时间" width="170" />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :disabled="row.acknowledged"
              @click="handleAcknowledge(row)"
            >
              确认
            </el-button>
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
import { getAlertNotifications, acknowledgeAlert } from '@/api/modules/monitor'
import type { AlertNotification, PageParams } from '@/types'
import StatusTag from '@/components/StatusTag.vue'
import { ALERT_LEVEL_MAP } from '@/utils/constants'

const loading = ref(false)
const tableData = ref<AlertNotification[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10 })

const searchForm = reactive({
  level: '',
  acknowledged: '',
  keyword: '',
  dateRange: null as [string, string] | null,
})

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    }
    if (searchForm.level) params.level = searchForm.level
    if (searchForm.acknowledged !== '') params.acknowledged = searchForm.acknowledged === 'true'
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.dateRange) {
      params.startTime = searchForm.dateRange[0]
      params.endTime = searchForm.dateRange[1]
    }
    const res = await getAlertNotifications(params as unknown as PageParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取告警通知失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  searchForm.level = ''
  searchForm.acknowledged = ''
  searchForm.keyword = ''
  searchForm.dateRange = null
  pageParams.page = 1
  fetchData()
}

async function handleAcknowledge(row: AlertNotification) {
  try {
    await acknowledgeAlert(row.id)
    ElMessage.success('告警已确认')
    row.acknowledged = true
    row.acknowledgedBy = '当前用户'
    row.acknowledgedTime = new Date().toLocaleString()
  } catch {
    ElMessage.error('确认失败，请稍后重试')
  }
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
