<script setup>
import { ref, computed, watch } from 'vue'
import { parseDate, today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

// shadcn-vue 日期时间选择器：Popover + Calendar（选日期，min 限制不可选今天之前）+ 时间选择（页内 select，避免原生 time 控件抢焦点关闭弹层）。
// 对外以 v-model 暴露 "YYYY-MM-DDTHH:mm" 字符串，与原生 datetime-local 字段格式一致，便于直接接入既有校验（form.start_time < todayMin）。
const props = defineProps({
  modelValue: { type: String, default: '' }, // "YYYY-MM-DDTHH:mm"
  min: { type: String, default: '' }, // 可选，最早可选日期 "YYYY-MM-DDTHH:mm"
  placeholder: { type: String, default: '选择日期时间' },
  invalid: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const dateValue = ref(null) // CalendarDate | null
const timeValue = ref('') // "HH:mm"

function applyModel(v) {
  const [d, t] = v ? v.split('T') : [null, null]
  let nd = null
  if (d) {
    try { nd = parseDate(d) } catch { nd = null }
  }
  const nt = t ? t.slice(0, 5) : ''
  if (nd?.toString() !== dateValue.value?.toString()) dateValue.value = nd
  if (nt !== timeValue.value) timeValue.value = nt
}
watch(() => props.modelValue, applyModel, { immediate: true })

// 最早可选日期（CalendarDate）。今天之前一律不可选。
const minDateValue = computed(() => {
  if (props.min) {
    try { return parseDate(props.min.split('T')[0]) } catch (e) { /* fallthrough */ }
  }
  return today(getLocalTimeZone())
})

// reka-ui CalendarRoot 的函数型禁用：返回 true 的日子不可点选并置灰。
const isDateDisabled = (date) => {
  const min = minDateValue.value
  if (!min) return false
  return date.compare(min) < 0
}

const display = computed(() => {
  if (!dateValue.value) return ''
  const d = dateValue.value
  const t = timeValue.value || '00:00'
  return `${d.year}年${d.month}月${d.day}日 ${t}`
})

const hour = computed({
  get: () => (timeValue.value ? timeValue.value.slice(0, 2) : ''),
  set: (v) => { timeValue.value = `${v}:${minute.value || '00'}`; commit() },
})
const minute = computed({
  get: () => (timeValue.value ? timeValue.value.slice(3, 5) : ''),
  set: (v) => { timeValue.value = `${hour.value || '09'}:${v}`; commit() },
})

function commit() {
  if (dateValue.value && timeValue.value) {
    emit('update:modelValue', `${dateValue.value.toString()}T${timeValue.value}`)
  } else {
    emit('update:modelValue', '')
  }
}

function onPickDate(d) {
  dateValue.value = d
  if (!timeValue.value) timeValue.value = '09:00'
  commit()
}

const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        :class="cn(
          'flex h-11 w-full items-center justify-between rounded-[10px] border border-gray-200 bg-white px-3 text-left text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10',
          invalid && 'border-[#C0202E]',
          open && 'border-[#C0202E] ring-[3px] ring-[#C0202E]/10',
          !display && 'text-gray-400',
        )"
      >
        <span>{{ display || placeholder }}</span>
        <svg class="h-4 w-4 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
      </button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        :model-value="dateValue"
        :is-date-disabled="isDateDisabled"
        @update:model-value="onPickDate"
      />
      <div class="border-t border-gray-100 p-3">
        <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">时间</label>
        <div class="flex items-center gap-2">
          <select
            v-model="hour"
            class="h-10 w-16 rounded-[10px] border border-gray-200 px-2 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
          >
            <option v-for="h in hourOptions" :key="h" :value="h">{{ h }}</option>
          </select>
          <span class="text-[15px] font-medium text-gray-500">:</span>
          <select
            v-model="minute"
            class="h-10 w-16 rounded-[10px] border border-gray-200 px-2 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
          >
            <option v-for="m in minuteOptions" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
