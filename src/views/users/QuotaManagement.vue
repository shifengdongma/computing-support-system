<template>
  <div class="page-container">
    <div class="page-header">
      <h2>配额管理</h2>
      <p class="page-desc">管理用户资源配额限制</p>
    </div>

    <el-card shadow="never" class="search-bar">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="keyword"
            placeholder="搜索用户名"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :span="16" style="text-align: right">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="data-card">
      <el-table
        :data="quotaList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户" width="120" fixed="left" />
        <el-table-column label="最大作业数" width="150" align="center">
          <template #default="{ row }">
            <div class="quota-cell">
              <span class="quota-used">{{ row.runningJobs }}</span>
              <span class="quota-sep"> / </span>
              <span class="quota-max">{{ row.maxJobs }}</span>
              <el-progress
                :percentage="computePercent(row.runningJobs, row.maxJobs)"
                :stroke-width="6"
                style="margin-top: 4px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="CPU" width="150" align="center">
          <template #default="{ row }">
            <div class="quota-cell">
              <span class="quota-used">{{ row.usedCpus }}</span>
              <span class="quota-sep"> / </span>
              <span class="quota-max">{{ row.maxCpus }}</span>
              <el-progress
                :percentage="computePercent(row.usedCpus, row.maxCpus)"
                :stroke-width="6"
                style="margin-top: 4px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="GPU" width="150" align="center">
          <template #default="{ row }">
            <div class="quota-cell">
              <span class="quota-used">{{ row.usedGpus }}</span>
              <span class="quota-sep"> / </span>
              <span class="quota-max">{{ row.maxGpus }}</span>
              <el-progress
                :percentage="computePercent(row.usedGpus, row.maxGpus)"
                :stroke-width="6"
                style="margin-top: 4px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="存储" width="160" align="center">
          <template #default="{ row }">
            <div class="quota-cell">
              <span class="quota-used">{{ row.usedStorage }}</span>
              <span class="quota-sep"> / </span>
              <span class="quota-max">{{ row.maxStorage }}</span>
              <el-progress
                :percentage="storagePercent(row)"
                :stroke-width="6"
                style="margin-top: 4px"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="maxWalltime" label="最大时长" width="110" align="center" />
        <el-table-column label="有效期" min-width="200" align="center">
          <template #default="{ row }">
            {{ row.validFrom }} ~ {{ row.validTo }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑配额
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
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- Edit Quota Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑配额"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        label-width="110px"
        label-position="right"
      >
        <el-form-item label="用户">
          <span class="dialog-username">{{ dialogForm.username }}</span>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最大作业数">
              <el-input-number
                v-model="dialogForm.maxJobs"
                :min="1"
                :max="9999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运行作业数">
              <el-input-number
                v-model="dialogForm.runningJobs"
                :min="0"
                :max="9999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最大CPU">
              <el-input-number
                v-model="dialogForm.maxCpus"
                :min="1"
                :max="99999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已用CPU">
              <el-input-number
                v-model="dialogForm.usedCpus"
                :min="0"
                :max="99999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最大GPU">
              <el-input-number
                v-model="dialogForm.maxGpus"
                :min="0"
                :max="9999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已用GPU">
              <el-input-number
                v-model="dialogForm.usedGpus"
                :min="0"
                :max="9999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最大存储">
              <el-input v-model="dialogForm.maxStorage" placeholder="例如: 100GB" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="已用存储">
              <el-input v-model="dialogForm.usedStorage" placeholder="例如: 50GB" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="最大时长">
          <el-input v-model="dialogForm.maxWalltime" placeholder="例如: 72:00:00" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="有效期开始">
              <el-date-picker
                v-model="dialogForm.validFrom"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效期结束">
              <el-date-picker
                v-model="dialogForm.validTo"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { Quota } from '@/types'
import { getQuotas } from '@/api/modules/users'

const keyword = ref('')

const quotaList = ref<Quota[]>([])
const total = ref(0)
const loading = ref(false)

const pageParams = reactive({
  page: 1,
  pageSize: 20,
})

const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref('')
const dialogFormRef = ref<FormInstance>()

interface QuotaForm {
  username: string
  maxJobs: number
  runningJobs: number
  maxCpus: number
  usedCpus: number
  maxGpus: number
  usedGpus: number
  maxStorage: string
  usedStorage: string
  maxWalltime: string
  validFrom: string
  validTo: string
}

const dialogForm = reactive<QuotaForm>({
  username: '',
  maxJobs: 100,
  runningJobs: 0,
  maxCpus: 64,
  usedCpus: 0,
  maxGpus: 8,
  usedGpus: 0,
  maxStorage: '',
  usedStorage: '',
  maxWalltime: '',
  validFrom: '',
  validTo: '',
})

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getQuotas({
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    })
    let list = res.data.list
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      list = list.filter((q) => q.username.toLowerCase().includes(kw))
    }
    quotaList.value = list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取配额列表失败')
  } finally {
    loading.value = false
  }
}

function computePercent(used: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(Math.round((used / max) * 100), 100)
}

function storagePercent(row: Quota): number {
  const used = parseStorageValue(row.usedStorage)
  const max = parseStorageValue(row.maxStorage)
  return computePercent(used, max)
}

function parseStorageValue(val: string): number {
  if (!val) return 0
  const match = val.match(/^(\d+(?:\.\d+)?)\s*(GB|TB|MB)$/i)
  if (!match) return 0
  const num = parseFloat(match[1])
  const unit = match[2].toUpperCase()
  if (unit === 'TB') return num * 1024
  if (unit === 'MB') return num / 1024
  return num
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleReset() {
  keyword.value = ''
  pageParams.page = 1
  fetchData()
}

function handleEdit(row: Quota) {
  editingId.value = row.id
  dialogForm.username = row.username
  dialogForm.maxJobs = row.maxJobs
  dialogForm.runningJobs = row.runningJobs
  dialogForm.maxCpus = row.maxCpus
  dialogForm.usedCpus = row.usedCpus
  dialogForm.maxGpus = row.maxGpus
  dialogForm.usedGpus = row.usedGpus
  dialogForm.maxStorage = row.maxStorage
  dialogForm.usedStorage = row.usedStorage
  dialogForm.maxWalltime = row.maxWalltime
  dialogForm.validFrom = row.validFrom
  dialogForm.validTo = row.validTo
  dialogVisible.value = true
}

async function handleSave() {
  saving.value = true
  try {
    ElMessage.success('配额更新成功')
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error('配额更新失败')
  } finally {
    saving.value = false
  }
}
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

  :deep(.el-card__body) {
    padding: 16px 20px;
  }
}

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }
}

.quota-cell {
  .quota-used {
    color: #409eff;
    font-weight: 600;
  }

  .quota-sep {
    color: #c0c4cc;
  }

  .quota-max {
    color: #606266;
  }
}

.dialog-username {
  font-weight: 600;
  color: #303133;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
