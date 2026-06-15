import request from '../request'
import type { PhysicalNode, GpuResource, CpuMemoryResource, StorageResource, NetworkResource, PaginatedData, PageParams } from '@/types'
import { getMockPhysicalNodes, getMockGpuPools, getMockCpuMemory, getMockStorage, getMockNetwork } from '@/mock/modules/resources'

export function getPhysicalNodes(params: PageParams): Promise<{ data: PaginatedData<PhysicalNode> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockPhysicalNodes(params) })
  }
  return request.get('/resources/nodes', { params })
}

export function getGpuResourcePools(params: PageParams): Promise<{ data: PaginatedData<GpuResource> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockGpuPools(params) })
  }
  return request.get('/resources/gpu', { params })
}

export function getCpuMemoryResources(params: PageParams): Promise<{ data: PaginatedData<CpuMemoryResource> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockCpuMemory(params) })
  }
  return request.get('/resources/cpu-memory', { params })
}

export function getStorageResources(params: PageParams): Promise<{ data: PaginatedData<StorageResource> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockStorage(params) })
  }
  return request.get('/resources/storage', { params })
}

export function getNetworkResources(params: PageParams): Promise<{ data: PaginatedData<NetworkResource> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockNetwork(params) })
  }
  return request.get('/resources/network', { params })
}
