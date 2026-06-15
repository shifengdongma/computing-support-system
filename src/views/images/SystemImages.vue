<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统镜像</h2>
      <p class="page-desc">管理系统基础镜像</p>
    </div>

    <el-card shadow="never">
      <!-- Search Bar -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" size="default">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="镜像名称/版本/操作系统"
              clearable
              style="width: 260px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
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
        <el-table-column prop="name" label="镜像名称" min-width="140" />
        <el-table-column prop="version" label="版本" width="100" align="center" />
        <el-table-column prop="os" label="操作系统" width="110" />
        <el-table-column prop="kernel" label="内核" width="120" />
        <el-table-column prop="size" label="大小" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="IMAGE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">查看详情</el-button>
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

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="镜像详情"
      width="600px"
    >
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="镜像名称" span="2">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="版本" span="1">{{ detailData.version }}</el-descriptions-item>
          <el-descriptions-item label="操作系统" span="1">{{ detailData.os }}</el-descriptions-item>
          <el-descriptions-item label="内核" span="1">{{ detailData.kernel }}</el-descriptions-item>
          <el-descriptions-item label="大小" span="1">{{ detailData.size }}</el-descriptions-item>
          <el-descriptions-item label="状态" span="1">
            <StatusTag :status="detailData.status" :status-map="IMAGE_STATUS_MAP" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" span="1">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" span="1">{{ detailData.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="描述" span="2">{{ detailData.description }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemImages } from '@/api/modules/images'
import type { SystemImage, PageParams } from '@/types'
import StatusTag from '@/components/StatusTag.vue'
import { IMAGE_STATUS_MAP } from '@/utils/constants'

const loading = ref(false)
const tableData = ref<SystemImage[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10 })

const searchForm = reactive({
  keyword: '',
})

const detailVisible = ref(false)
const detailData = ref<SystemImage | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    const res = await getSystemImages(params as unknown as PageParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取系统镜像列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  pageParams.page = 1
  fetchData()
}

function handleDetail(row: SystemImage) {
  detailData.value = row
  detailVisible.value = true
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
