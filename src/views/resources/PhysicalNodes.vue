<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">物理节点</h2>
      <p class="page-header__description">管理集群中的所有物理节点，查看节点状态与资源使用情况</p>
    </div>

    <div class="search-bar">
      <div class="search-bar__left">
        <el-input
          v-model="keyword"
          placeholder="搜索节点名称或IP"
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
          <el-option label="在线" value="online" />
          <el-option label="离线" value="offline" />
          <el-option label="维护中" value="maintenance" />
        </el-select>
      </div>
      <div class="search-bar__right">
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="data-card" style="padding: 0">
      <el-table
        :data="filteredList"
        v-loading="physicalNodesLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="150" />
        <el-table-column prop="cpuModel" label="CPU型号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="cpuCores" label="CPU核数" width="100" align="center" />
        <el-table-column prop="memory" label="内存" width="100" align="center" />
        <el-table-column prop="gpuType" label="GPU型号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="gpuCount" label="GPU数量" width="100" align="center" />
        <el-table-column prop="diskSize" label="磁盘" width="110" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="NODE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="healthScore" label="健康分" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.healthScore >= 80 ? 'success' : row.healthScore >= 60 ? 'warning' : 'danger'"
              size="small"
            >
              {{ row.healthScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时长" width="120" align="center" />
      </el-table>
      <div class="pagination-wrapper" style="margin-top: 16px; display: flex; justify-content: flex-end; padding: 0 20px 20px">
        <el-pagination
          v-model:current-page="physicalNodesCurrentPage"
          v-model:page-size="physicalNodesPageSize"
          :total="physicalNodesTotal"
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
import { NODE_STATUS_MAP } from '@/utils/constants'

const resourcesStore = useResourcesStore()
const {
  physicalNodes,
  physicalNodesLoading,
  physicalNodesTotal,
  physicalNodesCurrentPage,
  physicalNodesPageSize,
} = storeToRefs(resourcesStore)

const keyword = ref('')
const filterStatus = ref('')

const filteredList = computed(() => {
  let list = physicalNodes.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter(
      (n) => n.name.toLowerCase().includes(kw) || n.ip.toLowerCase().includes(kw)
    )
  }
  if (filterStatus.value) {
    list = list.filter((n) => n.status === filterStatus.value)
  }
  return list
})

function handleSearch() {
  resourcesStore.fetchPhysicalNodes({ page: 1, pageSize: physicalNodesPageSize.value })
}

function handleRefresh() {
  resourcesStore.fetchPhysicalNodes({
    page: physicalNodesCurrentPage.value,
    pageSize: physicalNodesPageSize.value,
  })
}

function handlePageChange(page: number, size: number) {
  physicalNodesCurrentPage.value = page
  physicalNodesPageSize.value = size
  resourcesStore.fetchPhysicalNodes({ page, pageSize: size })
}

onMounted(() => {
  resourcesStore.fetchPhysicalNodes()
})
</script>

<style scoped lang="scss">
.data-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
