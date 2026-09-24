// 届次管理 Mock（开发期，由 vite/plugin-mock.js 自动挂载）
// 对齐后端 DRF：
// - GET    /api/academic-years/                  列表
// - POST   /api/academic-years/                  创建（body 含可选 set_current）
// - PUT    /api/academic-years/:id/               更新
// - POST   /api/academic-years/:id/activate/      设为当前届次
// - DELETE /api/academic-years/:id/               删除
// 共享状态（内存数据与 currentAcademicYear）抽到 mock/_shared.js，
// 供 home/overview 读取，以实现「设为当前」后顶栏徽标联动。
import {
  db,
  addYear,
  updateYear,
  activateYear,
  deleteYear,
} from './_shared.js'

export default [
  {
    url: '/api/academic-years/',
    method: 'get',
    response: () => db.map((y) => ({ ...y })),
  },
  {
    url: '/api/academic-years/',
    method: 'post',
    response: ({ body }) => addYear(body),
  },
  {
    url: '/api/academic-years/:id',
    method: 'put',
    response: ({ body, params }) => updateYear(Number(params.id), body),
  },
  {
    url: '/api/academic-years/:id/activate/',
    method: 'post',
    response: ({ params }) => activateYear(Number(params.id)),
  },
  {
    url: '/api/academic-years/:id',
    method: 'delete',
    response: ({ params }) => deleteYear(Number(params.id)),
  },
]
