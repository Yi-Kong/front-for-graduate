<script setup>
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getOverview } from '@/api/home'

const { data: overview, isLoading, isError, error } = useQuery({
  queryKey: ['home', 'overview'],
  queryFn: getOverview,
})

const yearName = computed(() => overview.value?.academic_year?.name || '—')
const stageName = computed(() => overview.value?.stage?.name || '—')
const stageDeadline = computed(() => {
  const d = overview.value?.stage?.deadline
  if (!d) return ''
  return String(d).replace('T', ' ').slice(0, 16)
})
const timeline = computed(() => overview.value?.timeline || [])
const todosCount = computed(() => overview.value?.todos?.count ?? 0)

const STAGE_LABEL = { done: '已结束', live: '进行中', wait: '未开始' }
const STAGE_PILL = {
  done: 'bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]',
  live: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
  wait: 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]',
}
</script>

<template>
  <div>
    <div class="mb-5">
      <h1 class="text-[24px] font-bold tracking-[0.5px]">工作台</h1>
      <p class="mt-1.5 text-[13.5px] text-gray-500">当前学年毕业设计全流程概览，按您的角色展示待办与阶段进度。</p>
    </div>

    <p v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-[14px] text-gray-500">加载中…</p>
    <p v-else-if="isError" class="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-[14px] text-red-600">
      概览数据加载失败：{{ error?.message || '未知错误' }}
    </p>

    <template v-else>
      <!-- 概览卡片 -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex items-center gap-1.5 text-[12.5px] text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#C0202E]"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.7"/></svg>
            当前届次
          </div>
          <div class="mt-3 text-[26px] font-bold tracking-[0.5px]">{{ yearName }}</div>
          <div class="mt-1.5 text-[12.5px] text-gray-400">状态：已激活 · 全局数据以此过滤</div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex items-center gap-1.5 text-[12.5px] text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#C0202E]"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
            当前阶段
          </div>
          <div class="mt-3 text-[18px] font-bold">{{ stageName }}</div>
          <div class="mt-1.5 text-[12.5px] text-gray-400">截止：{{ stageDeadline || '—' }}</div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5">
          <div class="flex items-center gap-1.5 text-[12.5px] text-gray-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#C0202E]"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 21l-5 2.2 1-5.5-4-3.9 5.5-.8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
            我的待办
          </div>
          <div class="mt-3 text-[26px] font-bold tracking-[0.5px]">{{ todosCount }}</div>
          <div class="mt-1.5 text-[12.5px] text-gray-400">暂无待处理事项</div>
        </div>
      </div>

      <!-- 流程阶段时间轴 -->
      <div class="mt-6">
        <div class="mb-3.5 flex items-center gap-2 text-[15px] font-bold">
          <span class="h-4 w-1 rounded bg-[#C0202E]"></span> 流程阶段时间轴
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-6">
          <div class="relative pl-[22px]">
            <div class="absolute bottom-1.5 left-[6px] top-1.5 w-0.5 bg-gray-200"></div>
            <div v-for="(s, i) in timeline" :key="i" class="relative pb-[18px] last:pb-0">
              <span
                class="absolute -left-[22px] top-[3px] h-3.5 w-3.5 rounded-full border-[3px] border-[#C0202E] bg-white"
                :class="{
                  'border-[#C0202E] bg-[#C0202E] shadow-[0_0_0_4px_#fdecee]': s.status === 'live',
                  'border-[#f59e0b] bg-white': s.status === 'wait',
                  'border-[#6366f1] bg-[#6366f1]': s.status === 'done',
                }"
              ></span>
              <div class="text-[14px] font-semibold">
                {{ s.name }}
                <span
                  class="ml-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-semibold"
                  :class="STAGE_PILL[s.status]"
                >{{ STAGE_LABEL[s.status] }}</span>
              </div>
              <div class="mt-1 text-[12.5px] text-gray-400">{{ s.start }} ~ {{ s.end }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 按角色待办（空态） -->
      <div class="mt-6">
        <div class="mb-3.5 flex items-center gap-2 text-[15px] font-bold">
          <span class="h-4 w-1 rounded bg-[#C0202E]"></span> 按角色待办
        </div>
        <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" class="mx-auto mb-2.5 text-gray-300"><path d="M5 5h14v14H5z" stroke="currentColor" stroke-width="1.7"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          <div class="text-[14px] font-semibold text-gray-600">暂无待办事项</div>
          <div class="mt-1.5 text-[12.5px] text-gray-400">当前账号在本届次下没有需要处理的任务。</div>
        </div>
      </div>

      <div class="mt-5 flex gap-2.5 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] p-3 text-[12.5px] leading-[1.65] text-[#92400e]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="mt-[1px] flex-none"><circle cx="12" cy="12" r="9" stroke="#d97706" stroke-width="1.7"/><path d="M12 7v6M12 16.5v.5" stroke="#d97706" stroke-width="1.7" stroke-linecap="round"/></svg>
        <span><b>后端已知限制：</b>① <code>/api/home/overview/</code> 的 <code>todos</code> 固定 <code>{count:0}</code> → 待办区展示空态；② <code>AcademicStageConfig</code> 暂无 CRUD 接口，时间轴以后端补齐配置后才有真实数据，本页以「代表性阶段」示意。</span>
      </div>
    </template>
  </div>
</template>
