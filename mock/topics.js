// 题目 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐后端 DRF 契约：
// - GET    /api/topics/                      列表（分页 {count,next,previous,results}；可选 status 过滤）
// - POST   /api/topics/:id/approve/          审核通过 → PUBLISHED（body 空）
// - POST   /api/topics/:id/reject/           退回修改 → REJECTED（body: { comment }）
// ADMIN 视角：列表返回全量题目，前端按状态筛选。
const db = [
  { id: 1001, academic_year: 1, title: '基于深度学习的校园能耗预测系统', normalized_title: '基于深度学习的校园能耗预测系统', topic_source: 'TEACHER', proposer: 37, supervisor: 37, description: '面向校园建筑能耗数据，采用 LSTM 等深度学习模型进行短期与中长期能耗预测，为节能调度提供决策支持。需完成数据清洗、模型训练与可视化平台搭建。', status: 'PENDING_REVIEW', review_comment: '' },
  { id: 1002, academic_year: 1, title: '煤矿巷道围岩稳定性数值模拟分析', normalized_title: '煤矿巷道围岩稳定性数值模拟分析', topic_source: 'TEACHER', proposer: 12, supervisor: 12, description: '采用 FLAC3D 建立巷道围岩数值模型，分析不同支护方案下的变形与应力分布，提出优化支护参数。', status: 'PENDING_REVIEW', review_comment: '' },
  { id: 1003, academic_year: 1, title: '智能仓储机器人路径规划算法研究', normalized_title: '智能仓储机器人路径规划算法研究', topic_source: 'ADMIN', proposer: 8, supervisor: 8, description: '研究多 AGV 协同场景下的全局路径规划与局部避障算法，提升仓储拣选效率。', status: 'PENDING_REVIEW', review_comment: '' },
  { id: 1004, academic_year: 1, title: '光伏发电系统最大功率点跟踪控制', normalized_title: '光伏发电系统最大功率点跟踪控制', topic_source: 'TEACHER', proposer: 21, supervisor: 21, description: '对比扰动观察法、电导增量法等 MPPT 策略，在部分遮蔽条件下提升跟踪效率。', status: 'PUBLISHED', review_comment: '' },
  { id: 1005, academic_year: 1, title: '校园二手交易平台的设计与实现', normalized_title: '校园二手交易平台的设计与实现', topic_source: 'TEACHER', proposer: 33, supervisor: 33, description: '基于 Vue + Spring Boot 的校园闲置物品交易系统，含发布、撮合、评价模块。', status: 'PUBLISHED', review_comment: '' },
  { id: 1006, academic_year: 1, title: '基于机器视觉的零件表面缺陷检测', normalized_title: '基于机器视觉的零件表面缺陷检测', topic_source: 'TEACHER', proposer: 45, supervisor: 45, description: '使用 YOLO 系列目标检测模型对工业零件表面划痕、凹坑等缺陷进行识别与定位。', status: 'REJECTED', review_comment: '描述过于简略，缺少技术路线与数据集说明，请补充后重新提交。' },
  { id: 1007, academic_year: 2, title: '新能源汽车电池热管理仿真', normalized_title: '新能源汽车电池热管理仿真', topic_source: 'TEACHER', proposer: 19, supervisor: 19, description: '建立电池包液冷散热模型，分析高倍率充放电下的温度均匀性。', status: 'REJECTED', review_comment: '与往届题目重复度较高，请调整研究切入点。' },
  { id: 1008, academic_year: 1, title: '基于知识图谱的毕业设计选题推荐', normalized_title: '基于知识图谱的毕业设计选题推荐', topic_source: 'ADMIN', proposer: 8, supervisor: 8, description: '构建专业领域知识图谱，结合学生画像做个性化选题推荐。', status: 'DRAFT', review_comment: '' },
  { id: 1009, academic_year: 1, title: '工业物联网边缘计算节点调度优化', normalized_title: '工业物联网边缘计算节点调度优化', topic_source: 'TEACHER', proposer: 27, supervisor: 27, description: '研究边缘节点任务卸载与资源调度策略，降低端到端时延。', status: 'PENDING_DEDUP', review_comment: '' },
]

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
      if (query.status) rows = rows.filter((t) => t.status === query.status)
      if (query.keyword) {
        const kw = String(query.keyword).toLowerCase()
        rows = rows.filter((t) => t.title.toLowerCase().includes(kw))
      }
      return paginate(rows, query)
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
      return { ...item }
    },
  },
]
