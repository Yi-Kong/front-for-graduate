# 我的指导情况（教师）· 设计文档

> 路由 `/my-supervision`，原 `component: ComingSoon`（`src/router/index.js`）。本文档为设计阶段产物，**代码实现需在设计稿经用户批准后启动**。
> 设计基线：登录页 v4、题目浏览（`TopicBrowse.vue`）、我的题目申报（`MyTopics.vue`）、我的选题（`MySelection.vue`）。山能红 `#C0202E`、浅红底 `#fdecee`、卡片 `rounded-2xl`、抽屉 `z-55`、弹窗 `z-80`。
> 后端契约以 `docs/backend-interface-analysis.md` + `docs/API接口文档.md` 为准（DRF 裸对象，无 `{code,message,data}` 包装；列表 `{count,next,previous,results}`）。
> 设计稿：`design/my-supervision-design.html`（可切换「有指导关系 / 无指导关系 / 加载失败」三态，含详情抽屉）。

---

## 1. 背景与目标

教师端目前只有「我的题目申报」。选题轮次关闭后系统会生成 `supervision_assignment`（指导关系），但教师**没有任何入口查看「本届分给我指导的学生与题目、以及他们走到了哪个流程阶段」**。本页补齐教师视角的指导全景。

目标：
1. 教师一眼看清本届**指导了多少学生**、分别选了哪些题、来源是什么。
2. 概览各流程阶段（开题 / 中期 / 答辩 / 成绩）的分布，便于跟进进度。
3. 点开单个学生看题目完整信息与阶段进度条。
4. 后端缺口（指导关系查询 / 统计 / 流程确认）前端不假装存在，如实降级展示。

## 2. 角色与权限

| 项 | 值 |
|---|---|
| 角色 | `TEACHER`（`meta.roles: ['TEACHER']`，路由守卫已生效，无需改动） |
| 菜单 | `AppSidebar.vue` 教师组「我的指导情况」已就位（icon `mentor`），**无需改动** |
| 数据范围 | 仅本人指导关系（由后端按当前教师过滤；mock 直接给该教师数据） |
| 越权 | 非 TEACHER 访问由守卫跳回工作台 |

## 3. 功能范围

| 编号 | 功能 | 触发条件 | 说明 |
|---|---|---|---|
| F1 | 指导概览统计 | 进入页面 | 指导总人数 / 已选题 / 待选题 / 跨阶段分布 4 张卡 |
| F2 | 学生指导列表 | 进入页面 | 表格：学生 / 题目 / 来源 / 轮次 / 当前阶段 / 状态 / 操作 |
| F3 | 筛选 | 输入/选择 | 关键词（学生姓名或学号、题名）+ 届次 + 阶段，当前页客户端过滤 |
| F4 | 分页 | 列表超 10 条 | 复用 `common/Pagination`，每页 10 条 |
| F5 | 学生指导详情 | 点「查看」 | 右侧抽屉（Sheet z-55），只读：题目完整信息 + 阶段进度条 |

**不含（本期不做）**：
- 阶段确认 / 催交 / 审核操作 —— 流程确认模块后端未实现，本页只读。
- 指导学生账号管理、改派题目 —— 无端点。
- 导出 Excel —— 无需求。
- 跨届历史汇总 —— 仅展示所选届次（默认当前届）。

## 4. 接口与字段

> ⚠️ 下列「我的指导关系」「指导统计」两个端点**后端当前均不存在**（见 `backend-interface-analysis.md` 第 87、107 行：仅 service/模型，缺 HTTP 端点）。设计稿先定义理想契约，实现期用 mock 兜底，并列入后端需求。

| 动作 | 方法 | 路径 | 请求 | 响应 |
|---|---|---|---|---|
| 我的指导关系 | GET | `/api/teachers/me/supervisions/` | `academic_year`(可选) + `page`(+`page_size`) | `{count,next,previous,results}` |
| 指导统计 | GET | `/api/teachers/me/supervision-statistics/` | `academic_year`(可选) | `{total, selected, unselected, stage_distribution}` |
| 题目详情 | GET | `/api/topics/{id}/` | — | 题目对象（补全指导教师/来源/学年/描述） |
| 学年列表 | GET | `/api/academic-years/` | — | 数组 `{id,name}` |

