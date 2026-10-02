<script setup>
// 题目审核抽屉（#8 题目审核 复用）
// props: open 显隐；topic 当前题目（已含 yearName 映射字段）
// emits: close / updated（审核动作成功后通知父组件刷新列表）
import { ref, computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { approveTopic, rejectTopic } from '@/api/topics'
import { statusLabel, statusVariant, sourceLabel } from '@/utils/topics'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: { type: Object, default: null },
})
const emit = defineEmits(['close', 'updated'])

const BADGE = {
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  gray: 'bg-gray-100 text-gray-600 border border-gray-200',
  purple: 'bg-violet-50 text-violet-700 border border-violet-200',
}
const statusBadge = (s) => BADGE[statusVariant(s)] || BADGE.gray
const teacherText = (id) => (id != null ? `教师 #${id}` : '—')

const isPending = computed(() => props.topic?.status === 'PENDING_REVIEW')

// 退回修改弹窗 + 审核通过二次确认
const rejectOpen = ref(false)
const approveOpen = ref(false)
const rejectComment = ref('')
function openReject() {
  rejectComment.value = ''
  rejectOpen.value = true
}
function openApprove() {
  approveOpen.value = true
}

const qcInvalidate = () => emit('updated')

const approveMutation = useMutation({
  mutationFn: (id) => approveTopic(id),
  onSuccess: () => {
    approveOpen.value = false
    qcInvalidate()
    emit('close')
  },
})
const rejectMutation = useMutation({
  mutationFn: ({ id, comment }) => rejectTopic(id, comment),
  onSuccess: () => {
    rejectOpen.value = false
    qcInvalidate()
    emit('close')
  },
})

function confirmApprove() {
  if (props.topic) approveMutation.mutate(props.topic.id)
}
function confirmReject() {
  if (!props.topic) return
  rejectMutation.mutate({ id: props.topic.id, comment: rejectComment.value.trim() })
}
function closeAll() {
  rejectOpen.value = false
  emit('close')
}
</script>

<template>
  <div v-if="open && topic" class="fixed inset-0 z-50 bg-black/40" @click="closeAll" />
  <Transition name="drawer">
    <aside
      v-if="open && topic"
      class="drawer fixed right-0 top-0 z-[55] flex h-full w-[480px] max-w-[calc(100vw-32px)] flex-col bg-white shadow-2xl"
    >
      <div class="flex items-start justify-between gap-3 border-b border-gray-200 p-5">
        <div>
          <h3 class="text-[18px] font-bold leading-[1.45] text-gray-900">{{ topic.title }}</h3>
          <div class="mt-1.5 flex items-center gap-2 text-[12.5px] text-gray-400">
            <span>{{ sourceLabel(topic.topic_source) }}</span>
            <span>·</span>
            <span>{{ topic.yearName || `届次#${topic.academic_year}` }}</span>
            <span>·</span>
            <span>ID {{ topic.id }}</span>
          </div>
        </div>
        <button
          class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-gray-200"
          @click="closeAll"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        <div class="mb-4 inline-flex items-center gap-2">
          <span class="text-[12.5px] font-semibold text-gray-500">当前状态</span>
          <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold" :class="statusBadge(topic.status)">
            {{ statusLabel(topic.status) }}
          </span>
        </div>

        <div class="kv"><div class="k">题目来源</div><div class="v">{{ sourceLabel(topic.topic_source) }}</div></div>
        <div class="kv"><div class="k">指导教师</div><div class="v">{{ teacherText(topic.supervisor) }}</div></div>
        <div class="kv"><div class="k">申报人</div><div class="v">{{ teacherText(topic.proposer) }}</div></div>
        <div class="kv"><div class="k">所属学年</div><div class="v">{{ topic.yearName || `届次#${topic.academic_year}` }}</div></div>
        <div v-if="topic.review_comment" class="kv" style="flex-direction: column; align-items: stretch">
          <div class="k" style="width: auto; margin-bottom: 4px">退回意见</div>
          <div class="rounded-[10px] border border-red-200 bg-red-50 p-3.5 text-[14px] leading-[1.7] text-red-700">{{ topic.review_comment }}</div>
        </div>
        <div class="kv" style="flex-direction: column; align-items: stretch">
          <div class="k" style="width: auto; margin-bottom: 4px">题目描述</div>
          <div class="rounded-[10px] border border-gray-200 bg-gray-50 p-3.5 text-[14px] leading-[1.75] text-gray-700">
            {{ topic.description || '暂无描述' }}
          </div>
        </div>

        <div class="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 p-3.5 text-[12.5px] leading-[1.7] text-amber-700">
          <b>查重提示（待后端补齐）：</b>后端暂未提供疑似重复题目的复核接口，本条题目无法在此确认是否与他人题目重复。建议后端补充 duplicate-check 复核能力后，此处展示查重相似度与复核入口。
        </div>
      </div>

      <div class="border-t border-gray-200 p-5">
        <div v-if="isPending" class="flex gap-3">
          <button
            class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-[#f6d3d7] bg-[#fdecee] px-4 text-[14px] font-semibold text-[#8F1822] transition hover:bg-[#fbdde0] disabled:opacity-60"
            :disabled="rejectMutation.isPending.value"
            @click="openReject"
          >
            退回修改
          </button>
          <button
            class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
            :disabled="approveMutation.isPending.value"
            @click="openApprove"
          >
            {{ approveMutation.isPending.value ? '处理中…' : '审核通过' }}
          </button>
        </div>
        <p v-else class="text-center text-[13px] text-gray-400">该题目已处理（{{ statusLabel(topic.status) }}），无需审核。</p>
      </div>
    </aside>
  </Transition>

  <!-- 退回修改弹窗 -->
  <div
    v-if="rejectOpen"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
    @click.self="rejectOpen = false"
  >
    <div class="w-[440px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div class="px-5 py-4">
        <h3 class="text-[17px] font-semibold text-gray-900">退回修改</h3>
        <p class="mt-2 text-[13.5px] leading-[1.6] text-gray-500">请填写退回原因，教师将在「我的题目申报」中看到该意见。</p>
        <textarea
          v-model="rejectComment"
          class="mt-3 min-h-[96px] w-full rounded-[10px] border border-gray-200 p-3 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
          placeholder="例如：题目与往年题目重复度较高，请调整研究切入点；或描述过于简略，需补充技术路线。"
        />
      </div>
      <div class="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
        <button
          class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          :disabled="rejectMutation.isPending.value"
          @click="rejectOpen = false"
        >
          取消
        </button>
        <button
          class="h-10 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          :disabled="rejectMutation.isPending.value"
          @click="confirmReject"
        >
          {{ rejectMutation.isPending.value ? '处理中…' : '确认退回' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 审核通过二次确认 -->
  <ConfirmDialog
    :open="approveOpen && !rejectOpen"
    title="审核通过"
    message="确认通过该题目？通过后题目将发布，学生可在选题阶段看到。"
    confirm-text="确认通过"
    :loading="approveMutation.isPending.value"
    @close="approveOpen = false"
    @confirm="confirmApprove"
  />
</template>

<style scoped>
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
