// 操作日志 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐后端 DRF：
// - GET    /api/operation-logs/        列表（query: operator / action / date_from / date_to / search / page）
//                                      返回 { count, next, previous, results }
// - GET    /api/operation-logs/:id/     详情
// 注意：以下字段严格对齐 API 接口文档——operator_name / operation_type(大写枚举) /
// target_type / target_id / before_data / after_data / ip_address / created_at。
function pad(n) {
  return String(n).padStart(2, '0')
}

function buildLogs() {
  const operators = [
    { operator_name: '王管理员' },
    { operator_name: '李老师' },
    { operator_name: '张老师' },
    { operator_name: '赵老师' },
  ]
  const operation_types = ['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'REVIEW', 'EXPORT', 'SELECTION']
  const topics = [
    '基于 LSTM 的电力负荷预测',
    '校园能耗监测平台设计',
    '煤矿通风系统优化仿真',
    '毕业设计过程管理系统设计与实现',
    '光伏阵列故障诊断算法研究',
    '智能仓储调度系统',
    '配电网无功优化',
    '工业互联网数据采集终端',
  ]
  const logs = []
  let id = 1
  const base = new Date('2026-09-29T14:32:08')
  for (let i = 0; i < 46; i++) {
    const operation_type = operation_types[i % operation_types.length]
    const op = operators[i % operators.length]
    let target_type = '—'
    let target_id = ''
    let before_data = null
    let after_data = null
    if (operation_type === 'LOGIN') {
      after_data = { event: '登录系统', channel: 'web' }
    } else if (operation_type === 'CREATE') {
      const t = topics[i % topics.length]
      target_type = '题目'
      target_id = `#T-${2000 + i}`
      after_data = { title: t, status: 'PENDING_DEDUP' }
    } else if (operation_type === 'UPDATE') {
      const t = topics[i % topics.length]
      target_type = '题目'
      target_id = `#T-${2000 + i}`
      before_data = { title: t }
      after_data = { title: t, status: 'PENDING_REVIEW' }
    } else if (operation_type === 'DELETE') {
      target_type = '届次'
      target_id = '2024 届'
      before_data = { name: '2024 届' }
      after_data = { deleted: true }
    } else if (operation_type === 'IMPORT') {
      const ok = 300 + (i % 9)
      const fail = i % 5
      target_type = '学生导入批次'
      target_id = `#B-${100 + i}`
      after_data = { total: ok + fail, success: ok, failed: fail }
    } else if (operation_type === 'REVIEW') {
      const t = topics[i % topics.length]
      target_type = '题目'
      target_id = `#T-${2000 + i}`
      before_data = { status: 'PENDING_REVIEW' }
      after_data = { status: 'APPROVED' }
    } else if (operation_type === 'EXPORT') {
      target_type = '操作日志'
      target_id = 'export.csv'
      after_data = { rows: 120 }
    } else if (operation_type === 'SELECTION') {
      const t = topics[i % topics.length]
      target_type = '选题'
      target_id = `#S-${2000 + i}`
      after_data = { student: 'S2026001', topic: t }
    }
    const d = new Date(base.getTime() - i * 5 * 3600 * 1000 - (i % 7) * 60000)
    const created = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    logs.push({
      id,
      created_at: created,
      operator_name: op.operator_name,
      operation_type,
      target_type,
      target_id,
      before_data,
      after_data,
      ip_address: `10.12.3.${10 + (i % 50)}`,
    })
    id++
  }
  return logs
}

const logs = buildLogs()
const PAGE_SIZE = 20

function applyFilters(list, q) {
  let r = list.slice()
  if (q.operator) {
    const k = String(q.operator).toLowerCase()
    r = r.filter((l) => l.operator_name.toLowerCase().includes(k))
  }
  if (q.action) r = r.filter((l) => l.operation_type === q.action)
  if (q.search) {
    const k = String(q.search).toLowerCase()
    r = r.filter((l) => {
      const snapshot = JSON.stringify(l.before_data || {}) + JSON.stringify(l.after_data || {})
      return (
        snapshot + l.target_type + l.target_id
      ).toLowerCase().includes(k)
    })
  }
  if (q.date_from) r = r.filter((l) => l.created_at >= q.date_from)
  if (q.date_to)
    r = r.filter((l) => l.created_at <= q.date_to + ' 23:59:59')
  return r
}

export default [
  {
    url: '/api/operation-logs/',
    method: 'get',
    response: ({ query }) => {
      const filtered = applyFilters(logs, query || {})
      const page = Math.max(1, Number(query?.page) || 1)
      const start = (page - 1) * PAGE_SIZE
      const results = filtered.slice(start, start + PAGE_SIZE)
      const count = filtered.length
      const next =
        start + PAGE_SIZE < count
          ? `/api/operation-logs/?page=${page + 1}`
          : null
      const previous =
        page > 1 ? `/api/operation-logs/?page=${page - 1}` : null
      return { count, next, previous, results }
    },
  },
  {
    url: '/api/operation-logs/:id',
    method: 'get',
    response: ({ params }) => {
      const item = logs.find((l) => String(l.id) === String(params.id))
      return item ? { ...item } : { detail: '日志不存在' }
    },
  },
]
