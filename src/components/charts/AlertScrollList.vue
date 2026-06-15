<template>
  <div class="alert-scroll-list" :style="{ maxHeight: maxHeight }">
    <div class="alert-scroll-list__header">
      <span>告警信息</span>
      <el-tag size="small" type="danger">{{ criticalCount }} 严重</el-tag>
    </div>
    <div class="alert-scroll-list__body" ref="scrollRef">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
        :class="{ acknowledged: alert.acknowledged }"
      >
        <div class="alert-item__dot" :class="'alert-item__dot--' + alert.level"></div>
        <div class="alert-item__content">
          <div class="alert-item__message">{{ alert.message }}</div>
          <div class="alert-item__meta">
            <span>{{ alert.source }}</span>
            <span>{{ formatTime(alert.time) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AlertItem } from '@/types'

const props = withDefaults(defineProps<{
  alerts: AlertItem[]
  maxHeight?: string
}>(), {
  maxHeight: '300px',
})

const criticalCount = computed(() => (props.alerts ?? []).filter((a) => a.level === 'critical').length)

function formatTime(time: string): string {
  const d = new Date(time)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped lang="scss">
.alert-scroll-list {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    font-weight: 500;
  }

  &__body {
    max-height: calc(100% - 45px);
    overflow-y: auto;
    padding: 0;
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    border-bottom: 1px solid #fafafa;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.acknowledged {
      opacity: 0.6;
    }

    &__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;

      &--critical { background: #f56c6c; }
      &--warning { background: #e6a23c; }
      &--info { background: #909399; }
    }

    &__content {
      flex: 1;
      min-width: 0;
    }

    &__message {
      font-size: 13px;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #c0c4cc;
      margin-top: 4px;
    }
  }
}
</style>
