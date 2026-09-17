<script setup>
import { useAttrs } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <div :class="cn('flex items-center p-6 pt-0', attrs.class)">
    <slot />
  </div>
</template>
