<script setup>
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { getTopics } from '@/api/topics'
import { getAcademicYears } from '@/api/academic'
import { statusLabel, sourceLabel } from '@/utils/topics'
import TopicTable from '@/components/topics/TopicTable.vue'
import TopicReviewDrawer from '@/components/topics/TopicReviewDrawer.vue'

const PAGE_SIZE = 20
const qc = useQueryClient()

// 状态分段：默认「待审核」
const STATUS_TABS = [
  { value: 'PENDING_REVIEW', label: '待审核' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'REJECTED', label: '退回修改' },
  { value: 'ALL', label: '全部' },
]
const statusTab = ref('PENDING_REVIEW')
const page = ref(1)
const filters = ref({ keyword: '', year: '' })

// 题目列表（服务端分页：page/page_size；可选 status 过滤）
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['topics', 'review', statusTab, page],
  queryFn: () =>
    getTopics({
      page: page.value,
      page_size: PAGE_SIZE,
      ...(statusTab.value !== 'ALL' ? { status: statusTab.value } : {}),
    }),
})
const raw = computed(() =>
  data.value?.results || (Array.isArray(data.value) ? data.value : []),
)
const total = computed(() =>
  typeof data.value?.count === 'number' ? data.value.count : raw.value.length,
)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// 学年 id -> 名称
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

// 客户端补充筛选（关键词 / 学年）；状态已由服务端过滤
const rows = computed(() =>
  raw.value
    .filter((t) => {
      const f = filters.value
      if (f.keyword && !t.title.includes(f.keyword)) return false
      if (f.year && String(t.academic_year) !== String(f.year)) return false
      return true
    })
    .map((t) => ({ ...t, yearName: yearMap.value[t.academic_year] || `届次#${t.academic_year}` })),
)

function onChangeStatus() {
  page.value = 1
}
function onQuery() {
  page.value = 1
}
function onReset() {
  filters.value = { keyword: '', year: '' }
  page.value = 1
}
function prevPage() {
  if (page.value > 1) page.value -= 1
}
function nextPage() {
  if (page.value < totalPages.value) page.value += 1
}

// 审核抽屉
const drawerOpen = ref(false)
const current = ref(null)
function openReview(t) {
  current.value = t
  drawerOpen.value = true
}
function refresh() {
  qc.invalidateQueries({ queryKey: ['topics', 'review'] })
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="mb-5">
      <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">题目审核</h1>
      <p class="mt-1.5 max-w-[780px] text-[13.5px] leading-[1.6] text-gray-500">
        审核教师提交的毕业设计题目。待审核题目需确认内容合规、与既有题目无重复后，执行「审核通过」发布，或「退回修改」并填写意见。仅管理员可执行审核操作。
      </p>
    </div>

    <!-- 状态分段 + 筛选 -->
    <div class="mb-4 flex flex-wrap items-end gap-3.5 rounded-2xl border border-gray-200 bg-white p-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-700">状态</label>
        <div class="inline-flex rounded-[10px] bg-gray-100 p-1">
          <button
            v-for="tab in STATUS_TABS"
            :key="tab.value"
            class="rounded-[8px] px-3.5 py-1.5 text-[13.5px] font-semibold transition"
            :class="statusTab === tab.value ? 'bg-white text-[#8F1822] shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            @click="statusTab = tab.value; onChangeStatus()"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
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
    <div v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">加载中…</div>
    <div v-else-if="isError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">加载失败：{{ error?.message }}</div>
    <div v-else-if="!rows.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
      <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </div>
      <h3 class="text-[16px] font-bold text-gray-900">暂无待处理题目</h3>
      <p class="mx-auto mt-1.5 max-w-[360px] text-[13.5px] leading-[1.6] text-gray-500">
        当前筛选条件下没有需要审核的题目。教师提交审核后，题目会进入「待审核」队列。
      </p>
    </div>

    <!-- 列表 + 分页 -->
    <div v-else>
      <TopicTable :topics="rows">
        <template #actions="{ topic }">
          <button v-if="topic.status === 'PENDING_REVIEW'" class="act act-primary" @click="openReview(topic)">审核</button>
          <button v-else class="act" @click="openReview(topic)">查看详情</button>
        </template>
      </TopicTable>

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

    <!-- 审核抽屉 -->
    <TopicReviewDrawer v-if="drawerOpen" :open="drawerOpen" :topic="current" @close="drawerOpen = false" @updated="refresh" />
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
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 30px;
  padding: 0 11px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.act:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}
.act-primary {
  color: #c0202e;
  background: #fdecee;
  border-color: #f6d3d7;
}
.act-primary:hover {
  background: #fbdde0;
  border-color: #efc2c7;
  color: #8f1822;
}
</style>
