<script setup>
import { ref, watch } from 'vue'
import DateTimePicker from '@/components/selection/DateTimePicker.vue'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

// 新增 / 编辑选题轮次表单弹窗。纯 UI：仅负责收集并校验表单，提交时 emit('submit', payload)，
// 实际的 create/update mutation 由父页面执行。
// props.years：所属学年下拉选项 [{ id, name }]，来自 academic-years 列表。
const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initial: { type: Object, default: () => null },
  years: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'submit'])

// datetime-local 仅接受 "YYYY-MM-DDTHH:mm"（或带秒）；后端可能返回带秒字符串，统一截断到分钟
function toLocalInput(v) {
  if (typeof v !== 'string') return ''
  return v.slice(0, 16)
}

// 今天 00:00 作为可选最早时间（不允许选择今天之前）。datetime-local 的 min 仅限制选择器，
// 再配合校验拦截手动输入，确保两个时间均不早于今日。
const todayMin = (() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
})()

const form = ref({ academic_year: '', round_no: '', start_time: '', end_time: '' })
const errors = ref({})

watch(
  () => [props.open, props.initial],
  () => {
    if (!props.open) return
    if (props.mode === 'edit' && props.initial) {
      form.value = {
        academic_year: props.initial.academic_year ?? '',
        round_no: props.initial.round_no ?? '',
        start_time: toLocalInput(props.initial.start_time),
        end_time: toLocalInput(props.initial.end_time),
      }
    } else {
      // 默认取当前届次（列表首个，约定前端按 is_current 优先；此处取第一项作为建议）
      form.value = {
        academic_year: props.years?.[0]?.id ?? '',
        round_no: '',
        start_time: '',
        end_time: '',
      }
    }
    errors.value = {}
  },
  { immediate: true },
)

function validate() {
  const e = {}
  if (!form.value.academic_year) e.academic_year = '请选择所属学年'
  const no = Number(form.value.round_no)
  if (!no || no < 1) e.round_no = '请填写轮次号（≥1）'
  if (!form.value.start_time) e.start_time = '请选择开放时间'
  if (!form.value.end_time) e.end_time = '请选择截止时间'
  if (form.value.start_time && form.value.start_time < todayMin) e.start_time = '开放时间不能早于今天'
  if (form.value.end_time && form.value.end_time < todayMin) e.end_time = '截止时间不能早于今天'
  if (form.value.start_time && form.value.end_time && form.value.end_time <= form.value.start_time) {
    e.end_time = '截止时间须晚于开放时间'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    academic_year: Number(form.value.academic_year),
    round_no: Number(form.value.round_no),
    start_time: form.value.start_time,
    end_time: form.value.end_time,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => { if (!v) emit('close') }">
    <DialogContent class="max-w-[460px] p-0" :show-close="false">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <DialogTitle class="text-[17px] font-semibold text-gray-900">
          {{ mode === 'edit' ? '编辑轮次' : '新增轮次' }}
        </DialogTitle>
        <DialogClose
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </DialogClose>
      </div>

      <div class="px-5 py-5">
        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">所属学年<span class="ml-0.5 text-[#C0202E]">*</span></label>
          <select
            v-model="form.academic_year"
            class="h-11 w-full rounded-[10px] border border-gray-200 bg-white px-3.5 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
          >
            <option value="" disabled>请选择学年</option>
            <option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option>
          </select>
          <p v-if="errors.academic_year" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.academic_year }}</p>
          <p v-else class="mt-1.5 text-[12px] text-gray-400">轮次按所选学年独立编号。</p>
        </div>

        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">轮次号<span class="ml-0.5 text-[#C0202E]">*</span></label>
          <input
            v-model="form.round_no"
            type="number"
            min="1"
            class="h-11 w-full rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-800 outline-none transition focus:border-[#C0202E] focus:ring-[3px] focus:ring-[#C0202E]/10"
            placeholder="例如：1"
          />
          <p v-if="errors.round_no" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.round_no }}</p>
        </div>

        <div class="mb-1 grid grid-cols-2 gap-3.5">
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">开放时间<span class="ml-0.5 text-[#C0202E]">*</span></label>
            <DateTimePicker
              v-model="form.start_time"
              :min="todayMin"
              :invalid="!!errors.start_time"
              placeholder="选择开放时间"
            />
            <p v-if="errors.start_time" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.start_time }}</p>
          </div>
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">截止时间<span class="ml-0.5 text-[#C0202E]">*</span></label>
            <DateTimePicker
              v-model="form.end_time"
              :min="todayMin"
              :invalid="!!errors.end_time"
              placeholder="选择截止时间"
            />
            <p v-if="errors.end_time" class="mt-1.5 text-[12px] text-[#C0202E]">{{ errors.end_time }}</p>
          </div>
        </div>
        <p class="text-[12px] text-gray-400">截止时间须晚于开放时间；轮次开启后学生方可在此窗口内选题。</p>
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
