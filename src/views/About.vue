<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/store/counter'
import { formatDate } from '@/utils/format'

const counter = useCounterStore()
const { count, double } = storeToRefs(counter)

const now = formatDate(new Date())
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="mb-2 text-2xl font-bold text-gray-800">关于本项目</h1>
    <p class="mb-6 text-sm text-gray-500">一个基于 Vite + Vue3 的标准示例项目。</p>

    <div class="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
      <h2 class="text-lg font-semibold">技术栈</h2>
      <ul class="list-inside list-disc space-y-1 text-sm text-gray-600">
        <li>Vue 3（传统 .vue 单文件组件，非 JSX/TSX）</li>
        <li>Tailwind CSS v4（@tailwindcss/vite 插件）</li>
        <li>TanStack Query（@tanstack/vue-query）管理异步请求</li>
        <li>Pinia 状态管理</li>
        <li>Vue Router 路由</li>
        <li>内置 Mock 服务（Vite 中间件，零第三方依赖）</li>
      </ul>

      <hr class="border-gray-100" />

      <h2 class="text-lg font-semibold">Pinia 计数器示例</h2>
      <div class="flex items-center gap-4">
        <button
          class="rounded-lg bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
          @click="counter.reset()"
        >
          重置
        </button>
        <span class="text-3xl font-bold text-brand">{{ count }}</span>
        <button
          class="rounded-lg bg-brand px-4 py-1 text-white hover:bg-brand-dark"
          @click="counter.increment()"
        >
          +1
        </button>
        <span class="text-sm text-gray-400">double = {{ double }}</span>
      </div>

      <p class="text-xs text-gray-400">当前时间：{{ now }}</p>
    </div>
  </div>
</template>
