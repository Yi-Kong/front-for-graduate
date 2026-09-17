// 认证相关 Mock 接口（开发期，由 vite/plugin-mock.js 自动挂载）
// 结构对齐后端 DRF：裸数据，无 {code,message,data} 包装；
// 登录返回顶层 access / refresh / must_change_password / role_codes（无 token、无嵌套 user）。
export default [
  {
    url: '/api/auth/login/',
    method: 'post',
    response: ({ body }) => {
      const { username } = body || {}
      const profiles = {
        admin: { name: '系统管理员', role_codes: ['ADMIN'], must_change_password: true },
        teacher: { name: '王老师', role_codes: ['TEACHER'], must_change_password: false },
        student: { name: '李同学', role_codes: ['STUDENT'], must_change_password: false },
      }
      const profile = profiles[username] || profiles.student
      return {
        access: 'mock-access-' + username,
        refresh: 'mock-refresh-' + username,
        must_change_password: profile.must_change_password,
        role_codes: profile.role_codes,
      }
    },
  },
  {
    // 登录响应不含 user，前端登录后会再调此接口拉取用户基本信息
    url: '/api/auth/me/',
    method: 'get',
    response: () => ({
      username: 'demo',
      name: '演示用户',
      role_codes: ['ADMIN'],
      must_change_password: false,
    }),
  },
  {
    url: '/api/auth/change-password/',
    method: 'post',
    response: () => ({ detail: '密码修改成功' }),
  },
]