**指导关系对象（`results[]`）理想字段**：

```json
{
  "id": 12,
  "academic_year": 3,
  "selection_round": 2,
  "student": { "id": 301, "name": "张伟", "student_no": "2021010301" },
  "topic": { "id": 88, "title": "基于 Vue3 的毕业设计管理系统", "topic_source": "TEACHER", "status": "SELECTED" },
  "assigned_at": "2026-03-12T10:24:00"
}
```

**阶段进度**：选题完成后进入流程四阶段 `开题 → 中期 → 答辩 → 成绩`。因**流程确认模块后端未实现**，阶段数据无来源；mock 默认全部为「未开始」，`StageProgress` 仅以选题完成作为已确定节点，后续阶段置灰并顶部提示「流程确认模块暂未上线」。

错误处理：统一展示 `error.message`（`request.js` 已解析 `detail` / `non_field_errors` / 字段级错误），不猜测文案。

## 5. 页面结构

```
┌ 页头 h1「我的指导情况」+ 说明（本届分配给你的学生与题目）
├ 后端缺口提示条（蓝/灰，流程确认模块未上线时展示）
├ ① 概览统计 4 卡 SupervisionStatCards
├ ② 筛选条（关键词 / 届次 / 阶段）+ SupervisionTable + Pagination
└ ③ 详情抽屉 SupervisionDetailDrawer（Sheet z-55，只读）
```

采用「统计卡 + 列表」单页结构，不做 tab。

### 5.1 概览统计卡（SupervisionStatCards）

四张等宽卡（白底 `rounded-2xl`、顶部细色条）：
- 指导总人数（蓝）
- 已选题（绿）
- 待选题（琥珀）
- 流程阶段分布（灰，小字列出 开题 X / 中期 X / 答辩 X / 成绩 X）

接口缺失时四卡均降级为「—」灰态，不报错。

### 5.2 学生指导列表（SupervisionTable）

7 列：

| 列 | 内容 |
|---|---|
| 学生 | 姓名 14px/600 + 学号 12px 灰 |
| 题目 | 题名（截断），点「查看」开抽屉 |
| 来源 | `TEACHER`→「教师申报」/ `ADMIN`→「管理员录入」（Badge） |
| 指导轮次 | 第 N 轮 |
| 当前阶段 | `StageProgress` 迷你 stepper（5 节点横排） |
| 状态 | 题目 `StatusBadge`（SELECTED 等） |
| 操作 | `[查看]` |

空态（无指导关系）：插画 + 「本届暂无分配给你的指导学生」+ 说明（轮次关闭后才生成）。
加载中 / 加载失败两态必备。

### 5.3 阶段进度（StageProgress）

横排 5 节点：选题 → 开题 → 中期 → 答辩 → 成绩。
- 选题完成（有 `topic` 且 `status=SELECTED`）作为前置基座，标绿。
- 4 个流程节点：后端未实现期间全部灰「未开始」；后端上线后按 `student-stage-records` 状态点亮（本期不接）。

### 5.4 详情抽屉（SupervisionDetailDrawer）

Sheet 三段式（head `border-b p-5` / body `flex-1 overflow-y-auto p-5` / foot `border-t p-5`）。
- 头部：学生姓名 + 学号 + 指导轮次。
- 正文：`.kv` 展示 题目 / 来源 / 状态 / 所属学年 / 提交时间；题目描述灰底块。
- 阶段进度条 `StageProgress`（完整版）。
- 底部：仅「关闭」按钮（只读，无确认操作）。

## 6. 组件拆分与复用

**复用（零改动）**：`common/Badge`、`common/Pagination`、`topics/StatusBadge`、`Sheet` 系列、`utils/topics.js`（statusLabel/variant）、全局类 `.act/.kv/.card-wrap`（**SFC 内禁止重定义**）。

**新建**：

