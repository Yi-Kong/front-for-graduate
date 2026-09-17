# 前端页面规划（第一阶段：用户管理与选题）

> **本次修订依据**：`backend-interface-analysis.md`（2026-09-16，对 `backend/` 实际 Django + DRF 代码的接口分析）。
> 原规划（2026-09-12）依据的是后端「计划文档」反推出的预期接口；而本分析文档反映的是**代码真实落地情况**，二者存在多处不一致，本规划据此修订。
> **关键结论**：后端已落地第一阶段（认证 / 届次 / 题目含自动查重与审核流转 / 两轮选题含并发锁定与指导关系生成 / Excel 导入 / 操作日志）核心能力；但**接口契约、登录返回结构、若干页面依赖的接口尚未到位**，前端须先按真实契约对齐再逐页推进。

**Scope：** 仅第一阶段（用户管理与选题），不含答辩、成绩、AI 总结等后续阶段（这些模块后端尚未开工，本期不做页面）。
**技术栈（沿用项目约定）：** Vite 8 + Vue 3.5（仅 `<script setup>` `.vue` SFC，禁用 JSX/TSX）+ Tailwind CSS v4 + @tanstack/vue-query 5 + vue-router 5 + pinia 4 + mockjs。
**运行/包管理：** Bun 1.2.8（`bun install` / `bun run`）。
**角色：** `ADMIN` / `TEACHER` / `STUDENT`（无 `SECRETARY`，与设计修订一致）。
**前端代码现状（对照提醒）：** 当前 `src/` 仍是 Vite 脚手架 + 登录/改密两页，且这两页的解析逻辑（`store/auth.js` 读 `data?.token`/`data?.user`、`src/api/user.js` 调 `/user/list`、`request.js` 假设 `{code,message,data}`）**与真实后端契约不符**。本规划落地前必须先修正这三处，否则接真后端即崩。

---

## 〇、后端接口契约对齐（前置，必须先达成）

> 这是与原规划最大的偏差点。原规划第四节假设后端返回 `{ code, message, data }` 并统一解包——**实际后端用 DRF/simplejwt 标准响应，没有 `code` 字段**，前端必须改为适配 DRF。

### 0.1 响应结构
- **成功**：成功响应为**裸对象**（如登录直接返回 `access`/`refresh`/`must_change_password`/`role_codes`），**不带 `code/message/data` 包装**。前端 `request.js` 响应拦截器应：成功时直接返回 `response.data`，**不要**去取 `res.data` 子对象、也不要判断 `code`。
- **错误**：业务/校验错误以 **HTTP 状态码（4xx/5xx）+ `{ detail }` 或字段级错误对象** 返回（DRF 风格），**不含 `code` 业务码**。拦截器应把 `error.response.data` 解析为可读错误信息（`detail` 或合并字段错误），而非读取 `res.message`。
- **401 处理**：无 `access` 或过期时后端返回 401，拦截器应清除本地登录态并跳登录页（后端**无 refresh / logout 端点**，见 0.3，故无法静默续期）。

### 0.2 登录返回与用户态
- `POST /api/auth/login/` 真实返回（顶层字段）：
  - `access` —— JWT 访问令牌（前端应作为 `token` 存入 localStorage 供 `Authorization: Bearer <access>` 使用）；
  - `refresh` —— 刷新令牌（**但后端未挂 `token_refresh` 端点，当前不可使用**，仅暂存或忽略）；
  - `must_change_password` —— 布尔，是否强制改密；
  - `role_codes` —— 角色码数组（`['ADMIN']` 等）。
- ⚠️ **登录响应里没有 `user` 对象、也没有 `token` 字段**。因此前端**不能**像原规划那样从登录结果直接取 `user`；登录成功后必须**再调 `GET /api/auth/me/`** 获取当前用户基本信息（姓名/角色展示等），用以填充 `user` 状态。
- `must_change_password` / `role_codes` 由登录响应顶层读取，**不是** `user` 的子字段。

### 0.3 认证端点缺口（后端已知，前端需知晓）
- 后端**未提供** `token_refresh` / `token_verify` / `logout` 端点。因此：前端无静默续期能力（依赖 `access` 有效期）；登出只能是纯客户端清态（无服务端失效 token 机制）。

