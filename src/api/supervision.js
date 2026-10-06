import request from '@/api/request'

// 我的指导情况（教师端）。
// ⚠️ 下列两个端点后端当前【均不存在】（见 docs/backend-interface-analysis.md 第 87、107 行：
// supervision_assignment 仅在选题轮次 close 时由 service 生成，缺 HTTP 端点；
// supervision_statistics 统计 API 同样缺失）。实现期由 mock/supervisions.js 兜底，
// 后端补齐后仅需替换下方路径，前端无需改动：
//   - 建议新增 GET /api/teachers/me/supervisions/   返回 {count,next,previous,results}
//   - 建议新增 GET /api/teachers/me/supervision-statistics/  返回统计对象
// 此外 student 字段后端当前仅存 id（selection-choices 模型），需在 supervision 对象内联
// {name, student_no} 摘要，否则列表无法展示学生姓名/学号（列入后端需求）。
export function getMySupervisions(params = {}) {
  return request.get('/teachers/me/supervisions/', { params })
}

export function getSupervisionStats(params = {}) {
  return request.get('/teachers/me/supervision-statistics/', { params })
}
