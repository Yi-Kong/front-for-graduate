import request from '@/api/request'

// 题目（topics）。对齐后端 DRF 约定：
// - 列表 GET /api/topics/   query: page, page_size（可选筛选 title/academic_year/supervisor，待后端确认）
//   返回标准分页结构 { count, next, previous, results }
// - 详情 GET /api/topics/:id/
// 数据范围：学生视角后端只返回 PUBLISHED；前端不做状态过滤。
export function getTopics(params = {}) {
  return request.get('/topics/', { params })
}

export function getTopicDetail(id) {
  return request.get(`/topics/${id}/`)
}
