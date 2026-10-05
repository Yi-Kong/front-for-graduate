<script setup>
import { DialogClose } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DialogClose :as-child="asChild" :class="cn(props.class)">
    <slot />
  </DialogClose>
</template>
