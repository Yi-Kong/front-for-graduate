// 我的指导情况（教师端）展示辅助：阶段进度构建 + 日期格式化

// 将 supervision 对象转换为阶段步骤数组，供 StageProgress 渲染。
// 后端流程确认模块（开题/中期/答辩/成绩）未实现，故仅「选题」为确定节点
// （topic.status === 'SELECTED' 即点亮），其余流程阶段统一置灰并标注未开始。
export function buildStageSteps(row) {
  const selected = !!(row && row.topic && row.topic.status === 'SELECTED')
  const doneText = selected
    ? `已完成 · ${formatDateTime(row.assigned_at)}`
    : '已完成'
  return [
    { name: '选题', done: selected, doneText, todoText: '待选题' },
    { name: '开题', done: false, todoText: '未开始（流程确认模块未上线）' },
    { name: '中期', done: false, todoText: '未开始' },
    { name: '答辩', done: false, todoText: '未开始' },
    { name: '成绩', done: false, todoText: '未开始' },
  ]
}

// 'YYYY-MM-DDTHH:mm:ss' / 'YYYY-MM-DDTHH:mm' -> 'YYYY-MM-DD HH:mm'
export function formatDateTime(v) {
  if (!v || typeof v !== 'string') return '—'
  return v.replace('T', ' ').slice(0, 16)
}
