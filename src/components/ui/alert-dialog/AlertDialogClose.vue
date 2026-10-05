<script setup>
import { AlertDialogCancel } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <AlertDialogCancel :as-child="asChild" :class="cn(props.class)">
    <slot />
  </AlertDialogCancel>
</template>
