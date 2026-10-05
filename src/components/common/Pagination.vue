<script setup>
// 公共分页条（列表页复用，替代此前 4 个页面各自复制的 .pg 标记与样式）。
// props: page 当前页；totalPages 总页数；total 总条数；pageNumbers 可选页码按钮（不传则仅上一页/下一页）
// emits: update:page —— 父级用 v-model 风格绑定 :page + @update:page
// 左侧统计文案可用 #summary 插槽覆盖（如操作日志需展示「每页 N 条」）。
const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  total: { type: Number, default: 0 },
  pageNumbers: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:page'])

function go(p) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
    <div class="text-[13px] text-gray-500">
      <slot name="summary">
        共 <b class="text-gray-900">{{ total }}</b> 条 · 第 <b class="text-gray-900">{{ page }}</b> / {{ totalPages }} 页
      </slot>
    </div>
    <div class="flex items-center gap-1.5">
      <button class="pg" :disabled="page <= 1" @click="go(page - 1)">上一页</button>
      <button
        v-for="p in pageNumbers"
        :key="p"
        class="pg"
        :class="p === page ? 'pg-active' : ''"
        @click="go(p)"
      >
        {{ p }}
      </button>
      <button class="pg" :disabled="page >= totalPages" @click="go(page + 1)">下一页</button>
    </div>
  </div>
</template>
