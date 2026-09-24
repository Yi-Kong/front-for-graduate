// 工作台概览 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐后端 GET /api/home/overview/：返回当前届次 / 当前阶段 / 流程时间轴 / 待办。
// 注意：后端 home_overview 的 todos 固定 {count:0}，时间轴读 AcademicStageConfig（暂无配置接口）；
// 本 mock 提供「代表性阶段」数据供 UI 落地，真实字段以后端为准。
export default [
  {
    url: '/api/home/overview/',
    method: 'get',
    response: () => ({
      academic_year: { id: 1, name: '2026 届', is_active: true },
      stage: {
        name: '题目申报与查重',
        deadline: '2026-03-15T23:59:00',
        status: 'live',
      },
      timeline: [
        { name: '届次与师生准备', start: '2025-09-01', end: '2025-12-31', status: 'done' },
        { name: '题目申报与查重', start: '2026-01-01', end: '2026-03-15', status: 'live' },
        { name: '题目审核与发布', start: '2026-03-16', end: '2026-04-10', status: 'wait' },
        { name: '第一轮选题', start: '2026-04-11', end: '2026-04-25', status: 'wait' },
        { name: '第二轮选题', start: '2026-04-26', end: '2026-05-10', status: 'wait' },
      ],
      todos: { count: 0 },
    }),
  },
]
