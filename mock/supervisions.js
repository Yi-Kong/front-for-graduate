// 我的指导情况 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对应教师端 GET /api/teachers/me/supervisions/ 与 GET /api/teachers/me/supervision-statistics/。
// ⚠️ 这两个端点后端当前均不存在（backend-interface-analysis.md）：仅 service/模型层有，
// 缺 HTTP 端点。此处用 mock 兜底，字段形态即「建议后端补齐时的理想契约」。
//
// 持久化：落盘 node_modules/.mock-state/supervisions.json（位于 mock/ 之外，避免 fs.watch 重加载循环），
// 变更后 commit() 落盘；自增 id 取「当前最大 id + 1」。
import fs from 'node:fs'
import path from 'node:path'

const stateDir = path.resolve(process.cwd(), 'node_modules', '.mock-state')
const stateFile = path.join(stateDir, 'supervisions.json')

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
    // 忽略写入失败（如目录只读）
  }
}

// 种子：当前登录教师 id=1（mock 的 /auth/me/ 返回 id:1）的指导关系。
// 选题轮次关闭后系统生成；这里直接给出「已选题」态（topic.status=SELECTED）。
// 流程阶段（开题/中期/答辩/成绩）后端未实现，故 supervision 对象不含阶段字段，
// 前端仅以「已选题」作为确定节点，其余阶段统一置灰（见 StageProgress）。
const seed = [
  {
    id: 1, academic_year: 1, selection_round: 2, assigned_at: '2026-03-12T10:24:00',
    student: { id: 101, name: '张伟', student_no: '2021010301' },
    topic: { id: 4, title: '光伏发电系统最大功率点跟踪控制', topic_source: 'TEACHER', status: 'SELECTED', description: '对比扰动观察法、电导增量法等 MPPT 策略，在部分遮蔽条件下提升跟踪效率。' },
  },
  {
    id: 2, academic_year: 1, selection_round: 2, assigned_at: '2026-03-12T10:30:00',
    student: { id: 102, name: '王芳', student_no: '2021010302' },
    topic: { id: 5, title: '智能仓储机器人路径规划算法研究', topic_source: 'TEACHER', status: 'SELECTED', description: '研究多 AGV 协同场景下的全局路径规划与局部避障算法，提升仓储拣选效率。' },
  },
  {
    id: 3, academic_year: 1, selection_round: 2, assigned_at: '2026-03-12T10:42:00',
    student: { id: 103, name: '陈晨', student_no: '2021010303' },
    topic: { id: 103, title: '基于知识图谱的毕业设计选题推荐', topic_source: 'ADMIN', status: 'SELECTED', description: '构建专业领域知识图谱，结合学生画像做个性化选题推荐。' },
  },
  {
    id: 4, academic_year: 1, selection_round: 1, assigned_at: '2026-03-05T09:15:00',
    student: { id: 104, name: '刘洋', student_no: '2021010304' },
    topic: { id: 6, title: '分布式光伏并网控制系统设计', topic_source: 'TEACHER', status: 'SELECTED', description: '研究并网逆变器的控制策略与电能质量治理，保证并网稳定。' },
  },
  {
    id: 5, academic_year: 1, selection_round: 2, assigned_at: '2026-03-12T11:02:00',
    student: { id: 105, name: '赵敏', student_no: '2021010305' },
    topic: { id: 7, title: '基于数字孪生的矿井通风系统优化', topic_source: 'TEACHER', status: 'SELECTED', description: '建立矿井通风数字孪生模型，优化风量分配与节能运行。' },
  },
  {
    id: 6, academic_year: 1, selection_round: 2, assigned_at: '2026-03-12T11:20:00',
    student: { id: 106, name: '孙磊', student_no: '2021010306' },
    topic: { id: 8, title: '校园充电桩智能调度与计费系统', topic_source: 'ADMIN', status: 'SELECTED', description: '面向校园场景的充电桩排队调度与分时计费平台。' },
  },
  {
    id: 7, academic_year: 1, selection_round: 1, assigned_at: '2026-03-05T09:40:00',
    student: { id: 107, name: '周婷', student_no: '2021010307' },
    topic: { id: 9, title: '风力发电机叶片故障诊断方法', topic_source: 'TEACHER', status: 'SELECTED', description: '基于振动信号与深度学习对风机叶片裂纹、覆冰等故障进行诊断。' },
  },
  {
    id: 8, academic_year: 1, selection_round: 2, assigned_at: '2026-03-12T11:48:00',
    student: { id: 108, name: '吴昊', student_no: '2021010308' },
    topic: { id: 10, title: '基于边缘计算的车间能耗监测平台', topic_source: 'TEACHER', status: 'SELECTED', description: '在车间边缘侧采集与预处理能耗数据，构建实时监测与告警平台。' },
  },
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
  return { count: rows.length, next, previous, results: slice.map((r) => ({ ...r })) }
}

// 统计从 db 实时派生，保证与列表一致（已选题 = topic.status==='SELECTED'）
function buildStats(rows) {
  const total = rows.length
  const selected = rows.filter((r) => r.topic && r.topic.status === 'SELECTED').length
  return {
    total,
    selected,
    unselected: total - selected,
    // 流程确认模块后端未实现，四个流程阶段分布恒为 0
    stage_distribution: { proposal: 0, midterm: 0, defense: 0, grade: 0 },
  }
}

export default [
  {
    url: '/api/teachers/me/supervisions/',
    method: 'get',
    response: ({ query }) => {
      let rows = db.map((r) => ({ ...r }))
      if (query.academic_year) {
        rows = rows.filter((r) => Number(r.academic_year) === Number(query.academic_year))
      }
      return paginate(rows, query)
    },
  },
  {
    url: '/api/teachers/me/supervision-statistics/',
    method: 'get',
    response: ({ query }) => {
      let rows = db.map((r) => ({ ...r }))
      if (query.academic_year) {
        rows = rows.filter((r) => Number(r.academic_year) === Number(query.academic_year))
      }
      return buildStats(rows)
    },
  },
]
