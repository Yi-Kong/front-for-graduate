# 后端接口分析报告（基于实际代码）

**分析对象：** `backend/`（Django + DRF，6 个应用）
**分析时间：** 2026-09-16
**路由入口：** `config/urls.py`，所有接口前缀 `/api/`，认证用 `djangorestframework-simplejwt`

---

## 一、已实现应用与接口清单

### 1. 账号 `accounts`（前缀 `/api/auth/`）
| 方法 | 路径 | 视图 | 权限 | 说明 |
|---|---|---|---|---|
| POST | `/api/auth/login/` | LoginView | AllowAny | 登录，返回 `access`/`refresh`/`must_change_password`/`role_codes` |
| GET | `/api/auth/me/` | MeView | IsAuthenticated | 当前用户基本信息 |
| POST | `/api/auth/change-password/` | ChangePasswordView | IsAuthenticated | 修改密码并清除"必须改密码"标记 |

### 2. 届次与首页 `academic`
| 方法 | 路径 | 视图 | 权限 | 说明 |
|---|---|---|---|---|
| GET | `/api/academic-years/` | AcademicYearViewSet.list | IsAdmin | 届次列表 |
| POST | `/api/academic-years/` | .create | IsAdmin | 新建届次 |
| GET | `/api/academic-years/{id}/` | .retrieve | IsAdmin | 详情 |
| PUT | `/api/academic-years/{id}/` | .update | IsAdmin | 全量更新 |
| PATCH | `/api/academic-years/{id}/` | .partial_update | IsAdmin | 部分更新 |
| DELETE | `/api/academic-years/{id}/` | .destroy | IsAdmin | 删除届次 |
| POST | `/api/academic-years/{id}/activate/` | .activate | IsAdmin | 设为当前届次 |
| GET | `/api/home/overview/` | home_overview | IsAuthenticated | 首页概览：当前届次/当前阶段/时间轴；**待办 `todos` 固定为 `{count:0}`，未实现** |

### 3. 题目 `topics`
| 方法 | 路径 | 视图 | 权限 | 说明 |
|---|---|---|---|---|
| GET | `/api/topics/` | TopicViewSet.list | 登录(角色过滤) | 列表：ADMIN 全量 / TEACHER 本人 / STUDENT 仅"已发布" |
| POST | `/api/topics/` | .create | 登录 | 新建题目，**创建时自动跑查重**，状态置"待查重" |
| GET | `/api/topics/{id}/` | .retrieve | 登录 | 详情 |
| PUT | `/api/topics/{id}/` | .update | 登录 | 全量更新（改题名自动写 `TopicVersion`） |
| POST | `/api/topics/{id}/submit-review/` | .submit_review | 登录 | 提交审核（前置：无未处理的疑似重复） |
| POST | `/api/topics/{id}/approve/` | .approve | 登录 | 审核通过 → 已发布 |
| POST | `/api/topics/{id}/reject/` | .reject | 登录 | 退回修改 → 退回 |

> ⚠️ `TopicViewSet` 未显式设置 `permission_classes`，`approve`/`reject` 没有 `IsAdmin` 保护，且 `get_queryset` 对 TEACHER 不过滤状态 —— **教师可能审批/退回自己（甚至他人）的题目**，存在越权与自审批风险（见第四节）。

### 4. 选题 `selection`
| 方法 | 路径 | 视图 | 权限 | 说明 |
|---|---|---|---|---|
| GET | `/api/selection-rounds/` | SelectionRoundViewSet.list | IsAdmin | 轮次列表 |
| POST | `/api/selection-rounds/` | .create | IsAdmin | 新建轮次 |
| GET | `/api/selection-rounds/{id}/` | .retrieve | IsAdmin | 详情 |
| PUT/PATCH | `/api/selection-rounds/{id}/` | .update/.partial_update | IsAdmin | 更新 |
| DELETE | `/api/selection-rounds/{id}/` | .destroy | IsAdmin | 删除 |
| POST | `/api/selection-rounds/{id}/open/` | .open | IsAdmin | 开启轮次 |
| POST | `/api/selection-rounds/{id}/close/` | .close | IsAdmin | 关闭轮次并**生成指导关系**（`supervision_assignment`） |
| POST | `/api/selection-choices/` | SelectionChoiceView | IsStudent | 选题（先到先得原子锁定） |
| POST | `/api/selection-choices/change/` | SelectionChangeView | IsStudent | 改选 |
| GET | `/api/students/me/selection-result/` | MySelectionResultView | IsStudent | 我的选题结果 |

### 5. 导入 `imports`
| 方法 | 路径 | 视图 | 权限 | 说明 |
|---|---|---|---|---|
| POST | `/api/imports/teachers/validate/` | TeacherValidateView | IsAdmin | 教师 Excel 预校验，返回 `batch_id` |
| POST | `/api/imports/teachers/commit/` | TeacherCommitView | IsAdmin | 教师导入提交 |
| POST | `/api/imports/students/validate/` | StudentValidateView | IsAdmin | 学生 Excel 预校验 |
| POST | `/api/imports/students/commit/` | StudentCommitView | IsAdmin | 学生导入提交 |
| GET | `/api/imports/{pk}/` | ImportBatchViewSet.retrieve | IsAdmin | 导入批次详情 |
| GET | `/api/imports/{pk}/errors/` | .errors | IsAdmin | 导入错误明细 |

### 6. 审计 `audit`
| 方法 | 路径 | 视图 | 权限 | 说明 |
|---|---|---|---|---|
| GET | `/api/operation-logs/` | OperationLogViewSet.list | IsAdmin | 操作日志列表 |
| GET | `/api/operation-logs/{id}/` | .retrieve | IsAdmin | 日志详情 |

