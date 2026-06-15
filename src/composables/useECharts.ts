import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

export function useECharts(
  chartRef: Ref<HTMLElement | null>,
  optionsFactory: () => EChartsOption
) {
  const chartInstance = ref<echarts.ECharts | null>(null)

  function initChart() {
    if (!chartRef.value) return
    chartInstance.value = echarts.init(chartRef.value)
    chartInstance.value.setOption(optionsFactory())
  }

  function updateOptions() {
    if (!chartInstance.value) return
    chartInstance.value.setOption(optionsFactory(), true)
  }

  function resize() {
    chartInstance.value?.resize()
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    chartInstance.value?.dispose()
  })

  return {
    chartInstance,
    updateOptions,
    resize,
  }
}
