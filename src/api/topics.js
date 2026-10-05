import request from '@/api/request'

// 题目（topics）。对齐后端 DRF 约定：
// - 列表 GET /api/topics/   query: page, page_size（可选 status / proposer / keyword 过滤）
//   返回标准分页结构 { count, next, previous, results }
// - 详情 GET /api/topics/:id/
// - 新建 POST /api/topics/    body: title, academic_year, topic_source, proposer, supervisor, description
//                           后端创建时自动跑查重，状态置 PENDING_DEDUP
// - 更新 PUT  /api/topics/:id/  全量更新（改题名自动写 TopicVersion）
// - 提交审核 POST /api/topics/:id/submit-review/  空 body，前置：无未处理疑似重复
// 数据范围：学生视角后端只返回 PUBLISHED；教师视角后端返回本人题目（前端额外传 proposer 兼容 mock）
export function getTopics(params = {}) {
  return request.get('/topics/', { params })
}

// 学生端可选题目：只取 PUBLISHED（后端按角色过滤；mock 同构）
export function getSelectableTopics(params = {}) {
  return request.get('/topics/', { params: { status: 'PUBLISHED', ...params } })
}

export function getTopicDetail(id) {
  return request.get(`/topics/${id}/`)
}

export function createTopic(payload) {
  return request.post('/topics/', payload)
}

export function updateTopic(id, payload) {
  return request.put(`/topics/${id}/`, payload)
}

export function submitReview(id) {
  return request.post(`/topics/${id}/submit-review/`, {})
}

// 管理员审核用（非教师页功能，保留复用）
export function approveTopic(id) {
  return request.post(`/topics/${id}/approve/`, {})
}

export function rejectTopic(id, comment) {
  return request.post(`/topics/${id}/reject/`, { comment })
}
