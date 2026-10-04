// 题目 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐后端 DRF 契约：
// - GET    /api/topics/                      列表（分页 {count,next,previous,results}；可选 status / proposer / keyword 过滤）
// - POST   /api/topics/                      新建，后端自动查重 → status=PENDING_DEDUP
// - PUT    /api/topics/:id/                  全量更新
// - POST   /api/topics/:id/submit-review/     提交审核 → PENDING_REVIEW
// - POST   /api/topics/:id/approve/          审核通过 → PUBLISHED（管理员）
// - POST   /api/topics/:id/reject/           退回修改 → REJECTED（管理员）
//
// 持久化：落盘 node_modules/.mock-state/topics.json（位于 mock/ 之外，避免 fs.watch 重加载循环），
// 变更后 commit() 落盘；自增 id 取「当前最大 id + 1」。
import fs from 'node:fs'
import path from 'node:path'

const stateDir = path.resolve(process.cwd(), 'node_modules', '.mock-state')
const stateFile = path.join(stateDir, 'topics.json')

function loadDb(seed) {
  let arr = seed.map((x) => ({ ...x }))
  if (fs.existsSync(stateFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(stateFile, 'utf-8'))
      if (Array.isArray(parsed)) arr = parsed
    } catch {
      // 文件损坏则回退种子
    }
  }
  return arr
}
function commit(arr) {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(stateFile, JSON.stringify(arr, null, 2))
  } catch {
    // 忽略写入失败
  }
}

// 种子：id=1 为当前登录教师（mock 的 /auth/me/ 返回 id:1）的题目，覆盖各状态；
// 其余为其它教师/管理员的题目，用于验证「教师仅见本人」。
const seed = [
  { id: 1, academic_year: 1, title: '基于深度学习的校园能耗预测系统', normalized_title: '基于深度学习的校园能耗预测系统', topic_source: 'TEACHER', proposer: 1, supervisor: 1, description: '面向校园建筑能耗数据，采用 LSTM 等深度学习模型进行短期与中长期能耗预测，为节能调度提供决策支持。', status: 'PENDING_REVIEW', review_comment: '' },
  { id: 2, academic_year: 1, title: '工业物联网边缘计算节点调度优化', normalized_title: '工业物联网边缘计算节点调度优化', topic_source: 'TEACHER', proposer: 1, supervisor: 1, description: '研究边缘节点任务卸载与资源调度策略，降低端到端时延。', status: 'PENDING_DEDUP', review_comment: '' },
  { id: 3, academic_year: 1, title: '基于机器视觉的零件表面缺陷检测', normalized_title: '基于机器视觉的零件表面缺陷检测', topic_source: 'TEACHER', proposer: 1, supervisor: 1, description: '使用 YOLO 系列目标检测模型对工业零件表面划痕、凹坑等缺陷进行识别与定位。', status: 'REJECTED', review_comment: '描述过于简略，缺少技术路线与数据集说明，请补充后重新提交。' },
  { id: 4, academic_year: 1, title: '光伏发电系统最大功率点跟踪控制', normalized_title: '光伏发电系统最大功率点跟踪控制', topic_source: 'TEACHER', proposer: 1, supervisor: 1, description: '对比扰动观察法、电导增量法等 MPPT 策略，在部分遮蔽条件下提升跟踪效率。', status: 'PUBLISHED', review_comment: '' },
  { id: 5, academic_year: 1, title: '智能仓储机器人路径规划算法研究', normalized_title: '智能仓储机器人路径规划算法研究', topic_source: 'TEACHER', proposer: 1, supervisor: 1, description: '研究多 AGV 协同场景下的全局路径规划与局部避障算法，提升仓储拣选效率。', status: 'DRAFT', review_comment: '' },
  { id: 101, academic_year: 1, title: '煤矿巷道围岩稳定性数值模拟分析', normalized_title: '煤矿巷道围岩稳定性数值模拟分析', topic_source: 'TEACHER', proposer: 2, supervisor: 2, description: '采用 FLAC3D 建立巷道围岩数值模型，分析不同支护方案下的变形与应力分布。', status: 'PENDING_REVIEW', review_comment: '' },
  { id: 102, academic_year: 1, title: '校园二手交易平台的设计与实现', normalized_title: '校园二手交易平台的设计与实现', topic_source: 'TEACHER', proposer: 3, supervisor: 3, description: '基于 Vue + Spring Boot 的校园闲置物品交易系统。', status: 'PUBLISHED', review_comment: '' },
  { id: 103, academic_year: 1, title: '基于知识图谱的毕业设计选题推荐', normalized_title: '基于知识图谱的毕业设计选题推荐', topic_source: 'ADMIN', proposer: 3, supervisor: 3, description: '构建专业领域知识图谱，结合学生画像做个性化选题推荐。', status: 'DRAFT', review_comment: '' },
]

