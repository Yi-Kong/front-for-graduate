<script setup>
import { ref, computed, unref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getSelectionRounds,
  createSelectionRound,
  updateSelectionRound,
  openSelectionRound,
  closeSelectionRound,
  deleteSelectionRound,
} from '@/api/selection'
import { getAcademicYears } from '@/api/academic'
import { formatDate } from '@/utils/format'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import RoundFormDialog from '@/components/selection/RoundFormDialog.vue'

const qc = useQueryClient()

const { data: rounds, isLoading, isError, error } = useQuery({
  queryKey: ['selection-rounds', 'list'],
  queryFn: getSelectionRounds,
})
// 兼容后端可能的分页包装 {results,count} 或直接数组
const rawList = computed(() =>
  Array.isArray(rounds.value) ? rounds.value : rounds.value?.results || [],
)

// 所属学年列表（用于表单下拉与「所属学年」列名映射）
const { data: years } = useQuery({
  queryKey: ['academic-years', 'list'],
  queryFn: getAcademicYears,
})
const yearMap = computed(() => {
  const arr = Array.isArray(years.value) ? years.value : years.value?.results || []
  return Object.fromEntries(arr.map((y) => [y.id, y.name]))
})

// 按学年筛选（前端本地过滤，API 未提供过滤参数）
const selectedYear = ref('')
const list = computed(() => {
  if (!selectedYear.value) return rawList.value
  return rawList.value.filter((r) => String(r.academic_year) === String(selectedYear.value))
})

function statusMeta(status) {
  if (status === 'OPEN') return { label: '进行中', cls: 'bg-[#fdecee] text-[#8F1822] border-[#f6d3d7]' }
  if (status === 'CLOSED') return { label: '已结束', cls: 'bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]' }
  return { label: '待开始', cls: 'bg-gray-100 text-gray-500 border-gray-200' }
}

function invalidate() {
  qc.invalidateQueries({ queryKey: ['selection-rounds', 'list'] })
}

// 新增 / 编辑
const formOpen = ref(false)
const formMode = ref('create')
const editing = ref(null)
function openCreate() {
  formMode.value = 'create'
  editing.value = null
  // 清掉上一次提交遗留的 pending/error 状态，避免弹窗一打开就显示「保存中…」且按钮被禁用
  saveMutation.reset()
  formOpen.value = true
}
function openEdit(item) {
  formMode.value = 'edit'
  editing.value = item
  saveMutation.reset()
  formOpen.value = true
}
const saveMutation = useMutation({
  mutationFn: (payload) =>
    formMode.value === 'edit' && editing.value
      ? updateSelectionRound(editing.value.id, payload)
      : createSelectionRound(payload),
  onSuccess: () => {
    formOpen.value = false
    invalidate()
  },
})

// 开启（直接操作，无需确认）
const openMutation = useMutation({
  mutationFn: (id) => openSelectionRound(id),
  onSuccess: invalidate,
})

// 关闭（生成指导关系，需二次确认）
const closeOpen = ref(false)
const closing = ref(null)
function askClose(item) {
  closing.value = item
  closeOpen.value = true
}
const closeMutation = useMutation({
  mutationFn: (id) => closeSelectionRound(id),
  onSuccess: () => {
    closeOpen.value = false
    invalidate()
  },
})
function onConfirmClose() {
  if (closing.value) closeMutation.mutate(closing.value.id)
}

// 删除（二次确认）
const deleteOpen = ref(false)
const deleting = ref(null)
function askDelete(item) {
  deleting.value = item
  deleteOpen.value = true
}
const deleteMutation = useMutation({
  mutationFn: (id) => deleteSelectionRound(id),
  onSuccess: () => {
    deleteOpen.value = false
    invalidate()
  },
})
function onConfirmDelete() {
  if (deleting.value) deleteMutation.mutate(deleting.value.id)
}

// ⚠️ useMutation() 返回的是「含 ref 的普通对象」，不是 reactive 对象；在模板里直接写
// saveMutation.isPending 拿到的是 Ref 对象本身（恒为真），会让按钮永久处于禁用/「保存中…」状态。
// 必须显式 unref 成布尔值再用。
const saving = computed(() => unref(saveMutation.isPending))
const opening = computed(() => unref(openMutation.isPending))
const closingRound = computed(() => unref(closeMutation.isPending))
const deletingRound = computed(() => unref(deleteMutation.isPending))

