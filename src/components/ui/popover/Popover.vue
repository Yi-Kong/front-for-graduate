<script setup>
import { PopoverRoot } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])
</script>

<template>
  <PopoverRoot
    :open="open"
    :default-open="defaultOpen"
    @update:open="(e) => emit('update:open', e)"
  >
    <slot />
  </PopoverRoot>
</template>
