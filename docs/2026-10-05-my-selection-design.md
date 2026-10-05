# 我的选题（学生）· 设计文档

> 路由 `/my-selection`，当前 `component: ComingSoon`（`src/router/index.js` 第 46 行）。本文档为设计阶段产物，**代码实现需在设计稿经用户批准后启动**。
> 设计基线：登录页 v4、题目浏览页（`TopicBrowse.vue`）、我的题目申报页（`MyTopics.vue`）、选题轮次页（`SelectionRound.vue`）。山能红 `#C0202E`、浅红底 `#fdecee`、卡片 `rounded-2xl`、弹窗 `z-80`、抽屉 `z-55`。
> 后端契约以 `docs/backend-interface-analysis.md` + `docs/API接口文档.md` 为准（DRF 裸对象，无 `{code,message,data}` 包装；列表 `{count,next,previous,results}`）。
> 设计稿：`design/my-selection-design.html`（可切换「未选题/已选题 × 轮次进行中/待开始/已结束/状态未知」）。

---

## 1. 背景与目标

学生端目前只有「题目浏览」（看得到但选不了），`/my-selection` 仍是占位页，学生链路断在最后一环。本页补齐闭环：**题目浏览 → 选题 → 查看结果 → 改选**。

目标：
1. 学生能一眼看到自己本届**有没有选题**、选的是哪题、指导教师是谁。
2. 选题轮次开放期间能**选题**与**改选**（先到先得，改选释放原题）。
3. 明确告知轮次开放/截止时间，轮次未开放或已结束时**禁用操作并说明原因**。
4. 失败（题目被抢、轮次未开放、校验失败）有可读反馈，且列表能自愈刷新。

## 2. 角色与权限

| 项 | 值 |
|---|---|
| 角色 | `STUDENT`（`meta.roles: ['STUDENT']`，路由守卫已生效，无需改动） |
| 菜单 | `AppSidebar.vue` 学生组「我的选题」已就位（icon `pick`），**无需改动** |
| 数据范围 | 学生只能看到后端返回的 `PUBLISHED` 题目；选题结果只能看本人 |
| 越权 | 非 STUDENT 访问由守卫跳回工作台 |

## 3. 功能范围

| 编号 | 功能 | 触发条件 | 说明 |
|---|---|---|---|
| F1 | 展示轮次状态 | 进入页面 | 第 N 轮 + 状态 + 开放/截止时间；接口缺失时降级为灰色提示条 |
| F2 | 展示我的选题结果 | 进入页面 | 未选题 / 已选题 / 加载中 / 加载失败 四态 |
| F3 | 选题 | 未选题 + 轮次可操作 | `POST /api/selection-choices/`，二次确认 |
| F4 | 改选 | 已选题 + 轮次可操作 | `POST /api/selection-choices/change/`，二次确认，文案明示释放原题 |
| F5 | 题目详情 | 任意题目 | 右侧抽屉，只读；底部按钮直接进入确认流程 |
| F6 | 可选题目列表 | 进入页面 | 关键词/学年筛选 + 分页，复用 `TopicTable` |

**不含（本期不做）**：
- 取消选题 —— 后端无端点（`status` 枚举有 `CANCELLED` 但无路由）。
- 志愿排序 / 多志愿 —— 后端模型是单条 `SelectionChoice`。
- 选题历史记录展示 —— 无列表接口。
- 指导教师联系方式等扩展信息 —— 接口无字段。

## 4. 接口与字段

| 动作 | 方法 | 路径 | 请求 | 响应 |
|---|---|---|---|---|
| 我的结果 | GET | `/api/students/me/selection-result/` | — | `{ topic_id: integer\|null, topic_title: string }` |
| 题目详情 | GET | `/api/topics/{id}/` | — | 题目对象（补全指导教师/来源/学年/描述） |
| 可选题目 | GET | `/api/topics/` | `page`（+`page_size`） | `{count,next,previous,results}` |
| 学年映射 | GET | `/api/academic-years/` | — | 数组 `{id,name,...}` |
| 选题 | POST | `/api/selection-choices/` | `{ topic_id }` | 201 `{id, selection_round, student, topic, status, submitted_at}` |
| 改选 | POST | `/api/selection-choices/change/` | `{ topic_id }` | 200 同上（⚠️ 路径**不带** `{id}`） |
| 当前轮次 | GET | `/api/selection-rounds/current/` | — | `{id, academic_year, round_no, start_time, end_time, status}`（**mock-only，需后端补**） |

状态流转：

```
题目 PUBLISHED ──学生选题──▶ SELECTED（其他学生不可见）
      ▲                          │
      └────────改选释放──────────┘（旧题回置 PUBLISHED，新题置 SELECTED）
```

