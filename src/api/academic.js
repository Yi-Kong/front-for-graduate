import request from '@/api/request'

// 届次管理（管理员）。对齐后端 DRF 约定：
// - 列表   GET    /api/academic-years/                  （返回数组；若后端启用分页则为 {results,count}，这里容错取其 results）
// - 创建   POST   /api/academic-years/                   body: { name, start_date, end_date, status, is_current }
// - 更新   PUT    /api/academic-years/:id/
// - 设为当前 POST  /api/academic-years/:id/activate/
// - 删除   DELETE /api/academic-years/:id/
export function getAcademicYears() {
  return request.get('/academic-years/')
}

export function createAcademicYear(payload) {
  return request.post('/academic-years/', payload)
}

export function updateAcademicYear(id, payload) {
  return request.put(`/academic-years/${id}/`, payload)
}

export function activateAcademicYear(id) {
  return request.post(`/academic-years/${id}/activate/`)
}

export function deleteAcademicYear(id) {
  return request.delete(`/academic-years/${id}/`)
}
