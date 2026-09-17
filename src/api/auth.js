import request from '@/api/request'

// 认证相关接口（对齐后端 /api/auth/ 前缀，DRF 标准响应）
// 后端登录返回顶层：access / refresh / must_change_password / role_codes（无 token、无嵌套 user）
export function login(data) {
  return request.post('/auth/login/', data)
}

export function changePassword(data) {
  return request.post('/auth/change-password/', data)
}

// 登录响应不含 user 对象，需再拉当前用户基本信息
export function me() {
  return request.get('/auth/me/')
}
