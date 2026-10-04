<script setup>
import { cn } from '@/lib/utils'
import { buttonVariants } from './variants'

const props = defineProps({
  variant: { type: String, required: false, default: 'default' },
  size: { type: String, required: false, default: 'default' },
  class: { type: String, required: false, default: '' },
})
</script>

<template>
  <button :class="cn(buttonVariants({ variant, size }), props.class)">
    <slot />
  </button>
</template>