错误处理：不猜测文案，统一展示 `error.message`（`src/api/request.js` 已解析 `detail` / `non_field_errors` / 字段级错误）。

## 5. 页面结构

```
┌ 页头 h1「我的选题」+ 说明（先到先得、改选不可撤销）
├ 错误条（红，选题失败时展示，可关闭）
├ ① 轮次状态条 RoundStatusBar
├ ② 我的选题结果 SelectionResultCard
├ ③ 筛选条（关键词 / 学年）+ TopicTable + Pagination
├ ④ 详情抽屉 MySelectionDrawer（Sheet z-55）
└ ⑤ 确认弹窗 ConfirmDialog（z-80）
```

采用**单页上下两段**（结果卡常驻 + 下方列表），不做 tab、不做双视图：改选时「当前题」与「候选列表」需同屏可见，且结果卡局部刷新即可。

### 5.1 轮次状态条（RoundStatusBar）

| 轮次状态 | 徽标 | 文案 | 操作按钮 |
|---|---|---|---|
| `OPEN` | 绿 pill「进行中」 | 第 N 轮选题 + 开放/截止时间 | 可用 |
| `PENDING` | 琥珀 pill「待开始」 | 第 N 轮将于 X 开始 | **禁用** |
| `CLOSED` | 蓝 pill「已结束」 | 本届选题已结束，如需变更请联系管理员 | **禁用** |
| 接口失败/404 | 灰 pill「状态未知」+ 虚线框 | 轮次状态暂不可知，可尝试选择，最终以系统返回为准 | **保持可用** |

设计原则：**「未知」不等于「禁止」**。只有接口明确返回 `PENDING`/`CLOSED` 才禁用按钮，其余一律放行，由后端报错兜底（避免前端误判阻断学生选题）。

### 5.2 我的选题结果卡（SelectionResultCard）

- **未选题**：图标 + 「你还没有选题」+ 按轮次状态变化的说明 + 「去题目浏览」按钮（跳 `/topic-browse`）。
- **已选题**：题名 17px/700 + `已选定` / 来源 / 轮次 徽章 + `.kv` 三行（指导教师 / 所属学年 / 提交时间）+ 右侧「查看详情」「改选题目」。
- 加载中 / 加载失败（红字 + 重试）两态必备。

`selection-result` 只有 `topic_id`/`topic_title`，其余字段**再查 `GET /api/topics/{id}/` 补全**（已确认）。

### 5.3 可选题目列表

沿用 `TopicTable`（6 列）并通过 `#actions` 插槽覆盖操作列：

| 场景 | 操作列 |
|---|---|
| 未选题 | `[选择此题]` `[查看详情]` |
| 已选题（非当前题） | `[改选为此题]` `[查看详情]` |
| 当前选题行 | `[查看详情]` + 禁用态 `[当前选题]`，整行浅红底区分 |

筛选沿用 `TopicBrowse` 的**当前页客户端过滤**（后端未文档化 `keyword` 参数）；每页 10 条。

### 5.4 详情抽屉（MySelectionDrawer）

Sheet 三段式（head `border-b p-5` / body `flex-1 overflow-y-auto p-5` / foot `border-t p-5`），`.kv` 展示状态、指导教师、来源、学年、描述（灰底 `desc-box`）。底部按钮三态：选择此题 / 改选为此题 / 当前选题（禁用）。**纯 UI**，点击 `emit('select', topic)`，由页面统一开确认弹窗。

### 5.5 确认弹窗与错误反馈

- 选题与改选**都走 ConfirmDialog**（已确认）。改选文案明示「《A》将被释放，其他同学可立即选定，且无法撤销」。
- 失败：页头下方红色内联条 + 确认弹窗内原地可重试；无论成败都 `invalidateQueries` 列表与结果，被抢的题目刷新即消失。

## 6. 组件拆分与复用

**复用（零改动）**：`TopicTable`（`#actions` 插槽）、`common/Pagination`、`common/Badge`、`topics/StatusBadge`、`ConfirmDialog`、`Sheet` 系列、`utils/topics.js`、`utils/format.js`，以及全局类 `.act/.act-primary/.pg/.kv/.card-wrap`（**SFC 内禁止重定义**）。

**新建**：

