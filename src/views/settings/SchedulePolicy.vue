<template>
  <div class="page-container">
    <div class="page-header">
      <h2>调度策略</h2>
      <p class="page-desc">管理集群资源调度策略，支持回填调度、组调度、抢占调度和预留调度</p>
    </div>

    <el-card shadow="never" class="data-card">
      <div class="toolbar">
        <el-button type="primary" @click="openAddDialog">
          添加策略
        </el-button>
      </div>

      <el-table :data="policyList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="150" />
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small" effect="plain">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" align="center" />
        <el-table-column label="配置" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <code class="config-json">{{ formatConfig(row.config) }}</code>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enabled"
              :loading="row._switchLoading"
              @change="(val: boolean) => handleToggleEnabled(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchPolicies"
          @current-change="fetchPolicies"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showDialog"
      title="添加策略"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择策略类型" style="width: 100%">
            <el-option label="回填调度" value="backfill" />
            <el-option label="组调度" value="gang" />
            <el-option label="抢占调度" value="preemption" />
            <el-option label="预留调度" value="reservation" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-input-number v-model="formData.priority" :min="0" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { SchedulePolicy, PageParams } from '@/types'
import { getSchedulePolicies } from '@/api/modules/settings'

const policyList = ref<(SchedulePolicy & { _switchLoading?: boolean })[]>([])
const loading = ref(false)
const total = ref(0)
const showDialog = ref(false)
const submitting = ref(false)

const formRef = ref<FormInstance>()

const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 20,
})

const formData = reactive({
  name: '',
  type: 'backfill' as SchedulePolicy['type'],
  priority: 50,
  enabled: true,
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择策略类型', trigger: 'change' },
  ],
  priority: [
    { required: true, message: '请输入优先级', trigger: 'blur' },
  ],
}

const typeLabelMap: Record<string, string> = {
  backfill: '回填调度',
  gang: '组调度',
  preemption: '抢占调度',
  reservation: '预留调度',
}

const typeTagMap: Record<string, string> = {
  backfill: 'primary',
  gang: 'success',
  preemption: 'danger',
  reservation: 'warning',
}

function typeLabel(type: string): string {
  return typeLabelMap[type] || type
}

function typeTag(type: string): string {
  return typeTagMap[type] || 'info'
}

function formatConfig(config: Record<string, unknown>): string {
  try {
    return JSON.stringify(config)
  } catch {
    return String(config)
  }
}

onMounted(() => {
  fetchPolicies()
})

async function fetchPolicies() {
  loading.value = true
  try {
    const res = await getSchedulePolicies(pageParams)
    policyList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取调度策略列表失败')
  } finally {
    loading.value = false
  }
}

function handleToggleEnabled(row: SchedulePolicy & { _switchLoading?: boolean }, val: boolean) {
  row._switchLoading = true
  setTimeout(() => {
    row.enabled = val
    row._switchLoading = false
    ElMessage.success(val ? '策略已启用' : '策略已禁用')
  }, 300)
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    ElMessage.success('调度策略已添加')
    showDialog.value = false
    formRef.value?.resetFields()
    await fetchPolicies()
  } catch {
    ElMessage.error('添加策略失败')
  } finally {
    submitting.value = false
  }
}

function openAddDialog() {
  formData.name = ''
  formData.type = 'backfill'
  formData.priority = 50
  formData.enabled = true
  showDialog.value = true
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

.toolbar {
  margin-bottom: 16px;
}

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }
}

.config-json {
  font-size: 12px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
