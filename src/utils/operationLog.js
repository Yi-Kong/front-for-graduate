// 操作日志页相关纯函数与展示元数据，供筛选栏、详情抽屉、列表复用

// 操作类型 → 展示文案 + pill 配色（对齐后端文档大写枚举）
export const ACTION_META = {
  LOGIN: { label: '登录', pill: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' },
  CREATE: { label: '创建', pill: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' },
  UPDATE: { label: '更新', pill: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' },
  DELETE: { label: '删除', pill: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' },
  IMPORT: { label: '导入', pill: 'bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]' },
  REVIEW: { label: '审核', pill: 'bg-[#ecfeff] text-[#0e7490] border-[#a5f3fc]' },
  EXPORT: { label: '导出', pill: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' },
  SELECTION: { label: '选题', pill: 'bg-[#fdf4ff] text-[#a21caf] border-[#f5d0fe]' },
}

export function actionMeta(a) {
  return ACTION_META[a] || { label: a, pill: 'bg-gray-100 text-gray-500 border-gray-200' }
}

// 详情列展示 before_data / after_data 的 JSON 快照
export function logSnapshot(log) {
  const d = log?.after_data || log?.before_data
  return d ? JSON.stringify(d) : '—'
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// 时间范围 → DRF 查询参数（date_from / date_to）
export function rangeToDates(range) {
  if (!range) return {}
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 0
  if (!days) return {}
  const to = new Date()
  const from = new Date(to.getTime() - days * 86400000)
  const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return { date_from: fmt(from), date_to: fmt(to) }
}
