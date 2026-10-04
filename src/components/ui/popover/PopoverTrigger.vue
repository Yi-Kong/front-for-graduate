<script setup>
import { PopoverTrigger } from 'reka-ui'
</script>

<template>
  <PopoverTrigger v-bind="$attrs">
    <slot />
  </PopoverTrigger>
</template>
