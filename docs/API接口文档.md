# 毕业设计督导系统 API 接口文档

> 由 OpenAPI schema 自动生成，共 28 个路径。
> 鉴权方式：Bearer Token（`Authorization: Bearer <access>`），登录接口除外。

## 接口清单

### GET `/api/academic-years/`
**说明**：获取学年列表（academic-years）
**请求参数**
_无_
**响应 200**
_（数组响应，以下为元素结构）_
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| [].id | integer | 是 | 学年ID |
| [].name | string | 是 | 学年名称，如 2026-2027 学年 |
| [].start_date | string | 是 | 学年开始日期 |
| [].end_date | string | 是 | 学年结束日期 |
| [].status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| [].is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |

### POST `/api/academic-years/`
**说明**：创建学年（academic-years）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |
**响应 201**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |

### GET `/api/academic-years/{id}/`
**说明**：获取学年详情（academic-years）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 学年的唯一标识ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |

### PUT `/api/academic-years/{id}/`
**说明**：更新学年（academic-years）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |

### PATCH `/api/academic-years/{id}/`
**说明**：部分更新学年（academic-years）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 否 | 学年ID |
| name | string | 否 | 学年名称，如 2026-2027 学年 |
| start_date | string | 否 | 学年开始日期 |
| end_date | string | 否 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 否 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 否 | 是否为系统当前生效的学年，全局同时只允许一个为 true |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |

### DELETE `/api/academic-years/{id}/`
**说明**：删除学年（academic-years）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 学年的唯一标识ID |
**响应 204**
_无响应体_

