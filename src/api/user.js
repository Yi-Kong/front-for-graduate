import request from './request'

// 获取用户列表
export function getUserList() {
  return request.get('/user/list')
}

// 获取用户详情
export function getUserDetail(id) {
  return request.get('/user/detail', { params: { id } })
}

// 登录
export function login(data) {
  return request.post('/login', data)
}