const db = loadDb(seed)
commit(db)
let nextId = db.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1

function paginate(rows, query) {
  const page = Number(query.page) || 1
  const size = Number(query.page_size) || 10
  const start = (page - 1) * size
  const slice = rows.slice(start, start + size)
  const next = start + size < rows.length ? `?page=${page + 1}&page_size=${size}` : null
  const previous = page > 1 ? `?page=${page - 1}&page_size=${size}` : null
  return { count: rows.length, next, previous, results: slice.map((t) => ({ ...t })) }
}

export default [
  {
    url: '/api/topics/',
    method: 'get',
    response: ({ query }) => {
      let rows = db
      if (query.proposer) rows = rows.filter((t) => t.proposer === Number(query.proposer))
      if (query.status) rows = rows.filter((t) => t.status === query.status)
      if (query.keyword) {
        const kw = String(query.keyword).toLowerCase()
        rows = rows.filter((t) => t.title.toLowerCase().includes(kw))
      }
      return paginate(rows, query)
    },
  },
  {
    url: '/api/topics/',
    method: 'post',
    response: ({ body }) => {
      const item = {
        id: nextId++,
        academic_year: Number(body?.academic_year),
        title: body?.title || '',
        normalized_title: body?.title || '',
        topic_source: body?.topic_source || 'TEACHER',
        proposer: Number(body?.proposer),
        supervisor: Number(body?.supervisor),
        description: body?.description || '',
        status: 'PENDING_DEDUP',
        review_comment: '',
      }
      db.push(item)
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/topics/:id/',
    method: 'put',
    response: ({ body, params }) => {
      const item = db.find((t) => t.id === Number(params.id))
      if (!item) return { detail: '题目不存在' }
      if (body?.title !== undefined) { item.title = body.title; item.normalized_title = body.title }
      if (body?.academic_year !== undefined) item.academic_year = Number(body.academic_year)
      if (body?.topic_source !== undefined) item.topic_source = body.topic_source
      if (body?.proposer !== undefined) item.proposer = Number(body.proposer)
      if (body?.supervisor !== undefined) item.supervisor = Number(body.supervisor)
      if (body?.description !== undefined) item.description = body.description
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/topics/:id/submit-review/',
    method: 'post',
    response: ({ params }) => {
      const item = db.find((t) => t.id === Number(params.id))
      if (!item) return { detail: '题目不存在' }
      item.status = 'PENDING_REVIEW'
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/topics/:id/approve/',
    method: 'post',
    response: ({ params }) => {
      const item = db.find((t) => t.id === Number(params.id))
      if (!item) return { detail: '题目不存在' }
      item.status = 'PUBLISHED'
      item.review_comment = ''
      commit(db)
      return { ...item }
    },
  },
  {
    url: '/api/topics/:id/reject/',
    method: 'post',
    response: ({ params, body }) => {
      const item = db.find((t) => t.id === Number(params.id))
      if (!item) return { detail: '题目不存在' }
      item.status = 'REJECTED'
      item.review_comment = body?.comment || ''
      commit(db)
      return { ...item }
    },
  },
]
