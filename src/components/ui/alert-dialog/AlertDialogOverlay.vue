<script setup>
import { AlertDialogOverlay } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <AlertDialogOverlay
    :class="cn('fixed inset-0 z-[80] bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', props.class)"
  >
    <slot />
  </AlertDialogOverlay>
</template>