---

## 一、页面总览（共 14 个页面 + 后端 API 现状）

统一套一层「应用外壳（App Shell）」：侧边栏菜单按 `role_codes` 过滤，路由守卫负责未登录跳转登录、未改密跳转强制改密。

新增「后端现状」列，标注每页当前**可构建 / 受限 / 受阻**：

| # | 页面 | 角色 | 核心功能 | 对应后端 API | 后端现状 |
|---|------|------|---------|-------------|---------|
| 1 | 登录页 | 全部 | 账号密码登录，取 `access`/`must_change_password`/`role_codes`，再调 `/auth/me/` | `POST /api/auth/login/` | ✅ 已实现（须按 0.2 真实结构解析） |
| 2 | 首次强制改密页 | 全部 | `must_change_password=true` 时强制改密后才放行 | `POST /api/auth/change-password/` | ✅ 已实现 |
| 3 | 工作台 / 首页总览 | 全部 | 时间轴、当前阶段、按角色待办 | `GET /api/home/overview/` | ⚠️ 接口已实现，但 `todos` 固定 `{count:0}` 未实现 → 待办区为空 |
| 4 | 届次管理 | 管理员 | 届次列表、新增、激活当前届次 | `/api/academic-years/` + `activate/` | ✅ 已实现 |
| 5 | 流程 / 阶段配置 | 管理员 | 配置本届各流程节点名称/时间/迟交 | 仅 `AcademicStageConfig` 模型 | ❌ 无任何 CRUD 接口 → 页面无法构建 |
| 6 | 师生批量导入 | 管理员 | 上传 Excel → 校验 → 提交；看批次与错误明细 | `imports/teachers\|students/validate\|commit/`、`imports/{id}`、`/errors/` | ✅ 全部已实现 |
| 7 | 师生账号管理 | 管理员 | 账号列表、启用/停用（`user_status`）、角色 | 无对应端点 | ❌ 列表/停用 API 缺失 → 页面无法构建 |
| 8 | 题目管理 / 审核 | 管理员 | 题目表、提交审核、通过/退回；处理疑似重复 | `/api/topics/` CRUD + `submit-review`/`approve`/`reject` | ⚠️ 接口已实现，但**疑似重复复核接口缺失**→ 疑似重复题卡死无法放行（审核断路）；且 `approve`/`reject` 后端缺 `IsAdmin`（越权风险，须后端修） |
| 9 | 选题轮次管理 | 管理员 | 轮次 CRUD、开启/关闭（关闭生成指导关系）、指导人数统计 | `/api/selection-rounds/` + `open`/`close` | ⚠️ 轮次与开关已实现；`supervision_statistics` 统计 API 缺失 → 统计区无数据 |
| 10 | 操作日志 | 管理员 | 全量操作留痕分页查询 | `GET /api/operation-logs/` | ✅ 已实现 |
| 11 | 我的题目申报 | 教师 | 申报（自动查重）、仅看本人、改标题留版本、看查重结果 | `/api/topics/`（教师数据范围）+ 自动查重 | ✅ 已实现 |
| 12 | 我的指导情况 | 教师 | 本届分配给自己的学生与题目 | 缺按教师查询 `SupervisionAssignment` 的 API | ❌ 查询接口缺失 → 页面无法构建 |
| 13 | 题目浏览 | 学生 | 浏览已发布（`PUBLISHED`）题目 | `/api/topics/`（学生仅 `PUBLISHED`） | ✅ 已实现 |
| 14 | 我的选题 | 学生 | 轮次内选题/改选（先到先得）、看本人结果 | `POST /api/selection-choices/`、`/change/`、`GET /api/students/me/selection-result/` | ✅ 已实现 |

> 备注：
> - 第 2 页可与登录做成同一认证流程里的强制步骤，不一定要独立路由。
> - 第 13、14 页在路由上可合并为「学生选题中心」。
> - **本期可端到端构建的页面**：#1 #2 #4 #6 #10 #11 #13 #14（8 个）。
> - **展示可构建、关键数据/操作受限**：#3（待办空）#8（疑似重复无法放行）#9（统计空）。
> - **完全受阻、需后端补接口**：#5 #7 #12。
> - 按上表计为 **14 个**独立页面（规划层面），但其中 3 个当前无后端支撑。

