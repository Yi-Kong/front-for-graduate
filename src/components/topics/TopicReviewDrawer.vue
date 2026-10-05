<script setup>
// 题目审核抽屉（#8 题目审核 复用）
// props: open 显隐；topic 当前题目（已含 yearName 映射字段）
// emits: close / updated（审核动作成功后通知父组件刷新列表）
import { ref, computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { approveTopic, rejectTopic } from '@/api/topics'
import { statusLabel, sourceLabel } from '@/utils/topics'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import StatusBadge from '@/components/topics/StatusBadge.vue'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from '@/components/ui/alert-dialog'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: { type: Object, default: null },
})
const emit = defineEmits(['close', 'updated'])

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
</script>

<template>
  <Sheet :open="open && !!topic" @update:open="(v) => { if (!v) emit('close') }">
    <SheetContent side="right" :show-close="false">
      <div class="flex items-start justify-between gap-3 border-b border-gray-200 p-5">
        <div>
          <SheetTitle class="text-[18px] font-bold leading-[1.45] text-gray-900">{{ topic.title }}</SheetTitle>
          <div class="mt-1.5 flex items-center gap-2 text-[12.5px] text-gray-400">
            <span>{{ sourceLabel(topic.topic_source) }}</span>
            <span>·</span>
            <span>{{ topic.yearName || `届次#${topic.academic_year}` }}</span>
            <span>·</span>
            <span>ID {{ topic.id }}</span>
          </div>
        </div>
        <SheetClose
          class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-gray-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </SheetClose>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        <div class="mb-4 inline-flex items-center gap-2">
          <span class="text-[12.5px] font-semibold text-gray-500">当前状态</span>
          <StatusBadge :status="topic.status" />
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
    </SheetContent>
  </Sheet>

  <!-- 退回修改弹窗 -->
  <AlertDialog :open="rejectOpen" @update:open="(v) => { if (!v) rejectOpen = false }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>退回修改</AlertDialogTitle>
        <AlertDialogDescription>请填写退回原因，教师将在「我的题目申报」中看到该意见。</AlertDialogDescription>
      </AlertDialogHeader>
      <textarea
        v-model="rejectComment"
        class="mt-1 min-h-[96px] w-full rounded-[10px] border border-gray-200 p-3 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
        placeholder="例如：题目与往年题目重复度较高，请调整研究切入点；或描述过于简略，需补充技术路线。"
      />
      <AlertDialogFooter>
        <AlertDialogClose
          class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          :disabled="rejectMutation.isPending.value"
        >
          取消
        </AlertDialogClose>
        <button
          class="h-10 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          :disabled="rejectMutation.isPending.value"
          @click="confirmReject"
        >
          {{ rejectMutation.isPending.value ? '处理中…' : '确认退回' }}
        </button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

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

