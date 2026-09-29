<script setup>
import { ref } from 'vue'

// 文件上传拖拽区。受控组件：v-model:file 绑定选中的 File 对象。
// 仅负责选择文件并向上 emit，真正的校验/解析由父页面调用接口完成。
const props = defineProps({
  accept: { type: String, default: '.xlsx,.xls' },
  file: { type: Object, default: null },
  maxSizeMB: { type: Number, default: 5 },
})
const emit = defineEmits(['update:file'])

const inputRef = ref(null)
const dragging = ref(false)

function pick() {
  inputRef.value?.click()
}
function onInput(e) {
  const f = e.target.files?.[0]
  if (f) emit('update:file', f)
  e.target.value = ''
}
function onDrop(e) {
  dragging.value = false
  const f = e.dataTransfer.files?.[0]
  if (f) emit('update:file', f)
}
function clear() {
  emit('update:file', null)
}
</script>

<template>
  <div>
    <div
      class="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-gray-300 bg-[#fafbfc] px-5 py-10 text-center transition hover:border-[#C0202E] hover:bg-white"
      :class="dragging ? 'border-[#C0202E] bg-white' : ''"
      @click="pick"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <div class="mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#fdecee] text-[#C0202E]">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 16V4M8 8l4-4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </div>
      <div class="text-[15px] font-semibold text-gray-900">点击或拖拽 Excel 文件到此处</div>
      <div class="mt-1.5 text-[13px] text-gray-400">支持 .xlsx / .xls，单文件不超过 {{ maxSizeMB }}MB（建议先下载模板填写）</div>
      <input ref="inputRef" type="file" :accept="accept" class="hidden" @change="onInput" />
    </div>

    <div v-if="file" class="mt-3 flex items-center justify-between gap-3 rounded-[10px] border border-gray-200 bg-white px-4 py-2.5">
      <div class="flex items-center gap-2.5 text-[13.5px] text-gray-800">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19V5a1 1 0 0 1 1-1h9l5 5v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" stroke="#047857" stroke-width="1.6"/><path d="M14 4v5h5" stroke="#047857" stroke-width="1.6"/></svg>
        <span class="font-medium">{{ file.name }}</span>
        <span class="text-gray-400">· {{ (file.size / 1024).toFixed(1) }} KB</span>
      </div>
      <button class="text-[13px] font-semibold text-gray-500 transition hover:text-[#C0202E]" @click.stop="clear">移除</button>
    </div>
  </div>
</template>
