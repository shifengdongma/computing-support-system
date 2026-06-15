<template>
  <div class="page-container">
    <div class="page-header">
      <h2>实时监控</h2>
      <p class="page-desc">查看集群节点的实时性能指标数据</p>
    </div>

    <!-- Summary Cards -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="4" v-for="card in summaryCards" :key="card.label">
        <el-card shadow="never" class="data-card">
          <div class="card-value">{{ card.value }}</div>
          <div class="card-label">{{ card.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Node Selector -->
    <el-card shadow="never" class="section-card">
      <div class="section-header">
        <span class="section-title">节点选择</span>
      </div>
      <el-select
        v-model="selectedNodeId"
        placeholder="请选择要监控的节点"
        style="width: 320px"
        @change="handleNodeChange"
      >
        <el-option
          v-for="node in nodeOptions"
          :key="node.value"
          :label="node.label"
          :value="node.value"
        />
      </el-select>
    </el-card>

    <!-- Metrics Charts -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>CPU使用率趋势图</span>
          </template>
          <div ref="cpuChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>内存使用率趋势图</span>
          </template>
          <div ref="memoryChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span>GPU使用率趋势图</span>
          </template>
          <div ref="gpuChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Real-time Gauges -->
    <el-card shadow="never" class="section-card">
      <template #header>
        <span>实时数据</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="gauge-item">
            <div class="gauge-label">磁盘IO</div>
            <div class="gauge-value">{{ metrics?.diskIO ?? '--' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="gauge-item">
            <div class="gauge-label">网络IO</div>
            <div class="gauge-value">{{ metrics?.networkIO ?? '--' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="gauge-item">
            <div class="gauge-label">温度</div>
            <div class="gauge-value">{{ metrics ? metrics.temperature + ' °C' : '--' }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="gauge-item">
            <div class="gauge-label">功耗</div>
            <div class="gauge-value">{{ metrics?.powerUsage ?? '--' }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { getNodeMetrics } from '@/api/modules/monitor'
import type { NodeMetrics } from '@/types'
import { useECharts } from '@/composables/useECharts'
import type { EChartsOption } from 'echarts'

const selectedNodeId = ref('node-1')
const timeRange = ref('1h')

const nodeOptions = [
  { label: '计算节点-01', value: 'node-1' },
  { label: '计算节点-02', value: 'node-2' },
  { label: '计算节点-03', value: 'node-3' },
  { label: 'GPU节点-01', value: 'node-4' },
  { label: 'GPU节点-02', value: 'node-5' },
]

const metrics = ref<NodeMetrics | null>(null)

const cpuChartRef = ref<HTMLElement | null>(null)
const memoryChartRef = ref<HTMLElement | null>(null)
const gpuChartRef = ref<HTMLElement | null>(null)

function buildCpuOptions(): EChartsOption {
  const data = metrics.value?.cpuUsage ?? []
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map((p) => p.time), axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{ type: 'line', data: data.map((p) => p.value), smooth: true, lineStyle: { color: '#409eff' }, itemStyle: { color: '#409eff' } }],
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
  }
}

function buildMemoryOptions(): EChartsOption {
  const data = metrics.value?.memoryUsage ?? []
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map((p) => p.time), axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{ type: 'line', data: data.map((p) => p.value), smooth: true, lineStyle: { color: '#67c23a' }, itemStyle: { color: '#67c23a' } }],
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
  }
}

function buildGpuOptions(): EChartsOption {
  const data = metrics.value?.gpuUsage ?? []
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map((p) => p.time), axisLabel: { rotate: 45 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
    series: [{ type: 'line', data: data.map((p) => p.value), smooth: true, lineStyle: { color: '#e6a23c' }, itemStyle: { color: '#e6a23c' } }],
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
  }
}

const { updateOptions: updateCpu } = useECharts(cpuChartRef, buildCpuOptions)
const { updateOptions: updateMemory } = useECharts(memoryChartRef, buildMemoryOptions)
const { updateOptions: updateGpu } = useECharts(gpuChartRef, buildGpuOptions)

const summaryCards = computed(() => [
  { label: '节点总数', value: nodeOptions.length },
  { label: '平均CPU使用率', value: metrics.value ? calcAvg(metrics.value.cpuUsage) + '%' : '--' },
  { label: '平均内存使用率', value: metrics.value ? calcAvg(metrics.value.memoryUsage) + '%' : '--' },
  { label: '平均GPU使用率', value: metrics.value ? calcAvg(metrics.value.gpuUsage) + '%' : '--' },
  { label: '告警数量', value: 0 },
])

function calcAvg(points: { value: number }[]): number {
  if (!points.length) return 0
  const sum = points.reduce((s, p) => s + p.value, 0)
  return Math.round((sum / points.length) * 100) / 100
}

async function fetchMetrics() {
  try {
    const res = await getNodeMetrics(selectedNodeId.value, timeRange.value)
    metrics.value = res.data
    await nextTick()
    updateCpu()
    updateMemory()
    updateGpu()
  } catch {
    // silently fail
  }
}

function handleNodeChange() {
  fetchMetrics()
}

onMounted(() => {
  fetchMetrics()
})
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

.summary-cards {
  margin-bottom: 20px;
}

.data-card {
  text-align: center;

  .card-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }

  .card-label {
    font-size: 13px;
    color: #909399;
    margin-top: 4px;
  }
}

.section-card {
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 280px;
}

.gauge-item {
  text-align: center;
  padding: 20px 0;

  .gauge-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .gauge-value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
