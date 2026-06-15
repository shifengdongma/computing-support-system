<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-header__title">网络资源</h2>
      <p class="page-header__description">查看集群网络状态，包括带宽、延迟和吞吐量信息</p>
    </div>

    <div class="search-bar">
      <div class="search-bar__left">
        <el-input
          v-model="keyword"
          placeholder="搜索网络名称"
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
          <el-option label="正常" value="normal" />
          <el-option label="拥塞" value="congested" />
          <el-option label="异常" value="error" />
        </el-select>
      </div>
      <div class="search-bar__right">
        <el-button type="primary" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="data-card" style="padding: 0">
      <el-table
        :data="filteredList"
        v-loading="networkLoading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">
              {{ row.type === 'infiniband' ? 'InfiniBand' : '以太网' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bandwidth" label="带宽" width="130" align="center" />
        <el-table-column prop="currentThroughput" label="当前吞吐" width="130" align="center" />
        <el-table-column prop="latency" label="延迟" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.latency }} ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="packetLoss" label="丢包率" width="100" align="center">
          <template #default="{ row }">
            <span>{{ row.packetLoss }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="NETWORK_STATUS_MAP" />
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper" style="margin-top: 16px; display: flex; justify-content: flex-end; padding: 0 20px 20px">
        <el-pagination
          v-model:current-page="networkCurrentPage"
          v-model:page-size="networkPageSize"
          :total="networkTotal"
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
import { NETWORK_STATUS_MAP } from '@/utils/constants'

const resourcesStore = useResourcesStore()
const {
  network,
  networkLoading,
  networkTotal,
  networkCurrentPage,
  networkPageSize,
} = storeToRefs(resourcesStore)

const keyword = ref('')
const filterStatus = ref('')

const filteredList = computed(() => {
  let list = network.value
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    list = list.filter((n) => n.name.toLowerCase().includes(kw))
  }
  if (filterStatus.value) {
    list = list.filter((n) => n.status === filterStatus.value)
  }
  return list
})

function handleSearch() {
  resourcesStore.fetchNetwork({ page: 1, pageSize: networkPageSize.value })
}

function handleRefresh() {
  resourcesStore.fetchNetwork({
    page: networkCurrentPage.value,
    pageSize: networkPageSize.value,
  })
}

function handlePageChange(page: number, size: number) {
  networkCurrentPage.value = page
  networkPageSize.value = size
  resourcesStore.fetchNetwork({ page, pageSize: size })
}

onMounted(() => {
  resourcesStore.fetchNetwork()
})
</script>

<style scoped lang="scss">
.data-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
</style>
