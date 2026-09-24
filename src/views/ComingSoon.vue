<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fdecee] text-[#8F1822]">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5L12 21l-5 2.2 1-5.5-4-3.9 5.5-.8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
    </div>
    <h2 class="text-[18px] font-semibold text-gray-800">{{ route.meta.title || '功能' }} · 建设中</h2>
    <p class="mx-auto mt-2 max-w-[420px] text-[13.5px] leading-[1.7] text-gray-500">
      该页面后端接口或设计稿尚未就绪，暂以占位呈现。后续将按「设计稿先行」流程补充对应设计与实现。
    </p>
  </div>
</template>
