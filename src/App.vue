<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'

// 认证类页面（login / force-change-pwd）使用全屏 blank 布局，不套应用外壳
const route = useRoute()
const isBlank = computed(() => route.meta.layout === 'blank')
</script>

<template>
  <RouterView v-if="isBlank" />
  <div v-else class="flex min-h-screen bg-gray-50 text-gray-800">
    <!-- 侧边导航（抽离为公共组件 AppSidebar） -->
    <AppSidebar />

    <!-- 内容区 -->
    <main class="flex-1 overflow-auto p-8">
      <RouterView />
    </main>
  </div>
</template>
