import request from '@/api/request'

// 工作台概览（所有已登录角色），后端 GET /api/home/overview/
// 返回：当前届次 academic_year(字符串) / 当前阶段 current_stage(字符串|null) / 流程时间轴 timeline / 待办 todos
export function getOverview() {
  return request.get('/home/overview/')
}
