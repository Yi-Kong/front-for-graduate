<script setup>
// 通用状态胶囊。统一配色映射，替代此前在多个页面/组件内各写一份的 BADGE 常量。
// props: variant 颜色变体（green/red/amber/blue/gray/purple）；内容用默认插槽传入。
import { computed } from 'vue'

const VARIANT = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
}

const props = defineProps({
  variant: { type: String, default: 'gray' },
})

// 必须 computed：status/来源会随行数据与列表刷新变化
const cls = computed(() => VARIANT[props.variant] || VARIANT.gray)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold"
    :class="cls"
  >
    <slot />
  </span>
</template>
