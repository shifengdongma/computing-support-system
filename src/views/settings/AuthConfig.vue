<template>
  <div class="page-container">
    <div class="page-header">
      <h2>认证配置</h2>
      <p class="page-desc">管理系统身份认证方式，支持 LDAP、OAuth2、SAML 和本地认证</p>
    </div>

    <el-card shadow="never" class="data-card">
      <div class="toolbar">
        <el-button type="primary" @click="openAddDialog">
          添加认证配置
        </el-button>
      </div>

      <el-table :data="configList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="140" />
        <el-table-column label="类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small" effect="plain">
              {{ typeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="server" label="服务器" min-width="180" show-overflow-tooltip />
        <el-table-column prop="port" label="端口" width="80" align="center" />
        <el-table-column prop="baseDn" label="BaseDN" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enabled"
              :loading="row._switchLoading"
              @change="(val: boolean) => handleToggleEnabled(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="isEditing ? '编辑认证配置' : '添加认证配置'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="LDAP" value="ldap" />
            <el-option label="OAuth2" value="oauth2" />
            <el-option label="SAML" value="saml" />
            <el-option label="本地认证" value="local" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入配置名称" />
        </el-form-item>
        <el-form-item label="服务器" prop="server">
          <el-input v-model="formData.server" placeholder="请输入服务器地址" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input-number v-model="formData.port" :min="1" :max="65535" style="width: 100%" />
        </el-form-item>
        <el-form-item label="BaseDN" prop="baseDn">
          <el-input v-model="formData.baseDn" placeholder="例如: dc=example,dc=com" />
        </el-form-item>
        <el-form-item label="BindDN" prop="bindDn">
          <el-input v-model="formData.bindDn" placeholder="例如: cn=admin,dc=example,dc=com" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { AuthConfig } from '@/types'
import { getAuthConfigs } from '@/api/modules/settings'

const configList = ref<(AuthConfig & { _switchLoading?: boolean })[]>([])
const loading = ref(false)
const showDialog = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const editingId = ref('')

const formRef = ref<FormInstance>()

const initFormData = () => ({
  type: 'ldap' as AuthConfig['type'],
  name: '',
  server: '',
  port: 389,
  baseDn: '',
  bindDn: '',
  enabled: true,
})

const formData = reactive(initFormData())

const formRules: FormRules = {
  type: [
    { required: true, message: '请选择认证类型', trigger: 'change' },
  ],
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
  ],
  server: [
    { required: true, message: '请输入服务器地址', trigger: 'blur' },
  ],
  port: [
    { required: true, message: '请输入端口号', trigger: 'blur' },
  ],
}

const typeLabelMap: Record<string, string> = {
  ldap: 'LDAP',
  oauth2: 'OAuth2',
  saml: 'SAML',
  local: '本地认证',
}

const typeTagMap: Record<string, string> = {
  ldap: 'primary',
  oauth2: 'success',
  saml: 'warning',
  local: 'info',
}

function typeLabel(type: string): string {
  return typeLabelMap[type] || type
}

function typeTag(type: string): string {
  return typeTagMap[type] || 'info'
}

onMounted(() => {
  fetchConfigs()
})

async function fetchConfigs() {
  loading.value = true
  try {
    const res = await getAuthConfigs()
    configList.value = res.data
  } catch {
    ElMessage.error('获取认证配置列表失败')
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

function openEditDialog(row: AuthConfig) {
  isEditing.value = true
  editingId.value = row.id
  formData.type = row.type
  formData.name = row.name
  formData.server = row.server
  formData.port = row.port
  formData.baseDn = row.baseDn
  formData.bindDn = row.bindDn
  formData.enabled = row.enabled
  showDialog.value = true
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    ElMessage.success(isEditing.value ? '认证配置已更新' : '认证配置已添加')
    showDialog.value = false
    formRef.value?.resetFields()
    await fetchConfigs()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

function handleToggleEnabled(row: AuthConfig & { _switchLoading?: boolean }, val: boolean) {
  row._switchLoading = true
  setTimeout(() => {
    row.enabled = val
    row._switchLoading = false
    ElMessage.success(val ? '已启用' : '已禁用')
  }, 300)
}

function handleDelete(row: AuthConfig) {
  ElMessageBox.confirm(`确定要删除认证配置 "${row.name}" 吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      ElMessage.success(`认证配置 "${row.name}" 已删除`)
      await fetchConfigs()
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
</style>
