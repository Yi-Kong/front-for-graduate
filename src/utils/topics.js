// 题目相关展示映射（供 #13 题目浏览 / #11 我的题目申报 / #8 题目审核 复用）

const STATUS_LABEL = {
  DRAFT: '草稿',
  PENDING_DEDUP: '待查重',
  DEDUP_DONE: '查重完成',
  PENDING_REVIEW: '待审核',
  APPROVED: '审核通过',
  REJECTED: '退回修改',
  PUBLISHED: '已发布',
  SELECTED: '已选定',
  ARCHIVED: '已归档',
}

// 状态 -> 颜色变体（green/red/amber/blue/gray），与 TopicTable 的 BADGE 映射对应
const STATUS_VARIANT = {
  DRAFT: 'gray',
  PENDING_DEDUP: 'gray',
  DEDUP_DONE: 'blue',
  PENDING_REVIEW: 'amber',
  APPROVED: 'green',
  REJECTED: 'red',
  PUBLISHED: 'green',
  SELECTED: 'blue',
  ARCHIVED: 'gray',
}

const SOURCE_LABEL = {
  TEACHER: '教师申报',
  ADMIN: '管理员录入',
}

export function statusLabel(s) {
  return STATUS_LABEL[s] || s || '—'
}

export function statusVariant(s) {
  return STATUS_VARIANT[s] || 'gray'
}

export function sourceLabel(s) {
  return SOURCE_LABEL[s] || s || '—'
}
