<script setup>
import { useQuery } from '@tanstack/vue-query'
import { getUserList } from '@/api/user'
import UserCard from '@/components/UserCard.vue'

// 使用 TanStack Query 管理用户列表请求
const {
  data: users,
  isLoading,
  isError,
  error,
  refetch,
  isFetching,
} = useQuery({
  queryKey: ['users'],
  queryFn: getUserList,
})
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">用户列表</h1>
        <p class="text-sm text-gray-400">数据来自 Mock 接口，通过 TanStack Query 管理</p>
      </div>
      <button
        class="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
        :disabled="isFetching"
        @click="refetch()"
      >
        {{ isFetching ? '刷新中…' : '刷新' }}
      </button>
    </div>

    <!-- 加载骨架 -->
    <div
      v-if="isLoading"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-32 animate-pulse rounded-xl bg-gray-200/70"
      />
    </div>

    <!-- 错误态 -->
    <div
      v-else-if="isError"
      class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
    >
      加载失败：{{ error?.message }}
    </div>

    <!-- 数据态 -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UserCard v-for="u in users" :key="u.id" :user="u" />
    </div>
  </div>
</template>
