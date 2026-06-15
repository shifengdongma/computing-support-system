import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getSystemImages, getAiFrameworkImages, getCustomImages } from '@/api/modules/images'
import type { SystemImage, AiFrameworkImage, CustomImage, PageParams } from '@/types'

export const useImagesStore = defineStore('images', () => {
  const systemImages = ref<SystemImage[]>([])
  const systemImagesTotal = ref(0)
  const systemImagesLoading = ref(false)

  const aiFrameworkImages = ref<AiFrameworkImage[]>([])
  const aiFrameworkImagesTotal = ref(0)
  const aiFrameworkImagesLoading = ref(false)

  const customImages = ref<CustomImage[]>([])
  const customImagesTotal = ref(0)
  const customImagesLoading = ref(false)

  async function fetchSystemImages(params: PageParams = { page: 1, pageSize: 10 }) {
    systemImagesLoading.value = true
    try {
      const res = await getSystemImages(params)
      systemImages.value = res.data.list
      systemImagesTotal.value = res.data.total
    } finally {
      systemImagesLoading.value = false
    }
  }

  async function fetchAiFrameworkImages(params: PageParams = { page: 1, pageSize: 10 }) {
    aiFrameworkImagesLoading.value = true
    try {
      const res = await getAiFrameworkImages(params)
      aiFrameworkImages.value = res.data.list
      aiFrameworkImagesTotal.value = res.data.total
    } finally {
      aiFrameworkImagesLoading.value = false
    }
  }

  async function fetchCustomImages(params: PageParams = { page: 1, pageSize: 10 }) {
    customImagesLoading.value = true
    try {
      const res = await getCustomImages(params)
      customImages.value = res.data.list
      customImagesTotal.value = res.data.total
    } finally {
      customImagesLoading.value = false
    }
  }

  return {
    systemImages, systemImagesTotal, systemImagesLoading, fetchSystemImages,
    aiFrameworkImages, aiFrameworkImagesTotal, aiFrameworkImagesLoading, fetchAiFrameworkImages,
    customImages, customImagesTotal, customImagesLoading, fetchCustomImages,
  }
})
