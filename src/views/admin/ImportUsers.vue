<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import {
  validateImport,
  commitImport,
  getImportBatch,
  getImportErrors,
} from '@/api/import'
import FileDropzone from '@/components/import/FileDropzone.vue'
import ErrorDetailModal from '@/components/import/ErrorDetailModal.vue'

// 模板字段（推断，后端 §5 未定义列结构，实现前须与后端校验代码核对）
const TEMPLATES = {
  teachers: { label: '教师', fields: ['工号', '姓名', '性别', '所属院系', '职称', '手机号'] },
  students: { label: '学生', fields: ['学号', '姓名', '性别', '专业', '班级', '手机号'] },
}

const activeTab = ref('teachers')
const stage = ref('upload') // 'upload' | 'result'
const file = ref(null)
const batchId = ref(null)
const showModal = ref(false)
const successMsg = ref('')

const current = computed(() => TEMPLATES[activeTab.value])
const noLabel = computed(() => '字段')

function switchTab(type) {
  if (type === activeTab.value) return
  activeTab.value = type
  stage.value = 'upload'
  file.value = null
  batchId.value = null
  successMsg.value = ''
}

// 预校验：上传 → 拿 batch_id → 切换结果态（详情/错误由下方 useQuery 拉取）
const validateMutation = useMutation({
  mutationFn: () => validateImport(activeTab.value, file.value),
  onSuccess: (res) => {
    batchId.value = res.batch_id
    stage.value = 'result'
  },
})
function onValidate() {
  if (!file.value) return
  successMsg.value = ''
  validateMutation.mutate()
}

// 批次详情 + 逐行错误
const { data: batch, isLoading: batchLoading } = useQuery({
  queryKey: ['import-batch', activeTab, batchId],
  queryFn: () => getImportBatch(batchId.value),
  enabled: computed(() => !!batchId.value),
})
const { data: batchErrors } = useQuery({
  queryKey: ['import-batch-errors', activeTab, batchId],
  queryFn: () => getImportErrors(batchId.value),
  enabled: computed(() => !!batchId.value),
})
const errorList = computed(() => batchErrors.value || [])

// 提交导入（写库）。语义以真实后端为准：此处按「整批提交→部分成功」模型返回摘要。
const commitMutation = useMutation({
  mutationFn: () => commitImport(activeTab.value, batchId.value),
  onSuccess: (res) => {
    successMsg.value =
      activeTab.value === 'students'
        ? `导入完成：成功写入 ${res.success_rows} 名学生。`
        : `导入完成：新建 ${res.created} 名、更新 ${res.updated} 名教师。`
    stage.value = 'upload'
    file.value = null
    batchId.value = null
  },
})
function onCommit() {
  commitMutation.mutate()
}

// 下载模板 / 错误明细（前端生成 CSV；后端未提供模板端点，落地时需对齐后端实现）
function triggerCsv(filename, content) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
function downloadTemplate() {
  const f = current.value.fields
  const sample =
    activeTab.value === 'teachers'
      ? ['T2026001', '张三', '男', '采矿工程系', '讲师', '13800000000']
      : ['S2026001', '李四', '女', '计算机科学与技术', '计科2301', '13900000000']
  triggerCsv(`${current.value.label}导入模板.csv`, [f.join(','), sample.join(',')].join('\n'))
}
function downloadErrors() {
  if (!errorList.value.length) return
  const header = ['行号', noLabel.value, '原始值', '错误信息']
  const rows = errorList.value.map((e) => [e.row_no, e.field_name, e.raw_value, e.error_message].join(','))
  triggerCsv('导入错误明细.csv', [header.join(','), ...rows].join('\n'))
}
</script>

