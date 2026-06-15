<template>
  <div class="dashboard page-container">
    <!-- Summary cards row -->
    <el-row :gutter="16" class="summary-row" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__content">
            <div class="summary-card__label">集群利用率</div>
            <div class="summary-card__value">{{ clusterUtilization }}%</div>
            <div class="summary-card__trend" v-if="data?.resources">
              <span :class="data.resources.cpu.trend >= 0 ? 'trend-up' : 'trend-down'">
                {{ Math.abs(data.resources.cpu.trend) }}%
              </span>
              <span class="summary-card__trend-label">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__content">
            <div class="summary-card__label">在线节点</div>
            <div class="summary-card__value">{{ onlineNodes }} / {{ totalNodes }}</div>
            <div class="summary-card__sub">节点总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__content">
            <div class="summary-card__label">运行作业</div>
            <div class="summary-card__value summary-card__value--success">{{ jobStats?.running ?? 0 }}</div>
            <div class="summary-card__sub">当前运行中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__content">
            <div class="summary-card__label">排队作业</div>
            <div class="summary-card__value summary-card__value--warning">{{ jobStats?.queued ?? 0 }}</div>
            <div class="summary-card__sub">等待中</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Resource rings row -->
    <el-row :gutter="16" class="chart-row" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="never" class="data-card">
          <ResourceRingChart
            title="CPU"
            :used="data?.resources?.cpu?.used ?? 0"
            :total="data?.resources?.cpu?.total ?? 0"
            :unit="data?.resources?.cpu?.unit ?? ''"
            color="#409eff"
          />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="data-card">
          <ResourceRingChart
            title="GPU"
            :used="data?.resources?.gpu?.used ?? 0"
            :total="data?.resources?.gpu?.total ?? 0"
            :unit="data?.resources?.gpu?.unit ?? ''"
            color="#67c23a"
          />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="data-card">
          <ResourceRingChart
            title="内存"
            :used="data?.resources?.memory?.used ?? 0"
            :total="data?.resources?.memory?.total ?? 0"
            :unit="data?.resources?.memory?.unit ?? ''"
            color="#e6a23c"
          />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="data-card">
          <ResourceRingChart
            title="存储"
            :used="data?.resources?.storage?.used ?? 0"
            :total="data?.resources?.storage?.total ?? 0"
            :unit="data?.resources?.storage?.unit ?? ''"
            color="#f56c6c"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Job trends + Alert list row -->
    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="never" class="data-card">
          <template #header>
            <div class="data-card__header">
              <span class="data-card__header-title">作业趋势</span>
            </div>
          </template>
          <JobBarChart :data="jobTrends" height="300px" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="data-card">
          <AlertScrollList :alerts="alerts" max-height="380px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/modules/dashboard'
import ResourceRingChart from '@/components/charts/ResourceRingChart.vue'
import JobBarChart from '@/components/charts/JobBarChart.vue'
import AlertScrollList from '@/components/charts/AlertScrollList.vue'

const dashboardStore = useDashboardStore()
const { data, loading } = storeToRefs(dashboardStore)
const resources = computed(() => data.value?.resources)
const jobStats = computed(() => data.value?.jobStats)
const jobTrends = computed(() => data.value?.jobTrends ?? [])
const alerts = computed(() => data.value?.alerts ?? [])
const clusterUtilization = computed(() => data.value?.clusterUtilization ?? 0)
const onlineNodes = computed(() => data.value?.onlineNodes ?? 0)
const totalNodes = computed(() => data.value?.totalNodes ?? 0)

onMounted(() => {
  dashboardStore.fetchData()
})
</script>

<style scoped lang="scss">
.dashboard {
  .summary-row {
    .summary-card {
      border-radius: 8px;

      &__content {
        padding: 4px 0;
      }

      &__label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      &__value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        line-height: 1.2;

        &--success {
          color: #67c23a;
        }

        &--warning {
          color: #e6a23c;
        }
      }

      &__trend {
        margin-top: 8px;
        font-size: 12px;
      }

      &__trend-label {
        color: #909399;
        margin-left: 4px;
      }

      &__sub {
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
      }
    }
  }

  .chart-row {
    .el-card {
      border-radius: 8px;
    }
  }
}
</style>
