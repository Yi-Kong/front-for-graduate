// 选题轮次状态展示映射（对照后端 selection-rounds.status: PENDING/OPEN/CLOSED）
const ROUND_STATUS = {
  OPEN: { label: '进行中', variant: 'green' },
  PENDING: { label: '待开始', variant: 'amber' },
  CLOSED: { label: '已结束', variant: 'blue' },
}

export function roundStatusLabel(s) {
  return ROUND_STATUS[s]?.label || s || '—'
}

export function roundStatusVariant(s) {
  return ROUND_STATUS[s]?.variant || 'gray'
}

export function isRoundOpen(round) {
  return !!round && round.status === 'OPEN'
}

export function roundWindowText(round) {
  if (!round || !round.start_time || !round.end_time) return ''
  const fmt = (v) => String(v).replace('T', ' ').slice(0, 16)
  return `开放 ${fmt(round.start_time)}　截止 ${fmt(round.end_time)}`
}
