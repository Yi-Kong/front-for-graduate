<script setup>
import { DialogDescription } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <DialogDescription :class="cn('text-[13.5px] leading-[1.6] text-gray-500', props.class)">
    <slot />
  </DialogDescription>
</template>