| 文件 | props / 导出 | emits | 职责 | 行数上限 |
|---|---|---|---|---|
| `src/views/student/MySelection.vue` | — | — | 编排 4 个 query + 2 个 mutation | **≤200** |
| `src/components/selection/RoundStatusBar.vue` | `round` `known` `loading` | — | 轮次条四态 | 80 |
| `src/components/selection/SelectionResultCard.vue` | `result` `topic` `loading` `error` `canChange` | `browse` `change` `view` | 结果卡四态 | 120 |
| `src/components/selection/MySelectionDrawer.vue` | `open` `topic` `selectedTopicId` `disabled` | `close` `select(topic)` | 只读抽屉 | 130 |
| `src/utils/selection.js` | `roundStatusLabel` `roundStatusVariant` `isRoundOpen` `roundWindowText` | — | 轮次状态映射 | 60 |
| `src/api/selection.js`（改） | + `chooseTopic` `changeTopic` `getMySelectionResult` `getCurrentRound` | — | 学生选题 API | — |
| `mock/selection-choice.js`（新） | 4 条路由 | — | 选题 mock + 落盘 | — |
| `mock/topics.js`（改） | 补 `GET :id/`、请求级 reload、隐藏 `SELECTED` | — | 配合选题状态联动 | +10 |
| `vite/plugin-mock.js`（改） | 路由支持 `status` 字段 | — | 演示 4xx | +2 |
| `src/router/index.js`（改） | `ComingSoon` → `MySelection` | — | 挂载 | +2 |

## 7. 后端契约缺口与风险

| # | 风险 | 影响 | 处理 |
|---|---|---|---|
| R1 | `GET /api/selection-rounds/` 是 `IsAdmin`，学生拿不到轮次状态 | 无法判断能否选题 | mock 自建 `/current/`，失败降级不禁用（设计已覆盖）；列入后端需求 |
| R2 | `selection-result` 仅 `topic_id`/`topic_title` | 结果卡信息薄 | 再查 `GET /api/topics/{id}/`；列入后端需求建议展开字段 |
| R3 | 无取消选题端点 | 误选只能改选 | UI 不做取消入口，文案说明 |
| R4 | 选题接口错误 detail 未文档化 | 无法预设文案 | 只展示 `error.message`，不猜测 |
| R5 | mock 中间件恒 200 | 错误分支难验证 | 已获准给 `vite/plugin-mock.js` 加 `status` 支持 |
| R6 | mock 跨文件状态同步（选题改题目 `status`） | 列表不联动 | 以 `node_modules/.mock-state/topics.json` 为通道，`mock/topics.js` 请求级 reload |
| R7 | `stage_code` 枚举未文档化 | 不能用于逻辑判断 | 本页**不**使用 `home/overview` 做判断，仅可能作展示 |

## 8. 实现阶段任务清单

1. `src/api/selection.js` 追加 4 个函数（含「需后端补」注释）。
2. 新建 `src/utils/selection.js`。
3. `vite/plugin-mock.js` 支持路由 `status`（向后兼容）。
4. 新建 `mock/selection-choice.js`（result / choose / change / current-round，落盘 `selection-choices.json`）。
5. `mock/topics.js` 三处小改。
6. 新建 `RoundStatusBar.vue` → `SelectionResultCard.vue` → `MySelectionDrawer.vue`。
7. 新建 `src/views/student/MySelection.vue`（≤200 行）。
8. `src/router/index.js` 挂载。

自检项：① `.vue` 均 ≤300 行；② `isPending` 已 `unref`（禁止模板直写 `m.isPending`）；③ 弹层 z 分层正确（抽屉 55/60、弹窗 80/81、Popover 100）；④ SFC 内无重定义全局类；⑤ `bun run build` 通过。

## 9. 默认决策（用户已确认）

- **Q1 轮次状态**：采用「学生可见轮次接口 + 降级兜底」，不用 `home/overview` 做逻辑判断。
- **Q2 mock 报错**：允许改 `vite/plugin-mock.js` 支持 4xx。
- **Q3 结果卡详情**：再查 `GET /api/topics/{id}/` 补全。
- **Q4 确认弹窗**：选题与改选**都要**二次确认。

其余默认：每页 10 条；mock 种子默认「未选题」以便演示完整链路；不做取消选题入口。

## 10. 验收标准

- [ ] 未选题进入：结果卡显示空态，列表可选题目正常展示，操作为「选择此题」。
- [ ] 选题后：结果卡切换为该题（含指导教师/学年/提交时间），该题从列表消失。
- [ ] 改选后：结果卡切换为新题，旧题回列表、新题消失。
- [ ] 轮次 `PENDING`/`CLOSED` 时按钮禁用且有说明；删掉 mock 的 `current/` 路由后降级为灰条且按钮仍可用。
- [ ] 409 分支：红色错误条展示后端文案，列表自愈刷新。
- [ ] `bun run build` 通过，无 `.vue` 超 300 行。

---

## 审核清单（供评审）

- [ ] 页面信息架构（单页上下两段，结果卡常驻）
- [ ] 轮次状态四态与「未知不禁用」原则
- [ ] 结果卡字段补全方式（额外查题目详情）
- [ ] 操作列三态与当前题行样式
- [ ] 确认弹窗文案（改选明示释放原题）
- [ ] 后端缺口 R1–R7 的标注方式
- [ ] 组件拆分与行数预算
