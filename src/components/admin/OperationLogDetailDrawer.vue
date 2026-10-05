<script setup>
import { actionMeta } from '@/utils/operationLog'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

defineProps({ log: { type: Object, default: null } })
const emit = defineEmits(['close'])
</script>

<template>
  <Sheet :open="!!log" @update:open="(v) => { if (!v) emit('close') }">
    <SheetContent side="right" :show-close="false">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <SheetTitle class="text-[17px] font-bold">操作日志详情</SheetTitle>
        <SheetClose class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </SheetClose>
      </div>
      <div v-if="log" class="flex-1 overflow-y-auto px-5 py-4">
        <div class="kv kv-stack"><div class="k">操作人</div><div class="v">{{ log.operator_name }}</div></div>
        <div class="kv kv-stack"><div class="k">操作类型</div><div class="v"><span class="inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold" :class="actionMeta(log.operation_type).pill">{{ actionMeta(log.operation_type).label }}</span></div></div>
        <div class="kv kv-stack"><div class="k">操作对象</div><div class="v">{{ log.target_type && log.target_type !== '—' ? log.target_type + ' / ' + log.target_id : '—' }}</div></div>
        <div class="kv kv-stack"><div class="k">变更前</div><div class="v break-all font-mono text-[12.5px]">{{ log.before_data ? JSON.stringify(log.before_data) : '—' }}</div></div>
        <div class="kv kv-stack"><div class="k">变更后</div><div class="v break-all font-mono text-[12.5px]">{{ log.after_data ? JSON.stringify(log.after_data) : '—' }}</div></div>
        <div class="kv kv-stack"><div class="k">IP 地址</div><div class="v font-mono">{{ log.ip_address }}</div></div>
        <div class="kv kv-stack"><div class="k">操作时间</div><div class="v font-mono">{{ log.created_at }}</div></div>
      </div>
    </SheetContent>
  </Sheet>
</template>

