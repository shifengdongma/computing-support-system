<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">CPU与内存资源</h2>
      <p class="page-header__description">查看集群中各节点的CPU和内存分配与使用情况</p>
    </div>

    <div class="search-bar">
      <div class="search-bar__left">
        <el-input
          v-model="keyword"
          placeholder="搜索节点名称"
          clearable
          style="width: 200px"
          @input="handleSearch"
        />
      </div>
      <div class="search-bar__right">
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="data-card" style="padding: 0">
      <el-table
        :data="filteredList"
        v-loading="cpuMemoryLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="nodeName" label="节点" min-width="140" show-overflow-tooltip />
        <el-table-column prop="cpuAllocated" label="CPU已分配" width="110" align="center" />
        <el-table-column prop="cpuTotal" label="CPU总量" width="100" align="center" />
        <el-table-column label="CPU利用率" width="130" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.cpuUsage * 100)"
              :status="row.cpuUsage >= 0.8 ? 'exception' : row.cpuUsage >= 0.5 ? 'warning' : 'success'"
              :width="80"
              :stroke-width="6"
              type="line"
            />
          </template>
        </el-table-column>
        <el-table-column prop="memoryAllocated" label="内存已分配" width="120" align="center" />
        <el-table-column prop="memoryTotal" label="内存总量" width="120" align="center" />
        <el-table-column label="内存利用率" width="130" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.memoryUsage * 100)"
              :status="row.memoryUsage >= 0.8 ? 'exception' : row.memoryUsage >= 0.5 ? 'warning' : 'success'"
              :width="80"
              :stroke-width="6"
              type="line"
            />
          </template>
        </el-table-column>
        <el-table-column prop="runningJobs" label="运行作业数" width="110" align="center" />
      </el-table>
      <div class="pagination-wrapper" style="margin-top: 16px; display: flex; justify-content: flex-end; padding: 0 20px 20px">
        <el-pagination
          v-model:current-page="cpuMemoryCurrentPage"
          v-model:page-size="cpuMemoryPageSize"
          :total="cpuMemoryTotal"
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

const resourcesStore = useResourcesStore()
const {
  cpuMemory,
  cpuMemoryLoading,
  cpuMemoryTotal,
  cpuMemoryCurrentPage,
  cpuMemoryPageSize,
} = storeToRefs(resourcesStore)

const keyword = ref('')

const filteredList = computed(() => {
  if (!keyword.value) return cpuMemory.value
  const kw = keyword.value.toLowerCase()
  return cpuMemory.value.filter((n) => n.nodeName.toLowerCase().includes(kw))
})

function handleSearch() {
  resourcesStore.fetchCpuMemory({ page: 1, pageSize: cpuMemoryPageSize.value })
}

function handleRefresh() {
  resourcesStore.fetchCpuMemory({
    page: cpuMemoryCurrentPage.value,
    pageSize: cpuMemoryPageSize.value,
  })
}

function handlePageChange(page: number, size: number) {
  cpuMemoryCurrentPage.value = page
  cpuMemoryPageSize.value = size
  resourcesStore.fetchCpuMemory({ page, pageSize: size })
}

onMounted(() => {
  resourcesStore.fetchCpuMemory()
})
</script>

<style scoped lang="scss">
.data-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
