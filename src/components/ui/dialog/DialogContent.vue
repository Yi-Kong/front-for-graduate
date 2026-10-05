<script setup>
import { DialogPortal, DialogContent, DialogTitle, DialogDescription } from 'reka-ui'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import DialogOverlay from './DialogOverlay.vue'
import DialogClose from './DialogClose.vue'

const props = defineProps({
  class: { type: String, default: '' },
  // 关闭按钮：默认显示右上角 X；弹窗已在父级处理 header 时可关闭
  showClose: { type: Boolean, default: true },
})
const emit = defineEmits(['close'])
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      :class="cn('fixed left-1/2 top-1/2 z-[81] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', props.class)"
      :aria-describedby="undefined"
      @escape-key-down="emit('close')"
    >
      <slot />
      <DialogClose
        v-if="showClose"
        class="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 opacity-80 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">关闭</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
