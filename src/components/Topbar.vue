<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { getOverview } from '@/api/home'

const route = useRoute()
const toggleSidebar = inject('toggleSidebar')

// 与工作台共用 overview 缓存（同 queryKey），仅取当前届次用于顶部徽标
const { data: overview } = useQuery({
  queryKey: ['home', 'overview'],
  queryFn: getOverview,
})

const currentYear = computed(() => overview.value?.academic_year || '')
const title = computed(() => route.meta.title || '工作台')
</script>

<template>
  <header class="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
    <div class="flex items-center gap-2.5">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 md:hidden"
        @click="toggleSidebar"
        aria-label="打开菜单"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
      <div class="text-[13px] text-gray-500">
        毕业设计综合管理系统 / <b class="font-semibold text-gray-900">{{ title }}</b>
      </div>
    </div>
    <span
      v-if="currentYear"
      class="inline-flex items-center gap-1.5 rounded-full border border-[#f6d3d7] bg-[#fdecee] px-3 py-1 text-[13px] font-semibold text-[#8F1822]"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-[#C0202E]"></span>
      当前届次：{{ currentYear }}
    </span>
  </header>
</template>
