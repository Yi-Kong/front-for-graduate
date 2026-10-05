<script setup>
import Badge from '@/components/common/Badge.vue'
import { roundStatusLabel, roundStatusVariant, roundWindowText } from '@/utils/selection'

const props = defineProps({
  round: { type: Object, default: null },
  known: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-3.5 rounded-2xl border bg-white p-3.5"
    :class="known ? 'border-gray-200' : 'border-dashed border-gray-300 bg-gray-50'"
  >
    <div
      class="flex h-[42px] w-[42px] shrink-0 flex-col items-center justify-center rounded-[10px] text-white"
      :class="
        !round
          ? 'bg-gray-400'
          : round.status === 'CLOSED'
            ? 'bg-[#4338ca]'
            : round.status === 'PENDING'
              ? 'bg-[#b45309]'
              : 'bg-[#C0202E]'
      "
    >
      <small class="text-[9px] font-semibold opacity-85">第</small>
      <span class="text-[13px] font-bold leading-[1.1]">{{ round ? round.round_no : '?' }}</span>
      <small class="text-[9px] font-semibold opacity-85">轮</small>
    </div>
    <div class="min-w-[220px] flex-1">
      <div class="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
        <span>{{ round ? `第 ${round.round_no} 轮选题` : '选题轮次' }}</span>
        <Badge v-if="round" :variant="roundStatusVariant(round.status)">{{ roundStatusLabel(round.status) }}</Badge>
        <Badge v-else variant="gray">状态未知</Badge>
      </div>
      <div class="mt-1 text-[12.5px] text-gray-500">
        <span v-if="loading">加载中…</span>
        <span v-else-if="!known">选题轮次状态暂不可知，可尝试选择，最终以系统返回为准。</span>
        <span v-else>{{ roundWindowText(round) }}</span>
      </div>
    </div>
  </div>
</template>
