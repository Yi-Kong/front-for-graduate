// 师生批量导入 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐 backend-interface-analysis.md §5「导入 imports」：
// - 预校验  POST /api/imports/:type/validate/   返回 { batch_id }（仅建预校验批次，不写账号库）
// - 提交    POST /api/imports/:type/commit/     body { batch_id }，写库返回批次摘要
// - 批次详情 GET  /api/imports/:pk/
// - 错误明细 GET  /api/imports/:pk/errors/
// type ∈ teachers | students。以上均为 IsAdmin。
//
// ⚠️ 说明：本 mock 不解析真实 Excel，validate 忽略上传内容，直接返回一组固定的校验结果，
// 仅用于驱动前端流程演示。真实后端会解析文件并按字段校验（字段以后端为准）。
const batches = {}
let seq = 0

function buildErrors(type) {
  if (type === 'teachers') {
    return [
      { row_no: 4, field_name: '姓名', raw_value: '王', error_message: '姓名格式不合规（仅 1 字），应为 2–4 个汉字' },
      { row_no: 7, field_name: '工号', raw_value: '—', error_message: '工号缺失，且与学生库现有工号重复校验未通过' },
      { row_no: 11, field_name: '手机号', raw_value: '1380', error_message: '手机号位数不足（当前 4 位）' },
      { row_no: 23, field_name: '所属院系', raw_value: '人工智能系', error_message: '所属院系「人工智能系」不在可选院系列表' },
      { row_no: 39, field_name: '手机号', raw_value: '13800000012', error_message: '手机号重复（与第 12 行相同）' },
    ]
  }
  return [
    { row_no: 3, field_name: '姓名', raw_value: '李', error_message: '姓名格式不合规（仅 1 字），应为 2–4 个汉字' },
    { row_no: 9, field_name: '学号', raw_value: '—', error_message: '学号缺失' },
    { row_no: 15, field_name: '手机号', raw_value: '1390', error_message: '手机号位数不足（当前 3 位）' },
    { row_no: 28, field_name: '专业', raw_value: '智能建造', error_message: '专业「智能建造」不在可选专业列表' },
    { row_no: 40, field_name: '手机号', raw_value: '13900000008', error_message: '手机号重复（与第 8 行相同）' },
  ]
}

function buildBatch(type) {
  const errors = buildErrors(type)
  const total = 120
  const failed = errors.length
  const success = total - failed
  seq += 1
  const id = `IMP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(seq).padStart(3, '0')}`
  return {
    id,
    import_type: type === 'teachers' ? 'TEACHER' : 'STUDENT',
    total_rows: total,
    success_rows: success,
    failed_rows: failed,
    status: failed === 0 ? 'done' : success === 0 ? 'failed' : 'partial',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    errors,
  }
}

function batchSummary(b) {
  return {
    id: b.id,
    import_type: b.import_type,
    total_rows: b.total_rows,
    success_rows: b.success_rows,
    failed_rows: b.failed_rows,
    status: b.status,
    created_at: b.created_at,
  }
}

function commitBatch(batchId, type) {
  const b = batches[batchId]
  if (!b) return { detail: '批次不存在', code: 'not_found' }
  if (type === 'teachers') {
    const created = Math.ceil(b.success_rows * 0.7)
    return { batch_id: batchId, created, updated: b.success_rows - created }
  }
  return { batch_id: batchId, success_rows: b.success_rows }
}

export default [
  {
    url: '/api/imports/teachers/validate/',
    method: 'post',
    response: () => {
      const b = buildBatch('teachers')
      batches[b.id] = b
      return { batch_id: b.id }
    },
  },
  {
    url: '/api/imports/students/validate/',
    method: 'post',
    response: () => {
      const b = buildBatch('students')
      batches[b.id] = b
      return { batch_id: b.id }
    },
  },
  {
    url: '/api/imports/teachers/commit/',
    method: 'post',
    response: ({ body }) => commitBatch(body.batch_id, 'teachers'),
  },
  {
    url: '/api/imports/students/commit/',
    method: 'post',
    response: ({ body }) => commitBatch(body.batch_id, 'students'),
  },
  {
    url: '/api/imports/:pk/',
    method: 'get',
    response: ({ params }) => {
      const b = batches[params.pk]
      return b ? batchSummary(b) : { detail: '批次不存在', code: 'not_found' }
    },
  },
  {
    url: '/api/imports/:pk/errors/',
    method: 'get',
    response: ({ params }) => {
      const b = batches[params.pk]
      return b ? b.errors : []
    },
  },
]
