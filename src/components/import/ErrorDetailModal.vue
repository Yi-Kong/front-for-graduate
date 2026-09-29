<script setup>
// 导入错误明细弹窗（复用真实接口 GET /api/imports/:pk/errors/ 的数据）。
// 纯展示组件：open 控制显隐，errors 为逐行错误数组 [{ row, no, name, message }]。
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '当次导入错误明细' },
  noLabel: { type: String, default: '工号/学号' },
  errors: { type: Array, default: () => [] },
})
const emit = defineEmits(['close'])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
    @click.self="emit('close')"
  >
    <div class="flex max-h-[calc(100vh-64px)] w-[720px] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 class="text-[17px] font-semibold text-gray-900">{{ title }}</h3>
        <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="overflow-auto px-5 py-4">
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left text-[12.5px] font-semibold text-gray-500">
              <th class="px-3 py-2" style="width: 12%">行号</th>
              <th class="px-3 py-2" style="width: 22%">{{ noLabel }}</th>
              <th class="px-3 py-2" style="width: 18%">姓名</th>
              <th class="px-3 py-2" style="width: 48%">错误信息</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in errors" :key="e.row" class="border-t border-gray-100 bg-[#fef2f2]">
              <td class="px-3 py-2.5 font-mono text-[13px] text-gray-700">{{ e.row }}</td>
              <td class="px-3 py-2.5 font-mono text-[13px] text-gray-700">{{ e.no }}</td>
              <td class="px-3 py-2.5 text-[14px] text-gray-800">{{ e.name }}</td>
              <td class="px-3 py-2.5 text-[13px] text-[#b91c1c]">{{ e.message }}</td>
            </tr>
            <tr v-if="!errors.length">
              <td colspan="4" class="px-3 py-8 text-center text-[13.5px] text-gray-400">无错误记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
        <button class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50" @click="emit('close')">关闭</button>
        <button class="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px" @click="emit('close')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          下载错误明细
        </button>
      </div>
    </div>
  </div>
</template>
