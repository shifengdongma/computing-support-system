<template>
  <div class="page-container">
    <div class="page-header">
      <h2>自定义镜像</h2>
      <p class="page-desc">管理用户自定义镜像</p>
    </div>

    <el-card shadow="never">
      <!-- Search Bar -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" size="default">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="镜像名称/版本/所有者"
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
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column prop="version" label="版本" width="100" align="center" />
        <el-table-column prop="baseImage" label="基础镜像" min-width="150" show-overflow-tooltip />
        <el-table-column prop="owner" label="所有者" width="120" />
        <el-table-column prop="size" label="大小" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="IMAGE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
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
      title="自定义镜像详情"
      width="700px"
    >
      <template v-if="detailData">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="名称" span="2">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="版本" span="1">{{ detailData.version }}</el-descriptions-item>
          <el-descriptions-item label="大小" span="1">{{ detailData.size }}</el-descriptions-item>
          <el-descriptions-item label="基础镜像" span="1">{{ detailData.baseImage }}</el-descriptions-item>
          <el-descriptions-item label="所有者" span="1">{{ detailData.owner }}</el-descriptions-item>
          <el-descriptions-item label="状态" span="1">
            <StatusTag :status="detailData.status" :status-map="IMAGE_STATUS_MAP" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" span="1">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" span="1">{{ detailData.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="描述" span="2">{{ detailData.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="dockerfile-section">
          <div class="dockerfile-label">Dockerfile 内容</div>
          <pre class="dockerfile-content">{{ detailData.dockerfile }}</pre>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCustomImages } from '@/api/modules/images'
import type { CustomImage, PageParams } from '@/types'
import StatusTag from '@/components/StatusTag.vue'
import { IMAGE_STATUS_MAP } from '@/utils/constants'

const loading = ref(false)
const tableData = ref<CustomImage[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10 })

const searchForm = reactive({
  keyword: '',
})

const detailVisible = ref(false)
const detailData = ref<CustomImage | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    const res = await getCustomImages(params as unknown as PageParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取自定义镜像列表失败')
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

function handleDetail(row: CustomImage) {
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

.dockerfile-section {
  margin-top: 16px;
}

.dockerfile-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.dockerfile-content {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
}
</style>
