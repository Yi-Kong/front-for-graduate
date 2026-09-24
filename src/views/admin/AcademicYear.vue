<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  activateAcademicYear,
  deleteAcademicYear,
} from '@/api/academic'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import YearFormDialog from '@/components/admin/YearFormDialog.vue'

const qc = useQueryClient()

const { data: years, isLoading, isError, error } = useQuery({
  queryKey: ['academic-years', 'list'],
  queryFn: getAcademicYears,
})
// 兼容后端可能的分页包装 {results,count} 或直接数组
const list = computed(() =>
  Array.isArray(years.value) ? years.value : years.value?.results || [],
)

// 任一数据变更后，刷新列表 + 工作台 overview（顶栏「当前届次」徽标随之联动）
function invalidate() {
  qc.invalidateQueries({ queryKey: ['academic-years', 'list'] })
  qc.invalidateQueries({ queryKey: ['home', 'overview'] })
}

// 新增 / 编辑
const formOpen = ref(false)
const formMode = ref('create')
const editing = ref(null)
function openCreate() {
  formMode.value = 'create'
  editing.value = null
  formOpen.value = true
}
function openEdit(item) {
  formMode.value = 'edit'
  editing.value = item
  formOpen.value = true
}
const saveMutation = useMutation({
  mutationFn: (payload) =>
    formMode.value === 'edit' && editing.value
      ? updateAcademicYear(editing.value.id, payload)
      : createAcademicYear(payload),
  onSuccess: () => {
    formOpen.value = false
    invalidate()
  },
})

// 设为当前
const activateMutation = useMutation({
  mutationFn: (id) => activateAcademicYear(id),
  onSuccess: invalidate,
})

// 删除（二次确认）
const confirmOpen = ref(false)
const deleting = ref(null)
function askDelete(item) {
  deleting.value = item
  confirmOpen.value = true
}
const deleteMutation = useMutation({
  mutationFn: (id) => deleteAcademicYear(id),
  onSuccess: () => {
    confirmOpen.value = false
    invalidate()
  },
})

function onFormSubmit(payload) {
  saveMutation.mutate(payload)
}
function onConfirmDelete() {
  if (deleting.value) deleteMutation.mutate(deleting.value.id)
}

function yearBadge(name) {
  return String(name).replace(/\D/g, '').slice(-2) || String(name).slice(0, 2)
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">届次管理</h1>
        <p class="mt-1.5 max-w-[720px] text-[13.5px] leading-[1.6] text-gray-500">
          维护毕业设计届次（如「2026 届」）。将某一届次设为「当前届次」后，全系统数据（题目、选题、指导关系、操作日志等）均按该届次过滤。
        </p>
      </div>
      <button
        class="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px"
        @click="openCreate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        新增届次
      </button>
    </div>

    <!-- 加载 / 错误 / 空态 -->
    <div v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">
      加载中…
    </div>
    <div v-else-if="isError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">
      加载失败：{{ error?.message }}
    </div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center text-[13.5px] text-gray-500">
      暂无届次，点击右上角「新增届次」创建。
    </div>

    <!-- 列表 -->
    <div v-else class="card-wrap overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left text-[12.5px] font-semibold text-gray-500">
            <th class="whitespace-nowrap px-5 py-3" style="width: 24%">届次</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 16%">学年范围</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 16%">创建时间</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 14%">状态</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 30%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="y in list"
            :key="y.id"
            class="border-t border-gray-100 transition hover:bg-gray-50"
            :class="y.is_current ? 'bg-[#fdecee] hover:bg-[#fbe3e6]' : ''"
          >
            <td data-label="届次" class="px-5 py-3.5">
              <div class="year-cell">
                <div class="flex items-center gap-2.5">
                  <span class="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-[#C0202E] text-[13px] font-bold text-white">{{ yearBadge(y.name) }}</span>
                  <span class="font-semibold text-gray-900">{{ y.name }}</span>
                </div>
                <div class="mt-0.5 text-[12.5px] text-gray-400">{{ y.is_current ? '本届毕业设计正在推进中' : '已结束' }}</div>
              </div>
            </td>
            <td data-label="学年范围" class="px-5 py-3.5 text-[14px] text-gray-700">{{ y.start_year }} – {{ y.end_year }}</td>
            <td data-label="创建时间" class="px-5 py-3.5 text-[14px] text-gray-700">{{ y.created_at }}</td>
            <td data-label="状态" class="px-5 py-3.5">
              <span v-if="y.is_current" class="inline-flex items-center rounded-full border border-[#f6d3d7] bg-[#fdecee] px-2.5 py-1 text-[12px] font-semibold text-[#8F1822]">当前届次</span>
              <span v-else class="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-[12px] font-semibold text-gray-500">历史届次</span>
            </td>
            <td data-label="操作" class="px-5 py-3.5">
              <div class="acts flex flex-wrap items-center gap-1.5">
                <button
                  v-if="!y.is_current"
                  class="act act-primary"
                  :disabled="activateMutation.isPending"
                  @click="activateMutation.mutate(y.id)"
                >
                  设为当前
                </button>
                <button class="act" @click="openEdit(y)">编辑</button>
                <button
                  class="act act-danger"
                  :disabled="y.is_current || deleteMutation.isPending"
                  :title="y.is_current ? '当前激活届次不可删除' : ''"
                  @click="askDelete(y)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <YearFormDialog
      :open="formOpen"
      :mode="formMode"
      :initial="editing"
      :loading="saveMutation.isPending"
      @close="formOpen = false"
      @submit="onFormSubmit"
    />
    <ConfirmDialog
      :open="confirmOpen"
      title="删除届次"
      :message="deleting ? `确定删除「${deleting.name}」？删除后不可恢复。` : ''"
      confirm-text="删除"
      :loading="deleteMutation.isPending"
      @close="confirmOpen = false"
      @confirm="onConfirmDelete"
    />
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
.act-danger {
  color: #dc2626;
  border-color: #fecaca;
}
.act-danger:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
}

/* 超窄屏（≤560px）：表格转为卡片列表，避免横向滚动 */
@media (max-width: 560px) {
  .card-wrap {
    border: none;
    background: transparent;
    overflow: visible;
  }
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
  tr.bg-\[\#fdecee\] {
    background: #fdecee;
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
  .year-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }
  .acts {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
