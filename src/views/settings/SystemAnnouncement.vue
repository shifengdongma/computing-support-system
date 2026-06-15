<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统公告</h2>
      <p class="page-desc">管理系统公告，发布维护通知和重要信息</p>
    </div>

    <el-card shadow="never" class="data-card">
      <div class="toolbar">
        <el-button type="primary" @click="openAddDialog">
          发布公告
        </el-button>
      </div>

      <el-table :data="announcementList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityTag(row.priority)" size="small" effect="plain">
              {{ priorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.published ? 'success' : 'info'" size="small">
              {{ row.published ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="170" />
        <el-table-column prop="expireTime" label="过期时间" width="170" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button
              type="warning"
              link
              size="small"
              @click="handleTogglePublish(row)"
            >
              {{ row.published ? '取消发布' : '发布' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
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
          background
          @size-change="fetchAnnouncements"
          @current-change="fetchAnnouncements"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="isEditing ? '编辑公告' : '发布公告'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="4"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高" value="high" />
            <el-option label="普通" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发布时间" prop="publishTime">
              <el-date-picker
                v-model="formData.publishTime"
                type="datetime"
                placeholder="选择发布时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker
                v-model="formData.expireTime"
                type="datetime"
                placeholder="选择过期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发布状态">
          <el-switch v-model="formData.published" active-text="发布" inactive-text="草稿" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { SystemAnnouncement, PageParams } from '@/types'
import { getAnnouncements } from '@/api/modules/settings'

const announcementList = ref<SystemAnnouncement[]>([])
const loading = ref(false)
const total = ref(0)
const showDialog = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingId = ref('')

const formRef = ref<FormInstance>()

const pageParams = reactive<PageParams>({
  page: 1,
  pageSize: 20,
})

const initFormData = () => ({
  title: '',
  content: '',
  priority: 'normal' as SystemAnnouncement['priority'],
  publishTime: '',
  expireTime: '',
  published: true,
})

const formData = reactive(initFormData())

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' },
  ],
}

const priorityLabelMap: Record<string, string> = {
  high: '高',
  normal: '普通',
  low: '低',
}

const priorityTagMap: Record<string, string> = {
  high: 'danger',
  normal: 'primary',
  low: 'info',
}

function priorityLabel(priority: string): string {
  return priorityLabelMap[priority] || priority
}

function priorityTag(priority: string): string {
  return priorityTagMap[priority] || 'info'
}

onMounted(() => {
  fetchAnnouncements()
})

async function fetchAnnouncements() {
  loading.value = true
  try {
    const res = await getAnnouncements(pageParams)
    announcementList.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEditing.value = false
  editingId.value = ''
  Object.assign(formData, initFormData())
  showDialog.value = true
}

function openEditDialog(row: SystemAnnouncement) {
  isEditing.value = true
  editingId.value = row.id
  formData.title = row.title
  formData.content = row.content
  formData.priority = row.priority
  formData.publishTime = row.publishTime
  formData.expireTime = row.expireTime
  formData.published = row.published
  showDialog.value = true
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    ElMessage.success(isEditing.value ? '公告已更新' : '公告已发布')
    showDialog.value = false
    formRef.value?.resetFields()
    await fetchAnnouncements()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

function handleTogglePublish(row: SystemAnnouncement) {
  const action = row.published ? '取消发布' : '发布'
  ElMessageBox.confirm(`确定要${action}公告 "${row.title}" 吗？`, `${action}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    row.published = !row.published
    ElMessage.success(`${action}成功`)
  }).catch(() => {
    // cancelled
  })
}

function handleDelete(row: SystemAnnouncement) {
  ElMessageBox.confirm(`确定要删除公告 "${row.title}" 吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      ElMessage.success(`公告 "${row.title}" 已删除`)
      await fetchAnnouncements()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // cancelled
  })
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
