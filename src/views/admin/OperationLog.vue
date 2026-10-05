<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { getOperationLogs } from '@/api/audit'
import { actionMeta, logSnapshot } from '@/utils/operationLog'
import OperationLogFilters from '@/components/admin/OperationLogFilters.vue'
import OperationLogDetailDrawer from '@/components/admin/OperationLogDetailDrawer.vue'
import Pagination from '@/components/common/Pagination.vue'

const PAGE_SIZE = 20

// —— 列表查询（DRF 分页结构 {count,next,previous,results}）——
const applied = ref({})
const page = ref(1)

function onSearch(payload) {
  page.value = 1
  applied.value = payload
}

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
    <OperationLogFilters @search="onSearch" />

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
    <Pagination
      v-if="!isLoading && !isError && list.length"
      :page="page"
      :total-pages="totalPages"
      :total="total"
      :page-numbers="pageNumbers"
      @update:page="page = $event"
    >
      <template #summary>共 {{ total }} 条 · 每页 {{ PAGE_SIZE }} 条</template>
    </Pagination>

    <!-- 详情抽屉 -->
    <OperationLogDetailDrawer v-if="drawerOpen" :log="selected" @close="closeDetail" />
  </div>
</template>
