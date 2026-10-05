<script setup>
// 教师题目详情抽屉（#11 我的题目申报）
// 只读展示 + 按状态提供「编辑 / 提交审核」入口；不含审核/退回按钮，规避教师自审批。
// props: open / topic；emits: close / edit(topic) / submitted
import { ref, computed, unref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { submitReview } from '@/api/topics'
import { statusLabel, sourceLabel } from '@/utils/topics'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import StatusBadge from '@/components/topics/StatusBadge.vue'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: { type: Object, default: null },
})
const emit = defineEmits(['close', 'edit', 'submitted'])

const teacherText = (id) => (id != null ? `教师 #${id}` : '—')

const canAct = computed(() => ['DRAFT', 'REJECTED'].includes(props.topic?.status))

const confirmOpen = ref(false)
const qc = useQueryClient()
const submitMutation = useMutation({
  mutationFn: (id) => submitReview(id),
  onSuccess: () => {
    confirmOpen.value = false
    emit('submitted')
    qc.invalidateQueries({ queryKey: ['topics', 'my'] })
  },
})
const submitting = computed(() => unref(submitMutation.isPending))

function onConfirmSubmit() {
  if (props.topic) submitMutation.mutate(props.topic.id)
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
          <b>查重提示（待后端补齐）：</b>提交审核后系统自动查重。若被判定为疑似重复将无法发布，需管理员复核确认不重复后方可继续。
        </div>
      </div>

      <div class="border-t border-gray-200 p-5">
        <div v-if="canAct" class="flex gap-3">
          <button
            class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-[#f6d3d7] bg-[#fdecee] px-4 text-[14px] font-semibold text-[#8F1822] transition hover:bg-[#fbdde0]"
            @click="emit('edit', topic)"
          >
            编辑
          </button>
          <button
            class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
            :disabled="submitting"
            @click="confirmOpen = true"
          >
            {{ topic.status === 'REJECTED' ? '重新提交审核' : '提交审核' }}
          </button>
        </div>
        <p v-else class="text-center text-[13px] text-gray-400">
          该题目当前为「{{ statusLabel(topic.status) }}」，无需操作；可在管理员处理后继续。
        </p>
      </div>
    </SheetContent>
  </Sheet>

  <ConfirmDialog
    :open="confirmOpen && !submitting"
    title="提交审核"
    :message="topic?.status === 'REJECTED' ? '确认提交修改后重新审核？提交后题目进入待审核队列。' : '确认提交审核？提交后系统将自动查重，题目进入待审核队列。'"
    confirm-text="确认提交"
    :loading="submitting"
    @close="confirmOpen = false"
    @confirm="onConfirmSubmit"
  />
</template>
