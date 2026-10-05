<script setup>
import { ref, computed, unref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { getSelectableTopics, getTopicDetail } from '@/api/topics'
import { getAcademicYears } from '@/api/academic'
import {
  getMySelectionResult,
  getCurrentRound,
  chooseTopic,
  changeTopic,
} from '@/api/selection'
import { isRoundOpen } from '@/utils/selection'
import RoundStatusBar from '@/components/selection/RoundStatusBar.vue'
import SelectionResultCard from '@/components/selection/SelectionResultCard.vue'
import MySelectionDrawer from '@/components/selection/MySelectionDrawer.vue'
import TopicTable from '@/components/topics/TopicTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const qc = useQueryClient()
const PAGE_SIZE = 10
const page = ref(1)

// 当前轮次（mock-only /current/，失败降级不禁用）
const {
  data: roundData,
  isLoading: roundLoading,
  isError: roundError,
} = useQuery({ queryKey: ['selection', 'current-round'], queryFn: getCurrentRound, retry: false })
const roundKnown = computed(() => !roundError.value && !!roundData.value)
const currentRound = computed(() => (roundKnown.value ? roundData.value : null))
const listDisabled = computed(() => roundKnown.value && !isRoundOpen(currentRound.value))

// 我的选题结果 + 详情补全
const resultQuery = useQuery({ queryKey: ['selection', 'result'], queryFn: getMySelectionResult })
const result = computed(() => resultQuery.data.value || null)
const resultLoading = resultQuery.isLoading
const resultError = computed(() => (resultQuery.error.value ? resultQuery.error.value.message : ''))
const hasChoice = computed(() => !!result.value && result.value.topic_id != null)
const selectedTopicId = computed(() => (hasChoice.value ? result.value.topic_id : null))
const detailQuery = useQuery({
  queryKey: ['topics', 'detail', selectedTopicId],
  queryFn: () => getTopicDetail(selectedTopicId.value),
  enabled: hasChoice,
})
const topicDetail = computed(() => detailQuery.data.value || null)
const canChange = computed(() => {
  if (!hasChoice.value) return true
  if (roundKnown.value && !isRoundOpen(currentRound.value)) return false
  return true
})

// 可选题目列表
const {
  data: topicsData,
  isLoading: topicsLoading,
  isError: topicsError,
  error: topicsErr,
} = useQuery({
  queryKey: ['topics', 'selectable', page],
  queryFn: () => getSelectableTopics({ page: page.value, page_size: PAGE_SIZE }),
})
const topicsRaw = computed(() => topicsData.value?.results || [])
const total = computed(() =>
  typeof topicsData.value?.count === 'number' ? topicsData.value.count : topicsRaw.value.length,
)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// 学年映射 + 客户端关键词筛选
const { data: yearsData } = useQuery({ queryKey: ['academic-years', 'list'], queryFn: getAcademicYears })
const yearMap = computed(() => {
  const arr = Array.isArray(yearsData.value) ? yearsData.value : yearsData.value?.results || []
  return Object.fromEntries(arr.map((y) => [y.id, y.name]))
})
const keyword = ref('')
const rows = computed(() =>
  topicsRaw.value
    .map((t) => ({ ...t, yearName: yearMap.value[t.academic_year] || `届次#${t.academic_year}` }))
    .filter((t) => !keyword.value || t.title.includes(keyword.value)),
)

// 抽屉 + 二次确认
const drawerOpen = ref(false)
const drawerTopic = ref(null)
const confirmOpen = ref(false)
const pendingAction = ref(null)
const mutErr = ref('')

const chooseMutation = useMutation({ mutationFn: (id) => chooseTopic(id) })
const changeMutation = useMutation({ mutationFn: (id) => changeTopic(id) })
const submitting = computed(() => unref(chooseMutation.isPending) || unref(changeMutation.isPending))

function openDrawer(t) {
  if (!t) return
  drawerTopic.value = t
  drawerOpen.value = true
}
function onDrawerSelect(topic) {
  drawerOpen.value = false
  pendingAction.value = { type: selectedTopicId.value != null ? 'change' : 'choose', topic }
  confirmOpen.value = true
}
function confirmMessage() {
  if (!pendingAction.value) return ''
  const { type, topic } = pendingAction.value
  return type === 'change'
    ? `确定将选题改为「${topic.title}」吗？原题目将释放回可选池。`
    : `确定选择题目「${topic.title}」吗？选题后本轮次内仍可改选。`
}
function runMutation() {
  const { type, topic } = pendingAction.value
  mutErr.value = ''
  const m = type === 'change' ? changeMutation : chooseMutation
  m.mutate(Number(topic.id), {
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['selection', 'result'] })
      qc.invalidateQueries({ queryKey: ['topics', 'detail'] })
      qc.invalidateQueries({ queryKey: ['topics', 'selectable'] })
      confirmOpen.value = false
      pendingAction.value = null
    },
    onError: (e) => {
      mutErr.value = e.message || '操作失败'
      confirmOpen.value = false
      pendingAction.value = null
    },
  })
}
function onResultChange() {
  // 已选题：前往列表挑选其他题目改选
  document.getElementById('topic-list')?.scrollIntoView({ behavior: 'smooth' })
}
function goBrowse() {
  router.push({ name: 'topic-browse' })
}
</script>

