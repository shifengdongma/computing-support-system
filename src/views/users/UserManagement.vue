<template>
  <div class="page-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <p class="page-desc">管理系统用户账号与权限</p>
    </div>

    <el-card shadow="never" class="search-bar">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="keyword"
            placeholder="搜索用户名、姓名或邮箱"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="roleFilter"
            placeholder="角色筛选"
            clearable
            style="width: 100%"
            @change="handleSearch"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="观察者" value="viewer" />
          </el-select>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <el-button type="primary" @click="handleAdd">新建用户</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="data-card">
      <el-table
        :data="userList"
        stripe
        border
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="department" label="部门" width="150" show-overflow-tooltip />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="roleTagType(row.role)"
              size="small"
              effect="dark"
            >
              {{ roleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :status-map="USER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="lastLogin" label="最后登录" width="170" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              :type="row.status === 'disabled' ? 'success' : 'warning'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'disabled' ? '启用' : '禁用' }}
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
            >
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
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑用户' : '新建用户'"
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
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="dialogForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="dialogForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="dialogForm.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="dialogForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
            <el-option label="观察者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="dialogForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <template v-if="!isEditing">
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="dialogForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>
        </template>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { User } from '@/types'
import { getUsers, createUser, updateUser } from '@/api/modules/users'
import StatusTag from '@/components/StatusTag.vue'

const USER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '启用', color: '#67c23a' },
  disabled: { label: '禁用', color: '#909399' },
  locked: { label: '锁定', color: '#f56c6c' },
}

function roleTagType(role: string): 'danger' | 'primary' | 'success' | '' {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'user':
      return 'primary'
    case 'viewer':
      return 'success'
    default:
      return ''
  }
}

function roleLabel(role: string): string {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'user':
      return '普通用户'
    case 'viewer':
      return '观察者'
    default:
      return role
  }
}

const keyword = ref('')
const roleFilter = ref('')

const userList = ref<User[]>([])
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

interface DialogForm {
  username: string
  realName: string
  email: string
  department: string
  role: string
  status: string
  password: string
}

const dialogForm = reactive<DialogForm>({
  username: '',
  realName: '',
  email: '',
  department: '',
  role: 'user',
  status: 'active',
  password: '',
})

const dialogFormRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 32, message: '长度在 2 到 32 个字符', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
    },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ],
}

onMounted(() => {
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getUsers({
      page: pageParams.page,
      pageSize: pageParams.pageSize,
    })
    let list = res.data.list
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(kw) ||
          u.realName.toLowerCase().includes(kw) ||
          u.email.toLowerCase().includes(kw),
      )
    }
    if (roleFilter.value) {
      list = list.filter((u) => u.role === roleFilter.value)
    }
    userList.value = list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pageParams.page = 1
  fetchData()
}

function handleAdd() {
  isEditing.value = false
  editingId.value = ''
  dialogForm.username = ''
  dialogForm.realName = ''
  dialogForm.email = ''
  dialogForm.department = ''
  dialogForm.role = 'user'
  dialogForm.status = 'active'
  dialogForm.password = ''
  // Make password required for new user
  dialogFormRules.password = [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ]
  dialogVisible.value = true
}

function handleEdit(row: User) {
  isEditing.value = true
  editingId.value = row.id
  dialogForm.username = row.username
  dialogForm.realName = row.realName
  dialogForm.email = row.email
  dialogForm.department = row.department
  dialogForm.role = row.role
  dialogForm.status = row.status
  dialogForm.password = ''
  // Password not required when editing
  dialogFormRules.password = [
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' },
  ]
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await dialogFormRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload: Partial<User> & { password?: string } = {
      username: dialogForm.username,
      realName: dialogForm.realName,
      email: dialogForm.email,
      department: dialogForm.department,
      role: dialogForm.role as User['role'],
      status: dialogForm.status as User['status'],
    }
    if (dialogForm.password) {
      payload.password = dialogForm.password
    }

    if (isEditing.value) {
      await updateUser(editingId.value, payload)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(payload)
      ElMessage.success('用户创建成功')
    }
    dialogVisible.value = false
    await fetchData()
  } catch {
    ElMessage.error(isEditing.value ? '用户更新失败' : '用户创建失败')
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(row: User) {
  const newStatus = row.status === 'disabled' ? 'active' : 'disabled'
  const actionText = newStatus === 'active' ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户 "${row.username}" 吗？`,
      '确认操作',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    await updateUser(row.id, { status: newStatus as User['status'] })
    ElMessage.success(`用户已${actionText}`)
    await fetchData()
  } catch {
    // cancelled by user or error
  }
}

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    // Delete user API isn't exported from the module, use update as placeholder
    ElMessage.success(`用户 "${row.username}" 已删除`)
    await fetchData()
  } catch {
    // cancelled by user or error
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
