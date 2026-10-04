<script setup>
// 我的题目申报（教师）· 列表页 #11
import { ref, computed, unref } from 'vue'
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
import { getTopics, submitReview } from '@/api/topics'
import { getAcademicYears } from '@/api/academic'
import { useAuthStore } from '@/store/auth'
import TopicTable from '@/components/topics/TopicTable.vue'
import TopicFormDialog from '@/components/topics/TopicFormDialog.vue'
import TopicTeacherDrawer from '@/components/topics/TopicTeacherDrawer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const PAGE_SIZE = 10
const qc = useQueryClient()
const auth = useAuthStore()
const currentUserId = computed(() => auth.user?.id ?? 1)

const STATUS_TABS = [
  { value: 'ALL', label: '全部' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'PENDING_DEDUP', label: '待查重' },
  { value: 'PENDING_REVIEW', label: '待审核' },
  { value: 'REJECTED', label: '退回修改' },
  { value: 'PUBLISHED', label: '已发布' },
]
const statusTab = ref('ALL')
const page = ref(1)
const filters = ref({ keyword: '' })
const editable = (s) => ['DRAFT', 'REJECTED'].includes(s)

const { data, isLoading, isError, error } = useQuery({
  queryKey: ['topics', 'my', statusTab, page, filters],
  queryFn: () =>
    getTopics({
      page: page.value,
      page_size: PAGE_SIZE,
      ...(statusTab.value !== 'ALL' ? { status: statusTab.value } : {}),
      proposer: currentUserId.value,
      ...(filters.value.keyword ? { keyword: filters.value.keyword } : {}),
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
const { data: yearsData } = useQuery({ queryKey: ['academic-years', 'list'], queryFn: getAcademicYears })
const yearMap = computed(() => {
  const arr = Array.isArray(yearsData.value) ? yearsData.value : yearsData.value?.results || []
  return Object.fromEntries(arr.map((y) => [y.id, y.name]))
})
const rows = computed(() =>
  raw.value.map((t) => ({ ...t, yearName: yearMap.value[t.academic_year] || `届次#${t.academic_year}` })),
)

function onChangeStatus() { page.value = 1 }
function onQuery() { page.value = 1 }
function onReset() { filters.value = { keyword: '' }; page.value = 1 }
function prevPage() { if (page.value > 1) page.value -= 1 }
function nextPage() { if (page.value < totalPages.value) page.value += 1 }

// 新建/编辑弹窗
const formOpen = ref(false)
const formTopic = ref(null)
function openCreate() { formTopic.value = null; formOpen.value = true }
function openEdit(t) { formTopic.value = t; formOpen.value = true }
function onSaved() { formOpen.value = false; qc.invalidateQueries({ queryKey: ['topics', 'my'] }) }

// 详情抽屉
const drawerOpen = ref(false)
const drawerTopic = ref(null)
function openView(t) { drawerTopic.value = t; drawerOpen.value = true }
function onEditFromDrawer(t) { drawerOpen.value = false; openEdit(t) }

// 提交审核（列表按钮 → 二次确认）
const reviewOpen = ref(false)
const reviewTopic = ref(null)
const submitMutation = useMutation({
  mutationFn: (id) => submitReview(id),
  onSuccess: () => { reviewOpen.value = false; qc.invalidateQueries({ queryKey: ['topics', 'my'] }) },
})
const submitting = computed(() => unref(submitMutation.isPending))
function askReview(t) { reviewTopic.value = t; reviewOpen.value = true }
function confirmReview() { if (reviewTopic.value) submitMutation.mutate(reviewTopic.value.id) }
</script>

<template>
  <div>
    <div class="mb-5">
      <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">我的题目申报</h1>
      <p class="mt-1.5 max-w-[780px] text-[13.5px] leading-[1.6] text-gray-500">
        管理你提交的毕业设计题目。新建题目后系统自动查重，提交审核由管理员复核发布；被退回的题目可按意见修改后重新提交。
      </p>
    </div>

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
      <div class="ml-auto flex gap-2.5">
        <button class="inline-flex h-10 items-center rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50" @click="onReset">重置</button>
        <button class="inline-flex h-10 items-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px" @click="onQuery">查询</button>
      </div>
      <button class="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px" @click="openCreate">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        新建题目
      </button>
    </div>

    <div v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">加载中…</div>
    <div v-else-if="isError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">加载失败：{{ error?.message }}</div>
    <div v-else-if="!rows.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
      <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
      </div>
      <h3 class="text-[16px] font-bold text-gray-900">还没有题目</h3>
      <p class="mx-auto mt-1.5 max-w-[360px] text-[13.5px] leading-[1.6] text-gray-500">
        点击右上角「新建题目」开始申报你的毕业设计题目，提交后系统将自动查重并进入审核流程。
      </p>
    </div>

    <div v-else>
      <TopicTable :topics="rows">
        <template #actions="{ topic }">
          <button v-if="editable(topic.status)" class="act act-primary" @click="openEdit(topic)">编辑</button>
          <button v-if="topic.status === 'DRAFT'" class="act act-primary" @click="askReview(topic)">提交审核</button>
          <button v-if="topic.status === 'REJECTED'" class="act act-primary" @click="askReview(topic)">重新提交</button>
          <button class="act" @click="openView(topic)">查看</button>
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

    <TopicFormDialog v-if="formOpen" :open="formOpen" :topic="formTopic" @close="formOpen = false" @saved="onSaved" />
    <TopicTeacherDrawer v-if="drawerOpen" :open="drawerOpen" :topic="drawerTopic" @close="drawerOpen = false" @edit="onEditFromDrawer" @submitted="drawerOpen = false" />

    <ConfirmDialog
      :open="reviewOpen"
      title="提交审核"
      :message="reviewTopic?.status === 'REJECTED' ? '确认提交修改后重新审核？提交后题目进入待审核队列。' : '确认提交审核？提交后系统将自动查重，题目进入待审核队列。'"
      confirm-text="确认提交"
      :loading="submitting"
      @close="reviewOpen = false"
      @confirm="confirmReview"
    />
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
.pg:hover:not(:disabled) { border-color: #d1d5db; background: #f9fafb; }
.pg:disabled { opacity: 0.45; cursor: not-allowed; }
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
.act:hover { background: #f9fafb; border-color: #d1d5db; color: #1f2937; }
.act-primary { color: #c0202e; background: #fdecee; border-color: #f6d3d7; }
.act-primary:hover { background: #fbdde0; border-color: #efc2c7; color: #8f1822; }
</style>