---

## 二、逐页说明（含后端现状）

### 公共 / 认证
- **1. 登录页**：提交 `/api/auth/login/`；解析顶层 `access` → 存 token；读 `must_change_password`/`role_codes`；随即 `GET /api/auth/me/` 拉用户信息填充 `user`；`must_change_password=true` 跳 #2，否则跳首页。（⚠️ 须先按 0.1–0.2 修正 `request.js` 与 `store/auth.js` 的解析逻辑。）
- **2. 首次强制改密页**：提交 `/api/auth/change-password/`；成功后 `must_change_password` 置否，跳首页。未改密前不可访问其它路由（路由守卫拦截）。
- **3. 工作台 / 首页总览**：调用 `/api/home/overview/`，渲染当前届次、当前阶段、时间轴（各阶段 start/deadline，逾期由 `deadline` 前端动态计算）。**按角色待办区：后端 `todos` 固定 `{count:0}`，本期展示空态即可**，待后端实现后再接。

### 管理员
- **4. 届次管理**：列表 + 新增 + 激活（调 `activate/`）；激活后全局以当前届次过滤数据。
- **5. 流程 / 阶段配置**：⚠️ **后端仅有 `AcademicStageConfig` 模型，无任何创建/编辑接口**，且首页时间轴正是读它——无配置入口则时间轴为空。需后端补 stages / stage-config 的 CRUD 后才能构建，本期暂缓。
- **6. 师生批量导入**：教师/学生两入口；先 `validate` 预览计数与错误（不落库），确认后 `commit` 写库；批次详情页展示 `total_rows / success_rows / failed_rows` 与逐行错误（`/errors/`）。
- **7. 师生账号管理**：⚠️ **后端未定义账号列表与停用（基于 `user_status`）接口**，本期无法构建，建议作为导入功能的延伸由后端补接口。
- **8. 题目管理 / 审核**：管理员总题目表。`submit-review` → `approve`/`reject`（带 `review_comment`）。⚠️ **两处后端硬伤**：(a) `approve`/`reject` 未加 `IsAdmin`，教师可自审批/退回，属越权风险（需后端修，前端照常调用即可）；(b) **疑似重复复核接口缺失**——系统判为疑似重复的题目，`admin_result` 永远 `PENDING`，`submit-review` 会一直拦截，管理员在系统里无法「放行/确认重复」，审核流程对这类题是断路。页面可先展示查重状态，但「放行/确认重复」按钮需等后端补 `duplicate-checks/{cid}/review` 类接口后再接。
- **9. 选题轮次管理**：创建 `selection-rounds`（届次/轮次号/起止时间/是否首轮），`open`/`close`（关闭生成指导关系）；关闭后展示指导人数统计与超 10 人告警。⚠️ `supervision_statistics` 统计 API 缺失，统计区本期展示空态，待后端补。
- **10. 操作日志**：分页查询 `/api/operation-logs/`，展示操作人、类型、对象、时间、详情。

### 教师
- **11. 我的题目申报**：仅本人题目。新建时后端自动跑查重，页面展示查重状态（无重复/疑似/重复）与标准题名、编辑距离等；支持改标题并保留 `TopicVersion`。
- **12. 我的指导情况**：本届分配给自己的学生 + 题目。⚠️ **缺按教师查询 `SupervisionAssignment` 的 API**，本期无法构建，待后端补。

### 学生
- **13. 题目浏览**：仅 `PUBLISHED` 题目，支持按届次/教师/关键词筛选。
- **14. 我的选题**：在开启轮次内选择/改选（先到先得，后端事务+行锁保证原子）；展示本人当前选题结果（`/students/me/selection-result/`）。

---

## 三、必须提醒的后端缺口（前端需要，但后端尚未提供）

> 这些缺口决定哪些页面只能停在 UI 骨架 / mock 阶段，须与后端协调补接口。

