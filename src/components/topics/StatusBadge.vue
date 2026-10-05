<script setup>
// 题目状态胶囊：颜色与文案均由 utils/topics.js 的映射派生，
// 避免各页面重复维护 BADGE 常量与 statusLabel 调用。
import { computed } from 'vue'
import { statusLabel, statusVariant } from '@/utils/topics'
import Badge from '@/components/common/Badge.vue'

const props = defineProps({
  status: { type: String, default: '' },
})

const variant = computed(() => statusVariant(props.status))
const text = computed(() => statusLabel(props.status))
</script>

<template>
  <Badge :variant="variant">{{ text }}</Badge>
</template>