<template>
  <div>
    <!-- 页头 -->
    <div class="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-[24px] font-bold tracking-[0.5px] text-gray-900">师生批量导入</h1>
        <p class="mt-1.5 max-w-[720px] text-[13.5px] leading-[1.6] text-gray-500">
          按「教师 / 学生」分别上传 Excel 模板，系统先校验后导入。校验通过的行将写入账号库；校验失败的行可下载错误明细修正后重新导入。
        </p>
      </div>
      <button
        class="inline-flex h-[38px] items-center gap-1.5 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50"
        @click="downloadTemplate"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        下载导入模板
      </button>
    </div>

    <!-- 类型 Tab -->
    <div class="mb-4 inline-flex rounded-[10px] bg-gray-100 p-1">
      <button
        class="rounded-[8px] px-4 py-1.5 text-[13.5px] font-semibold transition"
        :class="activeTab === 'teachers' ? 'bg-white text-[#8F1822] shadow-sm' : 'text-gray-500'"
        @click="switchTab('teachers')"
      >
        教师导入
      </button>
      <button
        class="rounded-[8px] px-4 py-1.5 text-[13.5px] font-semibold transition"
        :class="activeTab === 'students' ? 'bg-white text-[#8F1822] shadow-sm' : 'text-gray-500'"
        @click="switchTab('students')"
      >
        学生导入
      </button>
    </div>

    <div
      class="mb-4 flex items-start gap-2 rounded-[10px] border border-[#fde68a] bg-[#fffbeb] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#92400e]"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="mt-0.5 shrink-0"><circle cx="12" cy="12" r="9" stroke="#d97706" stroke-width="1.7"/><path d="M12 8v5M12 16.5v.5" stroke="#d97706" stroke-width="1.7" stroke-linecap="round"/></svg>
      <span>模板字段（{{ current.label }}，推断待确认）：{{ current.fields.join('、') }}。字段缺失或格式错误将在校验阶段标红提示。后端文档 §5 未定义列结构，实现前须与后端校验代码核对。</span>
    </div>

    <!-- 成功提示 -->
    <div
      v-if="successMsg"
      class="mb-4 flex items-center gap-2 rounded-[10px] border border-[#a7f3d0] bg-[#ecfdf5] px-3.5 py-2.5 text-[13px] font-medium text-[#047857]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12.5 10 17l9-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      {{ successMsg }}
    </div>

    <!-- 状态一：上传 -->
    <div v-if="stage === 'upload'" class="rounded-2xl border border-gray-200 bg-white p-5">
      <div class="mb-3 text-[15px] font-bold">状态一 · 上传文件（{{ current.label }}）</div>
      <FileDropzone v-model:file="file" />
      <div class="mt-4 flex justify-end gap-2.5">
        <button
          class="h-10 rounded-[10px] border border-gray-200 bg-white px-4 text-[14px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          :disabled="!file || validateMutation.isPending"
          @click="file = null"
        >
          重新选择
        </button>
        <button
          class="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
          :disabled="!file || validateMutation.isPending"
          @click="onValidate"
        >
          <svg v-if="validateMutation.isPending" class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          {{ validateMutation.isPending ? '校验中…' : '校验' }}
        </button>
      </div>
    </div>

    <!-- 状态二：校验结果 -->
    <div v-else class="space-y-4">
      <div class="rounded-2xl border border-gray-200 bg-white p-5">
        <div class="mb-4 flex items-center justify-between">
          <div class="text-[15px] font-bold">状态二 · 校验结果（{{ current.label }}）</div>
          <button class="text-[13px] font-semibold text-gray-500 transition hover:text-[#C0202E]" @click="stage = 'upload'; file = null; batchId = null">返回重新上传</button>
        </div>

        <div v-if="batchLoading" class="py-10 text-center text-[13.5px] text-gray-400">加载校验结果…</div>
        <template v-else-if="batch">
          <!-- 统计卡 -->
          <div class="mb-4 grid grid-cols-3 gap-4">
            <div class="rounded-[14px] border border-gray-200 p-4">
              <div class="text-[30px] font-bold leading-tight text-gray-900">{{ batch.total_rows }}</div>
              <div class="text-[13px] text-gray-500">总行数</div>
            </div>
            <div class="rounded-[14px] border border-gray-200 p-4">
              <div class="text-[30px] font-bold leading-tight text-[#047857]">{{ batch.success_rows }}</div>
              <div class="text-[13px] text-gray-500">校验通过</div>
            </div>
            <div class="rounded-[14px] border border-gray-200 p-4">
              <div class="text-[30px] font-bold leading-tight text-[#b91c1c]">{{ batch.failed_rows }}</div>
              <div class="text-[13px] text-gray-500">校验失败</div>
            </div>
          </div>

          <!-- 错误行预览 -->
          <div class="overflow-x-auto rounded-[14px] border border-gray-200">
            <table class="w-full min-w-[640px] border-collapse">
              <thead>
                <tr class="bg-gray-50 text-left text-[12.5px] font-semibold text-gray-500">
                  <th class="px-5 py-3" style="width: 12%">行号</th>
                  <th class="px-5 py-3" style="width: 22%">{{ noLabel }}</th>
                  <th class="px-5 py-3" style="width: 18%">原始值</th>
                  <th class="px-5 py-3" style="width: 48%">错误信息</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in errorList" :key="e.row_no" class="border-t border-gray-100 bg-[#fef2f2]">
                  <td class="px-5 py-3 font-mono text-[13px] text-gray-700">{{ e.row_no }}</td>
                  <td class="px-5 py-3 font-mono text-[13px] text-gray-700">{{ e.field_name }}</td>
                  <td class="px-5 py-3 text-[14px] text-gray-800">{{ e.raw_value }}</td>
                  <td class="px-5 py-3 text-[13px] text-[#b91c1c]">{{ e.error_message }}</td>
                </tr>
                <tr v-if="!errorList.length">
                  <td colspan="4" class="px-5 py-8 text-center text-[13.5px] text-gray-400">校验全部通过，无错误行。</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="errorList.length" class="mt-2 text-[12.5px] text-gray-400">以下为校验未通过行，其余 {{ batch.success_rows }} 行已通过。可点「查看全部错误」查看完整明细。</p>

          <!-- 操作 -->
          <div class="mt-4 flex flex-wrap justify-end gap-2.5">
            <button class="act act-primary" @click="showModal = true">查看全部错误</button>
            <button class="act" @click="downloadErrors">下载错误明细</button>
            <button
              class="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#C0202E] px-4 text-[14px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60"
              :disabled="commitMutation.isPending || batch.failed_rows === batch.total_rows"
              @click="onCommit"
            >
              <svg v-if="commitMutation.isPending" class="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              {{ commitMutation.isPending ? '导入中…' : `提交导入（${batch.success_rows} 行）` }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <ErrorDetailModal
      :open="showModal"
      :title="`当次导入错误明细（${current.label}）`"
      :no-label="noLabel"
      :errors="errorList"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.act:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #1f2937;
}
.act-primary {
  color: #c0202e;
  background: #fdecee;
  border-color: #f6d3d7;
}
.act-primary:hover {
  background: #fbdde0;
  border-color: #efc2c7;
  color: #8f1822;
}
</style>
