<template>
  <div class="resource-ring-chart">
    <div ref="chartRef" class="chart-container"></div>
    <div class="chart-center">
      <span class="chart-center__value">{{ percentage }}%</span>
      <span class="chart-center__label">已使用</span>
    </div>
    <div class="chart-footer">
      <span class="chart-footer__title">{{ title }}</span>
      <span class="chart-footer__detail">{{ used }} / {{ total }} {{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useECharts } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

const props = withDefaults(defineProps<{
  title: string
  used: number
  total: number
  unit: string
  color?: string
}>(), {
  color: '#409eff',
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.used / props.total) * 100)
})

const chartRef = ref<HTMLElement | null>(null)

function getOptions(): EChartsOption {
  return {
    series: [
      {
        type: 'pie',
        radius: ['70%', '85%'],
        center: ['50%', '50%'],
        silent: true,
        label: { show: false },
        emphasis: { disabled: true },
        data: [
          { value: props.used, itemStyle: { color: props.color } },
          { value: props.total - props.used, itemStyle: { color: '#e8e8e8' } },
        ],
      },
    ],
  }
}

useECharts(chartRef, getOptions)
</script>

<style scoped lang="scss">
.resource-ring-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;

  .chart-container {
    width: 120px;
    height: 120px;
    position: relative;
  }

  .chart-center {
    position: absolute;
    transform: translateY(55px);
    display: flex;
    flex-direction: column;
    align-items: center;

    &__value {
      font-size: 24px;
      font-weight: 700;
      color: #303133;
      line-height: 1;
    }

    &__label {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  .chart-footer {
    margin-top: 12px;
    text-align: center;

    &__title {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    &__detail {
      display: block;
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style>
