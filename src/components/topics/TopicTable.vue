<script setup>
// 题目列表公共表格（#13 浏览 / #11 我的申报 / #8 审核 复用）
// props: topics 行数据（已含 yearName 等映射字段）；loading 加载态
// emits: view（点击题目名或默认「查看详情」）
// 操作列默认渲染「查看详情」，可通过 #actions 插槽按页面覆盖（如审核页的通过/退回）
import { statusLabel, statusVariant, sourceLabel } from '@/utils/topics'

defineProps({
  topics: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['view'])

// 徽章配色（与 utils/topics.js 的 statusVariant 对应）
const BADGE = {
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  gray: 'bg-gray-100 text-gray-600 border border-gray-200',
  purple: 'bg-violet-50 text-violet-700 border border-violet-200',
}
function statusBadge(s) {
  return BADGE[statusVariant(s)] || BADGE.gray
}
function sourceBadge(s) {
  return s === 'ADMIN' ? BADGE.purple : BADGE.blue
}
// 指导教师/申报人后端仅返回整型 ID（缺口：后端未展开姓名），先以「教师 #id」展示
function teacherText(id) {
  return id != null ? `教师 #${id}` : '—'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
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
            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold"
              :class="sourceBadge(t.topic_source)"
            >
              {{ sourceLabel(t.topic_source) }}
            </span>
          </td>
          <td data-label="所属学年" class="px-5 py-3.5 text-[14px] text-gray-700">
            {{ t.yearName || `届次#${t.academic_year}` }}
          </td>
          <td data-label="状态" class="px-5 py-3.5">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold"
              :class="statusBadge(t.status)"
            >
              {{ statusLabel(t.status) }}
            </span>
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

<style scoped>
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.act:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}
.act:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.act-primary {
  color: #c0202e;
  background: #fdecee;
  border-color: #f6d3d7;
}
.act-primary:hover:not(:disabled) {
  background: #fbdde0;
  border-color: #efc2c7;
  color: #8f1822;
}

/* 超窄屏（≤560px）：表格转为卡片列表 */
@media (max-width: 560px) {
  table,
  thead,
  tbody,
  tr,
  td {
    display: block;
    width: 100% !important;
  }
  thead {
    display: none;
  }
  tr {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 4px 14px;
    background: #fff;
  }
  td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 11px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  td:last-child {
    border-bottom: none;
  }
  td::before {
    content: attr(data-label);
    font-size: 12.5px;
    color: #6b7280;
    font-weight: 600;
    flex: none;
  }
  .acts {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
