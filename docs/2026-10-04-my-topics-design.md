# 我的题目申报（教师）· 设计文档

> 路由 `/my-topics`，当前为 `ComingSoon` 占位。本文档为设计阶段产物，代码实现需在设计稿经用户批准后启动。
> 设计基线：登录页 v4、题目审核页、题目浏览页、选题轮次页（山能红 `#C0202E`、浅红 `#fdecee`、卡片 `rounded-2xl`、弹窗 `z-80`、抽屉 `z-55`）。
> 后端契约以 `docs/backend-interface-analysis.md` + `docs/API接口文档.md` 为准（API 文档已知 `DEDUP_DONE`/`APPROVED` 为死状态，动作接口 body 仅传核心业务字段）。

---

## 1. 背景与目标
教师登录后，在「我的题目申报」管理本人提交的毕业设计题目：查看列表、新建/编辑、提交审核、查看详情与退回意见。是本系统的教师侧核心页面。

## 2. 角色与权限
- 仅 `TEACHER` 可见（路由 `meta.roles: ['TEACHER']`，越权由路由守卫拦截回工作台）。
- 后端 `GET /api/topics/` 对 `TEACHER` 仅返回**其本人**题目（数据范围过滤，`get_queryset` 按角色过滤）。
- 教师**不**可审核/退回自己的题目（审批为管理员职责，见 §7 风险1）。

## 3. 功能范围
| 编号 | 功能 | 触发状态 | 说明 |
|---|---|---|---|
| F1 | 题目列表 | 全部 | 状态分段 + 关键词搜索 + 分页（复用 `TopicTable.vue`） |
| F2 | 新建题目 | — | 弹窗表单 `TopicFormDialog` |
| F3 | 编辑题目 | `DRAFT` / `REJECTED` | 同弹窗，预填 |
| F4 | 提交审核 | `DRAFT` / `REJECTED` | 轻确认后 `submit-review` |
| F5 | 查看详情 | 全部 | 抽屉 `TopicTeacherDrawer`（只读 + 退回意见 + 查重提示 + 提交/编辑入口） |

**不含**：删除题目（后端无 DELETE 接口）、审核/退回（管理员职责）。

## 4. 接口与字段（后端 DRF 契约，裸对象返回，无 `{code,data}` 包装）
| 动作 | 方法 / 路径 | body | 备注 |
|---|---|---|---|
| 列表 | `GET /api/topics/` | `page,page_size,status?` | 返回 `{count,next,previous,results}`，取 `results` |
| 新建 | `POST /api/topics/` | `title, academic_year, topic_source, proposer, supervisor, description` | 创建时后端自动跑查重，状态置 `PENDING_DEDUP` |
| 更新 | `PUT /api/topics/{id}/` | 同上核心字段 | 改题名自动写 `TopicVersion` |
| 提交审核 | `POST /api/topics/{id}/submit-review/` | 空 body | 前置：无未处理的疑似重复 |

**当前前端缺口**：
- `src/api/topics.js` 仅含 `getTopics / getTopicDetail / approveTopic / rejectTopic`，**缺 `createTopic / updateTopic / submitReview`**（实现阶段补充）。
- `mock/topics.js` 仅含 GET 列表、approve、reject，**缺 create/update/submit-review**（实现阶段补充，按 mock 持久化规则落盘 `node_modules/.mock-state/topics.json`）。

### 状态流转（教师视角，实际生效状态）
```
DRAFT ──(保存草稿)──▶ 存为草稿
DRAFT/REJECTED ──(提交审核)──▶ PENDING_DEDUP ──(后端自动查重)──▶ PENDING_REVIEW
PENDING_REVIEW ──(管理员 approve)──▶ PUBLISHED ──(学生选定)──▶ SELECTED
PENDING_REVIEW ──(管理员 reject)──▶ REJECTED ──(教师改后重提)──▶ PENDING_DEDUP …
```
> 注：后端文档写明"创建时自动跑查重，状态置待查重"，即提交即进入查重。前端状态分段按 `DRAFT / PENDING_DEDUP / PENDING_REVIEW / REJECTED / PUBLISHED / 全部` 过滤，不强依赖 `DRAFT` 是否真实落库（以实际后端为准）。

## 5. 页面结构
### 5.1 列表页（主视图，复用题目审核页骨架）
- 页头：标题「我的题目申报」+ 中性说明文案。
- 操作栏：左侧**状态分段 tab**（草稿/待查重/待审核/退回修改/已发布/全部）；中间关键词搜索；右侧**「新建题目」主按钮**（山能红）。
- 列表：复用 `TopicTable`，操作列按状态渲染：
  - `DRAFT`：`编辑` `提交审核` `查看`
  - `PENDING_DEDUP`：`查看`（标注"查重中"）
  - `PENDING_REVIEW`：`查看`（标注"待管理员审核"）
  - `REJECTED`：`编辑` `重新提交` `查看`
  - `PUBLISHED`/`SELECTED`：`查看`
- 加载/错误/空态复用既有样式。
- 分页复用既有 `pg` 样式。

