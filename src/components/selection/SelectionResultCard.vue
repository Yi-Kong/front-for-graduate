<script setup>
import { computed } from 'vue'
import Badge from '@/components/common/Badge.vue'
import { sourceLabel } from '@/utils/topics'

const props = defineProps({
  result: { type: Object, default: null }, // { topic_id, topic_title }
  topic: { type: Object, default: null }, // GET /api/topics/{id}/ 补全
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  canChange: { type: Boolean, default: true },
})
const emit = defineEmits(['browse', 'change', 'view', 'retry'])

const hasChoice = computed(() => props.result && props.result.topic_id != null)
const teacherText = (id) => (id != null ? `教师 #${id}` : '—')
const yearText = (t) => (t?.yearName || (t?.academic_year != null ? `届次 #${t.academic_year}` : '—'))
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-5">
    <div class="mb-3.5 flex items-center justify-between">
      <h3 class="text-[15px] font-semibold">我的选题结果</h3>
      <span class="text-[12.5px] text-gray-400">selection-result 仅题名，详情由题目接口补全</span>
    </div>

    <div v-if="loading" class="py-6 text-center text-[13.5px] text-gray-400">加载中…</div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
    >
      加载失败：{{ error }}
      <button class="ml-2 underline" @click="emit('retry')">重试</button>
    </div>

    <div v-else-if="!hasChoice" class="flex items-center gap-3.5">
      <div class="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a1 1 0 0 1 1-1h9l5 5v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" stroke="currentColor" stroke-width="1.7"/><path d="M14 4v5h5" stroke="currentColor" stroke-width="1.7"/></svg>
      </div>
      <div>
        <h4 class="text-[15px] font-bold">你还没有选题</h4>
        <p class="mt-1 text-[13px] text-gray-500">可在下方列表中选择已发布题目，或前往「题目浏览」查看全部。</p>
        <button
          class="mt-2.5 inline-flex h-10 items-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px"
          @click="emit('browse')"
        >
          去题目浏览
        </button>
      </div>
    </div>

    <div v-else class="flex flex-wrap items-start gap-4">
      <div class="min-w-[260px] flex-1">
        <div class="text-[17px] font-bold leading-[1.5]">{{ result.topic_title }}</div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="blue">已选定</Badge>
          <Badge v-if="topic" :variant="topic.topic_source === 'ADMIN' ? 'purple' : 'blue'">{{ sourceLabel(topic.topic_source) }}</Badge>
        </div>
        <div class="mt-3">
          <div class="kv"><div class="k">指导教师</div><div class="v">{{ teacherText(topic?.supervisor) }}</div></div>
          <div class="kv"><div class="k">所属学年</div><div class="v">{{ yearText(topic) }}</div></div>
          <div class="kv"><div class="k">题目来源</div><div class="v">{{ topic ? sourceLabel(topic.topic_source) : '—' }}</div></div>
        </div>
      </div>
      <div class="flex w-[150px] shrink-0 flex-col gap-2.5">
        <button
          class="inline-flex h-11 items-center justify-center rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
          @click="emit('view')"
        >
          查看详情
        </button>
        <button
          class="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          :disabled="!canChange"
          @click="emit('change')"
        >
          改选题目
        </button>
      </div>
    </div>
  </div>
</template>
