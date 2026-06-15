import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import { getUsers, createUser, updateUser, getQuotas, getPriorityPolicies } from '@/api/modules/users'
import type { User, Quota, PriorityPolicy, PageParams } from '@/types'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const usersTotal = ref(0)
  const usersLoading = ref(false)

  const quotas = ref<Quota[]>([])
  const quotasTotal = ref(0)
  const quotasLoading = ref(false)

  const priorityPolicies = ref<PriorityPolicy[]>([])
  const priorityPoliciesTotal = ref(0)
  const priorityPoliciesLoading = ref(false)

  async function fetchUsers(params: PageParams = { page: 1, pageSize: 10 }) {
    usersLoading.value = true
    try {
      const res = await getUsers(params)
      users.value = res.data.list
      usersTotal.value = res.data.total
    } finally {
      usersLoading.value = false
    }
  }

  async function fetchQuotas(params: PageParams = { page: 1, pageSize: 10 }) {
    quotasLoading.value = true
    try {
      const res = await getQuotas(params)
      quotas.value = res.data.list
      quotasTotal.value = res.data.total
    } finally {
      quotasLoading.value = false
    }
  }

  async function fetchPriorityPolicies(params: PageParams = { page: 1, pageSize: 10 }) {
    priorityPoliciesLoading.value = true
    try {
      const res = await getPriorityPolicies(params)
      priorityPolicies.value = res.data.list
      priorityPoliciesTotal.value = res.data.total
    } finally {
      priorityPoliciesLoading.value = false
    }
  }

  async function doCreateUser(data: Partial<User> & { password?: string }) {
    await createUser(data)
    ElMessage.success('用户创建成功')
  }

  async function doUpdateUser(id: string, data: Partial<User>) {
    await updateUser(id, data)
    ElMessage.success('用户更新成功')
  }

  return {
    users, usersTotal, usersLoading, fetchUsers,
    quotas, quotasTotal, quotasLoading, fetchQuotas,
    priorityPolicies, priorityPoliciesTotal, priorityPoliciesLoading, fetchPriorityPolicies,
    doCreateUser, doUpdateUser,
  }
})
