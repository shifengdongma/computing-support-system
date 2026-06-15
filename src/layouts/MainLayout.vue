<template>
  <div class="main-layout">
    <aside class="main-layout__sidebar" :class="{ collapsed: isCollapsed }">
      <SidebarMenu :collapsed="isCollapsed" />
    </aside>
    <div class="main-layout__main">
      <header class="main-layout__header">
        <HeaderBar :collapsed="isCollapsed" @toggle-collapse="toggleCollapse" />
      </header>
      <main class="main-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import HeaderBar from '@/components/HeaderBar.vue'

const isCollapsed = ref(false)

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  &__sidebar {
    width: 220px;
    transition: width 0.3s ease;
    background: #001529;
    flex-shrink: 0;

    &.collapsed {
      width: 64px;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    height: 60px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f0f2f5;
  }
}
</style>
