<script setup>
// 山西能源学院官方校徽（图片资源位于 src/assets/school-logo.png）。
// 通过 size / watermark / rounded 控制呈现：左栏大徽、表单小徽、背景水印。
import emblem from '@/assets/school-logo.png'

defineProps({
  size: { type: Number, default: 64 },
  watermark: { type: Boolean, default: false },
  rounded: { type: Boolean, default: true },
})
</script>

<template>
  <img
    :src="emblem"
    :width="size"
    :height="size"
    :class="[
      rounded && !watermark ? 'rounded-full bg-white object-contain p-0.5' : '',
      watermark ? 'rounded-full opacity-[0.12] object-contain' : '',
    ]"
    :style="rounded && !watermark ? 'filter: drop-shadow(0 2px 6px rgba(0,0,0,.18))' : ''"
    alt="山西能源学院校徽"
  />
</template>
