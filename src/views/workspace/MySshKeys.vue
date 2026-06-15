<template>
  <div class="page-container">
    <div class="page-header">
      <h2>SSH 密钥</h2>
      <p class="page-desc">管理您的 SSH 公钥，用于免密登录集群节点</p>
    </div>

    <el-card shadow="never" class="data-card">
      <div class="toolbar">
        <el-button type="primary" @click="showAddDialog = true">
          添加SSH密钥
        </el-button>
      </div>

      <el-table :data="keyList" stripe border v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="fingerprint" label="指纹" min-width="220" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="tagType(row.type)" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bits" label="位数" width="80" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="lastUsed" label="最后使用" width="170" />
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="showAddDialog"
      title="添加SSH密钥"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="例如: work-laptop" />
        </el-form-item>
        <el-form-item label="公钥内容" prop="publicKey">
          <el-input
            v-model="formData.publicKey"
            type="textarea"
            :rows="6"
            placeholder="粘贴您的 SSH 公钥内容（通常以 ssh-rsa、ssh-ed25519 等开头）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { SshKey } from '@/types'
import { getSshKeys, createSshKey } from '@/api/modules/workspace'

const keyList = ref<SshKey[]>([])
const loading = ref(false)
const showAddDialog = ref(false)
const submitting = ref(false)

const formRef = ref<FormInstance>()

const formData = reactive({
  name: '',
  publicKey: '',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' },
  ],
  publicKey: [
    { required: true, message: '请输入公钥内容', trigger: 'blur' },
  ],
}

const typeColorMap: Record<string, string> = {
  rsa: 'primary',
  ed25519: 'success',
  ecdsa: 'warning',
}

function tagType(type: string): string {
  return typeColorMap[type] || 'info'
}

onMounted(() => {
  fetchKeys()
})

async function fetchKeys() {
  loading.value = true
  try {
    const res = await getSshKeys()
    keyList.value = res.data
  } catch {
    ElMessage.error('获取SSH密钥列表失败')
  } finally {
    loading.value = false
  }
}

function handleDelete(row: SshKey) {
  ElMessageBox.confirm(`确定要删除密钥 "${row.name}" 吗？删除后将无法使用该密钥登录。`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      ElMessage.success(`密钥 "${row.name}" 已删除`)
      await fetchKeys()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // cancelled
  })
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await createSshKey({
      name: formData.name,
      type: formData.publicKey,
    })
    ElMessage.success('SSH密钥添加成功')
    showAddDialog.value = false
    formRef.value?.resetFields()
    formData.publicKey = ''
    await fetchKeys()
  } catch {
    ElMessage.error('添加SSH密钥失败')
  } finally {
    submitting.value = false
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
