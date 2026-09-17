<script setup>
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow', attrs.class)">
    <slot />
  </div>
</template>