### 7. 其它（基础设施）
- `GET /api/health/` — 健康检查
- `GET /api/schema/` — OpenAPI Schema（drf-spectacular）
- `GET /api/docs/` — Swagger UI

---

## 二、与设计文档第 10 章的对照

| 设计章节 | 设计预期接口 | 实际状态 |
|---|---|---|
| 10.1 届次与流程 | academic-years CRUD + activate + **stages** | 届次 CRUD/activate ✅；**流程节点（stages）配置接口 ❌** |
| 10.2 用户导入 | teachers/validate/commit、students/validate/commit、`imports/{id}`、`/errors` | ✅ 全部实现 |
| 10.3 题目 | topics CRUD、**duplicate-check**、submit-review、approve、reject | CRUD/审核 ✅；**独立 duplicate-check 接口 ❌**（改为创建时自动跑） |
| 10.4 选题 | selection-rounds CRUD/open/close、selection-choices、**supervision-statistics**、**supervision-assignments/confirm** | 轮次+选题 ✅；统计/管理员分配确认 ❌ |
| 10.5 流程确认 | pending-confirmations、student-stage-records/{id}/confirm | ❌ 整个流程确认模块未实现 |
| 10.6 答辩 | defense-sessions、auto-arrange、conflicts、defense-groups、defense-records | ❌ 整个答辩模块未实现 |
| 10.7 成绩与总结 | grades、submit、publish、annual-statistics、annual-summaries | ❌ 整个成绩与 AI 总结模块未实现 |

**结论：** 当前后端覆盖了"第一阶段（用户/题目/选题）"的核心能力，但**第二阶段（过程确认、答辩）与第三阶段（成绩、通知、AI 总结）尚未开工**，与设计第 15 章的实施阶段一致（先做的确是第一阶段）。

---

## 三、权限模型现状

- 角色仅 `ADMIN / TEACHER / STUDENT`（`Role.Code`），**无 SECRETARY 角色** —— 这恰好与设计文档审核意见 S1 的修订建议（秘书不设为独立全局角色）一致。
- 权限类：`IsAdmin`、`IsTeacher`、`IsStudent` 继承自 `RolePermission`（ADMIN 一律放行，其余按 `allowed_roles` 交集判断）。
- 数据范围权限：题目列表用 `get_queryset` 按角色过滤（学生仅见已发布），符合设计 12.2 第三层"数据范围权限"。

---

## 四、关键问题与风险

### 🔴 高 — 题目审核越权 / 自审批
`TopicViewSet.approve` 与 `.reject` 未加 `IsAdmin`，且教师 `get_queryset` 不过滤状态。教师可能审批/退回自己的题目（自审批），违背设计 4.1（仅管理员审核发布）。
**建议：** `approve`/`reject`/`submit-review` 显式加 `IsAdmin`，并做对象级校验。

### 🔴 高（阻断性）— 疑似重复题目无法放行
- `run_duplicate_check`（topics/services.py）生成 `TopicDuplicateCheck`，其中 `admin_result` 默认 `PENDING`；
- `submit_review` 的前置校验 `_check_review_ready` 要求"无 `SUSPECT_DUPLICATE` 且 `admin_result=PENDING` 的记录"；
- **但全代码没有任何接口**能把 `admin_result` 置为"确认不重复"。
**结果：** 任何被系统判为疑似重复的题目，将永远卡在"待查重/待审核"，无法提交与发布。
**建议：** 补一个复核接口（如 `POST /api/topics/{id}/duplicate-checks/{cid}/review`，body 传 `admin_result` + `admin_comment`），并接入首页/列表展示。

### 🟡 中 — 缺少令牌刷新与登出接口
已用 simplejwt，但 `config/urls.py` 未挂 `token_refresh`/`token_verify`/`logout`。返回的 `refresh` 无法使用，前端只能依赖 `access`。
**建议：** 补充 refresh 与 logout 端点。

### 🟡 中 — 流程节点"可配置"未落地
设计 3.2 要求管理员可配置节点名称/时间/前置/提醒。代码虽有 `AcademicStageConfig` 模型，`home/overview` 也读取它，但**没有任何创建/编辑接口**，节点配置无法经 API 完成（疑似靠数据初始化/迁移）。
**建议：** 补充 stage 与 stage-config 的 CRUD 接口（对应设计 10.1 的 `stages`）。

### 🟡 中 — 首页待办未实现
`home_overview` 的 `todos` 固定 `{count:0}`，设计 6.1.2 的"按角色展示待办"未实现。

### 🟢 低 — 题目状态枚举冗余
`Topic.Status` 中 `DEDUP_DONE`（查重完成）、`APPROVED`（审核通过）在视图里从未赋值（`approve` 直接从 `PENDING_REVIEW` 跳到 `PUBLISHED`），属死状态，与设计状态机不完全一致，建议清理或补上对应流转。

---

## 五、总结

后端目前是一份**聚焦第一阶段的可用骨架**：认证、届次、题目（含自动查重与审核流转）、两轮选题（含并发锁定与指导关系生成）、Excel 导入、操作日志均已落地，且权限分层基本到位。

下一步最该补的，按优先级：
1. **修复题目审核越权**（加 `IsAdmin` + 对象校验）；
2. **补疑似重复复核接口**（否则审核流程对重复题是断路）；
3. **补齐 refresh/logout 与流程节点配置接口**；
4. 按设计 10.5–10.7 推进流程确认、答辩、成绩、通知、AI 总结模块。
