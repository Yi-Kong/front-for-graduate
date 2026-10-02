# #13 题目浏览 页面设计方案

> 阶段：设计稿（仅方案，未写代码）。需审核通过后进入编码阶段。
> 依据：`docs/2026-09-16-frontend-phase1-page-plan.md` + `毕业设计督导系统 API 接口文档`（OpenAPI，28 路径）。
> 角色：STUDENT（学生）。后端依赖：`GET /api/topics/`（分页）。

---

## 1. 页面定位

- **路由**：`/topic-browse`（当前为 `ComingSoon` 占位，需新建 `views/student/TopicBrowse.vue`）。
- **权限**：`meta.roles: ['STUDENT']`。管理员/教师访问会被路由守卫重定向到工作台。
- **目标**：学生在选题轮次开放前后，浏览系统已发布（`PUBLISHED`）的题目，按条件筛选、查看题目详情，为「我的选题」做准备。
- **数据范围**：学生视角仅返回 `PUBLISHED` 题目，由后端序列化器/queryset 数据范围保证（前端不做状态过滤，只展示）。

## 2. 接口字段映射

`GET /api/topics/?page=&page_size=` → 响应体：

```json
{ "count": 0, "next": "url|null", "previous": "url|null", "results": [ { ...topic } ] }
```

`results[]` 单条字段 → 前端展示：

| API 字段 | 类型 | 前端用途 | 展示处理 |
|----------|------|----------|----------|
| `id` | integer | 行唯一标识 | 内部使用 |
| `title` | string | 题目名称（主列） | 直接展示，可点击查看详情 |
| `academic_year` | integer | 所属学年 | 需映射为学年名称（见 §8 缺口） |
| `topic_source` | enum TEACHER/ADMIN | 题目来源 | `TEACHER`→教师申报 / `ADMIN`→管理员录入 |
| `proposer` | integer | 申报人 | 需映射为姓名（见 §8 缺口） |
| `supervisor` | integer | 指导教师 | 需映射为姓名（见 §8 缺口） |
| `description` | string? | 题目描述 | 详情抽屉展示，列表省略 |
| `status` | enum | 状态 | 学生视角恒定 `PUBLISHED` → 中文「已发布」 |
| `review_comment` | string | 退回意见 | 学生视角无意义，**隐藏** |
| `created_at` / `updated_at` | string | 时间 | 详情展示，ISO 时间本地化 |

**状态枚举中文映射**（抽成 `utils/topics.js`，供 #8/#11 复用）：

| 值 | 中文 | 值 | 中文 |
|----|------|----|------|
| DRAFT | 草稿 | APPROVED | 审核通过 |
| PENDING_DEDUP | 待查重 | REJECTED | 退回修改 |
| DEDUP_DONE | 查重完成 | PUBLISHED | 已发布 |
| PENDING_REVIEW | 待审核 | SELECTED | 已选定 |
| — | — | ARCHIVED | 已归档 |

## 3. 页面布局（沿用 AppShell）

```
┌──────────────────────────────────────────────────────────┐
│ Topbar（校徽 + 校训 + 用户信息）                            │
├────────────┬─────────────────────────────────────────────┤
│ Sidebar    │ 页头：题目浏览 ／ 副标题（当前届次提示）      │
│ （按角色   ├─────────────────────────────────────────────┤
│  过滤菜单） │ 筛选条：[关键词] [学年▾] [指导教师] [查询][重置]│
│            ├─────────────────────────────────────────────┤
│            │ TopicTable 卡片                              │
│            │  ┌──────────────────────────────────────┐   │
│            │  │ 题目名称 | 指导教师 | 来源 | 学年 | 状态 │   │
│            │  └──────────────────────────────────────┘   │
│            ├─────────────────────────────────────────────┤
│            │ 分页条（绑定 count/next/previous）            │
└────────────┴─────────────────────────────────────────────┘
        详情：点击行 → Drawer 展示 description / 来源 / 时间
```

## 4. 表格列（TopicTable 公共组件，供 #8/#11 复用）

