import request from '@/api/request'

// 选题轮次管理（管理员）。严格对齐后端 DRF 契约（docs/API接口文档.md + backend-interface-analysis.md）：
// - 列表   GET    /api/selection-rounds/                  （返回数组；若启用分页则为 {results,count}，页面容错取 results）
// - 创建   POST   /api/selection-rounds/                   body: { academic_year, round_no, start_time, end_time }
//          ⚠️ 仅提交上述 4 个核心字段；id / status 由系统生成（初态 PENDING），禁止传系统字段
// - 更新   PUT    /api/selection-rounds/:id/
// - 开启   POST   /api/selection-rounds/:id/open/          仅路径 id，无请求体
// - 关闭   POST   /api/selection-rounds/:id/close/         仅路径 id，无请求体；响应返回 { assignments_created }
// - 删除   DELETE /api/selection-rounds/:id/
// 字段说明：
//   academic_year —— 学年 id（整数），对应 academic-years 的资源 id
//   round_no      —— 同一学年内从 1 递增的轮次编号
//   start_time / end_time —— 开放/截止时间（字符串，datetime）
//   status        —— PENDING(待开始) / OPEN(进行中) / CLOSED(已结束)
export function getSelectionRounds() {
  return request.get('/selection-rounds/')
}

export function createSelectionRound(payload) {
  return request.post('/selection-rounds/', {
    academic_year: payload.academic_year,
    round_no: payload.round_no,
    start_time: payload.start_time,
    end_time: payload.end_time,
  })
}

export function updateSelectionRound(id, payload) {
  return request.put(`/selection-rounds/${id}/`, {
    academic_year: payload.academic_year,
    round_no: payload.round_no,
    start_time: payload.start_time,
    end_time: payload.end_time,
  })
}

export function openSelectionRound(id) {
  return request.post(`/selection-rounds/${id}/open/`)
}

export function closeSelectionRound(id) {
  return request.post(`/selection-rounds/${id}/close/`)
}

export function deleteSelectionRound(id) {
  return request.delete(`/selection-rounds/${id}/`)
}
