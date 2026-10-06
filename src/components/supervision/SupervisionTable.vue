<script setup>
// 学生指导列表（我的指导情况）。7 列：学生 / 题目 / 来源 / 指导轮次 / 当前阶段 / 状态 / 操作。
// props: rows 行数据（已含 yearName 等映射）；loading / error / emptyText 三态由本组件统一呈现。
// emits: view(row) —— 点击「查看」打开详情抽屉。
import { sourceLabel } from '@/utils/topics'
import { buildStageSteps } from '@/utils/supervision'
import Badge from '@/components/common/Badge.vue'
import StatusBadge from '@/components/topics/StatusBadge.vue'
import StageProgress from '@/components/supervision/StageProgress.vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  emptyText: { type: String, default: '本届暂无分配给你的指导学生。' },
})
const emit = defineEmits(['view'])

function sourceVariant(s) {
  return s === 'ADMIN' ? 'purple' : 'blue'
}
function stepsOf(row) {
  return buildStageSteps(row)
}
</script>

<template>
  <!-- 加载中 -->
  <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">
    加载中…
  </div>
  <!-- 加载失败 -->
  <div v-else-if="error" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">
    {{ error }}
  </div>
  <!-- 空态 -->
  <div v-else-if="!rows.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
    <h3 class="text-[16px] font-bold text-gray-900">暂无指导学生</h3>
    <p class="mx-auto mt-1.5 max-w-[380px] text-[13.5px] leading-[1.6] text-gray-500">{{ emptyText }}</p>
  </div>
  <!-- 列表 -->
  <div v-else class="card-wrap overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-50 text-left text-[12.5px] font-semibold text-gray-500">
          <th class="px-5 py-3" style="width: 16%">学生</th>
          <th class="px-5 py-3" style="width: 24%">题目</th>
          <th class="px-5 py-3" style="width: 11%">来源</th>
          <th class="px-5 py-3" style="width: 10%">指导轮次</th>
          <th class="px-5 py-3" style="width: 23%">当前阶段</th>
          <th class="px-5 py-3" style="width: 10%">状态</th>
          <th class="px-5 py-3" style="width: 6%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in rows"
          :key="r.id"
          class="border-t border-gray-100 transition hover:bg-gray-50"
        >
          <td data-label="学生" class="px-5 py-3.5">
            <div class="text-[14px] font-semibold text-gray-900">{{ r.student?.name || '—' }}</div>
            <div class="mt-0.5 text-[12px] text-gray-400">{{ r.student?.student_no || '' }}</div>
          </td>
          <td data-label="题目" class="px-5 py-3.5">
            <div class="max-w-[300px] truncate font-medium text-gray-900" :title="r.topic?.title">{{ r.topic?.title || '—' }}</div>
          </td>
          <td data-label="来源" class="px-5 py-3.5">
            <Badge :variant="sourceVariant(r.topic?.topic_source)">{{ sourceLabel(r.topic?.topic_source) }}</Badge>
          </td>
          <td data-label="指导轮次" class="px-5 py-3.5 text-[14px] text-gray-700">第 {{ r.selection_round }} 轮</td>
          <td data-label="当前阶段" class="px-5 py-3.5">
            <StageProgress :steps="stepsOf(r)" variant="mini" />
          </td>
          <td data-label="状态" class="px-5 py-3.5">
            <StatusBadge :status="r.topic?.status" />
          </td>
          <td data-label="操作" class="px-5 py-3.5">
            <div class="acts flex items-center gap-1.5">
              <button class="act act-primary" @click="emit('view', r)">查看</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
