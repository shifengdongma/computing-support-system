<template>
  <div class="page-container">
    <div class="page-header">
      <h2>告警规则</h2>
      <p class="page-desc">管理和配置监控告警规则</p>
    </div>

    <el-card shadow="never">
      <div class="search-bar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新建规则
        </el-button>
      </div>

      <el-table :data="tableData" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="metric" label="监控指标" min-width="120" />
        <el-table-column prop="condition" label="条件" width="80" align="center">
          <template #default="{ row }">
            {{ conditionLabel(row.condition) }}
          </template>
        </el-table-column>
        <el-table-column prop="threshold" label="阈值" width="100" align="center" />
        <el-table-column prop="duration" label="持续时间" width="100" align="center" />
        <el-table-column prop="severity" label="严重级别" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.severity" :status-map="ALERT_LEVEL_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="(val: boolean) => handleToggle(row, val)" />
          </template>
        </el-table-column>
        <el-table-column label="通知组" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-for="group in row.notifyGroup"
              :key="group"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px"
            >
              {{ group }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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
          @current-change="fetchData"
          @size-change="fetchData"
        />
      </div>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑规则' : '新建规则'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="监控指标" prop="metric">
          <el-input v-model="formData.metric" placeholder="例如: cpu_usage" />
        </el-form-item>
        <el-form-item label="条件" prop="condition">
          <el-select v-model="formData.condition" style="width: 100%">
            <el-option label="大于 (>)" value="gt" />
            <el-option label="小于 (<)" value="lt" />
            <el-option label="等于 (=)" value="eq" />
          </el-select>
        </el-form-item>
        <el-form-item label="阈值" prop="threshold">
          <el-input-number v-model="formData.threshold" :min="0" :max="100000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="持续时间" prop="duration">
          <el-input v-model="formData.duration" placeholder="例如: 5m" />
        </el-form-item>
        <el-form-item label="严重级别" prop="severity">
          <el-select v-model="formData.severity" style="width: 100%">
            <el-option label="严重 (critical)" value="critical" />
            <el-option label="警告 (warning)" value="warning" />
            <el-option label="信息 (info)" value="info" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用" prop="enabled">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
        <el-form-item label="通知组" prop="notifyGroup">
          <el-input
            v-model="notifyGroupInput"
            placeholder="多个组用逗号分隔"
            @input="handleNotifyGroupInput"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { getAlertRules } from '@/api/modules/monitor'
import type { AlertRule } from '@/types'
import StatusTag from '@/components/StatusTag.vue'
import { ALERT_LEVEL_MAP } from '@/utils/constants'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref<AlertRule[]>([])
const total = ref(0)
const pageParams = reactive({ page: 1, pageSize: 10 })

const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const formRef = ref<FormInstance>()
const notifyGroupInput = ref('')

const formData = reactive({
  name: '',
  metric: '',
  condition: 'gt' as 'gt' | 'lt' | 'eq',
  threshold: 80,
  duration: '5m',
  severity: 'warning' as 'critical' | 'warning' | 'info',
  enabled: true,
  notifyGroup: [] as string[],
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  metric: [{ required: true, message: '请输入监控指标', trigger: 'blur' }],
  condition: [{ required: true, message: '请选择条件', trigger: 'change' }],
  threshold: [{ required: true, message: '请输入阈值', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入持续时间', trigger: 'blur' }],
  severity: [{ required: true, message: '请选择严重级别', trigger: 'change' }],
}

function conditionLabel(cond: string): string {
  const map: Record<string, string> = { gt: '>', lt: '<', eq: '=' }
  return map[cond] || cond
}

function handleNotifyGroupInput(val: string) {
  formData.notifyGroup = val.split(',').map((s) => s.trim()).filter(Boolean)
}

function resetForm() {
  formData.name = ''
  formData.metric = ''
  formData.condition = 'gt'
  formData.threshold = 80
  formData.duration = '5m'
  formData.severity = 'warning'
  formData.enabled = true
  formData.notifyGroup = []
  notifyGroupInput.value = ''
  editingId.value = ''
  isEditing.value = false
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getAlertRules({ page: pageParams.page, pageSize: pageParams.pageSize })
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取告警规则失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: AlertRule) {
  isEditing.value = true
  editingId.value = row.id
  formData.name = row.name
  formData.metric = row.metric
  formData.condition = row.condition
  formData.threshold = row.threshold
  formData.duration = row.duration
  formData.severity = row.severity
  formData.enabled = row.enabled
  formData.notifyGroup = [...row.notifyGroup]
  notifyGroupInput.value = row.notifyGroup.join(', ')
  dialogVisible.value = true
}

async function handleDelete(row: AlertRule) {
  try {
    await ElMessageBox.confirm(`确定要删除规则"${row.name}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    ElMessage.success(`规则"${row.name}"已删除`)
    await fetchData()
  } catch {
    // cancelled
  }
}

async function handleToggle(row: AlertRule, val: boolean) {
  ElMessage.success(`${val ? '已启用' : '已禁用'}规则"${row.name}"`)
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEditing.value) {
      ElMessage.success('规则已更新')
    } else {
      ElMessage.success('规则已创建')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    submitting.value = false
  }
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
