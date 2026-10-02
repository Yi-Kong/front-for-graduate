<script setup>
import { reactive } from 'vue'
import { rangeToDates } from '@/utils/operationLog'

const emit = defineEmits(['search'])

const filters = reactive({ operator: '', action: '', range: '', keyword: '' })

function onSearch() {
  emit('search', {
    operator: filters.operator.trim(),
    action: filters.action,
    search: filters.keyword.trim(),
    ...rangeToDates(filters.range),
  })
}
function onReset() {
  filters.operator = ''
  filters.action = ''
  filters.range = ''
  filters.keyword = ''
  emit('search', {})
}
</script>

<template>
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
</template>
