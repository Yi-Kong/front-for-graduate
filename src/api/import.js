import request from '@/api/request'

// 师生批量导入（管理员）。对齐 backend-interface-analysis.md §5「导入 imports」：
// - 预校验  POST /api/imports/:type/validate/   返回 { batch_id }（不写库）
// - 提交    POST /api/imports/:type/commit/     body { batch_id }，写库返回批次摘要
// - 批次详情 GET  /api/imports/:pk/
// - 错误明细 GET  /api/imports/:pk/errors/
// type ∈ 'teachers' | 'students'。响应拦截器已解包，故以下函数直接返回业务数据。
export function validateImport(type, file) {
  const formData = new FormData()
  if (file) formData.append('file', file)
  return request.post(`/imports/${type}/validate/`, formData)
}

export function commitImport(type, batchId) {
  return request.post(`/imports/${type}/commit/`, { batch_id: batchId })
}

export function getImportBatch(pk) {
  return request.get(`/imports/${pk}/`)
}

export function getImportErrors(pk) {
  return request.get(`/imports/${pk}/errors/`)
}
