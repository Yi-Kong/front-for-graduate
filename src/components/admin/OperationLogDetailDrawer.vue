<script setup>
import { actionMeta } from '@/utils/operationLog'

defineProps({ log: { type: Object, default: null } })
const emit = defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 z-[80]">
    <div class="absolute inset-0 bg-black/40" @click="emit('close')"></div>
    <div class="absolute right-0 top-0 flex h-full w-[440px] max-w-full flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,.18)]">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 class="text-[17px] font-bold">操作日志详情</h3>
        <button class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div v-if="log" class="flex-1 overflow-y-auto px-5 py-4">
        <div class="kv"><div class="k">操作人</div><div class="v">{{ log.operator_name }}</div></div>
        <div class="kv"><div class="k">操作类型</div><div class="v"><span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold" :class="actionMeta(log.operation_type).pill">{{ actionMeta(log.operation_type).label }}</span></div></div>
        <div class="kv"><div class="k">操作对象</div><div class="v">{{ log.target_type && log.target_type !== '—' ? log.target_type + ' / ' + log.target_id : '—' }}</div></div>
        <div class="kv"><div class="k">变更前</div><div class="v break-all font-mono text-[12.5px]">{{ log.before_data ? JSON.stringify(log.before_data) : '—' }}</div></div>
        <div class="kv"><div class="k">变更后</div><div class="v break-all font-mono text-[12.5px]">{{ log.after_data ? JSON.stringify(log.after_data) : '—' }}</div></div>
        <div class="kv"><div class="k">IP 地址</div><div class="v font-mono">{{ log.ip_address }}</div></div>
        <div class="kv"><div class="k">操作时间</div><div class="v font-mono">{{ log.created_at }}</div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kv {
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
}
.kv:last-child {
  border-bottom: none;
}
.kv .k {
  margin-bottom: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #6b7280;
}
.kv .v {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
  word-break: break-all;
}
</style>
