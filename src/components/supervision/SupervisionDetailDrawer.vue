<script setup>
// 学生指导详情抽屉（只读，Sheet z-55）。展示题目完整信息 + 阶段进度条。
// props: open / row（supervision 对象，view 已附加 yearName）；emits close
import { computed } from 'vue'
import Sheet from '@/components/ui/sheet/Sheet.vue'
import SheetContent from '@/components/ui/sheet/SheetContent.vue'
import SheetTitle from '@/components/ui/sheet/SheetTitle.vue'
import SheetClose from '@/components/ui/sheet/SheetClose.vue'
import StatusBadge from '@/components/topics/StatusBadge.vue'
import StageProgress from '@/components/supervision/StageProgress.vue'
import { sourceLabel } from '@/utils/topics'
import { buildStageSteps, formatDateTime } from '@/utils/supervision'

const props = defineProps({
  open: { type: Boolean, default: false },
  row: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const steps = computed(() => buildStageSteps(props.row))
const yearText = computed(() => props.row?.yearName || (props.row?.academic_year != null ? `届次 #${props.row.academic_year}` : '—'))
</script>

<template>
  <Sheet :open="open && !!row" @update:open="(v) => { if (!v) emit('close') }">
    <SheetContent side="right" :show-close="false">
      <div class="flex items-start justify-between gap-3 border-b border-gray-200 p-5">
        <div>
          <SheetTitle class="text-[18px] font-bold leading-[1.45] text-gray-900">{{ row?.student?.name }}</SheetTitle>
          <div class="mt-1.5 text-[12.5px] text-gray-400">
            学号 {{ row?.student?.student_no || '—' }} · 第 {{ row?.selection_round }} 轮指导
          </div>
        </div>
        <SheetClose class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-gray-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        </SheetClose>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        <div class="mb-4 inline-flex items-center gap-2">
          <span class="text-[12.5px] font-semibold text-gray-500">当前状态</span>
          <StatusBadge :status="row?.topic?.status" />
        </div>
        <div class="kv"><div class="k">题目</div><div class="v">{{ row?.topic?.title || '—' }}</div></div>
        <div class="kv"><div class="k">来源</div><div class="v">{{ sourceLabel(row?.topic?.topic_source) }}</div></div>
        <div class="kv"><div class="k">所属学年</div><div class="v">{{ yearText }}</div></div>
        <div class="kv"><div class="k">提交时间</div><div class="v">{{ formatDateTime(row?.assigned_at) }}</div></div>
        <div class="kv-stack">
          <div class="k">题目描述</div>
          <div class="v rounded-[10px] border border-gray-200 bg-gray-50 p-3.5 text-[14px] leading-[1.75] text-gray-700">
            {{ row?.topic?.description || '暂无描述' }}
          </div>
        </div>

        <div class="mb-3 mt-6 text-[13px] font-semibold text-gray-900">流程阶段进度</div>
        <StageProgress :steps="steps" variant="full" />
      </div>

      <div class="flex border-t border-gray-200 p-5">
        <button
          class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
          @click="emit('close')"
        >
          关闭
        </button>
      </div>
    </SheetContent>
  </Sheet>
</template>
