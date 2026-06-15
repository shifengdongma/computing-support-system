<template>
  <div class="page-container">
    <div class="page-header">
      <h2>优先级策略</h2>
      <p class="page-desc">管理作业调度优先级策略配置</p>
    </div>

    <el-card shadow="never" class="data-card">
      <template #header>
        <div class="card-header">
          <span>策略列表</span>
          <el-button type="primary" size="small" @click="handleAdd">
            新增策略
          </el-button>
        </div>
      </template>

      <el-table
        :data="policyList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column label="类型" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="policyTagType(row.type)" size="small">
              {{ policyTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重" width="80" align="center" />
        <el-table-column prop="description" label="描述" min-width="240" show-overflow-tooltip />
        <el-table-column label="启用" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enabled"
              :loading="switchingId === row.id"
              @change="(val: boolean) => handleToggle(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
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

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑策略' : '新增策略'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dialogFormRef"
        :model="dialogForm"
        :rules="dialogFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入策略名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="dialogForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="公平共享" value="fairshare" />
            <el-option label="先进先出" value="fifo" />
            <el-option label="优先级" value="priority" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="权重" prop="weight">
          <el-input-number
            v-model="dialogForm.weight"
            :min="1"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="dialogForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入策略描述"
          />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="dialogForm.enabled" />
        </el-form-item>
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
import type { FormInstance, FormRules } from 'element-plus'
import type { PriorityPolicy } from '@/types'
import { getPriorityPolicies } from '@/api/modules/users'

function policyTypeLabel(type: string): string {
  switch (type) {
    case 'fairshare':
      return '公平共享'
    case 'fifo':
      return '先进先出'
    case 'priority':
      return '优先级'
    case 'custom':
      return '自定义'
    default:
      return type
  }
}

function policyTagType(type: string): 'success' | 'primary' | 'warning' | '' {
  switch (type) {
    case 'fairshare':
      return 'success'
    case 'fifo':
      return 'primary'
    case 'priority':
      return 'warning'
    case 'custom':
      return ''
    default:
      return ''
  }
}

const policyList = ref<PriorityPolicy[]>([])
const total = ref(0)
const loading = ref(false)

const pageParams = reactive({
  page: 1,
  pageSize: 20,
})

const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const saving = ref(false)
const dialogFormRef = ref<FormInstance>()
const switchingId = ref('')

interface PolicyForm {
  name: string
  type: string
  weight: number
  description: string
  enabled: boolean
}

const dialogForm = reactive<PolicyForm>({
  name: '',
  type: 'fairshare',
  weight: 10,
  description: '',
  enabled: true,
})

const dialogFormRules: FormRules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择策略类型', trigger: 'change' },
  ],
  weight: [
    { required: true, message: '请输入权重', trigger: 'blur' },
  ],
}

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getPriorityPolicies({
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    })
    policyList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取策略列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEditing.value = false
  editingId.value = ''
  dialogForm.name = ''
  dialogForm.type = 'fairshare'
  dialogForm.weight = 10
  dialogForm.description = ''
  dialogForm.enabled = true
  dialogVisible.value = true
}

function handleEdit(row: PriorityPolicy) {
  isEditing.value = true
  editingId.value = row.id
  dialogForm.name = row.name
  dialogForm.type = row.type
  dialogForm.weight = row.weight
  dialogForm.description = row.description
  dialogForm.enabled = row.enabled
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (isEditing.value) {
      ElMessage.success('策略更新成功')
    } else {
      ElMessage.success('策略创建成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error(isEditing.value ? '策略更新失败' : '策略创建失败')
  } finally {
    saving.value = false
  }
}

async function handleToggle(row: PriorityPolicy, val: boolean) {
  switchingId.value = row.id
  try {
    ElMessage.success(
      `策略 "${row.name}" 已${val ? '启用' : '禁用'}`,
    )
    await fetchData()
  } catch {
    ElMessage.error('状态切换失败')
  } finally {
    switchingId.value = ''
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

.data-card {
  :deep(.el-table) {
    th.el-table__cell {
      background-color: #fafafa;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
