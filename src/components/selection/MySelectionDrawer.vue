<script setup>
import { computed } from 'vue'
import Sheet from '@/components/ui/sheet/Sheet.vue'
import SheetContent from '@/components/ui/sheet/SheetContent.vue'
import SheetTitle from '@/components/ui/sheet/SheetTitle.vue'
import SheetClose from '@/components/ui/sheet/SheetClose.vue'
import StatusBadge from '@/components/topics/StatusBadge.vue'
import { sourceLabel } from '@/utils/topics'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: { type: Object, default: null },
  selectedTopicId: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'select'])

const isCurrent = computed(
  () => props.topic && props.selectedTopicId != null && Number(props.topic.id) === Number(props.selectedTopicId),
)
const teacherText = (id) => (id != null ? `教师 #${id}` : '—')
const yearText = (t) => (t?.yearName || (t?.academic_year != null ? `届次 #${t.academic_year}` : '—'))
</script>

<template>
  <Sheet :open="open && !!topic" @update:open="(v) => { if (!v) emit('close') }">
    <SheetContent side="right" :show-close="false">
      <div class="flex items-start justify-between gap-3 border-b border-gray-200 p-5">
        <div>
          <SheetTitle class="text-[18px] font-bold leading-[1.45] text-gray-900">{{ topic?.title }}</SheetTitle>
          <div class="mt-1.5 text-[12.5px] text-gray-400">{{ sourceLabel(topic?.topic_source) }} · {{ yearText(topic) }} · ID {{ topic?.id }}</div>
        </div>
        <SheetClose class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-gray-200">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </SheetClose>
      </div>
      <div class="flex-1 overflow-y-auto p-5">
        <div class="mb-4 inline-flex items-center gap-2">
          <span class="text-[12.5px] font-semibold text-gray-500">当前状态</span>
          <StatusBadge :status="topic?.status" />
        </div>
        <div class="kv"><div class="k">指导教师</div><div class="v">{{ teacherText(topic?.supervisor) }}</div></div>
        <div class="kv"><div class="k">题目来源</div><div class="v">{{ sourceLabel(topic?.topic_source) }}</div></div>
        <div class="kv"><div class="k">所属学年</div><div class="v">{{ yearText(topic) }}</div></div>
        <div class="kv" style="flex-direction: column; align-items: stretch">
          <div class="k" style="width: auto; margin-bottom: 4px">题目描述</div>
          <div class="rounded-[10px] border border-gray-200 bg-gray-50 p-3.5 text-[14px] leading-[1.75] text-gray-700">{{ topic?.description || '暂无描述' }}</div>
        </div>
      </div>
      <div class="flex gap-3 border-t border-gray-200 p-5">
        <button
          v-if="isCurrent"
          disabled
          class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] border border-gray-200 bg-gray-50 px-4 text-[14px] font-semibold text-gray-400"
        >
          当前选题
        </button>
        <button
          v-else
          :disabled="disabled"
          class="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          @click="emit('select', topic)"
        >
          {{ selectedTopicId != null ? '改选为此题' : '选择此题' }}
        </button>
      </div>
    </SheetContent>
  </Sheet>
</template>
