<template>
  <div class="page-container">
    <div class="page-header">
      <h2>AI框架镜像</h2>
      <p class="page-desc">管理AI框架镜像，包含深度学习框架和工具包</p>
    </div>

    <el-card shadow="never">
      <!-- Search Bar -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" size="default">
          <el-form-item label="框架">
            <el-select
              v-model="searchForm.framework"
              placeholder="全部框架"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="TensorFlow" value="TensorFlow" />
              <el-option label="PyTorch" value="PyTorch" />
              <el-option label="JAX" value="JAX" />
              <el-option label="PaddlePaddle" value="PaddlePaddle" />
              <el-option label="MindSpore" value="MindSpore" />
            </el-select>
          </el-form-item>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="镜像名称/版本"
              clearable
              style="width: 200px"
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
        <el-table-column prop="framework" label="框架" width="120" />
        <el-table-column prop="frameworkVersion" label="框架版本" width="110" align="center" />
        <el-table-column prop="cudaVersion" label="CUDA" width="100" align="center" />
        <el-table-column prop="pythonVersion" label="Python" width="90" align="center" />
        <el-table-column prop="size" label="大小" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="IMAGE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="包含包" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="pkg in row.includedPackages"
              :key="pkg"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px"
            >
              {{ pkg }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
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
      title="AI框架镜像详情"
      width="600px"
    >
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称" span="2">{{ detailData.name }}</el-descriptions-item>
          <el-descriptions-item label="框架" span="1">{{ detailData.framework }}</el-descriptions-item>
          <el-descriptions-item label="框架版本" span="1">{{ detailData.frameworkVersion }}</el-descriptions-item>
          <el-descriptions-item label="CUDA版本" span="1">{{ detailData.cudaVersion }}</el-descriptions-item>
          <el-descriptions-item label="Python版本" span="1">{{ detailData.pythonVersion }}</el-descriptions-item>
          <el-descriptions-item label="大小" span="1">{{ detailData.size }}</el-descriptions-item>
          <el-descriptions-item label="状态" span="1">
            <StatusTag :status="detailData.status" :status-map="IMAGE_STATUS_MAP" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" span="1">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" span="1">{{ detailData.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="描述" span="2">{{ detailData.description }}</el-descriptions-item>
          <el-descriptions-item label="包含包" span="2">
            <el-tag
              v-for="pkg in detailData.includedPackages"
              :key="pkg"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px"
            >
              {{ pkg }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAiFrameworkImages } from '@/api/modules/images'
import type { AiFrameworkImage, PageParams } from '@/types'
import StatusTag from '@/components/StatusTag.vue'
import { IMAGE_STATUS_MAP } from '@/utils/constants'

const loading = ref(false)
const tableData = ref<AiFrameworkImage[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10 })

const searchForm = reactive({
  framework: '',
  keyword: '',
})

const detailVisible = ref(false)
const detailData = ref<AiFrameworkImage | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    }
    if (searchForm.framework) params.framework = searchForm.framework
    if (searchForm.keyword) params.keyword = searchForm.keyword
    const res = await getAiFrameworkImages(params as unknown as PageParams)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取AI框架镜像列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  searchForm.framework = ''
  searchForm.keyword = ''
  pageParams.page = 1
  fetchData()
}

function handleDetail(row: AiFrameworkImage) {
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
