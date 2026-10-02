<script setup>
import { computed, inject } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import SchoolEmblem from '@/components/SchoolEmblem.vue'

const auth = useAuthStore()
const router = useRouter()
const sidebarOpen = inject('sidebarOpen')
const closeSidebar = inject('closeSidebar')

const ROLE_LABEL = { ADMIN: '管理员', TEACHER: '教师', STUDENT: '学生' }

// 图标内联 SVG（authored，静态可信，用 v-html 渲染）
const ICONS = {
  dashboard:
    '<rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.7"/>',
  users:
    '<circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  import:
    '<path d="M12 3v12M12 15v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8 7h8M8 11h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  check:
    '<path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.7"/>',
  clock:
    '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  log:
    '<path d="M5 5h14v14H5z" stroke="currentColor" stroke-width="1.7"/><path d="M8 10h8M8 14h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  doc:
    '<path d="M4 19V5a1 1 0 0 1 1-1h9l5 5v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" stroke="currentColor" stroke-width="1.7"/><path d="M14 4v5h5" stroke="currentColor" stroke-width="1.7"/>',
  mentor:
    '<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="10" r="2.4" stroke="currentColor" stroke-width="1.7"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M14 19c0-2 1.6-3.6 3.6-3.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  list:
    '<path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  pick:
    '<path d="M5 12.5 10 17l9-10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
}

// 菜单配置：每组用 roles 声明可见角色，组内项默认继承组角色；
// 若某 item 单独写 roles 则覆盖组角色（当前无此需求）。
const MENU = [
  {
    group: '通用',
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    items: [{ to: 'home', label: '工作台', icon: 'dashboard' }],
  },
  {
    group: '管理员',
    roles: ['ADMIN'],
    items: [
      { to: 'academic-years', label: '届次管理', icon: 'users' },
      { to: 'import-users', label: '师生批量导入', icon: 'import' },
      { to: 'topic-review', label: '题目审核', icon: 'check' },
      { to: 'selection-rounds', label: '选题轮次管理', icon: 'clock' },
      { to: 'operation-logs', label: '操作日志', icon: 'log' },
    ],
  },
  {
    group: '教师',
    roles: ['TEACHER'],
    items: [
      { to: 'my-topics', label: '我的题目申报', icon: 'doc' },
      { to: 'my-supervision', label: '我的指导情况', icon: 'mentor' },
    ],
  },
  {
    group: '学生',
    roles: ['STUDENT'],
    items: [
      { to: 'topic-browse', label: '题目浏览', icon: 'list' },
      { to: 'my-selection', label: '我的选题', icon: 'pick' },
    ],
  },
]

// 仅显示当前角色可见的菜单组与项（组级 roles 控制整组可见性，item 可单独覆盖）
const visibleGroups = computed(() => {
  const roles = auth.roleCodes || []
  return MENU
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => (i.roles || g.roles).some((r) => roles.includes(r))),
    }))
    .filter((g) => g.items.length > 0)
})

const userName = computed(() => auth.user?.real_name || '未命名用户')
const userInitial = computed(() => (userName.value || '?').slice(0, 1))
const userRoleLabel = computed(() => ROLE_LABEL[(auth.roleCodes || [])[0]] || '用户')

function onLogout() {
  auth.logout()
  router.replace('/login')
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- 品牌头 -->
    <div class="flex items-center gap-3 border-b border-gray-200 px-[18px] py-[18px]">
      <SchoolEmblem :size="30" />
      <div>
        <div class="text-[15px] font-bold leading-[1.2] tracking-[0.5px]">毕业设计综合管理系统</div>
        <div class="mt-[2px] text-[10px] tracking-[0.5px] text-gray-400">SHANXI INSTITUTE OF ENERGY</div>
      </div>
    </div>

    <!-- 菜单（按 role_codes 过滤） -->
    <nav class="flex-1 overflow-y-auto px-3 py-3">
      <template v-for="g in visibleGroups" :key="g.group">
        <div class="px-3 pb-1.5 pt-3 text-[11px] font-semibold tracking-[1px] text-gray-400">{{ g.group }}</div>
        <RouterLink
          v-for="item in g.items"
          :key="item.to"
          :to="{ name: item.to }"
          class="mb-0.5 flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[14px] text-gray-700 no-underline transition hover:bg-gray-100"
          active-class="bg-[#fdecee] font-semibold text-[#8F1822]"
          @click="closeSidebar"
        >
          <span class="ico" v-html="ICONS[item.icon]"></span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </template>
    </nav>

    <!-- 用户态 -->
    <div class="flex items-center gap-2.5 border-t border-gray-200 p-3.5">
      <div class="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#C0202E] text-[14px] font-semibold text-white">
        {{ userInitial }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="truncate text-[13.5px] font-semibold">{{ userName }}</div>
        <div class="text-[11.5px] text-gray-400">{{ userRoleLabel }} · {{ (auth.roleCodes || [])[0] }}</div>
      </div>
      <button
        class="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gray-100 text-gray-400 transition hover:bg-[#fdecee] hover:text-[#C0202E]"
        title="退出登录"
        @click="onLogout"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 12H4M4 12l3.5-3.5M4 12l3.5 3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" stroke="currentColor" stroke-width="1.7"/></svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.ico {
  width: 18px;
  height: 18px;
  flex: none;
  color: currentColor;
}
.ico :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}
</style>
