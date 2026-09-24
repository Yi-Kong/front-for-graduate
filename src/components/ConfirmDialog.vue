<script setup>
// 通用确认对话框（破坏性操作二次确认，如删除届次）。
// 各页可复用：open 控制显隐，confirm-text 自定义确认按钮文案。
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
    @click.self="emit('close')"
  >
    <div class="w-[400px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div class="px-5 py-4">
        <h3 class="text-[17px] font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="message" class="mt-2 text-[13.5px] leading-[1.6] text-gray-500">{{ message }}</p>
      </div>
      <div class="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
        <button
          class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          @click="emit('close')"
          :disabled="loading"
        >
          {{ cancelText }}
        </button>
        <button
          class="h-10 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          @click="emit('confirm')"
          :disabled="loading"
        >
          {{ loading ? '处理中…' : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
