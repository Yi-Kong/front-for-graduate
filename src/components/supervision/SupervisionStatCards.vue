<script setup>
// 指导概览统计 4 卡（我的指导情况页头）。
// props: stats —— 统计对象（可空，接口缺失/加载中时为 null，四卡降级「—」）；loading —— 加载态
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const total = computed(() => props.stats?.total ?? null)
const selected = computed(() => props.stats?.selected ?? null)
const unselected = computed(() => props.stats?.unselected ?? null)
const stages = computed(() => props.stats?.stage_distribution ?? null)

function dash(v) {
  return v == null ? '—' : v
}
</script>

<template>
  <div class="grid grid-cols-2 gap-3.5 md:grid-cols-4">
    <!-- 指导总人数 -->
    <div class="rounded-2xl border border-gray-200 border-l-4 border-l-blue-600 bg-white p-4">
      <div class="text-[12.5px] text-gray-500">指导总人数</div>
      <div class="mt-1.5 text-[26px] font-bold leading-none text-blue-600">{{ dash(total) }}</div>
      <div class="mt-1.5 text-[12px] text-gray-400">本届分配学生</div>
    </div>
    <!-- 已选题 -->
    <div class="rounded-2xl border border-gray-200 border-l-4 border-l-green-600 bg-white p-4">
      <div class="text-[12.5px] text-gray-500">已选题</div>
      <div class="mt-1.5 text-[26px] font-bold leading-none text-green-600">{{ dash(selected) }}</div>
      <div class="mt-1.5 text-[12px] text-gray-400">完成选题</div>
    </div>
    <!-- 待选题 -->
    <div class="rounded-2xl border border-gray-200 border-l-4 border-l-amber-500 bg-white p-4">
      <div class="text-[12.5px] text-gray-500">待选题</div>
      <div class="mt-1.5 text-[26px] font-bold leading-none text-amber-600">{{ dash(unselected) }}</div>
      <div class="mt-1.5 text-[12px] text-gray-400">轮次关闭后仍为空</div>
    </div>
    <!-- 流程阶段分布 -->
    <div class="rounded-2xl border border-gray-200 border-l-4 border-l-gray-400 bg-white p-4">
      <div class="text-[12.5px] text-gray-500">流程阶段分布</div>
      <div v-if="stages" class="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-gray-700">
        开题 <span class="text-gray-900">{{ stages.proposal }}</span> · 中期 <span class="text-gray-900">{{ stages.midterm }}</span><br />
        答辩 <span class="text-gray-900">{{ stages.defense }}</span> · 成绩 <span class="text-gray-900">{{ stages.grade }}</span>
      </div>
      <div v-else class="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-gray-400">开题 — · 中期 —<br />答辩 — · 成绩 —</div>
      <div class="mt-1.5 text-[12px] text-gray-400">后端未实现</div>
    </div>
  </div>
</template>
