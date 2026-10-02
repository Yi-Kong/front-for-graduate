// 工作台概览 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐后端 GET /api/home/overview/：返回当前届次 / 当前阶段 / 流程时间轴 / 待办。
// 注意：后端 home_overview 的 todos 固定 {count:0}，时间轴读 AcademicStageConfig（暂无配置接口）；
// 本 mock 提供「代表性阶段」数据供 UI 落地，真实字段以后端为准。
import { currentAcademicYear } from './_shared.js'
export default [
  {
    url: '/api/home/overview/',
    method: 'get',
    response: () => ({
      academic_year: currentAcademicYear(),
      current_stage: '题目申报与查重',
      timeline: [
        { stage_code: 'PREPARE', display_name: '届次与师生准备', start_time: '2025-09-01', deadline: '2025-12-31', overdue: true },
        { stage_code: 'DECLARATION', display_name: '题目申报与查重', start_time: '2026-01-01', deadline: '2026-03-15', overdue: true },
        { stage_code: 'REVIEW', display_name: '题目审核与发布', start_time: '2026-03-16', deadline: '2026-04-10', overdue: false },
        { stage_code: 'SELECTION1', display_name: '第一轮选题', start_time: '2026-04-11', deadline: '2026-04-25', overdue: false },
        { stage_code: 'SELECTION2', display_name: '第二轮选题', start_time: '2026-04-26', deadline: '2026-05-10', overdue: false },
      ],
      todos: { count: 0 },
    }),
  },
]
