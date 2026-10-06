// 认证相关 Mock 接口（开发期，由 vite/plugin-mock.js 自动挂载）
// 结构对齐后端 DRF：裸数据，无 {code,message,data} 包装；
// 登录返回顶层 access / refresh / must_change_password / real_name / role_codes（无嵌套 user）。
//
// 账号档案只在此处定义一份，/auth/login/ 与 /auth/me/ 共用：
// /auth/me/ 依据请求头 Authorization 里的 access 令牌反解账号，
// 避免出现「登录成学生、/me 却返回管理员」的身份错位。
const PROFILES = {
  admin: {
    id: 1,
    username: 'admin',
    real_name: '系统管理员',
    phone: '13800000000',
    user_status: 'ACTIVE',
    role_codes: ['ADMIN'],
    must_change_password: true,
  },
  teacher: {
    id: 2,
    username: 'teacher',
    real_name: '王老师',
    phone: '13800000001',
    user_status: 'ACTIVE',
    role_codes: ['TEACHER'],
    must_change_password: false,
  },
  student: {
    id: 3,
    username: 'student',
    real_name: '李同学',
    phone: '13800000002',
    user_status: 'ACTIVE',
    role_codes: ['STUDENT'],
    must_change_password: false,
  },
}

const TOKEN_PREFIX = 'mock-access-'

// 未预置的账号按学生兜底，用户名原样回显，保证 login 与 /auth/me/ 身份一致
function profileFor(username) {
  const key = String(username || '').trim()
  if (PROFILES[key]) return PROFILES[key]
  return {
    id: 0,
    username: key || 'student',
    real_name: key || '演示用户',
    phone: '',
    user_status: 'ACTIVE',
    role_codes: ['STUDENT'],
    must_change_password: false,
  }
}

// 从 Authorization: Bearer mock-access-<username> 反解当前账号
function profileFromToken(headers) {
  const raw = headers?.authorization || headers?.Authorization || ''
  const token = String(raw).replace(/^Bearer\s+/i, '').trim()
  if (!token.startsWith(TOKEN_PREFIX)) return null
  return profileFor(token.slice(TOKEN_PREFIX.length))
}

export default [
  {
    url: '/api/auth/login/',
    method: 'post',
    response: ({ body }) => {
      const profile = profileFor(body?.username)
      return {
        access: TOKEN_PREFIX + profile.username,
        refresh: 'mock-refresh-' + profile.username,
        must_change_password: profile.must_change_password,
        real_name: profile.real_name,
        role_codes: profile.role_codes,
      }
    },
  },
  {
    // 登录响应不含 user，前端登录后会再调此接口拉取用户基本信息。
    // 身份以请求头携带的 access 令牌为准；无令牌/令牌格式不对按后端行为返回 401。
    url: '/api/auth/me/',
    method: 'get',
    response: ({ headers }) => {
      const profile = profileFromToken(headers)
      if (!profile) {
        return {
          __mockError: { status: 401, body: { detail: '身份认证信息未提供。' } },
        }
      }
      const { must_change_password, ...me } = profile
      // 文档的 /me/ 字段表未列 must_change_password，这里补上：
      // 让「刷新后仍处于强制改密态」与登录响应保持一致（store 初始化时会读它）
      return { ...me, must_change_password }
    },
  },
  {
    url: '/api/auth/change-password/',
    method: 'post',
    response: () => ({ detail: '密码修改成功' }),
  },
]
