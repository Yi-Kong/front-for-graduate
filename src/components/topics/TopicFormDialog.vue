<script setup>
// 教师新建 / 编辑题目表单弹窗（#11 我的题目申报）
// props: open 显隐；topic 当前题目（null = 新建）
// emits: close / saved（保存成功后父组件刷新列表）
import { ref, reactive, computed, watch, unref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createTopic, updateTopic } from '@/api/topics'
import { getAcademicYears } from '@/api/academic'
import { useAuthStore } from '@/store/auth'

const props = defineProps({
  open: { type: Boolean, default: false },
  topic: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const auth = useAuthStore()
const qc = useQueryClient()
const currentUserId = computed(() => auth.user?.id ?? 1)
const currentName = computed(() => auth.user?.real_name || `用户 #${currentUserId.value}`)

// 学年列表（用于下拉）
const { data: yearsData } = useQuery({
  queryKey: ['academic-years', 'list'],
  queryFn: getAcademicYears,
})
const years = computed(() =>
  Array.isArray(yearsData.value) ? yearsData.value : yearsData.value?.results || [],
)
const currentYearId = computed(
  () => years.value.find((y) => y.is_current)?.id ?? years.value[0]?.id ?? 1,
)

const form = reactive({ title: '', academic_year: null, description: '' })
const titleError = ref('')
const isEdit = computed(() => !!props.topic)

function resetForm() {
  if (props.topic) {
    form.title = props.topic.title || ''
    form.academic_year = props.topic.academic_year ?? currentYearId.value
    form.description = props.topic.description || ''
  } else {
    form.title = ''
    form.academic_year = currentYearId.value
    form.description = ''
  }
  titleError.value = ''
}
watch(() => props.open, (v) => { if (v) resetForm() }, { immediate: true })

const saveMutation = useMutation({
  mutationFn: (payload) =>
    isEdit.value ? updateTopic(props.topic.id, payload) : createTopic(payload),
  onSuccess: () => {
    emit('saved')
    qc.invalidateQueries({ queryKey: ['topics', 'my'] })
  },
  onError: (e) => {
    titleError.value = e?.message || '保存失败'
  },
})
// vue-query 返回含 ref 的对象，isPending 必须解包，否则按钮会恒为「保存中…」禁用
const saving = computed(() => unref(saveMutation.isPending))

function validate() {
  titleError.value = ''
  if (!form.title.trim()) {
    titleError.value = '请填写题目名称'
    return false
  }
  if (!form.academic_year) {
    titleError.value = '请选择所属学年'
    return false
  }
  return true
}

function onSubmit() {
  if (!validate()) return
  const payload = {
    title: form.title.trim(),
    academic_year: Number(form.academic_year),
    topic_source: 'TEACHER',
    proposer: currentUserId.value,
    supervisor: currentUserId.value,
    description: form.description.trim(),
  }
  saveMutation.mutate(payload)
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
    @click.self="emit('close')"
  >
    <div class="w-[560px] max-w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h3 class="text-[17px] font-bold text-gray-900">{{ isEdit ? '编辑题目' : '新建题目' }}</h3>
        <button
          class="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-gray-200"
          @click="emit('close')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div class="px-5 py-4">
        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">题目名称<span class="text-[#C0202E]">*</span></label>
          <input
            v-model="form.title"
            class="h-11 w-full rounded-[10px] border px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
            :class="titleError ? 'border-[#C0202E]' : 'border-gray-200'"
            placeholder="例如：基于深度学习的校园能耗预测系统"
          />
          <p v-if="titleError" class="mt-1.5 text-[12.5px] text-[#C0202E]">{{ titleError }}</p>
        </div>

        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">所属学年<span class="text-[#C0202E]">*</span></label>
          <select
            v-model="form.academic_year"
            class="h-11 w-full rounded-[10px] border border-gray-200 px-3.5 text-[14px] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
          >
            <option v-for="y in years" :key="y.id" :value="y.id">{{ y.name }}</option>
          </select>
        </div>

        <div class="mb-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">题目来源<span class="text-[#C0202E]">*</span></label>
          <input
            value="教师申报 (TEACHER)"
            disabled
            class="h-11 w-full cursor-not-allowed rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 text-[14px] text-gray-500"
          />
          <p class="mt-1.5 text-[12px] text-gray-400">教师申报默认锁定，不可改为管理员录入。</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">申报人<span class="text-[#C0202E]">*</span></label>
            <input
              :value="currentName"
              disabled
              class="h-11 w-full cursor-not-allowed rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 text-[14px] text-gray-500"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">指导教师<span class="text-[#C0202E]">*</span></label>
            <input
              :value="currentName + '（本人）'"
              disabled
              class="h-11 w-full cursor-not-allowed rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 text-[14px] text-gray-500"
            />
          </div>
        </div>
        <p class="mt-1.5 text-[12px] text-gray-400">后端暂无教师列表接口，指导教师默认本人；接口就绪后可放开为可选。</p>

        <div class="mt-4">
          <label class="mb-1.5 block text-[13px] font-semibold text-gray-700">题目描述</label>
          <textarea
            v-model="form.description"
            class="min-h-[96px] w-full rounded-[10px] border border-gray-200 p-3 text-[14px] leading-[1.7] text-gray-900 outline-none transition focus:border-[#C0202E] focus:ring-2 focus:ring-[#C0202E]/10"
            placeholder="简述研究内容、技术路线与预期目标（建议 30–200 字）"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2.5 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
        <button
          class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          :disabled="saving"
          @click="emit('close')"
        >
          取消
        </button>
        <button
          class="h-10 rounded-[10px] bg-[#C0202E] px-5 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          :disabled="saving"
          @click="onSubmit"
        >
          {{ saving ? '保存中…' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>