### POST `/api/academic-years/{id}/activate/`
**说明**：激活学年（设为当前学年）（academic-years）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 学年ID |
| name | string | 是 | 学年名称，如 2026-2027 学年 |
| start_date | string | 是 | 学年开始日期 |
| end_date | string | 是 | 学年结束日期 |
| status | string (enum: DRAFT/PREPARING/IN_PROGRESS/FINISHED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PREPARING` - 准备中；`IN_PROGRESS` - 进行中；`FINISHED` - 已结束；`ARCHIVED` - 已归档 |
| is_current | boolean | 是 | 是否为系统当前生效的学年，全局同时只允许一个为 true |

### POST `/api/auth/change-password/`
**说明**：修改密码（auth）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| old_password | string | 是 | 当前使用的原密码 |
| new_password | string | 是 | 新密码，至少 6 位 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| detail | string | 是 | 错误信息描述 |

### POST `/api/auth/login/`
**说明**：用户登录（auth）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 登录用户名（管理员账号 / 教师工号 / 学号） |
| password | string | 是 | 登录密码 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| access | string | 是 | 访问令牌，后续接口需在请求头携带 Authorization: Bearer <access> |
| refresh | string | 是 | 刷新令牌（当前版本尚未开放刷新接口） |
| must_change_password | boolean | 是 | 是否必须先修改密码，为 true 时前端应跳转改密页 |
| real_name | string | 是 | 用户真实姓名 |
| role_codes | array<string> | 是 | 用户拥有的角色编码列表，取值 ADMIN / TEACHER / STUDENT |

### GET `/api/auth/me/`
**说明**：获取当前登录用户信息（auth）
**请求参数**
_无_
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 用户ID |
| username | string | 是 | 登录用户名 |
| real_name | string | 否 | 用户真实姓名 |
| phone | string | 否 | 联系手机号 |
| user_status | string (enum: ACTIVE/DISABLED) | 否 | 可选值：`ACTIVE` - 启用；`DISABLED` - 禁用 |
| role_codes | array<string> | 是 | 用户拥有的角色编码列表，取值 ADMIN / TEACHER / STUDENT |

### GET `/api/home/overview/`
**说明**：获取首页概览（home）
**请求参数**
_无_
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| academic_year | string | 是 | 当前学年名称 |
| current_stage | string | 是 | 当前所处阶段名称，不在任何阶段内时为 null |
| timeline | array<object> | 是 | 本学年各阶段的时间轴列表 |
| timeline[].stage_code | string | 是 | 阶段编码 |
| timeline[].display_name | string | 是 | 阶段显示名称 |
| timeline[].start_time | string | 是 | 该阶段开始时间 |
| timeline[].deadline | string | 是 | 该阶段截止时间 |
| timeline[].overdue | boolean | 是 | 是否已过截止时间 |
| todos | object | 是 | 待办汇总信息（JSON） |

### POST `/api/imports/students/commit/`
**说明**：提交学生导入（imports）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | integer | 是 | 校验阶段返回的导入批次ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | integer | 是 | 导入批次ID |
| success_rows | integer | 是 | 本次成功导入的学生数 |

### POST `/api/imports/students/validate/`
**说明**：校验学生导入文件（imports）
**请求参数（multipart/form-data）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | string | 是 | 学生信息 Excel 文件（.xlsx） |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | integer | 是 | 生成的导入批次ID，提交时需回传 |
| total | integer | 是 | 解析出的数据总行数 |
| new_count | integer | 是 | 校验通过的行数 |
| error_count | integer | 是 | 校验失败的行数 |

### POST `/api/imports/teachers/commit/`
**说明**：提交教师导入（imports）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | integer | 是 | 校验阶段返回的导入批次ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | integer | 是 | 导入批次ID |
| created | integer | 是 | 本次新建的教师账号数 |
| updated | integer | 是 | 本次更新的教师数 |

### POST `/api/imports/teachers/validate/`
**说明**：校验教师导入文件（imports）
**请求参数（multipart/form-data）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | string | 是 | 教师信息 Excel 文件（.xlsx） |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_id | integer | 是 | 生成的导入批次ID，提交时需回传 |
| total | integer | 是 | 解析出的数据总行数 |
| new_count | integer | 是 | 校验通过的行数 |
| error_count | integer | 是 | 校验失败的行数 |

### GET `/api/imports/{id}/`
**说明**：获取导入批次详情（imports）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 导入批次的唯一标识ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 导入批次ID |
| import_type | string (enum: TEACHER/STUDENT) | 是 | 可选值：`TEACHER` - 教师导入；`STUDENT` - 学生导入 |
| status | string (enum: PENDING/PROCESSING/COMPLETED/PARTIAL_FAILED/FAILED) | 否 | 可选值：`PENDING` - 待处理；`PROCESSING` - 处理中；`COMPLETED` - 已完成；`PARTIAL_FAILED` - 部分失败；`FAILED` - 全部失败 |
| total_rows | integer | 否 | 文件中解析出的数据总行数 |
| success_rows | integer | 否 | 校验通过的行数 |
| failed_rows | integer | 否 | 校验失败的行数 |
| created_at | string | 是 | 记录创建时间，自动生成 |

### GET `/api/imports/{id}/errors/`
**说明**：获取导入错误明细（imports）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 导入批次的唯一标识ID |
**响应 200**
_（数组响应，以下为元素结构）_
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| [].row_no | integer | 是 | 出错的 Excel 行号（含表头，从 1 开始） |
| [].field_name | string | 否 | 出错的列名，多个列用逗号分隔 |
| [].raw_value | string | 否 | 出错单元格的原始内容 |
| [].error_message | string | 是 | 具体的错误原因说明 |

### GET `/api/operation-logs/`
**说明**：获取操作日志列表（operation-logs）
**请求参数**
_无_
**响应 200**
_（数组响应，以下为元素结构）_
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| [].id | integer | 是 | 日志ID |
| [].operator_name | string | 是 | 执行操作的用户名 |
| [].operation_type | string (enum: CREATE/UPDATE/DELETE/REVIEW/IMPORT/EXPORT/LOGIN/SELECTION) | 是 | 可选值：`CREATE` - 创建；`UPDATE` - 修改；`DELETE` - 删除；`REVIEW` - 审核；`IMPORT` - 导入；`EXPORT` - 导出；`LOGIN` - 登录；`SELECTION` - 选题 |
| [].target_type | string | 是 | 被操作对象的类型，如 topic / selection_round |
| [].target_id | string | 否 | 被操作对象的主键 |
| [].before_data | object | 否 | 操作前的数据快照（JSON） |
| [].after_data | object | 否 | 操作后的数据快照（JSON） |
| [].ip_address | string | 否 | 发起操作的客户端 IP |
| [].created_at | string | 是 | 记录创建时间，自动生成 |

### GET `/api/operation-logs/{id}/`
**说明**：获取操作日志详情（operation-logs）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 操作日志的唯一标识ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 日志ID |
| operator_name | string | 是 | 执行操作的用户名 |
| operation_type | string (enum: CREATE/UPDATE/DELETE/REVIEW/IMPORT/EXPORT/LOGIN/SELECTION) | 是 | 可选值：`CREATE` - 创建；`UPDATE` - 修改；`DELETE` - 删除；`REVIEW` - 审核；`IMPORT` - 导入；`EXPORT` - 导出；`LOGIN` - 登录；`SELECTION` - 选题 |
| target_type | string | 是 | 被操作对象的类型，如 topic / selection_round |
| target_id | string | 否 | 被操作对象的主键 |
| before_data | object | 否 | 操作前的数据快照（JSON） |
| after_data | object | 否 | 操作后的数据快照（JSON） |
| ip_address | string | 否 | 发起操作的客户端 IP |
| created_at | string | 是 | 记录创建时间，自动生成 |

### GET `/api/schema/`
**说明**：获取 OpenAPI Schema（schema）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| format | query | string | 否 | 返回数据的格式 |
| lang | query | string | 否 | 返回描述所用的语言 |
**响应 200**
_无_

### POST `/api/selection-choices/`
**说明**：学生选题（selection-choices）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topic_id | integer | 是 | 要选择的题目ID |
**响应 201**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题记录ID |
| selection_round | integer | 是 | 所属选题轮次 |
| student | integer | 是 | 选题的学生 |
| topic | integer | 是 | 学生选定的题目 |
| status | string (enum: SELECTED/CANCELLED) | 否 | 可选值：`SELECTED` - 已选定；`CANCELLED` - 已取消 |
| submitted_at | string | 是 | 选题提交时间，自动生成 |

### POST `/api/selection-choices/change/`
**说明**：学生换题（selection-choices）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topic_id | integer | 是 | 要更换为的题目ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题记录ID |
| selection_round | integer | 是 | 所属选题轮次 |
| student | integer | 是 | 选题的学生 |
| topic | integer | 是 | 学生选定的题目 |
| status | string (enum: SELECTED/CANCELLED) | 否 | 可选值：`SELECTED` - 已选定；`CANCELLED` - 已取消 |
| submitted_at | string | 是 | 选题提交时间，自动生成 |

### GET `/api/selection-rounds/`
**说明**：获取选题轮次列表（selection-rounds）
**请求参数**
_无_
**响应 200**
_（数组响应，以下为元素结构）_
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| [].id | integer | 是 | 选题轮次ID |
| [].academic_year | integer | 是 | 所属学年 |
| [].round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| [].start_time | string | 是 | 本轮选题的开放时间 |
| [].end_time | string | 是 | 本轮选题的截止时间 |
| [].status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |

### POST `/api/selection-rounds/`
**说明**：创建选题轮次（selection-rounds）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |
**响应 201**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |

### GET `/api/selection-rounds/{id}/`
**说明**：获取选题轮次详情（selection-rounds）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 选题轮次的唯一标识ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |

### PUT `/api/selection-rounds/{id}/`
**说明**：更新选题轮次（selection-rounds）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |

### PATCH `/api/selection-rounds/{id}/`
**说明**：部分更新选题轮次（selection-rounds）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 否 | 选题轮次ID |
| academic_year | integer | 否 | 所属学年 |
| round_no | integer | 否 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 否 | 本轮选题的开放时间 |
| end_time | string | 否 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 否 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |

### DELETE `/api/selection-rounds/{id}/`
**说明**：删除选题轮次（selection-rounds）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 选题轮次的唯一标识ID |
**响应 204**
_无响应体_

### POST `/api/selection-rounds/{id}/close/`
**说明**：关闭选题轮次并生成指导关系（selection-rounds）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 选题轮次的唯一标识ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| assignments_created | integer | 是 | 轮次关闭后自动生成的指导关系数量 |

### POST `/api/selection-rounds/{id}/open/`
**说明**：开启选题轮次（selection-rounds）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 选题轮次ID |
| academic_year | integer | 是 | 所属学年 |
| round_no | integer | 是 | 同一学年内的轮次编号，从 1 递增 |
| start_time | string | 是 | 本轮选题的开放时间 |
| end_time | string | 是 | 本轮选题的截止时间 |
| status | string (enum: PENDING/OPEN/CLOSED) | 是 | 可选值：`PENDING` - 待开始；`OPEN` - 进行中；`CLOSED` - 已结束 |

### GET `/api/students/me/selection-result/`
**说明**：查询我的选题结果（students）
**请求参数**
_无_
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| topic_id | integer | 是 | 已选定题目的ID，尚未选题时为 null |
| topic_title | string | 否 | 已选定题目的名称 |

### GET `/api/topics/`
**说明**：获取题目列表（topics）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| page | query | integer | 否 | 分页结果集中的页码。 |
| page_size | query | integer | 否 | 每页返回的结果数量。 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| count | integer | 是 | 满足条件的记录总数 |
| next | string | 否 | 下一页的请求地址，没有下一页时为 null |
| previous | string | 否 | 上一页的请求地址，没有上一页时为 null |
| results | array<object> | 是 | 当前页的数据列表 |
| results[].id | integer | 是 | 题目ID |
| results[].academic_year | integer | 是 | 所属学年 |
| results[].title | string | 是 | 题目名称 |
| results[].normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| results[].topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| results[].proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| results[].supervisor | integer | 是 | 题目的指导教师 |
| results[].description | string | 否 | 题目内容与要求描述 |
| results[].status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| results[].review_comment | string | 是 | 管理员审核的退回意见 |
| results[].created_at | string | 是 | 记录创建时间，自动生成 |
| results[].updated_at | string | 是 | 记录最后更新时间，自动生成 |

### POST `/api/topics/`
**说明**：创建题目（topics）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |
**响应 201**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |

### GET `/api/topics/{id}/`
**说明**：获取题目详情（topics）
**请求参数**
| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 题目的唯一标识ID |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |

### PUT `/api/topics/{id}/`
**说明**：更新题目（topics）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |

### POST `/api/topics/{id}/approve/`
**说明**：审核通过题目（topics）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |

### POST `/api/topics/{id}/reject/`
**说明**：退回修改题目（topics）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| comment | string | 否 | 退回修改的原因说明 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |

### POST `/api/topics/{id}/submit-review/`
**说明**：提交题目审核（topics）
**请求参数（body）**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |
**响应 200**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 题目ID |
| academic_year | integer | 是 | 所属学年 |
| title | string | 是 | 题目名称 |
| normalized_title | string | 是 | 去除空格与标点后的题目名称，用于查重比对，由系统自动生成 |
| topic_source | string (enum: TEACHER/ADMIN) | 是 | 可选值：`TEACHER` - 教师申报；`ADMIN` - 管理员录入 |
| proposer | integer | 是 | 题目申报人（教师申报时为该教师） |
| supervisor | integer | 是 | 题目的指导教师 |
| description | string | 否 | 题目内容与要求描述 |
| status | string (enum: DRAFT/PENDING_DEDUP/DEDUP_DONE/PENDING_REVIEW/APPROVED/REJECTED/PUBLISHED/SELECTED/ARCHIVED) | 是 | 可选值：`DRAFT` - 草稿；`PENDING_DEDUP` - 待查重；`DEDUP_DONE` - 查重完成；`PENDING_REVIEW` - 待审核；`APPROVED` - 审核通过；`REJECTED` - 退回修改；`PUBLISHED` - 已发布；`SELECTED` - 已选定；`ARCHIVED` - 已归档 |
| review_comment | string | 是 | 管理员审核的退回意见 |
| created_at | string | 是 | 记录创建时间，自动生成 |
| updated_at | string | 是 | 记录最后更新时间，自动生成 |
