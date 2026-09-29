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
      { row: 4, no: 'T2026003', name: '王', message: '姓名格式不合规（仅 1 字），应为 2–4 个汉字' },
      { row: 7, no: '—', name: '赵敏', message: '工号缺失，且与学生库现有工号重复校验未通过' },
      { row: 11, no: 'T2026011', name: '陈强', message: '手机号位数不足（当前 4 位）' },
      { row: 23, no: 'T2026023', name: '刘洋', message: '所属院系「人工智能系」不在可选院系列表' },
      { row: 39, no: 'T2026039', name: '孙磊', message: '手机号重复（与第 12 行相同）' },
    ]
  }
  return [
    { row: 3, no: 'S2026003', name: '李', message: '姓名格式不合规（仅 1 字），应为 2–4 个汉字' },
    { row: 9, no: '—', name: '周婷', message: '学号缺失' },
    { row: 15, no: 'S2026015', name: '吴磊', message: '手机号位数不足（当前 3 位）' },
    { row: 28, no: 'S2026028', name: '郑爽', message: '专业「智能建造」不在可选专业列表' },
    { row: 40, no: 'S2026040', name: '王芳', message: '手机号重复（与第 8 行相同）' },
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
    type: type === 'teachers' ? '教师' : '学生',
    type_key: type,
    total_rows: total,
    success_rows: success,
    failed_rows: failed,
    status: failed === 0 ? 'done' : success === 0 ? 'failed' : 'partial',
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    errors,
    committed: false,
  }
}

function batchSummary(b) {
  return {
    id: b.id,
    type: b.type,
    type_key: b.type_key,
    total_rows: b.total_rows,
    success_rows: b.success_rows,
    failed_rows: b.failed_rows,
    status: b.status,
    created_at: b.created_at,
    committed: b.committed,
  }
}

function commitBatch(batchId) {
  const b = batches[batchId]
  if (!b) return { detail: '批次不存在', code: 'not_found' }
  b.committed = true
  return batchSummary(b)
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
    response: ({ body }) => commitBatch(body.batch_id),
  },
  {
    url: '/api/imports/students/commit/',
    method: 'post',
    response: ({ body }) => commitBatch(body.batch_id),
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
      return { errors: b ? b.errors : [] }
    },
  },
]
