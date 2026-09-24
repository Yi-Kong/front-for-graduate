<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Topbar from '@/components/Topbar.vue'

// 认证类页面（login / force-change-pwd）使用全屏 blank 布局，不套应用外壳
const route = useRoute()
const isBlank = computed(() => route.meta.layout === 'blank')
</script>

<template>
  <RouterView v-if="isBlank" />
  <div v-else class="flex min-h-screen bg-gray-50 text-gray-800">
    <!-- 侧边导航（按 role_codes 过滤） -->
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
