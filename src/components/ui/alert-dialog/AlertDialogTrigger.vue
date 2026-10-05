<script setup>
import { AlertDialogTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <AlertDialogTrigger :as-child="asChild" :class="cn(props.class)">
    <slot />
  </AlertDialogTrigger>
</template>
