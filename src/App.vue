<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed, ref, provide, watch } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Topbar from '@/components/Topbar.vue'

// 认证类页面（login / force-change-pwd）使用全屏 blank 布局，不套应用外壳
const route = useRoute()
const isBlank = computed(() => route.meta.layout === 'blank')

// 移动端抽屉侧边栏状态（窄屏下侧边栏以抽屉形式呈现，保留导航）
const sidebarOpen = ref(false)
provide('sidebarOpen', sidebarOpen)
provide('toggleSidebar', () => {
  sidebarOpen.value = !sidebarOpen.value
})
provide('closeSidebar', () => {
  sidebarOpen.value = false
})
// 路由切换时收起抽屉（窄屏）
watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)
</script>

<template>
  <RouterView v-if="isBlank" />
  <div v-else class="flex min-h-screen bg-gray-50 text-gray-800">
    <!-- 抽屉遮罩（仅窄屏显示） -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- 侧边导航（按 role_codes 过滤，窄屏为抽屉） -->
    <AppSidebar />

    <!-- 主区：顶栏 + 内容 -->
    <div class="flex min-w-0 flex-1 flex-col">
      <Topbar />
      <main class="flex-1 overflow-auto p-6 md:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
