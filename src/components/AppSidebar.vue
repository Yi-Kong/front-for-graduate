<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="w-56 shrink-0 border-r border-gray-200 bg-white p-6">
    <div class="mb-8 text-lg font-bold text-brand">🌟 Grad Front</div>
    <nav class="flex flex-col gap-2">
      <RouterLink
        to="/"
        class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        active-class="bg-brand/10 text-brand"
      >
        用户列表
      </RouterLink>
      <RouterLink
        to="/about"
        class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
        active-class="bg-brand/10 text-brand"
      >
        关于
      </RouterLink>
    </nav>
  </aside>
</template>
