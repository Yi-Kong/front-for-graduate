<script setup>
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <p :class="cn('text-sm text-muted-foreground', attrs.class)">
    <slot />
  </p>
</template>
