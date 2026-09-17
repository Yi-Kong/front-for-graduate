<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMutation } from '@tanstack/vue-query'
import { useAuthStore } from '@/store/auth'
import SchoolEmblem from '@/components/SchoolEmblem.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const showPwd = ref(false)
const remember = ref(false)
const errorMessage = ref('')

// 回填「记住我」保存的账号
onMounted(() => {
  const saved = localStorage.getItem('grad_remember_user')
  if (saved) {
    username.value = saved
    remember.value = true
  }
})

const { mutate: doLogin, isPending } = useMutation({
  mutationFn: (payload) => auth.login(payload),
  onSuccess: () => {
    if (remember.value) localStorage.setItem('grad_remember_user', username.value)
    else localStorage.removeItem('grad_remember_user')
    if (auth.mustChangePassword) router.replace('/force-change-pwd')
    else router.replace((route.query.redirect) || '/')
  },
  onError: (err) => {
    errorMessage.value = err?.message || '登录失败，请重试'
  },
})

function onSubmit() {
  errorMessage.value = ''
  if (!username.value.trim() || !password.value) {
    errorMessage.value = '请输入账号和密码'
    return
  }
  doLogin({ username: username.value.trim(), password: password.value })
}
</script>

<template>
  <div class="flex min-h-screen bg-[#f3f4f6]">
    <!-- 左侧品牌区（山能红） -->
    <aside class="relative hidden w-[45%] flex-col overflow-hidden bg-gradient-to-br from-[#C0202E] via-[#A81B28] to-[#8F1822] px-[52px] py-[48px] text-white md:flex">
      <div class="absolute -right-[110px] -top-[90px] h-[300px] w-[300px] rounded-full bg-white/[0.06]"></div>
      <div class="absolute -bottom-[70px] right-[30px] h-[200px] w-[200px] rounded-full bg-white/[0.06]"></div>
      <SchoolEmblem :size="320" watermark class="absolute -bottom-[60px] -right-[60px]" />

      <div class="z-10 flex items-center gap-4">
        <SchoolEmblem :size="64" />
        <div>
          <div class="text-[21px] font-bold tracking-[1px]">山西能源学院</div>
          <div class="mt-[3px] text-[11.5px] tracking-[0.5px] opacity-80">SHANXI INSTITUTE OF ENERGY</div>
        </div>
      </div>

      <div class="z-10 my-auto">
        <span class="mb-[22px] inline-block rounded-full border border-[#E3B23C]/50 px-[14px] py-1 text-[12px] tracking-[3px] text-[#E3B23C]">统一身份认证 · UNIFIED LOGIN</span>
        <h1 class="text-[38px] font-bold leading-[1.35] tracking-[2px]">毕业设计<br />综合管理系统</h1>
        <p class="mt-5 max-w-[400px] text-[14.5px] leading-[1.9] opacity-90">本系统服务于山西能源学院毕业设计全过程管理，覆盖届次与师生账号管理、题目申报查重与审核发布、两轮选题及指导关系生成等核心环节，为管理员、教师与学生提供协同工作环境。</p>

        <div class="mt-[34px] border-l-[3px] border-[#E3B23C] pl-4">
          <div class="text-[24px] font-bold tracking-[5px]">立德强能&nbsp;笃学善行</div>
          <div class="mt-[5px] text-[12px] tracking-[1px] opacity-80">校&nbsp;训 · MOTTO</div>
        </div>
      </div>

      <div class="z-10 text-[12px] opacity-60">© 2026 山西能源学院 · 毕业设计综合管理系统</div>
    </aside>

    <!-- 右侧表单区 -->
    <main class="flex flex-1 items-center justify-center bg-white p-10">
      <div class="w-full max-w-[380px]">
        <div class="mb-7 flex items-center gap-2.5">
          <SchoolEmblem :size="26" />
          <span class="text-[13px] text-gray-500">统一身份认证</span>
        </div>

        <h2 class="text-[24px] font-bold text-gray-900">欢迎登录</h2>
        <p class="mb-[26px] mt-2 text-[13.5px] text-gray-500">请使用账号密码登录您的账户</p>

        <form class="space-y-[18px]" @submit.prevent="onSubmit">
          <div>
            <label class="mb-[7px] block text-[13px] font-medium text-gray-700">账号</label>
            <div class="flex h-[46px] items-center gap-2.5 rounded-[10px] border border-gray-200 px-3 transition focus-within:border-[#C0202E] focus-within:ring-[3px] focus-within:ring-[#C0202E]/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="#9ca3af" stroke-width="1.7"/><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="#9ca3af" stroke-width="1.7" stroke-linecap="round"/></svg>
              <input v-model="username" type="text" autocomplete="username" placeholder="请输入账号 / 工号 / 学号" class="h-full flex-1 border-0 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400" />
            </div>
          </div>

          <div>
            <label class="mb-[7px] block text-[13px] font-medium text-gray-700">密码</label>
            <div class="flex h-[46px] items-center gap-2.5 rounded-[10px] border border-gray-200 px-3 transition focus-within:border-[#C0202E] focus-within:ring-[3px] focus-within:ring-[#C0202E]/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" stroke="#9ca3af" stroke-width="1.7"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#9ca3af" stroke-width="1.7"/></svg>
              <input v-model="password" :type="showPwd ? 'text' : 'password'" autocomplete="current-password" placeholder="请输入密码" class="h-full flex-1 border-0 bg-transparent text-[14px] text-gray-800 outline-none placeholder:text-gray-400" />
              <button type="button" class="flex text-gray-400" @click="showPwd = !showPwd" :aria-label="showPwd ? '隐藏密码' : '显示密码'">
                <svg v-if="!showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="#9ca3af" stroke-width="1.7"/><circle cx="12" cy="12" r="2.6" stroke="#9ca3af" stroke-width="1.7"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="#9ca3af" stroke-width="1.7" stroke-linecap="round"/><path d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 7a17 17 0 0 1-3.2 3.9M6.2 8.1A17 17 0 0 0 2 12s3.5 6 10 6a9.5 9.5 0 0 0 3.4-.6" stroke="#9ca3af" stroke-width="1.7"/></svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <label class="flex cursor-pointer items-center gap-[7px] text-[13px] text-gray-600">
              <input v-model="remember" type="checkbox" class="h-[15px] w-[15px] accent-[#C0202E]" /> 记住我
            </label>
            <a href="#" class="text-[13px] text-[#C0202E] no-underline">忘记密码？</a>
          </div>

          <p v-if="errorMessage" class="text-[13px] text-red-600">{{ errorMessage }}</p>

          <button type="submit" :disabled="isPending" class="h-[48px] w-full rounded-[10px] bg-[#C0202E] text-[15px] font-semibold text-white transition hover:bg-[#8F1822] active:translate-y-px disabled:opacity-60">
            {{ isPending ? '登录中…' : '登 录' }}
          </button>
        </form>

        <div class="mt-[18px] flex gap-[10px] rounded-[10px] border border-[#fde68a] bg-[#fffbeb] p-[13px] text-[12.5px] leading-[1.6] text-[#92400e]">
          <svg class="mt-[1px] flex-none" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#d97706" stroke-width="1.7"/><path d="M12 7v6M12 16.5v.5" stroke="#d97706" stroke-width="1.7" stroke-linecap="round"/></svg>
          <span>首次登录账号需修改初始密码后方可进入系统（由 <code>must_change_password</code> 控制）。</span>
        </div>

        <div class="mt-[22px] border-t border-dashed border-gray-200 pt-4">
          <div class="mb-[10px] text-[12px] text-gray-500">演示账号（按角色）</div>
          <div class="flex flex-wrap gap-2">
            <span class="rounded-full border border-[#f6d3d7] bg-[#fdecee] px-[11px] py-[5px] text-[12px] text-[#8F1822]">管理员 admin</span>
            <span class="rounded-full border border-[#f6d3d7] bg-[#fdecee] px-[11px] py-[5px] text-[12px] text-[#8F1822]">教师 teacher</span>
            <span class="rounded-full border border-[#f6d3d7] bg-[#fdecee] px-[11px] py-[5px] text-[12px] text-[#8F1822]">学生 student</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
