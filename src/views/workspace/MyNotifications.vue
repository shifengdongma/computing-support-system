<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-row">
        <div>
          <h2>消息通知</h2>
          <p class="page-desc">查看系统通知和作业状态变更消息</p>
        </div>
        <el-button type="primary" plain @click="handleMarkAllRead">
          全部标记为已读
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="data-card">
      <div class="search-bar">
        <el-select
          v-model="typeFilter"
          placeholder="通知类型"
          clearable
          style="width: 160px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="系统通知" value="system" />
          <el-option label="告警通知" value="alert" />
          <el-option label="作业通知" value="job" />
          <el-option label="配额通知" value="quota" />
        </el-select>
        <el-select
          v-model="readFilter"
          placeholder="阅读状态"
          clearable
          style="width: 140px"
          @change="handleFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="已读" value="read" />
          <el-option label="未读" value="unread" />
        </el-select>
      </div>

      <el-table :data="notificationList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">
            <span :class="{ 'unread-title': !row.read }">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagType(row.type)" size="small" effect="plain">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="170">
          <template #default="{ row }">
            {{ row.time }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.read" type="info" size="small">已读</el-tag>
            <el-tag v-else type="primary" size="small" effect="dark">未读</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.read"
              type="primary"
              link
              size="small"
              @click="handleMarkRead(row)"
            >
              标记已读
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
          @size-change="fetchNotifications"
          @current-change="fetchNotifications"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Notification, PageParams } from '@/types'
import { getNotifications } from '@/api/modules/workspace'

const notificationList = ref<Notification[]>([])
const loading = ref(false)
const total = ref(0)
const typeFilter = ref('')
const readFilter = ref('')

const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 20,
})

const typeLabelMap: Record<string, string> = {
  system: '系统通知',
  alert: '告警通知',
  job: '作业通知',
  quota: '配额通知',
}

const typeTagColorMap: Record<string, string> = {
  system: 'primary',
  alert: 'danger',
  job: 'success',
  quota: 'warning',
}

function typeLabel(type: string): string {
  return typeLabelMap[type] || type
}

function typeTagType(type: string): string {
  return typeTagColorMap[type] || 'info'
}

onMounted(() => {
  fetchNotifications()
})

function handleFilterChange() {
  pageParams.page = 1
  fetchNotifications()
}

async function fetchNotifications() {
  loading.value = true
  try {
    const params: Record<string, unknown> = { ...pageParams }
    if (typeFilter.value) {
      params.type = typeFilter.value
    }
    if (readFilter.value === 'read') {
      params.read = true
    } else if (readFilter.value === 'unread') {
      params.read = false
    }
    const res = await getNotifications(params as unknown as PageParams)
    notificationList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

function handleMarkRead(row: Notification) {
  row.read = true
  ElMessage.success('已标记为已读')
}

function handleMarkAllRead() {
  notificationList.value.forEach((n) => {
    n.read = true
  })
  ElMessage.success('全部标记为已读')
}
</script>

<style scoped lang="scss">
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;

  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

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
}

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }
}

.unread-title {
  font-weight: 700;
  color: #303133;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
