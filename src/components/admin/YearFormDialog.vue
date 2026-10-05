<script setup>
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

// 新增 / 编辑届次表单弹窗。纯 UI：仅负责收集并校验表单，提交时 emit('submit', payload)，
// 实际的 create/update mutation 由父页面执行。编辑模式隐藏「设为当前」复选框（改用操作列独立按钮）。
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initial: { type: Object, default: () => null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'submit'])

const form = ref({ name: '', start_year: '', end_year: '', set_current: true })
const errors = ref({})

watch(
  () => [props.open, props.initial],
  () => {
    if (!props.open) return
    if (props.mode === 'edit' && props.initial) {
      form.value = {
        name: props.initial.name,
        start_year: props.initial.start_date ? Number(props.initial.start_date.slice(0, 4)) : '',
        end_year: props.initial.end_date ? Number(props.initial.end_date.slice(0, 4)) : '',
        set_current: false,
      }
    } else {
      form.value = { name: '', start_year: '', end_year: '', set_current: true }
    }
    errors.value = {}
  },
  { immediate: true },
)

function validate() {
  const e = {}
  if (!String(form.value.name).trim()) e.name = '请填写届次名称'
  const s = Number(form.value.start_year)
  const en = Number(form.value.end_year)
  if (!s) e.start_year = '请填写起始学年'
  if (!en) e.end_year = '请填写结束学年'
  if (s && en && en < s) e.end_year = '结束学年应不小于起始学年'
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  const payload = {
    name: form.value.name.trim(),
    start_date: `${form.value.start_year}-09-01`,
    end_date: `${form.value.end_year}-07-31`,
    status: props.mode === 'create' ? 'DRAFT' : props.initial?.status || 'DRAFT',
  }
  if (props.mode === 'create') payload.is_current = form.value.set_current
  emit('submit', payload)
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => { if (!v) emit('close') }">
    <DialogContent class="max-w-[440px] p-0" :show-close="false">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <DialogTitle class="text-[17px] font-semibold text-gray-900">
          {{ mode === 'edit' ? '编辑届次' : '新增届次' }}
        </DialogTitle>
        <DialogClose
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </DialogClose>
      </div>

      <div class="px-5 py-5">
        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">届次名称<span class="ml-0.5 text-[#C0202E]">*</span></label>
          <input
            v-model="form.name"
            class="h-11 w-full rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
            placeholder="例如：2027 届"
          />
          <p v-if="errors.name" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.name }}</p>
          <p v-else class="mt-1.5 text-[12px] text-gray-400">建议格式为「起始年份 + 届」，与学年范围对应。</p>
        </div>

        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">起始学年<span class="ml-0.5 text-[#C0202E]">*</span></label>
          <input
            v-model="form.start_year"
            type="number"
            class="h-11 w-full rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
            placeholder="例如：2026"
          />
          <p v-if="errors.start_year" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.start_year }}</p>
        </div>

        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">结束学年<span class="ml-0.5 text-[#C0202E]">*</span></label>
          <input
            v-model="form.end_year"
            type="number"
            class="h-11 w-full rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
            placeholder="例如：2027"
          />
          <p v-if="errors.end_year" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.end_year }}</p>
          <p v-else class="mt-1.5 text-[12px] text-gray-400">结束学年一般比起始学年大 1，对应一学年的起止。</p>
        </div>

        <label v-if="mode === 'create'" class="flex items-center gap-2.5 text-[13.5px] text-gray-800">
          <input v-model="form.set_current" type="checkbox" class="h-[17px] w-[17px] accent-[#C0202E]" />
          新增后设为当前届次
        </label>
      </div>

      <div class="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
        <DialogClose
          class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          :disabled="loading"
        >
          取消
        </DialogClose>
        <button
          class="h-10 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          @click="onSubmit"
          :disabled="loading"
        >
          {{ loading ? '保存中…' : (mode === 'edit' ? '保存' : '确认新增') }}
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
