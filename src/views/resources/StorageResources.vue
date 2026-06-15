<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">存储资源</h2>
      <p class="page-header__description">管理集群中的存储资源，查看容量和使用情况</p>
    </div>

    <div class="search-bar">
      <div class="search-bar__left">
        <el-input
          v-model="keyword"
          placeholder="搜索存储名称或挂载点"
          clearable
          style="width: 200px"
          @input="handleSearch"
        />
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="健康" value="healthy" />
          <el-option label="降级" value="degraded" />
          <el-option label="故障" value="error" />
        </el-select>
      </div>
      <div class="search-bar__right">
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="data-card" style="padding: 0">
      <el-table
        :data="filteredList"
        v-loading="storageLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.type.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalSize" label="总容量" width="120" align="center" />
        <el-table-column prop="usedSize" label="已用容量" width="120" align="center" />
        <el-table-column label="使用率" width="180" align="center">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-progress
                :percentage="usagePercentage(row)"
                :status="usagePercentage(row) >= 90 ? 'exception' : usagePercentage(row) >= 70 ? 'warning' : 'success'"
                :stroke-width="8"
                style="flex: 1"
              />
              <span style="font-size: 12px; color: #909399; white-space: nowrap">{{ usagePercentage(row) }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mountPoint" label="挂载点" min-width="160" show-overflow-tooltip />
        <el-table-column prop="iops" label="IOPS" width="100" align="center" />
        <el-table-column prop="throughput" label="吞吐量" width="100" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="STORAGE_STATUS_MAP" />
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper" style="margin-top: 16px; display: flex; justify-content: flex-end; padding: 0 20px 20px">
        <el-pagination
          v-model:current-page="storageCurrentPage"
          v-model:page-size="storagePageSize"
          :total="storageTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useResourcesStore } from '@/stores/modules/resources'
import StatusTag from '@/components/StatusTag.vue'
import { STORAGE_STATUS_MAP } from '@/utils/constants'
import type { StorageResource } from '@/types'

const resourcesStore = useResourcesStore()
const {
  storage,
  storageLoading,
  storageTotal,
  storageCurrentPage,
  storagePageSize,
} = storeToRefs(resourcesStore)

const keyword = ref('')
const filterStatus = ref('')

function usagePercentage(row: StorageResource): number {
  if (!row.totalSize || !row.usedSize) return 0
  const total = parseStorageValue(row.totalSize)
  const used = parseStorageValue(row.usedSize)
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

function parseStorageValue(val: string): number {
  const num = parseFloat(val)
  if (isNaN(num)) return 0
  if (val.toUpperCase().includes('TB')) return num * 1024
  if (val.toUpperCase().includes('GB')) return num
  if (val.toUpperCase().includes('MB')) return num / 1024
  return num
}

const filteredList = computed(() => {
  let list = storage.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(
      (n) => n.name.toLowerCase().includes(kw) || n.mountPoint.toLowerCase().includes(kw)
    )
  }
  if (filterStatus.value) {
    list = list.filter((n) => n.status === filterStatus.value)
  }
  return list
})

function handleSearch() {
  resourcesStore.fetchStorage({ page: 1, pageSize: storagePageSize.value })
}

function handleRefresh() {
  resourcesStore.fetchStorage({
    page: storageCurrentPage.value,
    pageSize: storagePageSize.value,
  })
}

function handlePageChange(page: number, size: number) {
  storageCurrentPage.value = page
  storagePageSize.value = size
  resourcesStore.fetchStorage({ page, pageSize: size })
}

onMounted(() => {
  resourcesStore.fetchStorage()
})
</script>

<style scoped lang="scss">
.data-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
