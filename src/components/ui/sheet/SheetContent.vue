<script setup>
import { DialogPortal, DialogContent, DialogTitle, DialogDescription } from 'reka-ui'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import SheetOverlay from './SheetOverlay.vue'
import SheetClose from './SheetClose.vue'

const props = defineProps({
  class: { type: String, default: '' },
  side: { type: String, default: 'right' }, // 'right' | 'left' | 'top' | 'bottom'
  showClose: { type: Boolean, default: true },
})
</script>

<template>
  <DialogPortal>
    <SheetOverlay />
    <!-- z-[60]：必须高于 SheetOverlay 的 z-[55]（否则被遮罩盖住、抽屉内按钮点不动），
         同时低于弹窗 z-[80] 与 Popover z-[100]，保证抽屉里弹出的确认框仍在最上层 -->
    <DialogContent
      :aria-describedby="undefined"
      :class="cn(
        'fixed z-[60] gap-4 bg-white shadow-[-12px_0_40px_rgba(0,0,0,.18)] transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-300',
        side === 'right' && 'inset-y-0 right-0 h-full w-[480px] max-w-[calc(100vw-32px)] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        side === 'left' && 'inset-y-0 left-0 h-full w-[480px] max-w-[calc(100vw-32px)] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        side === 'top' && 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        side === 'bottom' && 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        props.class,
      )"
    >
      <slot />
      <SheetClose
        v-if="showClose"
        class="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 opacity-80 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">关闭</span>
      </SheetClose>
    </DialogContent>
  </DialogPortal>
</template>
