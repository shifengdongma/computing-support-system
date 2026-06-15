<template>
  <div class="sidebar-menu">
    <div class="logo-container" :class="{ collapsed }">
      <span class="logo-text" v-if="!collapsed">算力支撑管理系统</span>
      <span class="logo-text-mini" v-else>算力</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :router="true"
      background-color="#001529"
      text-color="#a6adb4"
      active-text-color="#ffffff"
      class="sidebar-menu__el-menu"
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <template v-if="route.children && route.children.length > 0">
          <el-sub-menu :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title || route.name }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children.filter(c => !c.meta?.hidden)"
              :key="child.path"
              :index="resolvePath(route.path, child.path)"
            >
              {{ child.meta?.title || child.name }}
            </el-menu-item>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="route.path">
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>{{ route.meta?.title || route.name }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const props = defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const router = useRouter()

const menuRoutes = computed(() => {
  const rootRoute = router.options.routes.find((r) => r.path === '/')
  if (!rootRoute || !rootRoute.children) return []
  return rootRoute.children.filter(
    (r: any) => r.meta?.title && !r.meta?.hidden
  )
})

const activeMenu = computed(() => route.path)

function resolvePath(parent: string, child: string): string {
  return parent === '/' ? `/${child}` : `${parent}/${child}`
}
</script>

<style scoped lang="scss">
.sidebar-menu {
  height: 100%;
  display: flex;
  flex-direction: column;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #002140;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;

    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }

    .logo-text-mini {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .sidebar-menu__el-menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    :deep(.el-sub-menu .el-menu) {
      background-color: #000c17;
    }

    :deep(.el-menu-item.is-active) {
      color: #ffffff;
      background-color: var(--el-color-primary-light-9) !important;
    }
  }
}
</style>
