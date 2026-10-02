<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getOperationLogs } from '@/api/audit'

const PAGE_SIZE = 20

// 操作类型 → 展示文案 + pill 配色（对齐文档大写枚举）
const ACTION_META = {
  LOGIN: { label: '登录', pill: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' },
  CREATE: { label: '创建', pill: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' },
  UPDATE: { label: '更新', pill: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' },
  DELETE: { label: '删除', pill: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' },
  IMPORT: { label: '导入', pill: 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]' },
  REVIEW: { label: '审核', pill: 'bg-[#ecfeff] text-[#0e7490] border-[#a5f3fc]' },
  EXPORT: { label: '导出', pill: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' },
  SELECTION: { label: '选题', pill: 'bg-[#fdf4ff] text-[#a21caf] border-[#f5d0fe]' },
}
function actionMeta(a) {
  return ACTION_META[a] || { label: a, pill: 'bg-gray-100 text-gray-500 border-gray-200' }
}
// 详情列展示 before_data / after_data 的 JSON 快照
function logSnapshot(log) {
  const d = log?.after_data || log?.before_data
  return d ? JSON.stringify(d) : '—'
}

// —— 筛选 ——
const filters = reactive({ operator: '', action: '', range: '', keyword: '' })
const applied = ref({})
const page = ref(1)

function pad(n) {
  return String(n).padStart(2, '0')
}
function rangeToDates(range) {
  if (!range) return {}
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 0
  if (!days) return {}
  const to = new Date()
  const from = new Date(to.getTime() - days * 86400000)
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return { date_from: fmt(from), date_to: fmt(to) }
}
function onSearch() {
  page.value = 1
  applied.value = {
    operator: filters.operator.trim(),
    action: filters.action,
    search: filters.keyword.trim(),
    ...rangeToDates(filters.range),
  }
}
function onReset() {
  filters.operator = ''
  filters.action = ''
  filters.range = ''
  filters.keyword = ''
  page.value = 1
  applied.value = {}
}

// —— 列表查询（DRF 分页结构 {count,next,previous,results}）——
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['operation-logs', 'list', applied, page],
  queryFn: () => getOperationLogs({ ...applied.value, page: page.value }),
})
const list = computed(() => data.value?.results || [])
const total = computed(() => data.value?.count || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

// 页码窗口（最多展示 7 个按钮）
const pageNumbers = computed(() => {
  const tp = totalPages.value
  const cur = page.value
  let s = Math.max(1, cur - 3)
  let e = Math.min(tp, s + 6)
  s = Math.max(1, e - 6)
  const arr = []
  for (let i = s; i <= e; i++) arr.push(i)
  return arr
})

// —— 详情抽屉 ——
const drawerOpen = ref(false)
const selected = ref(null)
function openDetail(log) {
  selected.value = log
  drawerOpen.value = true
}
function closeDetail() {
  drawerOpen.value = false
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="mb-5">
      <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">操作日志</h1>
      <p class="mt-1.5 max-w-[760px] text-[13.5px] leading-[1.6] text-gray-500">
        记录全系统关键操作（登录、届次变更、题目审核、师生导入等）的留痕，供管理员审计追溯。仅管理员可见。
      </p>
    </div>

    <!-- 筛选工具栏 -->
    <div class="mb-4 flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-600">操作人</label>
        <input v-model="filters.operator" class="h-10 w-[160px] rounded-[10px] border border-gray-200 px-3 text-[13.5px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10" placeholder="姓名 / 账号" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-600">操作类型</label>
        <select v-model="filters.action" class="h-10 w-[150px] rounded-[10px] border border-gray-200 bg-white px-3 text-[13.5px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10">
          <option value="">全部类型</option>
          <option value="LOGIN">登录</option>
          <option value="CREATE">创建</option>
          <option value="UPDATE">更新 / 编辑</option>
          <option value="DELETE">删除</option>
          <option value="IMPORT">导入</option>
          <option value="REVIEW">审核</option>
          <option value="EXPORT">导出</option>
          <option value="SELECTION">选题</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-[12.5px] font-semibold text-gray-600">时间范围</label>
        <select v-model="filters.range" class="h-10 w-[150px] rounded-[10px] border border-gray-200 bg-white px-3 text-[13.5px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10">
          <option value="">全部时间</option>
          <option value="7d">近 7 天</option>
          <option value="30d">近 30 天</option>
        </select>
      </div>
      <div class="flex flex-1 flex-col gap-1.5" style="min-width: 200px">
        <label class="text-[12.5px] font-semibold text-gray-600">关键词</label>
        <input v-model="filters.keyword" class="h-10 w-full rounded-[10px] border border-gray-200 px-3 text-[13.5px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10" placeholder="搜索操作对象 / 详情" />
      </div>
      <div class="flex gap-2.5">
        <button class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50" @click="onReset">重置</button>
        <button class="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px" @click="onSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          查询
        </button>
      </div>
    </div>

    <!-- 加载 / 错误 / 空态 -->
    <div v-if="isLoading" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-gray-400">加载中…</div>
    <div v-else-if="isError" class="rounded-2xl border border-gray-200 bg-white p-12 text-center text-[13.5px] text-[#C0202E]">加载失败：{{ error?.message }}</div>
    <div v-else-if="!list.length" class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center text-[13.5px] text-gray-500">没有符合条件的操作日志。</div>

    <!-- 列表 -->
    <div v-else class="card-wrap overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left text-[12.5px] font-semibold text-gray-500">
            <th class="whitespace-nowrap px-5 py-3" style="width: 18%">操作时间</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 14%">操作人</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 12%">类型</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 16%">操作对象</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 28%">详情</th>
            <th class="whitespace-nowrap px-5 py-3" style="width: 12%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in list" :key="log.id" class="border-t border-gray-100 transition hover:bg-gray-50">
            <td data-label="操作时间" class="px-5 py-3.5">
              <div class="font-mono text-[13.5px] text-gray-800">{{ log.created_at }}</div>
              <div class="mt-0.5 text-[12px] text-gray-400">IP {{ log.ip_address }}</div>
            </td>
            <td data-label="操作人" class="px-5 py-3.5">
              <div class="text-[14px] text-gray-800">{{ log.operator_name }}</div>
            </td>
            <td data-label="类型" class="px-5 py-3.5">
              <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold" :class="actionMeta(log.operation_type).pill">{{ actionMeta(log.operation_type).label }}</span>
            </td>
            <td data-label="操作对象" class="px-5 py-3.5 text-[14px] text-gray-700">
              <template v-if="log.target_type && log.target_type !== '—'">{{ log.target_type }} / {{ log.target_id }}</template>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td data-label="详情" class="px-5 py-3.5 text-[13.5px] text-gray-600">
              <span class="block max-w-[320px] truncate font-mono text-[12.5px]" :title="logSnapshot(log)">{{ logSnapshot(log) }}</span>
            </td>
            <td data-label="操作" class="px-5 py-3.5">
              <button class="act act-primary" @click="openDetail(log)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="!isLoading && !isError && list.length" class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div class="text-[13px] text-gray-500">共 {{ total }} 条 · 每页 {{ PAGE_SIZE }} 条</div>
      <div class="flex items-center gap-1.5">
        <button class="pg" :disabled="page <= 1" @click="page--">上一页</button>
        <button v-for="p in pageNumbers" :key="p" class="pg" :class="p === page ? 'pg-active' : ''" @click="page = p">{{ p }}</button>
        <button class="pg" :disabled="page >= totalPages" @click="page++">下一页</button>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <div v-if="drawerOpen" class="fixed inset-0 z-[80]">
      <div class="absolute inset-0 bg-black/40" @click="closeDetail"></div>
      <div class="absolute right-0 top-0 flex h-full w-[440px] max-w-full flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,.18)]">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h3 class="text-[17px] font-bold">操作日志详情</h3>
          <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200" @click="closeDetail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
        </div>
        <div v-if="selected" class="flex-1 overflow-y-auto px-5 py-4">
          <div class="kv"><div class="k">操作人</div><div class="v">{{ selected.operator_name }}</div></div>
          <div class="kv"><div class="k">操作类型</div><div class="v"><span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold" :class="actionMeta(selected.operation_type).pill">{{ actionMeta(selected.operation_type).label }}</span></div></div>
          <div class="kv"><div class="k">操作对象</div><div class="v">{{ selected.target_type && selected.target_type !== '—' ? selected.target_type + ' / ' + selected.target_id : '—' }}</div></div>
          <div class="kv"><div class="k">变更前</div><div class="v break-all font-mono text-[12.5px]">{{ selected.before_data ? JSON.stringify(selected.before_data) : '—' }}</div></div>
          <div class="kv"><div class="k">变更后</div><div class="v break-all font-mono text-[12.5px]">{{ selected.after_data ? JSON.stringify(selected.after_data) : '—' }}</div></div>
          <div class="kv"><div class="k">IP 地址</div><div class="v font-mono">{{ selected.ip_address }}</div></div>
          <div class="kv"><div class="k">操作时间</div><div class="v font-mono">{{ selected.created_at }}</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #c0202e;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.act:hover {
  background: #fdecee;
  border-color: #f6d3d7;
}
.pg {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.pg:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}
.pg:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.pg-active {
  background: #c0202e;
  border-color: #c0202e;
  color: #fff;
}
.kv {
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}
.kv:last-child {
  border-bottom: none;
}
.kv .k {
  margin-bottom: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #6b7280;
}
.kv .v {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
  word-break: break-all;
}

/* 超窄屏（≤560px）：表格转为卡片列表，避免横向滚动 */
@media (max-width: 560px) {
  .card-wrap {
    border: none;
    background: transparent;
    overflow: visible;
  }
  table, thead, tbody, tr, td {
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
}
</style>
