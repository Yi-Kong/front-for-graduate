// 共享 Mock 状态（仅作依赖模块，不直接作为路由源——文件名以 _ 开头，
// 被 vite/plugin-mock.js 的 loadMocks 跳过）。
// 关键：academic.js 与 home.js 都 import 本模块，且 plugin 不会用 ?t= 额外加载它，
// 从而 home/overview 与 academic-years 的路由操作共享同一份内存（避免双实例导致联动失效）。

const initial = [
  { id:1, name:'2026 届', start_year:2025, end_year:2026, is_current:true,  created_at:'2025-09-01 10:24' },
  { id:2, name:'2025 届', start_year:2024, end_year:2025, is_current:false, created_at:'2024-09-02 09:10' },
  { id:3, name:'2024 届', start_year:2023, end_year:2024, is_current:false, created_at:'2023-08-28 14:30' },
]

export const db = initial.map((x) => ({ ...x }))
let nextId = 4

export function currentAcademicYear() {
  const cur = db.find((y) => y.is_current)
  return cur ? { id: cur.id, name: cur.name } : null
}

export function clearCurrent() {
  db.forEach((y) => {
    y.is_current = false
  })
}

export function addYear(body) {
  if (body?.set_current) clearCurrent()
  const item = {
    id: nextId++,
    name: body?.name || `${body?.start_year || ''} 届`,
    start_year: Number(body?.start_year) || 0,
    end_year: Number(body?.end_year) || 0,
    is_current: !!body?.set_current,
    created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
  }
  db.push(item)
  return { ...item }
}

export function updateYear(id, body) {
  const item = db.find((y) => y.id === id)
  if (!item) return { detail: '届次不存在' }
  if (body?.set_current) clearCurrent()
  item.name = body?.name ?? item.name
  item.start_year = Number(body?.start_year) || item.start_year
  item.end_year = Number(body?.end_year) || item.end_year
  if (body?.set_current) item.is_current = true
  return { ...item }
}

export function activateYear(id) {
  clearCurrent()
  const item = db.find((y) => y.id === id)
  if (!item) return { detail: '届次不存在' }
  item.is_current = true
  return { ...item }
}

export function deleteYear(id) {
  const idx = db.findIndex((y) => y.id === id)
  if (idx === -1) return { detail: '届次不存在' }
  db.splice(idx, 1)
  return { deleted: id }
}
