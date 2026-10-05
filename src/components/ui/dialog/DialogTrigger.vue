<script setup>
import { DialogTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DialogTrigger :as-child="asChild" :class="cn(props.class)">
    <slot />
  </DialogTrigger>
</template>
