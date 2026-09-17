<script setup>
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <div :class="cn('flex flex-col gap-1.5 p-6', attrs.class)">
    <slot />
  </div>
</template>
