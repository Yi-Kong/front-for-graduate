<script setup>
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getMySupervisions, getSupervisionStats } from '@/api/supervision'
import { getAcademicYears } from '@/api/academic'
import { buildStageSteps } from '@/utils/supervision'
import SupervisionStatCards from '@/components/supervision/SupervisionStatCards.vue'
import SupervisionTable from '@/components/supervision/SupervisionTable.vue'
import SupervisionDetailDrawer from '@/components/supervision/SupervisionDetailDrawer.vue'
import Pagination from '@/components/common/Pagination.vue'

const PAGE_SIZE = 10
const page = ref(1)
const keyword = ref('')
const yearId = ref(null)
const stage = ref('all')
const drawerOpen = ref(false)
const drawerRow = ref(null)

// 学年列表（届次筛选 + 名称映射）
const { data: yearsData } = useQuery({ queryKey: ['academic-years', 'list'], queryFn: getAcademicYears })
const yearMap = computed(() => {
  const arr = Array.isArray(yearsData.value) ? yearsData.value : yearsData.value?.results || []
  return Object.fromEntries(arr.map((y) => [y.id, y.name]))
})
// 默认选中当前届（仅首次、且用户未手动改过）
watch(
  yearsData,
  (v) => {
    if (yearId.value != null || !v) return
    const arr = Array.isArray(v) ? v : v?.results || []
    const cur = arr.find((y) => y.is_current)
    yearId.value = cur ? cur.id : arr[0]?.id ?? null
  },
  { immediate: true },
)

// 我的指导关系列表（按届次 + 分页查询；关键词/阶段为当前页客户端过滤）
const {
  data: supData,
  isLoading: supLoading,
  isError: supError,
  error: supErr,
} = useQuery({
  queryKey: ['supervision', 'list', page, yearId],
  queryFn: () =>
    getMySupervisions({
      page: page.value,
      page_size: PAGE_SIZE,
      ...(yearId.value ? { academic_year: yearId.value } : {}),
    }),
})

// 指导概览统计
const { data: statsData, isLoading: statsLoading } = useQuery({
  queryKey: ['supervision', 'stats', yearId],
  queryFn: () => getSupervisionStats(yearId.value ? { academic_year: yearId.value } : {}),
})

// 行数据（附加 yearName 供表格/抽屉展示）
const rows = computed(() =>
  (supData.value?.results || []).map((r) => ({
    ...r,
    yearName: yearMap.value[r.academic_year] || `届次 #${r.academic_year}`,
  })),
)

// 阶段筛选：后端流程确认模块未实现，开题/中期/答辩/成绩 均不可达；
// 严格按阶段 done 标志过滤，未实现期间非「全部」一律为空（与顶部缺口提示一致）。
const STAGE_NAME = { proposal: '开题', midterm: '中期', defense: '答辩', grade: '成绩' }
const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    if (kw) {
      const hay = `${r.student?.name || ''} ${r.student?.student_no || ''} ${r.topic?.title || ''}`.toLowerCase()
      if (!hay.includes(kw)) return false
    }
    if (stage.value && stage.value !== 'all') {
      const step = buildStageSteps(r).find((s) => s.name === STAGE_NAME[stage.value])
      if (!step || !step.done) return false
    }
    return true
  })
})

const emptyText = computed(() =>
  rows.value.length === 0
    ? '本届暂无分配给你的指导学生。选题轮次关闭后系统会自动生成指导关系。'
    : '没有符合当前筛选条件的学生。',
)
const supErrorText = computed(() => (supErr.value ? supErr.value.message : ''))

// 分页
const total = computed(() =>
  typeof supData.value?.count === 'number' ? supData.value.count : rows.value.length,
)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageNumbers = computed(() => {
  const t = totalPages.value
  const c = page.value
  const arr = []
  const start = Math.max(1, c - 2)
  const end = Math.min(t, c + 2)
  for (let i = start; i <= end; i++) arr.push(i)
  return arr
})

// 过滤变化回到第 1 页
watch([keyword, stage, yearId], () => {
  page.value = 1
})

function openDrawer(row) {
  drawerRow.value = row
  drawerOpen.value = true
}
function closeDrawer() {
  drawerOpen.value = false
}
</script>

<template>
  <div>
    <div class="mb-5">
      <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">我的指导情况</h1>
      <p class="mt-1.5 max-w-[820px] text-[13.5px] leading-[1.6] text-gray-500">
        查看本届分配给你的学生与题目，以及各流程阶段的跟进进度。选题轮次关闭后系统自动生成指导关系。
      </p>
    </div>

    <!-- 后端缺口提示：流程确认模块（开题/中期/答辩/成绩）后端未实现 -->
    <div class="mb-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-800">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="shrink-0">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" />
        <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
      </svg>
      流程确认模块（开题 / 中期 / 答辩 / 成绩）后端尚未上线，阶段进度暂不可见，下方仅展示选题完成情况。
    </div>

    <SupervisionStatCards class="mb-4" :stats="statsData" :loading="statsLoading" />

    <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
      <h2 class="text-[16px] font-semibold text-gray-900">指导学生列表</h2>
      <div class="flex flex-wrap items-center gap-2.5">
        <input
          v-model="keyword"
          class="h-10 w-[240px] rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
          placeholder="搜索学生姓名 / 学号 / 题名"
        />
        <select
          v-model="yearId"
          class="h-10 rounded-[10px] border border-gray-200 px-3 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E]"
        >
          <option :value="null">全部届次</option>
          <option v-for="y in (Array.isArray(yearsData) ? yearsData : (yearsData?.results || []))" :key="y.id" :value="y.id">
            {{ y.name }}
          </option>
        </select>
        <select
          v-model="stage"
          class="h-10 rounded-[10px] border border-gray-200 px-3 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E]"
        >
          <option value="all">全部阶段</option>
          <option value="proposal">开题</option>
          <option value="midterm">中期</option>
          <option value="defense">答辩</option>
          <option value="grade">成绩</option>
        </select>
      </div>
    </div>

    <SupervisionTable
      :rows="filtered"
      :loading="supLoading"
      :error="supErrorText"
      :empty-text="emptyText"
      @view="openDrawer"
    />

    <Pagination
      v-if="!supLoading && !supErrorText && total > 0"
      :page="page"
      :total-pages="totalPages"
      :total="total"
      :page-numbers="pageNumbers"
      @update:page="page = $event"
    />

    <SupervisionDetailDrawer :open="drawerOpen" :row="drawerRow" @close="closeDrawer" />
  </div>
</template>
