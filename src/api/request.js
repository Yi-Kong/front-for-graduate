import axios from 'axios'

// 统一的请求实例
// 注意：后端为 Django + DRF（simplejwt），响应为标准 DRF 风格——
// 成功为「裸对象」（无 {code,message,data} 包装），错误以 HTTP 状态码 + {detail}/字段错误返回。
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
})

// 请求拦截：统一携带 Bearer token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 把 DRF 错误体转成可读字符串
function extractErrorMessage(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join('；')
  // 字段级错误：{ field: [msgs] }
  const fieldMsgs = Object.entries(data)
    .filter(([k]) => k !== 'detail' && k !== 'non_field_errors')
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('；') : v}`)
  return fieldMsgs.join('；')
}

// 响应拦截：DRF 风格，不做 {code,message,data} 解包
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    // 401：无令牌或已过期，清空本地登录态并跳登录（后端无 refresh/logout 端点，无法静默续期）
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('grad_user')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    const message =
      extractErrorMessage(error.response?.data) || error.message || '请求失败'
    return Promise.reject(new Error(message))
  },
)

export default request
