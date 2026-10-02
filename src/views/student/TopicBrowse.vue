<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { getTopics } from '@/api/topics'
import { getAcademicYears } from '@/api/academic'
import { statusLabel, sourceLabel } from '@/utils/topics'
import TopicTable from '@/components/topics/TopicTable.vue'

const router = useRouter()
const PAGE_SIZE = 10

const page = ref(1)
const filters = ref({ keyword: '', year: '', supervisor: '' })

// 题目列表（服务端分页：page/page_size）
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['topics', 'browse', page],
  queryFn: () => getTopics({ page: page.value, page_size: PAGE_SIZE }),
})
const raw = computed(() =>
  data.value?.results || (Array.isArray(data.value) ? data.value : []),
)
const total = computed(() =>
  typeof data.value?.count === 'number' ? data.value.count : raw.value.length,
)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// 学年 id -> 名称（展示「2026 届」）
const { data: yearsData } = useQuery({
  queryKey: ['academic-years', 'list'],
  queryFn: getAcademicYears,
})
const yearMap = computed(() => {
  const arr = Array.isArray(yearsData.value)
    ? yearsData.value
    : yearsData.value?.results || []
  return Object.fromEntries(arr.map((y) => [y.id, y.name]))
})

// 客户端筛选（后端筛选参数待确认，先对当前页结果过滤；见设计稿 §8 缺口1）
const rows = computed(() =>
  raw.value
    .filter((t) => {
      const f = filters.value
      if (f.keyword && !t.title.includes(f.keyword)) return false
      if (f.year && String(t.academic_year) !== String(f.year)) return false
      if (f.supervisor && !String(t.supervisor).includes(f.supervisor)) return false
      return true
    })
    .map((t) => ({ ...t, yearName: yearMap.value[t.academic_year] || `届次#${t.academic_year}` })),
)

function onQuery() {
  page.value = 1
}
function onReset() {
  filters.value = { keyword: '', year: '', supervisor: '' }
  page.value = 1
}
function prevPage() {
  if (page.value > 1) page.value -= 1
}
function nextPage() {
  if (page.value < totalPages.value) page.value += 1
}

// 详情抽屉
const drawerOpen = ref(false)
const current = ref(null)
function openDetail(t) {
  current.value = t
  drawerOpen.value = true
}
function goSelect() {
  drawerOpen.value = false
  router.push({ name: 'my-selection' })
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">题目浏览</h1>
        <p class="mt-1.5 max-w-[760px] text-[13.5px] leading-[1.6] text-gray-500">
          浏览本届已发布的毕业设计题目。可按关键词、学年、指导教师筛选；点击题目查看详细描述，确认心仪题目后前往「我的选题」完成选择。
        </p>
      </div>
    </div>

    <!-- 筛选条 -->
    <div class="mb-4 flex flex-wrap items-end gap-3.5 rounded-2xl border border-gray-200 bg-white p-4">
      <div class="flex min-w-[180px] flex-1 flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-700">关键词</label>
        <input
          v-model="filters.keyword"
          class="h-10 rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
          placeholder="按题目名称搜索"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-700">所属学年</label>
        <select
          v-model="filters.year"
          class="h-10 rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
        >
          <option value="">全部学年</option>
          <option v-for="y in Object.entries(yearMap)" :key="y[0]" :value="y[0]">{{ y[1] }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-700">指导教师</label>
        <input
          v-model="filters.supervisor"
          class="h-10 rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
          placeholder="输入教师姓名/工号"
        />
      </div>
      <div class="ml-auto flex gap-2.5">
        <button
          class="inline-flex h-10 items-center rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
          @click="onReset"
        >
          重置
        </button>
        <button
          class="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px"
          @click="onQuery"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.2-3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          查询
        </button>
      </div>
    </div>

    <!-- 加载 / 错误 / 空态 -->
    <div v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">
      加载中…
    </div>
    <div v-else-if="isError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">
      加载失败：{{ error?.message }}
    </div>
    <div v-else-if="!rows.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
      <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </div>
      <h3 class="text-[16px] font-bold text-gray-900">暂无可选题目</h3>
      <p class="mx-auto mt-1.5 max-w-[360px] text-[13.5px] leading-[1.6] text-gray-500">
        当前届次尚未发布任何题目，或选题轮次尚未开放。请关注「工作台」的阶段提醒，发布后会出现在这里。
      </p>
    </div>

    <!-- 列表 + 分页 -->
    <div v-else>
      <TopicTable :topics="rows" @view="openDetail" />

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="text-[13px] text-gray-500">
          共 <b class="text-gray-900">{{ total }}</b> 条 · 第 <b class="text-gray-900">{{ page }}</b> / {{ totalPages }} 页
        </div>
        <div class="flex gap-1.5">
          <button class="pg" :disabled="page <= 1" @click="prevPage">上一页</button>
          <button class="pg" :disabled="page >= totalPages" @click="nextPage">下一页</button>
        </div>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <div v-if="drawerOpen" class="fixed inset-0 z-50 bg-black/40" @click="drawerOpen = false" />
    <Transition name="drawer">
      <aside
        v-if="drawerOpen && current"
        class="drawer fixed right-0 top-0 z-[55] flex h-full w-[460px] max-w-[calc(100vw-32px)] flex-col bg-white shadow-2xl"
      >
        <div class="flex items-start justify-between gap-3 border-b border-gray-200 p-5">
          <div>
            <h3 class="text-[18px] font-bold leading-[1.45] text-gray-900">{{ current.title }}</h3>
            <div class="mt-1.5 text-[12.5px] text-gray-400">
              {{ sourceLabel(current.topic_source) }} · {{ current.yearName || `届次#${current.academic_year}` }}
            </div>
          </div>
          <button
            class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-gray-200"
            @click="drawerOpen = false"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <div class="kv"><div class="k">题目来源</div><div class="v">{{ sourceLabel(current.topic_source) }}</div></div>
          <div class="kv"><div class="k">指导教师</div><div class="v">{{ current.supervisor != null ? `教师 #${current.supervisor}` : '—' }}</div></div>
          <div class="kv"><div class="k">申报人</div><div class="v">{{ current.proposer != null ? `教师 #${current.proposer}` : '—' }}</div></div>
          <div class="kv"><div class="k">所属学年</div><div class="v">{{ current.yearName || `届次#${current.academic_year}` }}</div></div>
          <div class="kv"><div class="k">状态</div><div class="v">{{ statusLabel(current.status) }}</div></div>
          <div class="kv" style="flex-direction: column; align-items: stretch">
            <div class="k" style="width: auto; margin-bottom: 4px">题目描述</div>
            <div class="rounded-[10px] border border-gray-200 bg-gray-50 p-3.5 text-[14px] leading-[1.75] text-gray-700">
              {{ current.description || '暂无描述' }}
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 p-5">
          <button
            class="inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px"
            @click="goSelect"
          >
            前往「我的选题」选择此题
          </button>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.pg {
  min-width: 34px;
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.pg:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
}
.pg:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.kv {
  display: flex;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid #f3f4f6;
}
.kv:last-child {
  border-bottom: none;
}
.kv .k {
  width: 84px;
  flex: none;
  font-size: 13px;
  font-weight: 600;
  color: #9ca3af;
}
.kv .v {
  flex: 1;
  font-size: 14px;
  color: #374151;
}
.drawer {
  transition: transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
