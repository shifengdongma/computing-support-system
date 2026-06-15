<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">GPU资源池</h2>
      <p class="page-header__description">查看集群GPU资源分配情况与利用率</p>
    </div>

    <div class="search-bar">
      <div class="search-bar__left">
        <el-input
          v-model="keyword"
          placeholder="搜索节点名称或GPU型号"
          clearable
          style="width: 200px"
          @input="handleSearch"
        />
        <el-select
          v-model="filterType"
          placeholder="GPU型号筛选"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="NVIDIA A100" value="NVIDIA A100" />
          <el-option label="NVIDIA V100" value="NVIDIA V100" />
          <el-option label="NVIDIA A800" value="NVIDIA A800" />
        </el-select>
      </div>
      <div class="search-bar__right">
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="data-card" style="padding: 0">
      <el-table
        :data="filteredList"
        v-loading="gpuPoolsLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="nodeName" label="节点" min-width="140" show-overflow-tooltip />
        <el-table-column prop="gpuType" label="GPU型号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="total" label="总数" width="80" align="center" />
        <el-table-column prop="allocated" label="已分配" width="80" align="center" />
        <el-table-column prop="available" label="可用" width="80" align="center" />
        <el-table-column prop="utilizationRate" label="利用率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.utilizationRate * 100)"
              :status="row.utilizationRate >= 0.8 ? 'exception' : row.utilizationRate >= 0.5 ? 'warning' : 'success'"
              :width="60"
              :stroke-width="6"
              type="line"
            />
          </template>
        </el-table-column>
        <el-table-column prop="memoryTotal" label="显存总量" width="120" align="center" />
        <el-table-column prop="memoryUsed" label="显存已用" width="120" align="center" />
        <el-table-column prop="temperature" label="温度" width="80" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.temperature >= 80 ? '#f56c6c' : row.temperature >= 60 ? '#e6a23c' : '#67c23a' }">
              {{ row.temperature }}°C
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="powerDraw" label="功耗" width="100" align="center" />
      </el-table>
      <div class="pagination-wrapper" style="margin-top: 16px; display: flex; justify-content: flex-end; padding: 0 20px 20px">
        <el-pagination
          v-model:current-page="gpuPoolsCurrentPage"
          v-model:page-size="gpuPoolsPageSize"
          :total="gpuPoolsTotal"
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
  gpuPools,
  gpuPoolsLoading,
  gpuPoolsTotal,
  gpuPoolsCurrentPage,
  gpuPoolsPageSize,
} = storeToRefs(resourcesStore)

const keyword = ref('')
const filterType = ref('')

const filteredList = computed(() => {
  let list = gpuPools.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(
      (n) => n.nodeName.toLowerCase().includes(kw) || n.gpuType.toLowerCase().includes(kw)
    )
  }
  if (filterType.value) {
    list = list.filter((n) => n.gpuType === filterType.value)
  }
  return list
})

function handleSearch() {
  resourcesStore.fetchGpuPools({ page: 1, pageSize: gpuPoolsPageSize.value })
}

function handleRefresh() {
  resourcesStore.fetchGpuPools({
    page: gpuPoolsCurrentPage.value,
    pageSize: gpuPoolsPageSize.value,
  })
}

function handlePageChange(page: number, size: number) {
  gpuPoolsCurrentPage.value = page
  gpuPoolsPageSize.value = size
  resourcesStore.fetchGpuPools({ page, pageSize: size })
}

onMounted(() => {
  resourcesStore.fetchGpuPools()
})
</script>

<style scoped lang="scss">
.data-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
