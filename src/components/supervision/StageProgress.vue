<script setup>
// 流程阶段进度条（我的指导情况复用）。
// props:
//   steps   —— [{ name, done, doneText?, todoText? }]，由 utils/supervision.js 的 buildStageSteps 生成
//   variant —— 'mini'（列表内横向迷你）/ 'full'（抽屉内纵向完整时间线）
const props = defineProps({
  steps: { type: Array, default: () => [] },
  variant: { type: String, default: 'mini' },
})
</script>

<template>
  <!-- 横向迷你（列表用） -->
  <div v-if="variant === 'mini'" class="flex flex-wrap items-center gap-y-1">
    <template v-for="(s, i) in steps" :key="s.name">
      <span
        class="flex items-center gap-1 text-[11.5px]"
        :class="s.done ? 'font-semibold text-green-700' : 'text-gray-400'"
      >
        <span
          class="h-2.5 w-2.5 rounded-full border-2"
          :class="s.done ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-gray-200'"
        ></span>
        {{ s.name }}
      </span>
      <span v-if="i < steps.length - 1" class="mx-1 h-px w-3 bg-gray-200"></span>
    </template>
  </div>

  <!-- 纵向完整（抽屉用） -->
  <div v-else class="flex flex-col">
    <div v-for="(s, i) in steps" :key="s.name" class="flex gap-3">
      <div class="flex flex-col items-center">
        <span
          class="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 text-[12px] text-white"
          :class="s.done ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-gray-200'"
        >
          <svg v-if="s.done" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5 10 17l9-10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span v-if="i < steps.length - 1" class="my-0.5 w-0.5 flex-1 bg-gray-200" style="min-height: 18px"></span>
      </div>
      <div class="pb-[18px]" :class="s.done ? 'text-green-700' : ''">
        <div class="text-[14px] font-semibold" :class="s.done ? 'text-green-700' : 'text-gray-900'">{{ s.name }}</div>
        <div class="mt-0.5 text-[12px]" :class="s.done ? 'text-green-600' : 'text-gray-400'">
          {{ s.done ? s.doneText || '已完成' : s.todoText || '未开始' }}
        </div>
      </div>
    </div>
  </div>
</template>
