import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Login from '@/views/auth/Login.vue'
import ForceChangePwd from '@/views/auth/ForceChangePwd.vue'
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
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '用户列表' },
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: '关于' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫：未登录→登录；已登录且需改密→强制改密；带 redirect 回跳
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
  if (!auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

router.afterEach((to) => {
  document.title = (to.meta.title ? `${to.meta.title} - ` : '') + '毕业设计综合管理系统'
})

export default router
