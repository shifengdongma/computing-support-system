import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getPhysicalNodes,
  getGpuResourcePools,
  getCpuMemoryResources,
  getStorageResources,
  getNetworkResources,
} from '@/api/modules/resources'
import type {
  PhysicalNode,
  GpuResource,
  CpuMemoryResource,
  StorageResource,
  NetworkResource,
  PageParams,
} from '@/types'

export const useResourcesStore = defineStore('resources', () => {
  // Physical Nodes
  const physicalNodes = ref<PhysicalNode[]>([])
  const physicalNodesLoading = ref(false)
  const physicalNodesTotal = ref(0)
  const physicalNodesCurrentPage = ref(1)
  const physicalNodesPageSize = ref(20)

  async function fetchPhysicalNodes(params?: PageParams) {
    physicalNodesLoading.value = true
    try {
      const res = await getPhysicalNodes(params || { page: physicalNodesCurrentPage.value, pageSize: physicalNodesPageSize.value })
      physicalNodes.value = res.data.list
      physicalNodesTotal.value = res.data.total
      physicalNodesCurrentPage.value = res.data.page
      physicalNodesPageSize.value = res.data.pageSize
    } finally {
      physicalNodesLoading.value = false
    }
  }

  // GPU Resources
  const gpuPools = ref<GpuResource[]>([])
  const gpuPoolsLoading = ref(false)
  const gpuPoolsTotal = ref(0)
  const gpuPoolsCurrentPage = ref(1)
  const gpuPoolsPageSize = ref(20)

  async function fetchGpuPools(params?: PageParams) {
    gpuPoolsLoading.value = true
    try {
      const res = await getGpuResourcePools(params || { page: gpuPoolsCurrentPage.value, pageSize: gpuPoolsPageSize.value })
      gpuPools.value = res.data.list
      gpuPoolsTotal.value = res.data.total
      gpuPoolsCurrentPage.value = res.data.page
      gpuPoolsPageSize.value = res.data.pageSize
    } finally {
      gpuPoolsLoading.value = false
    }
  }

  // CPU/Memory Resources
  const cpuMemory = ref<CpuMemoryResource[]>([])
  const cpuMemoryLoading = ref(false)
  const cpuMemoryTotal = ref(0)
  const cpuMemoryCurrentPage = ref(1)
  const cpuMemoryPageSize = ref(20)

  async function fetchCpuMemory(params?: PageParams) {
    cpuMemoryLoading.value = true
    try {
      const res = await getCpuMemoryResources(params || { page: cpuMemoryCurrentPage.value, pageSize: cpuMemoryPageSize.value })
      cpuMemory.value = res.data.list
      cpuMemoryTotal.value = res.data.total
      cpuMemoryCurrentPage.value = res.data.page
      cpuMemoryPageSize.value = res.data.pageSize
    } finally {
      cpuMemoryLoading.value = false
    }
  }

  // Storage Resources
  const storage = ref<StorageResource[]>([])
  const storageLoading = ref(false)
  const storageTotal = ref(0)
  const storageCurrentPage = ref(1)
  const storagePageSize = ref(20)

  async function fetchStorage(params?: PageParams) {
    storageLoading.value = true
    try {
      const res = await getStorageResources(params || { page: storageCurrentPage.value, pageSize: storagePageSize.value })
      storage.value = res.data.list
      storageTotal.value = res.data.total
      storageCurrentPage.value = res.data.page
      storagePageSize.value = res.data.pageSize
    } finally {
      storageLoading.value = false
    }
  }

  // Network Resources
  const network = ref<NetworkResource[]>([])
  const networkLoading = ref(false)
  const networkTotal = ref(0)
  const networkCurrentPage = ref(1)
  const networkPageSize = ref(20)

  async function fetchNetwork(params?: PageParams) {
    networkLoading.value = true
    try {
      const res = await getNetworkResources(params || { page: networkCurrentPage.value, pageSize: networkPageSize.value })
      network.value = res.data.list
      networkTotal.value = res.data.total
      networkCurrentPage.value = res.data.page
      networkPageSize.value = res.data.pageSize
    } finally {
      networkLoading.value = false
    }
  }

  return {
    physicalNodes,
    physicalNodesLoading,
    physicalNodesTotal,
    physicalNodesCurrentPage,
    physicalNodesPageSize,
    fetchPhysicalNodes,
    gpuPools,
    gpuPoolsLoading,
    gpuPoolsTotal,
    gpuPoolsCurrentPage,
    gpuPoolsPageSize,
    fetchGpuPools,
    cpuMemory,
    cpuMemoryLoading,
    cpuMemoryTotal,
    cpuMemoryCurrentPage,
    cpuMemoryPageSize,
    fetchCpuMemory,
    storage,
    storageLoading,
    storageTotal,
    storageCurrentPage,
    storagePageSize,
    fetchStorage,
    network,
    networkLoading,
    networkTotal,
    networkCurrentPage,
    networkPageSize,
    fetchNetwork,
  }
})