| 列 | 绑定字段 | 说明 |
|----|----------|------|
| 题目名称 | `title` | 主列，可点击打开详情 |
| 指导教师 | `supervisor`→姓名 | 名称映射（§8） |
| 题目来源 | `topic_source` | shadcn Badge：`教师申报`/`管理员录入` |
| 所属学年 | `academic_year`→名称 | 名称映射（§8） |
| 状态 | `status` | Badge：`已发布`（绿/灰，依主题） |
| 操作 | — | 「查看详情」按钮 |

> 该表作为公共组件抽出，#8 题目审核、#11 我的题目申报复用同一表格骨架，仅列配置与操作按钮不同。

## 5. 筛选 / 搜索

| 条件 | 控件 | 备注 |
|------|------|------|
| 关键词 | 文本输入 | 按 `title` 模糊匹配（**待后端确认是否支持 query 参数**，见 §8） |
| 学年 | 下拉 | 选项取自届次列表接口或当前届次 |
| 指导教师 | 文本/下拉 | 依赖名称映射能力（§8） |
| 操作 | 查询 / 重置 | 重置清空全部条件，回到第一页 |

## 6. 分页与空态

- **服务端分页**：`page` / `page_size`，分页器绑定 `count` / `next` / `previous`；默认每页 10/20 条。
- **加载态**：表格区 shadcn `Skeleton` 占位。
- **空态**：无 `PUBLISHED` 题目时，居中插画 + 文案「暂无可选题目，请关注选题轮次开放时间」。

## 7. 复用组件规划

- `src/components/topics/TopicTable.vue`（公共，≤300 行）：props `data` / `loading` / `columns` 配置；#8/#11 直接复用。
- `src/utils/topics.js`：导出 `statusLabel(status)`、`statusVariant(status)`、`sourceLabel(source)` 等纯函数。
- 状态徽章、分页器复用已有 shadcn-vue 组件与项目内既有模式（参考 `academic-year` / `operation-log` 页面）。
- 学年 / 教师名称映射：抽成 `useTopicMeta` composable 或工具函数，集中处理 ID→名称。

## 8. 待后端确认的缺口（设计阶段必须澄清，否则影响筛选项与展示）

1. **筛选参数未文档化**：API 文档 `GET /api/topics/` 仅列 `page` / `page_size`，未列 `title` / `academic_year` / `supervisor` 等筛选参数。需确认后端是否支持；若不支持，筛选只能做当前页客户端过滤（体验受限）。
2. **名称未展开**：`proposer` / `supervisor` 为整型用户 ID，题目列表不含姓名，且无账号列表接口（#7 受阻）。需后端在 topic 序列化器中展开 `supervisor_name` / `proposer_name`，否则表格只能显示 ID。
3. **学生视角范围确认**：确认后端对 `STUDENT` 强制只返回 `PUBLISHED`，且是否与「当前届次 / 已开启轮次」绑定（影响副标题与空态文案）。

> **已查证（2026-10-02）**：`backend-interface-analysis.md` §3 明确 topics 列表数据范围为「ADMIN 全量 / TEACHER 本人 / STUDENT 仅**已发布**」——过滤条件只有 `status=PUBLISHED`，**没有任何文档要求按 `topic_source` 屏蔽管理员录入的题目**。因此学生端应正常展示已发布的管理员录入题目（`ADMIN`），「题目来源」列仅作信息展示，不作过滤条件。

## 9. 规范符合性

- 单 `.vue` 文件 ≤ 300 行，超出必须拆分（本页预估：TopicBrowse 视图 + TopicTable 组件，均可控）。
- 组件库统一 shadcn-vue；主色山能红 `#C0202E`；校徽/校训品牌区沿用现有 `SchoolEmblem` / `Topbar`。
- 请求层走已适配 DRF 的 `request.js`（裸对象响应 + `detail` 错误 + 401 清态），新增 `src/api/topics.js` 封装 `getTopics(params)`。
- 数据获取用 `@tanstack/vue-query`（`useQuery`），`data` 直接为后端裸业务对象。

---

## 审核清单（供评审）

- [ ] 布局结构是否符合 AppShell 现有风格
- [ ] 表格列是否满足学生浏览诉求
- [ ] 筛选条件是否保留（取决于 §8 缺口 1 后端答复）
- [ ] 名称映射方案（§8 缺口 2）后端是否可展开
- [ ] 空态 / 加载态文案是否合适
