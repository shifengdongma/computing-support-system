<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">页面不存在</h1>
      <p class="not-found-desc">您访问的页面不存在或已被移除</p>
      <el-button type="primary" size="large" @click="goHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<style scoped lang="scss">
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f0f2f5;
}

.not-found-content {
  text-align: center;
}

.not-found-code {
  font-size: 120px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
  margin-bottom: 16px;
  text-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.not-found-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.not-found-desc {
  margin: 0 0 32px;
  font-size: 16px;
  color: #909399;
}
</style>
