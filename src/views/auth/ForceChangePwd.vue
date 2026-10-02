<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/store/auth'
import SchoolEmblem from '@/components/SchoolEmblem.vue'

const router = useRouter()
const auth = useAuthStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPwd = ref(false)
const errorMessage = ref('')

const { mutate: doChange, isPending } = useMutation({
  mutationFn: (payload) => auth.changePassword(payload),
  onSuccess: () => {
    router.replace('/')
  },
  onError: (err) => {
    errorMessage.value = err?.message || '修改失败，请重试'
  },
})

function onSubmit() {
  errorMessage.value = ''
  if (!oldPassword.value) {
    errorMessage.value = '请输入原密码'
    return
  }
  if (!newPassword.value) {
    errorMessage.value = '请输入新密码'
    return
  }
  if (newPassword.value.length < 6) {
    errorMessage.value = '密码长度至少 6 位'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  doChange({ old_password: oldPassword.value, new_password: newPassword.value })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-6">
    <div class="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-sm">
      <div class="mb-6 flex items-center gap-2.5">
        <SchoolEmblem :size="28" />
        <span class="text-[13px] text-gray-500">统一身份认证</span>
      </div>
      <h2 class="text-[24px] font-bold text-gray-900">修改初始密码</h2>
      <p class="mb-6 mt-2 text-[13.5px] text-gray-500">为保障账户安全，首次登录请设置新密码。</p>

      <form class="space-y-[18px]" @submit.prevent="onSubmit">
        <div>
          <label class="mb-[7px] block text-[13px] font-medium text-gray-700">原密码</label>
          <div class="flex h-[46px] items-center gap-2.5 rounded-[10px] border border-gray-200 px-3 transition focus-within:border-[#C0202E] focus-within:ring-[3px] focus-within:ring-[#C0202E]/10">
            <input v-model="oldPassword" :type="showPwd ? 'text' : 'password'" autocomplete="current-password" placeholder="请输入当前密码" class="h-full flex-1 border-0 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400" />
          </div>
        </div>
        <div>
          <label class="mb-[7px] block text-[13px] font-medium text-gray-700">新密码</label>
          <div class="flex h-[46px] items-center gap-2.5 rounded-[10px] border border-gray-200 px-3 transition focus-within:border-[#C0202E] focus-within:ring-[3px] focus-within:ring-[#C0202E]/10">
            <input v-model="newPassword" :type="showPwd ? 'text' : 'password'" autocomplete="new-password" placeholder="至少 6 位" class="h-full flex-1 border-0 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400" />
          </div>
        </div>
        <div>
          <label class="mb-[7px] block text-[13px] font-medium text-gray-700">确认新密码</label>
          <div class="flex h-[46px] items-center gap-2.5 rounded-[10px] border border-gray-200 px-3 transition focus-within:border-[#C0202E] focus-within:ring-[3px] focus-within:ring-[#C0202E]/10">
            <input v-model="confirmPassword" :type="showPwd ? 'text' : 'password'" autocomplete="new-password" placeholder="再次输入新密码" class="h-full flex-1 border-0 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400" />
            <button type="button" class="text-[13px] text-gray-400" @click="showPwd = !showPwd">{{ showPwd ? '隐藏' : '显示' }}</button>
          </div>
        </div>

        <p v-if="errorMessage" class="text-[13px] text-red-600">{{ errorMessage }}</p>

        <button type="submit" :disabled="isPending" class="h-[48px] w-full rounded-[10px] bg-[#C0202E] text-[15px] font-semibold text-white transition hover:bg-[#8F1822] disabled:opacity-60">
          {{ isPending ? '提交中…' : '确认修改' }}
        </button>
      </form>
    </div>
  </div>
</template>
