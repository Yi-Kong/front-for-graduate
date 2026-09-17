<script setup>
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <h3 :class="cn('font-semibold leading-none tracking-tight', attrs.class)">
    <slot />
  </h3>
</template>
