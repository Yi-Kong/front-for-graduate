<script setup>
import { DialogTitle } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <DialogTitle :class="cn('text-[17px] font-semibold text-gray-900', props.class)">
    <slot />
  </DialogTitle>
</template>
