// 学生选题 Mock（开发期，由 vite/plugin-mock.js 自动挂载，文件名非 _ 开头）
// 对齐后端 DRF 契约：
// - GET  /api/students/me/selection-result/   我的结果 { topic_id, topic_title }
// - POST /api/selection-choices/               选题  body { topic_id }
// - POST /api/selection-choices/change/        改选  body { topic_id }（⚠️ 路径不带 {id}）
// - GET  /api/selection-rounds/current/        【mock-only，需后端补】当前轮次
//
// 持久化：
// - 选题状态落盘 node_modules/.mock-state/selection-choices.json
// - 题目 status（SELECTED/PUBLISHED）落盘到 node_modules/.mock-state/topics.json
//   （与 mock/topics.js 共用同一份落盘文件，本文件直接读写，topics.js 列表/详情读取前会 reloadDb 同步）
import fs from 'node:fs'
import path from 'node:path'

const stateDir = path.resolve(process.cwd(), 'node_modules', '.mock-state')
const choiceFile = path.join(stateDir, 'selection-choices.json')
const topicFile = path.join(stateDir, 'topics.json')
const roundFile = path.join(stateDir, 'selection.json')

function readJson(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
      if (parsed !== null && parsed !== undefined) return parsed
    }
  } catch {
    // 忽略解析失败
  }
  return fallback
}
function writeJson(file, data) {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  } catch {
    // 忽略写入失败
  }
}

function loadChoices() {
  return readJson(choiceFile, { student: 1, current: null, history: [] })
}
function saveChoices(data) {
  writeJson(choiceFile, data)
}
function loadTopics() {
  return readJson(topicFile, [])
}
function saveTopics(arr) {
  writeJson(topicFile, arr)
}
function loadRounds() {
  return readJson(roundFile, [])
}

function now() {
  return new Date().toISOString().slice(0, 16)
}

export default [
  {
    url: '/api/students/me/selection-result/',
    method: 'get',
    response: () => {
      const c = loadChoices()
      if (c.current == null) return { topic_id: null, topic_title: '' }
      const topics = loadTopics()
      const t = topics.find((x) => x.id === Number(c.current))
      return { topic_id: Number(c.current), topic_title: t ? t.title : '' }
    },
  },
  {
    url: '/api/selection-choices/',
    method: 'post',
    response: ({ body }) => {
      const topicId = Number(body?.topic_id)
      if (!topicId) return { __mockError: { status: 400, body: { detail: 'topic_id 不能为空' } } }
      const c = loadChoices()
      const topics = loadTopics()
      const t = topics.find((x) => x.id === Number(topicId))
      if (!t) return { __mockError: { status: 400, body: { detail: '题目不存在' } } }
      if (t.status !== 'PUBLISHED')
        return { __mockError: { status: 409, body: { detail: '该题目不可选，可能已被其他同学选定' } } }
      if (c.current != null)
        return { __mockError: { status: 400, body: { detail: '你已选题，如需更换请使用改选' } } }
      t.status = 'SELECTED'
      saveTopics(topics)
      c.current = topicId
      c.history.push({ topic_id: topicId, status: 'SELECTED', submitted_at: now() })
      saveChoices(c)
      return {
        id: 1,
        selection_round: 1,
        student: c.student,
        topic: topicId,
        status: 'SELECTED',
        submitted_at: now(),
      }
    },
  },
  {
    url: '/api/selection-choices/change/',
    method: 'post',
    response: ({ body }) => {
      const topicId = Number(body?.topic_id)
      if (!topicId) return { __mockError: { status: 400, body: { detail: 'topic_id 不能为空' } } }
      const c = loadChoices()
      if (c.current == null)
        return { __mockError: { status: 400, body: { detail: '尚未选题，无法改选' } } }
      const topics = loadTopics()
      const t = topics.find((x) => x.id === Number(topicId))
      if (!t) return { __mockError: { status: 400, body: { detail: '题目不存在' } } }
      if (t.status !== 'PUBLISHED')
        return { __mockError: { status: 409, body: { detail: '该题目不可选，可能已被其他同学选定' } } }
      if (Number(c.current) === topicId)
        return { __mockError: { status: 400, body: { detail: '该题目已是你的当前选题' } } }
      const old = topics.find((x) => x.id === Number(c.current))
      if (old) old.status = 'PUBLISHED'
      t.status = 'SELECTED'
      saveTopics(topics)
      c.current = topicId
      c.history.push({ topic_id: topicId, status: 'SELECTED', submitted_at: now() })
      saveChoices(c)
      return {
        id: 1,
        selection_round: 1,
        student: c.student,
        topic: topicId,
        status: 'SELECTED',
        submitted_at: now(),
      }
    },
  },
  {
    url: '/api/selection-rounds/current/',
    method: 'get',
    response: () => {
      const rounds = loadRounds()
      const open = rounds.find((r) => r.status === 'OPEN')
      const pick = open || (rounds.length ? rounds[rounds.length - 1] : null)
      if (!pick) return { __mockError: { status: 404, body: { detail: '暂无选题轮次' } } }
      return { ...pick }
    },
  },
]