<template>
  <div>
    <div class="mb-5">
      <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">我的选题</h1>
      <p class="mt-1.5 max-w-[820px] text-[13.5px] leading-[1.6] text-gray-500">
        查看当前选题轮次与你的选题结果；在下方已发布题目中选择或改选。选题与改选均会二次确认。
      </p>
    </div>

    <RoundStatusBar class="mb-4" :round="currentRound" :known="roundKnown" :loading="roundLoading" />

    <SelectionResultCard
      class="mb-4"
      :result="result"
      :topic="topicDetail"
      :loading="resultLoading"
      :error="resultError"
      :can-change="canChange"
      @browse="goBrowse"
      @change="onResultChange"
      @view="openDrawer(topicDetail)"
      @retry="resultQuery.refetch()"
    />

    <div v-if="mutErr" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
      {{ mutErr }}
    </div>

    <div id="topic-list" class="scroll-mt-4">
      <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 class="text-[16px] font-semibold text-gray-900">已发布题目</h2>
        <input
          v-model="keyword"
          class="h-10 w-[260px] rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
          placeholder="按题目名称搜索"
        />
      </div>

      <div v-if="topicsLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">加载中…</div>
      <div v-else-if="topicsError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">加载失败：{{ topicsErr?.message }}</div>
      <div v-else-if="!rows.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
        <h3 class="text-[16px] font-bold text-gray-900">暂无可选题目</h3>
        <p class="mx-auto mt-1.5 max-w-[360px] text-[13.5px] leading-[1.6] text-gray-500">当前没有已发布的题目，或选题轮次尚未开放。可前往「题目浏览」查看全部题目。</p>
      </div>
      <div v-else>
        <TopicTable :topics="rows" @view="openDrawer">
          <template #actions="{ topic }">
            <button v-if="Number(topic.id) === Number(selectedTopicId)" class="act" disabled>当前选题</button>
            <button v-else class="act act-primary" :disabled="listDisabled" @click="openDrawer(topic)">
              {{ selectedTopicId != null ? '改选为此题' : '选择此题' }}
            </button>
          </template>
        </TopicTable>
        <Pagination :page="page" :total-pages="totalPages" :total="total" @update:page="page = $event" />
      </div>
    </div>

    <MySelectionDrawer
      :open="drawerOpen"
      :topic="drawerTopic"
      :selected-topic-id="selectedTopicId"
      :disabled="listDisabled"
      @close="drawerOpen = false"
      @select="onDrawerSelect"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="确认选题操作"
      :message="confirmMessage()"
      :confirm-text="pendingAction?.type === 'change' ? '确认改选' : '确认选择'"
      :loading="submitting"
      @close="confirmOpen = false"
      @confirm="runMutation"
    />
  </div>
</template>
