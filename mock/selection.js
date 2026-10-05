// 选题轮次管理 Mock（开发期，由 vite/plugin-mock.js 自动挂载，文件名非 _ 开头）
// 对齐后端 DRF 契约：selection-rounds CRUD + open/close（仅路径参数，无请求体）
// 共享状态为内存数组；rounds 通过 academic_year 字段引用 academic-years 的 id，
// 前端在表单内通过 getAcademicYears() 做 id→名称映射，这里只存整数 id。
//
// 数据持久化：mock 插件会在 mock/ 下任意文件变动时通过动态重导入热加载模块，
// 若 db 写在模块顶层 const，重导入会重置为种子数据、且重启也丢失。因此把数组
// 落盘到 node_modules/.mock-state/selection.json（位于 mock/ 之外，不会触发
// fs.watch 重加载循环），变更后调用 commit() 落盘，使数据在重启/改动后仍然保留。
import fs from 'node:fs'
import path from 'node:path'

const stateDir = path.resolve(process.cwd(), 'node_modules', '.mock-state')
const stateFile = path.join(stateDir, 'selection.json')

function loadDb(seed) {
  let arr = seed.map((x) => ({ ...x }))
  if (fs.existsSync(stateFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
      if (Array.isArray(parsed)) arr = parsed
    } catch {
      // 文件损坏则回退到种子数据
    }
  }
  return arr
}

function commit(arr) {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(stateFile, JSON.stringify(arr, null, 2))
  } catch {
    // 忽略写入失败（如目录只读）
  }
}

const seed = [
  {
    id: 1,
    academic_year: 1, // 2026 届
    round_no: 1,
    start_time: '2026-10-01T09:00',
    end_time: '2026-10-20T23:59',
    status: 'OPEN',
  },
  {
    id: 2,
    academic_year: 1, // 2026 届
    round_no: 2,
    start_time: '2026-11-01T09:00',
    end_time: '2026-11-12T23:59',
    status: 'PENDING',
  },
  {
    id: 3,
    academic_year: 2, // 2025 届
    round_no: 1,
    start_time: '2025-03-03T09:00',
    end_time: '2025-03-10T23:59',
    status: 'CLOSED',
  },
]

const db = loadDb(seed)
// 首次落盘，保证文件存在
commit(db)
// 自增 id 以「当前最大 id + 1」派生，避免重启后 id 冲突
let nextId = db.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1

function ensureSeconds(v) {
  // datetime-local 值为 "YYYY-MM-DDTHH:mm"，补齐秒以兼容后端 DateTimeField
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
    return v + ':00'
  }
  return v
}

export default [
  {
    url: '/api/selection-rounds/',
    method: 'get',
    response: () => db.map((r) => ({ ...r })),
  },
  {
    url: '/api/selection-rounds/',
    method: 'post',
    response: ({ body }) => {
      const item = {
        id: nextId++,
        academic_year: Number(body?.academic_year),
        round_no: Number(body?.round_no),
        start_time: ensureSeconds(body?.start_time),
        end_time: ensureSeconds(body?.end_time),
        status: 'PENDING',
      }
      db.push(item)
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/selection-rounds/:id/',
    method: 'put',
    response: ({ body, params }) => {
      const item = db.find((r) => r.id === Number(params.id))
      if (!item) return { detail: '轮次不存在' }
      item.academic_year = Number(body?.academic_year ?? item.academic_year)
      item.round_no = Number(body?.round_no ?? item.round_no)
      if (body?.start_time) item.start_time = ensureSeconds(body.start_time)
      if (body?.end_time) item.end_time = ensureSeconds(body.end_time)
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/selection-rounds/:id/open/',
    method: 'post',
    response: ({ params }) => {
      const item = db.find((r) => r.id === Number(params.id))
      if (!item) return { detail: '轮次不存在' }
      item.status = 'OPEN'
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/selection-rounds/:id/close/',
    method: 'post',
    response: ({ params }) => {
      const item = db.find((r) => r.id === Number(params.id))
      if (!item) return { detail: '轮次不存在' }
      item.status = 'CLOSED'
      // 后端真实行为：依据本轮选题结果生成师生指导关系，返回生成数量
      commit(db)
      return { ...item, assignments_created: 128 }
    },
  },
  {
    url: '/api/selection-rounds/:id/',
    method: 'delete',
    response: ({ params }) => {
      const idx = db.findIndex((r) => r.id === Number(params.id))
      if (idx === -1) return { detail: '轮次不存在' }
      db.splice(idx, 1)
      commit(db)
      return { deleted: Number(params.id) }
    },
  },
]
