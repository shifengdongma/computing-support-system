<template>
  <div ref="chartRef" class="job-bar-chart" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useECharts } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(defineProps<{
  data: { date: string; submitted: number; completed: number; failed: number }[]
  height?: string
}>(), {
  height: '300px',
})

const chartRef = ref<HTMLElement | null>(null)

function getOptions(): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['提交', '完成', '失败'],
      bottom: 0,
      textStyle: { color: '#909399' },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: (props.data ?? []).map((d) => d.date.slice(5)),
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#909399', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#909399' },
    },
    series: [
      {
        name: '提交',
        type: 'bar',
        data: (props.data ?? []).map((d) => d.submitted),
        itemStyle: { color: '#409eff', borderRadius: [4, 4, 0, 0] },
        barWidth: 8,
      },
      {
        name: '完成',
        type: 'bar',
        data: (props.data ?? []).map((d) => d.completed),
        itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] },
        barWidth: 8,
      },
      {
        name: '失败',
        type: 'bar',
        data: (props.data ?? []).map((d) => d.failed),
        itemStyle: { color: '#f56c6c', borderRadius: [4, 4, 0, 0] },
        barWidth: 8,
      },
    ],
  }
}

useECharts(chartRef, getOptions)
</script>

<style scoped lang="scss">
.job-bar-chart {
  width: 100%;
}
</style>
