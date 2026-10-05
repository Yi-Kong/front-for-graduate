<script setup>
// 题目列表公共表格（#13 浏览 / #11 我的申报 / #8 审核 复用）
// props: topics 行数据（已含 yearName 等映射字段）；loading 加载态
// emits: view（点击题目名或默认「查看详情」）
// 操作列默认渲染「查看详情」，可通过 #actions 插槽按页面覆盖（如审核页的通过/退回）
// 徽章统一改用公共 Badge / StatusBadge；行内按钮用全局 .act；窄屏卡片化用全局 .card-wrap
import { sourceLabel } from '@/utils/topics'
import Badge from '@/components/common/Badge.vue'
import StatusBadge from '@/components/topics/StatusBadge.vue'

defineProps({
  topics: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['view'])

// 题目来源配色：管理员录入用紫色，教师申报用蓝色（配色统一由 Badge 维护）
function sourceVariant(s) {
  return s === 'ADMIN' ? 'purple' : 'blue'
}
// 指导教师/申报人后端仅返回整型 ID（缺口：后端未展开姓名），先以「教师 #id」展示
function teacherText(id) {
  return id != null ? `教师 #${id}` : '—'
}
</script>

<template>
  <div class="card-wrap overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <table class="w-full border-collapse">
      <thead>
        <tr class="bg-gray-50 text-left text-[12.5px] font-semibold text-gray-500">
          <th class="px-5 py-3" style="width: 34%">题目名称</th>
          <th class="px-5 py-3" style="width: 14%">指导教师</th>
          <th class="px-5 py-3" style="width: 14%">题目来源</th>
          <th class="px-5 py-3" style="width: 14%">所属学年</th>
          <th class="px-5 py-3" style="width: 12%">状态</th>
          <th class="px-5 py-3" style="width: 12%">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="t in topics"
          :key="t.id"
          class="border-t border-gray-100 transition hover:bg-gray-50"
        >
          <td data-label="题目名称" class="px-5 py-3.5">
            <button
              class="text-left font-semibold text-gray-900 transition hover:text-[#C0202E]"
              @click="emit('view', t)"
            >
              {{ t.title }}
            </button>
            <div class="mt-0.5 text-[12.5px] text-gray-400">ID {{ t.id }}</div>
          </td>
          <td data-label="指导教师" class="px-5 py-3.5 text-[14px] text-gray-700">
            {{ t.supervisorName || teacherText(t.supervisor) }}
          </td>
          <td data-label="题目来源" class="px-5 py-3.5">
            <Badge :variant="sourceVariant(t.topic_source)">
              {{ sourceLabel(t.topic_source) }}
            </Badge>
          </td>
          <td data-label="所属学年" class="px-5 py-3.5 text-[14px] text-gray-700">
            {{ t.yearName || `届次#${t.academic_year}` }}
          </td>
          <td data-label="状态" class="px-5 py-3.5">
            <StatusBadge :status="t.status" />
          </td>
          <td data-label="操作" class="px-5 py-3.5">
            <div class="acts flex items-center gap-1.5">
              <slot name="actions" :topic="t">
                <button class="act act-primary" @click="emit('view', t)">查看详情</button>
              </slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