function onFormSubmit(payload) {
  saveMutation.mutate(payload)
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">选题轮次管理</h1>
        <p class="mt-1.5 max-w-[720px] text-[13.5px] leading-[1.6] text-gray-500">
          配置本届毕业设计的选题轮次（如第一轮、第二轮）。轮次开启后，学生可在开放时间内选题意向；轮次关闭后系统自动依据选题结果生成师生指导关系。
        </p>
      </div>
      <button
        class="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px"
        @click="openCreate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        新增轮次
      </button>
    </div>

    <!-- 工具栏：按学年筛选 -->
    <div class="mb-3.5 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 text-[13px] text-gray-500">
        所属学年
        <select
          v-model="selectedYear"
          class="h-[38px] rounded-[10px] border border-gray-200 bg-white px-3 text-[13.5px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
        >
          <option value="">全部学年</option>
          <option v-for="y in (Array.isArray(years?.results) ? years.results : (Array.isArray(years) ? years : []))" :key="y.id" :value="y.id">{{ y.name }}</option>
        </select>
      </div>
      <span class="ml-auto text-[13px] text-gray-400">共 {{ list.length }} 个轮次</span>
    </div>

    <!-- 加载 / 错误 / 空态 -->
    <div v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">加载中…</div>
    <div v-else-if="isError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">加载失败：{{ error?.message }}</div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center text-[13.5px] text-gray-500">
      暂无轮次，点击右上角「新增轮次」创建。
    </div>

    <!-- 列表 -->
    <div v-else class="card-wrap overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left text-[12.5px] font-semibold text-gray-500">
            <th class="whitespace-nowrap px-5 py-3" style="width: 26%">轮次</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 22%">开放时间</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 22%">截止时间</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 12%">状态</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 18%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.id" class="border-t border-gray-100 transition hover:bg-gray-50">
            <td data-label="轮次" class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="flex h-[42px] w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] bg-[#C0202E] text-white">
                  <small class="text-[9px] font-semibold opacity-85">第</small>
                  <span class="text-[13px] font-bold leading-[1.1]">{{ r.round_no }}</span>
                  <small class="text-[9px] font-semibold opacity-85">轮</small>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">第 {{ r.round_no }} 轮</div>
                  <div class="mt-0.5 text-[12.5px] text-gray-400">所属学年：{{ yearMap[r.academic_year] || ('ID ' + r.academic_year) }}</div>
                </div>
              </div>
            </td>
            <td data-label="开放时间" class="px-5 py-3.5 text-[14px] tabular-nums text-gray-700">{{ formatDate(r.start_time) }}</td>
            <td data-label="截止时间" class="px-5 py-3.5 text-[14px] tabular-nums text-gray-700">{{ formatDate(r.end_time) }}</td>
            <td data-label="状态" class="px-5 py-3.5">
              <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold" :class="statusMeta(r.status).cls">{{ statusMeta(r.status).label }}</span>
            </td>
            <td data-label="操作" class="px-5 py-3.5">
              <div class="acts flex flex-wrap items-center gap-1.5">
                <button v-if="r.status === 'PENDING'" class="act act-primary" :disabled="opening" @click="openMutation.mutate(r.id)">开启</button>
                <button v-if="r.status === 'OPEN'" class="act act-danger" :disabled="closingRound" @click="askClose(r)">关闭</button>
                <button class="act" :disabled="r.status === 'CLOSED'" @click="openEdit(r)">编辑</button>
                <button class="act act-danger" :disabled="deletingRound" @click="askDelete(r)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 指导情况统计（空态占位：后端 supervision_statistics 待补） -->
    <div v-if="!isLoading && !isError" class="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
      <div class="mb-3.5 flex items-center justify-between">
        <h3 class="text-[15px] font-semibold text-gray-900">指导情况统计</h3>
        <span class="text-[12.5px] text-gray-400">轮次关闭后展示各教师指导人数（超 10 人告警）</span>
      </div>
      <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-7 text-gray-400">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M8 4v16" stroke="currentColor" stroke-width="1.6"/></svg>
        <div class="mt-2.5 text-[13.5px] font-semibold text-gray-500">统计区暂为空态</div>
        <div class="mt-1 text-[12.5px]">后端 supervision_statistics 统计接口尚未提供，待补齐后展示数据</div>
      </div>
    </div>

    <RoundFormDialog
      :open="formOpen"
      :mode="formMode"
      :initial="editing"
      :years="(Array.isArray(years?.results) ? years.results : (Array.isArray(years) ? years : []))"
      :loading="saving"
      @close="formOpen = false"
      @submit="onFormSubmit"
    />
    <ConfirmDialog
      :open="closeOpen"
      title="关闭选题轮次"
      :message="closing ? `确认关闭「第 ${closing.round_no} 轮」？关闭后系统将依据本轮学生选题结果自动生成师生指导关系，且轮次不可再开启。` : ''"
      confirm-text="确认关闭"
      :loading="closingRound"
      @close="closeOpen = false"
      @confirm="onConfirmClose"
    />
    <ConfirmDialog
      :open="deleteOpen"
      title="删除轮次"
      :message="deleting ? `确定删除「第 ${deleting.round_no} 轮」？删除后不可恢复。` : ''"
      confirm-text="删除"
      :loading="deletingRound"
      @close="deleteOpen = false"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
