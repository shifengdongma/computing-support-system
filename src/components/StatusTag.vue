<template>
  <el-tag :type="colorType" size="small">{{ label }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  statusMap: Record<string, { label: string; color: string }>
}>()

const current = computed(() => props.statusMap[props.status] || { label: props.status, color: '#909399' })

const label = computed(() => current.value.label)

const colorMap: Record<string, string> = {
  '#67c23a': 'success',
  '#e6a23c': 'warning',
  '#f56c6c': 'danger',
  '#409eff': '',
  '#909399': 'info',
  '#c0c4cc': 'info',
}

const colorType = computed(() => colorMap[current.value.color] || 'info')
</script>
