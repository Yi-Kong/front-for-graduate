import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, changePassword as changePwdApi, me as meApi } from '@/api/auth'

// 注意：token 键名必须与 src/api/request.js 拦截器读取的 'token' 保持一致，
// 否则登录后续请求不会自动带上 Authorization。
const TOKEN_KEY = 'token'
const USER_KEY = 'grad_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  // 后端登录响应（/api/auth/login/）的这些字段在「顶层」，而非 user 子对象内
  const mustChangePassword = ref(!!user.value?.must_change_password)
  const roleCodes = ref(user.value?.role_codes || [])

  const isLoggedIn = computed(() => !!token.value)

  function persist() {
    if (token.value) localStorage.setItem(TOKEN_KEY, token.value)
    else localStorage.removeItem(TOKEN_KEY)
    if (user.value) localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    else localStorage.removeItem(USER_KEY)
  }

  async function login(credentials) {
    const data = await loginApi(credentials)
    // 后端返回 access（JWT）/ refresh / must_change_password / role_codes（顶层）
    token.value = data?.access || ''
    mustChangePassword.value = !!data?.must_change_password
    roleCodes.value = data?.role_codes || []
    // 登录响应不含 user 对象，需再拉 /auth/me/ 获取用户详情
    try {
      user.value = await meApi()
    } catch {
      user.value = null
    }
    persist()
    return data
  }

  async function changePassword(payload) {
    await changePwdApi(payload)
    mustChangePassword.value = false
    if (user.value) {
      user.value.must_change_password = false
      persist()
    }
  }

  // 重新拉取当前用户信息（如刷新页面后补全 user 态）
  async function fetchMe() {
    user.value = await meApi()
    persist()
    return user.value
  }

  function logout() {
    token.value = ''
    user.value = null
    mustChangePassword.value = false
    roleCodes.value = []
    persist()
  }

  return {
    token,
    user,
    mustChangePassword,
    roleCodes,
    isLoggedIn,
    login,
    changePassword,
    fetchMe,
    logout,
  }
})
