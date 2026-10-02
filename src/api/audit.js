import request from '@/api/request'

// 操作日志（管理员，IsAdmin）。对齐后端 DRF 约定：
// - 列表   GET    /api/operation-logs/      query 可带 operator / action / date_from / date_to / search / page
//                                    返回标准 DRF 分页结构 { count, next, previous, results }
// - 详情   GET    /api/operation-logs/:id/
// 说明：后端文档（backend-interface-analysis.md）仅列出端点，字段以 API 接口文档为准——
// operator_name / operation_type / target_type / target_id / before_data / after_data /
// ip_address / created_at。
export function getOperationLogs(params = {}) {
  return request.get('/operation-logs/', { params })
}

export function getOperationLogDetail(id) {
  return request.get(`/operation-logs/${id}/`)
}