| 文件 | props / 导出 | emits | 职责 | 行数上限 |
|---|---|---|---|---|
| `src/views/teacher/MySupervision.vue` | — | — | 编排 3 个 query + 过滤/分页状态 | **≤200** |
| `src/components/supervision/SupervisionStatCards.vue` | `stats` `loading` | — | 概览 4 卡（含降级） | 90 |
| `src/components/supervision/SupervisionTable.vue` | `rows` `loading` `error` `emptyText` | `view(row)` | 学生指导列表 7 列 | 150 |
| `src/components/supervision/StageProgress.vue` | `steps` `variant` | — | 阶段 stepper（迷你/完整） | 70 |
| `src/components/supervision/SupervisionDetailDrawer.vue` | `open` `row` | `close` | 只读抽屉 | 120 |
| `src/api/supervision.js` | `getMySupervisions` `getSupervisionStats` | — | 教师指导 API（标注需后端补） | — |
| `mock/supervisions.js` | 列表 + 统计 路由 | — | 指导关系 mock + 落盘 `supervisions.json` | — |
| `src/router/index.js`（改） | `ComingSoon` → `MySupervision` | — | 挂载 | +2 |

## 7. 后端契约缺口与风险

| # | 风险 | 影响 | 处理 |
|---|---|---|---|
| R1 | 缺 `GET /api/teachers/me/supervisions/` | 列表无真实数据 | mock 自建，列入后端需求（P0） |
| R2 | 缺 `supervision_statistics` | 概览卡无数据 | mock 自建，`stats` 缺失时四卡降级「—」 |
| R3 | 流程确认模块未实现（开题/中期/答辩/成绩） | 阶段进度不可见 | `StageProgress` 仅点亮选题基座，流程节点灰「未开始」+ 顶部提示条 |
| R4 | `student` 字段仅 id（selection-choices 模型） | 列表需姓名/学号 | mock 展开 `student{name,student_no}`；真实接口需后端在 supervision 对象内联学生摘要，列入需求 |
| R5 | mock 中间件恒 200 | 错误分支难验证 | 复用已落地的 `vite/plugin-mock.js` `status` 支持（my-selection 已获准） |

## 8. 实现阶段任务清单

1. `src/api/supervision.js` 追加 `getMySupervisions` / `getSupervisionStats`（含「需后端补」注释）。
2. 新建 `mock/supervisions.js`（列表 8 条 + 统计，落盘 `supervisions.json`）。
3. 新建 `SupervisionStatCards.vue` → `StageProgress.vue` → `SupervisionTable.vue` → `SupervisionDetailDrawer.vue`。
4. 新建 `src/views/teacher/MySupervision.vue`（≤200 行）。
5. `src/router/index.js` 挂载（ComingSoon → MySupervision）。

自检项：① `.vue` 均 ≤300 行；② `isPending`/`isLoading` 已 `unref`（无模板直写 ref 对象）；③ 抽屉 z 分层正确（55/60）；④ SFC 内无重定义全局类；⑤ `bun run build` 通过。

## 9. 默认决策

- **Q1 阶段进度**：后端未实现期间，阶段节点灰「未开始」+ 顶部提示，不编造进度。
- **Q2 统计卡**：接口缺时降级「—」，不报错中断页面。
- **Q3 届次筛选**：默认当前届，提供届次下拉（取 `academic-years`）。
- **Q4 列表字段**：`student` 内联 `name`/`student_no`，待后端在 supervision 对象内联学生摘要。

其余默认：每页 10 条；筛选为当前页客户端过滤（后端未文档化服务端参数）；详情抽屉只读。

## 10. 验收标准

- [ ] 进入（mock 有指导关系）：4 张概览卡有数，列表展示学生+题目+来源+轮次+阶段+状态。
- [ ] 点「查看」：抽屉展示该生题目完整信息 + 阶段进度条，底部仅关闭。
- [ ] 空态：mock 置空时显示「本届暂无分配给你的指导学生」。
- [ ] 阶段进度：仅有选题基座点亮，流程节点灰「未开始」+ 顶部提示条。
- [ ] 删掉 mock 统计路由：四卡降级「—」不报错。
- [ ] `bun run build` 通过，无 `.vue` 超 300 行。

---

## 审核清单（供评审）

- [ ] 页面信息架构（统计卡 + 列表单页）
- [ ] 概览 4 卡字段与降级策略
- [ ] 列表 7 列与空态/加载/失败三态
- [ ] 阶段进度 stepper 在「后端未实现」下的诚实处理
- [ ] 详情抽屉只读范围
- [ ] 后端缺口 R1–R5 的标注方式
- [ ] 组件拆分与行数预算
