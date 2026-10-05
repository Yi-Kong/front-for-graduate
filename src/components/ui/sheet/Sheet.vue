<script setup>
import { DialogRoot, DialogPortal, DialogClose } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])
</script>

<template>
  <DialogRoot
    :open="open"
    :default-open="defaultOpen"
    @update:open="(e) => emit('update:open', e)"
  >
    <slot />
  </DialogRoot>
</template>
