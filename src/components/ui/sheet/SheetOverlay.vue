<script setup>
import { DialogOverlay } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <!-- 层级约定（勿改）：侧边栏 z-40 < 遮罩 z-55 < 抽屉本体 z-60 < 弹窗 z-80 < Popover z-100。
       此前遮罩写 z-80 高于本体 z-55，遮罩盖住抽屉导致抽屉内所有按钮点不动 -->
  <DialogOverlay
    :class="cn('fixed inset-0 z-[55] bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', props.class)"
  >
    <slot />
  </DialogOverlay>
</template>