1. **接口契约（全部页面）**：后端用 DRF 标准响应（裸对象 + HTTP 状态码 + `detail`），**没有 `{code,message,data}` 包装**。前端 `request.js` 须改为适配 DRF，否则无法正确解包与报错。（最高优先级，阻断一切真实联调。）
2. **登录无 `user` 对象 + 缺 `/auth/me/` 调用约定**：登录仅返回 `access`/`refresh`/`must_change_password`/`role_codes`，前端须登录后主动调 `GET /api/auth/me/` 取用户详情。
3. **无 refresh / logout 端点**：`refresh` 令牌当前不可续期；登出只能客户端清态。
4. **流程阶段配置（页面 #5）**：`AcademicStageConfig` 仅有模型无接口，需补 stages / stage-config CRUD。
5. **疑似重复题目复核（页面 #8，阻断性）**：`admin_result` 复核接口缺失，疑似重复题永久卡死无法放行，审核流程断路，须补 `duplicate-checks/{cid}/review`（传 `admin_result` + `admin_comment`）。
6. **题目审核越权（页面 #8，安全）**：`approve`/`reject` 未加 `IsAdmin` 且教师 `get_queryset` 不过滤状态，存在教师自审批风险，须后端显式加 `IsAdmin` + 对象级校验。
7. **指导关系与统计查询（页面 #9、#12）**：`supervision_statistics` 与按教师查 `SupervisionAssignment` 仅 service/模型，缺 HTTP 端点。
8. **账号列表 / 停用（页面 #7）**：依赖 `user_status`，但无列表与停用接口，建议作为导入功能延伸补充。
9. **首页待办未实现（页面 #3）**：`home_overview` 的 `todos` 固定 `{count:0}`，按角色待办本期展示空态。

---

## 四、落地目录 / 路由 / 技术约定（修正）

```
src/
├── views/
│   ├── auth/        Login.vue, ForceChangePwd.vue          # 1, 2
│   ├── home/        Dashboard.vue                          # 3（含 todos 空态）
│   ├── admin/       AcademicYear.vue                       # 4
│   │                ProcessConfig.vue                       # 5（等后端接口）
│   │                ImportUsers.vue                         # 6
│   │                AccountManage.vue                      # 7（等后端接口）
│   │                TopicReview.vue                         # 8（含疑似重复空操作占位）
│   │                SelectionRound.vue                      # 9（统计空态）
│   │                OperationLog.vue                       # 10
│   ├── teacher/     MyTopics.vue                           # 11
│   │                MySupervision.vue                      # 12（等后端接口）
│   └── student/     TopicBrowse.vue                        # 13
│                   MySelection.vue                         # 14
├── components/  AppShell.vue (按 role_codes 过滤侧边栏 + 路由出口)
├── router/      index.js (路由表 + 守卫：未登录→Login，未改密→ForceChangePwd)
├── store/       auth.js (access / refresh / user(来自 /auth/me/) / role_codes / must_change_password)
└── api/         request.js(适配 DRF), auth.js(login+me+changePassword),
                 academic.js, imports.js, topics.js,
                 selection.js, audit.js (分别对接后端 6 个 app)
```

- `src/api/request.js`：**baseURL `/api`**；成功直接返回 `response.data`（**不再**取 `res.data`）；失败按 HTTP 状态码 + `detail`/字段错误抛出；401 清态跳登录。**删除对 `{code,message,data}` 的假设。**
- 数据获取统一用 `@tanstack/vue-query`：`useQuery` 的 `data` 直接是后端返回的裸业务对象（**非** `data.data`）。
- `src/store/auth.js`：登录后存 `access` 为 token；解析顶层 `must_change_password`/`role_codes`；登录成功即 `GET /api/auth/me/` 填充 `user`；`refresh` 暂存（当前无刷新端点不可用）。
- 开发期先用 `mock/*.js`（`VITE_USE_MOCK=true`）跑 UI；**mock 结构须改为与后端真实契约一致**（裸对象、登录返回 `access`/`role_codes`、无 `user` 包裹），否则mock 正常、真后端即崩。待后端补齐第三节缺口接口后，再逐项接真实请求。
- 单文件行数 ≤ 300；UI 优先复用 shadcn-vue 组件；认证/品牌区沿用山能红设计体系。