### 5.2 新建/编辑弹窗 `TopicFormDialog`（z-80，抽屉外独立弹窗）
字段：
| 字段 | 控件 | 必填 | 默认/取值 |
|---|---|---|---|
| 题目名称 title | 文本输入 | ✅ | — |
| 所属学年 academic_year | 下拉 | ✅ | 默认当前届次（`/api/academic-years/` 取激活项） |
| 题目来源 topic_source | 单选（锁定） | ✅ | 默认 `TEACHER`，建议锁定不可改 |
| 申报人 proposer | 隐藏/锁定 | ✅ | 当前教师 id（`auth.user.id`），锁定 |
| 指导教师 supervisor | 下拉（锁定） | ✅ | 默认当前教师，MVP 锁定，留扩展（见 §7 风险3） |
| 题目描述 description | 文本域 | 选填 | 建议长度提示 |

校验：title/academic_year 必填；提交时 `mutationFn` 调 `createTopic`/`updateTopic`。
**vue-query 坑**：`isPending` 用 `computed(() => unref(saveMutation.isPending))`（参考选题轮次页写法），避免按钮永久禁用。

### 5.3 详情抽屉 `TopicTeacherDrawer`（z-55，只读 + 操作）
- 复用 `TopicReviewDrawer` 的展示结构（标题/来源/指导教师/申报人/学年/状态/退回意见/描述）。
- **去掉审核/退回按钮**（规避教师自审批）。
- 底部按状态显示教师可用动作：
  - `DRAFT`/`REJECTED`：`编辑`（打开 `TopicFormDialog`）、`提交审核`（ConfirmDialog 二次确认后 `submitReview`）。
  - 其它状态：仅展示。
- 查重提示区：沿用 `TopicReviewDrawer` 的"查重提示（待后端补齐）"文案，教师侧描述为"系统查重中/若判为疑似重复将无法提交，需管理员复核"。
- 提交审核**失败**（疑似重复）时，弹明确错误提示（读 `detail`/`non_field_errors`）。

## 6. 组件拆分与复用
**复用**：
- `src/components/topics/TopicTable.vue`（列表表格，`#actions` 插槽按状态覆盖操作列）。
- `src/utils/topics.js`（`statusLabel`/`statusVariant`/`sourceLabel`）。
- `src/components/ConfirmDialog.vue`（提交审核二次确认）。

**新建**：
- `src/views/teacher/MyTopics.vue`（页面容器，路由改指向）。
- `src/components/topics/TopicFormDialog.vue`（新建/编辑表单，≤300 行，超限拆子组件）。
- `src/components/topics/TopicTeacherDrawer.vue`（教师详情抽屉，≤300 行）。

**修改**：
- `src/router/index.js`：`/my-topics` 的 `component` 由 `ComingSoon` 改为 `MyTopics`。
- `src/api/topics.js`：补充 `createTopic / updateTopic / submitReview`。
- `mock/topics.js`：补充 create/update/submit-review 实现 + 落盘持久化。

## 7. 后端契约缺口与风险
- **风险1（越权）**：`approve`/`reject` 后端未加 `IsAdmin`，教师可能自审批。本页面**不暴露**审核按钮规避，但需后端修复。
- **风险2（阻断）**：疑似重复题目无复核接口，将永远卡在 `PENDING_DEDUP`/`PENDING_REVIEW` 无法提交发布。前端在 `PENDING_DEDUP` 与提交失败（疑似重复）时给出明确提示，不假装可绕过。
- **风险3（接口缺失）**：后端无"教师列表"接口，故 `supervisor` 在 MVP **默认=当前教师并锁定**，待账号管理接口就绪后放开为可选。
- **风险4（mock 脏数据）**：`mock/topics.js` 当前返回全量（含其它 proposer）。实现阶段需按当前教师 `proposer` 过滤或前端过滤，避免教师看到他人题目。

## 8. 实现阶段任务清单
1. `src/api/topics.js`：补 `createTopic`/`updateTopic`/`submitReview`。
2. `mock/topics.js`：补 create/update/submit-review + `node_modules/.mock-state/topics.json` 持久化 + 按 proposer 过滤列表。
3. `src/components/topics/TopicFormDialog.vue`：新建/编辑表单。
4. `src/components/topics/TopicTeacherDrawer.vue`：教师详情抽屉。
5. `src/views/teacher/MyTopics.vue`：列表页容器（状态分段 + 搜索 + 分页 + 操作列）。
6. `src/router/index.js`：`/my-topics` 指向 `MyTopics`。
7. 自检：每个 `.vue` ≤300 行；vue-query `isPending` 正确解包；弹层 z 分层（弹窗 z-80 / 抽屉 z-55）。

## 9. 默认决策（待批准时确认）
- **Q1** `supervisor`：MVP 锁定=当前教师（后端无教师列表接口）。是否允许选其他教师？→ 暂定锁定。
- **Q2** 删除题目：后端无 DELETE，暂不支持。是否需补充？→ 暂不支持。
- **Q3** `proposer`：锁定=当前登录教师。是否允许教师代他人申报？→ 暂定锁定。
- **Q4** `topic_source`：锁定 `TEACHER`。是否允许选 `ADMIN` 录入？→ 暂定锁定。

## 10. 验收标准
- 教师登录仅见本人题目；状态分段/搜索/分页正常。
- 新建题目后进入 `PENDING_DEDUP`；编辑/重新提交/查看详情按状态可用。
- 提交审核走 `submit-review`；疑似重复有明确提示。
- 全部按钮无"永久禁用/常显保存中"问题；弹层层级正确；无超 300 行文件。
