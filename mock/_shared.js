// 共享 Mock 状态（仅作依赖模块，不直接作为路由源——文件名以 _ 开头，
// 被 vite/plugin-mock.js 的 loadMocks 跳过）。
// 关键：academic.js 与 home.js 都 import 本模块，且 plugin 不会用 ?t= 额外加载它，
// 从而 home/overview 与 academic-years 的路由操作共享同一份内存（避免双实例导致联动失效）。

const initial = [
  { id:1, name:'2026 届', start_date:'2025-09-01', end_date:'2026-07-31', status:'IN_PROGRESS', is_current:true },
  { id:2, name:'2025 届', start_date:'2024-09-01', end_date:'2025-07-31', status:'FINISHED', is_current:false },
  { id:3, name:'2024 届', start_date:'2023-09-01', end_date:'2024-07-31', status:'ARCHIVED', is_current:false },
]

export const db = initial.map((x) => ({ ...x }))
let nextId = 4

export function currentAcademicYear() {
  const cur = db.find((y) => y.is_current)
  return cur ? cur.name : ''
}

export function clearCurrent() {
  db.forEach((y) => {
    y.is_current = false
  })
}

export function addYear(body) {
  if (body?.is_current) clearCurrent()
  const item = {
    id: nextId++,
    name: body?.name || `${body?.start_date ? body.start_date.slice(0, 4) : ''} 届`,
    start_date: body?.start_date || '',
    end_date: body?.end_date || '',
    status: body?.status || 'DRAFT',
    is_current: !!body?.is_current,
  }
  db.push(item)
  return { ...item }
}

export function updateYear(id, body) {
  const item = db.find((y) => y.id === id)
  if (!item) return { detail: '届次不存在' }
  if (body?.is_current) clearCurrent()
  item.name = body?.name ?? item.name
  item.start_date = body?.start_date ?? item.start_date
  item.end_date = body?.end_date ?? item.end_date
  item.status = body?.status ?? item.status
  if (body?.is_current) item.is_current = true
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
