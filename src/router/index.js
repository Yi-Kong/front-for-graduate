import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/auth/Login.vue'
import ForceChangePwd from '@/views/auth/ForceChangePwd.vue'
import Dashboard from '@/views/home/Dashboard.vue'
import ComingSoon from '@/views/ComingSoon.vue'
import AcademicYear from '@/views/admin/AcademicYear.vue'
import ImportUsers from '@/views/admin/ImportUsers.vue'
import OperationLog from '@/views/admin/OperationLog.vue'
import { useAuthStore } from '@/store/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: '登录', layout: 'blank' },
  },
  {
    path: '/force-change-pwd',
    name: 'force-change-pwd',
    component: ForceChangePwd,
    meta: { title: '修改初始密码', layout: 'blank' },
  },
  // 工作台（全部角色）
  {
    path: '/',
    name: 'home',
    component: Dashboard,
    meta: { title: '工作台', layout: 'app' },
  },
  // 管理员
  { path: '/academic-years', name: 'academic-years', component: AcademicYear, meta: { title: '届次管理', layout: 'app', roles: ['ADMIN'] } },
  { path: '/import-users', name: 'import-users', component: ImportUsers, meta: { title: '师生批量导入', layout: 'app', roles: ['ADMIN'] } },
  { path: '/topic-review', name: 'topic-review', component: ComingSoon, meta: { title: '题目审核', layout: 'app', roles: ['ADMIN'] } },
  { path: '/selection-rounds', name: 'selection-rounds', component: ComingSoon, meta: { title: '选题轮次管理', layout: 'app', roles: ['ADMIN'] } },
  { path: '/operation-logs', name: 'operation-logs', component: OperationLog, meta: { title: '操作日志', layout: 'app', roles: ['ADMIN'] } },
  // 教师
  { path: '/my-topics', name: 'my-topics', component: ComingSoon, meta: { title: '我的题目申报', layout: 'app', roles: ['TEACHER'] } },
  { path: '/my-supervision', name: 'my-supervision', component: ComingSoon, meta: { title: '我的指导情况', layout: 'app', roles: ['TEACHER'] } },
  // 学生
  { path: '/topic-browse', name: 'topic-browse', component: ComingSoon, meta: { title: '题目浏览', layout: 'app', roles: ['STUDENT'] } },
  { path: '/my-selection', name: 'my-selection', component: ComingSoon, meta: { title: '我的选题', layout: 'app', roles: ['STUDENT'] } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫：未登录→登录；未改密→强制改密；角色越权→跳工作台
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.path === '/login') {
    if (auth.isLoggedIn && !auth.mustChangePassword) return { path: '/' }
    return true
  }
  if (to.path === '/force-change-pwd') {
    if (!auth.isLoggedIn) return { path: '/login' }
    if (!auth.mustChangePassword) return { path: '/' }
    return true
  }

  // 已登录态下的受保护路由
  if (!auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (auth.mustChangePassword) {
    return { path: '/force-change-pwd' }
  }

  // 角色越权访问（如学生访问管理员页面）→ 回到工作台
  const roles = to.meta?.roles
  if (Array.isArray(roles) && !roles.some((r) => auth.roleCodes.includes(r))) {
    return { path: '/' }
  }

  return true
})

router.afterEach((to) => {
  document.title = (to.meta.title ? `${to.meta.title} - ` : '') + '毕业设计综合管理系统'
})

export default router
