<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand"
      >
        {{ user.name?.charAt(0) }}
      </div>
      <div>
        <div class="font-semibold text-gray-800">{{ user.name }}</div>
        <div class="text-xs text-gray-400">ID: {{ user.id }}</div>
      </div>
    </div>
    <dl class="mt-3 space-y-1 text-sm text-gray-500">
      <div class="flex justify-between"><dt>年龄</dt><dd>{{ user.age }}</dd></div>
      <div class="flex justify-between"><dt>邮箱</dt><dd class="truncate">{{ user.email }}</dd></div>
    </dl>
  </div>
</template>
