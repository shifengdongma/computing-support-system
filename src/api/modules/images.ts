import request from '../request'
import type { SystemImage, AiFrameworkImage, CustomImage, PaginatedData, PageParams } from '@/types'
import { getMockSystemImages, getMockAiFrameworkImages, getMockCustomImages } from '@/mock/modules/images'

export function getSystemImages(params: PageParams): Promise<{ data: PaginatedData<SystemImage> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockSystemImages(params) })
  }
  return request.get('/images/system', { params })
}

export function getAiFrameworkImages(params: PageParams): Promise<{ data: PaginatedData<AiFrameworkImage> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockAiFrameworkImages(params) })
  }
  return request.get('/images/ai-framework', { params })
}

export function getCustomImages(params: PageParams): Promise<{ data: PaginatedData<CustomImage> }> {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return Promise.resolve({ data: getMockCustomImages(params) })
  }
  return request.get('/images/custom', { params })
}
