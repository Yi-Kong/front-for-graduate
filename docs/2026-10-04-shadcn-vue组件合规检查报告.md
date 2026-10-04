# shadcn-vue 组件合规检查报告

- 检查时间：2026-10-04
- 检查范围：`src/` 全部 38 个 `.vue` + 20 个 `.js`（其中业务 `.vue` 27 个，`src/components/ui/` 下 11 个）
- 检查口径：项目规范「组件库统一使用 shadcn-vue，不引入 Element Plus / Naive UI；不得直接 import reka-ui 手搓组件」

---

## 一、总体结论

**未完全遵循。**

shadcn-vue 在这个项目里目前只算「装上了」，还没有真正「用起来」：

- 落地的基础组件只有 **4 个**：`button`、`card`、`calendar`、`popover`；
- 全项目真正引用 shadcn 组件的业务文件只有 **1 个**（`components/selection/DateTimePicker.vue`）；
- 其余 26 个业务组件 / 页面全部是**手写 HTML + Tailwind 内联类**；
- 其中 `ui/card` 是**零引用死代码**，`ui/button` 只被 `ui/calendar` 内部引用，业务层一次没用过。

| 指标 | 数值 |
|---|---|
| 已落地 shadcn 组件族 | 4（button / card / calendar / popover） |
| 业务文件中引用 `@/components/ui/*` 的文件数 | 1 / 27 |
| 原生 `<button>` | **80** 处（23 个业务文件） |
| 原生 `<input>` | 22 处 |
| 原生 `<select>` | 9 处 |
| 原生 `<textarea>` | 2 处 |
| 原生 `type="checkbox"` | 2 处 |
| 原生 `<table>` | 6 处 |
| 内联 `<svg>` 图标（lucide-vue-next 已装但零引用） | 42 处 |
| 直接 `import ... from 'reka-ui'` | 4 处（均在 `src/components/ui/` 内，**位置合规**） |

结论拆成两块：**「不该直接 import reka-ui」这条红线是守住的**（4 处 reka-ui import 全在 `src/components/ui/` 官方组件内部）；**「所有组件使用 shadcn-vue」这条没有做到**（只有 1 个文件用了）。

---

## 二、已落地的 shadcn 组件质量核查

| 组件 | 结构 | 结论 |
|---|---|---|
| `ui/button` | Button.vue + variants.js + index.js | ✅ 结构合规。`buttonVariants` 已按要求抽到独立 `.js`（规避 Rolldown 不识别 SFC 内 export 的问题），`index.js` 重导出，正确 |
| `ui/card` | Card + CardHeader/Title/Description/Content/Footer + index.js | ✅ 结构合规，但**零引用** |
| `ui/popover` | Popover + PopoverTrigger + PopoverContent + index.js | ✅ 结构合规。PopoverContent 自定义 `z-[100]`，符合项目「弹层需压过 z-[80]」约定 |
| `ui/calendar` | Calendar.vue + index.js | ⚠️ 结构合规，但样式里硬编码 `data-[selected]:bg-[#C0202E]`，用山能红覆盖了 shadcn 的 `--primary`；`@update:model-value` 已正确转发（此前踩过的坑已修） |

---

## 三、应当由 shadcn-vue 承载、但实际是手写的清单

| shadcn 组件 | 手写替代位置 | 量 |
|---|---|---|
| `Dialog` / `AlertDialog` | `ConfirmDialog.vue`、`admin/YearFormDialog.vue`、`selection/RoundFormDialog.vue`、`topics/TopicFormDialog.vue`、`import/ErrorDetailModal.vue`、`TopicReviewDrawer.vue` 内退回弹窗 | 6 个弹窗，全部自建 `fixed inset-0 bg-black/45` + `@click.self` |
| `Sheet` / `Drawer` | `topics/TopicReviewDrawer.vue`、`topics/TopicTeacherDrawer.vue`、`admin/OperationLogDetailDrawer.vue`、`student/TopicBrowse.vue` 详情抽屉 | 4 个抽屉 |
| `Table` | `admin/AcademicYear.vue`、`admin/OperationLog.vue`、`admin/ImportUsers.vue`、`topics/TopicTable.vue`、`import/ErrorDetailModal.vue`、`admin/SelectionRound.vue` | 6 处 |
| `Button` | 全站内联 Tailwind `<button>`（`MyTopics` 10、`ImportUsers` 9、`TopicReview` 7、`TopicBrowse` 6、`SelectionRound` 5、`TopicReviewDrawer` 5、`OperationLog` 4、`AcademicYear` 4、其余 15 个文件各 1–3） | **80 处** |
| `Input` / `Label` | Login、ForceChangePwd、YearFormDialog、OperationLogFilters、TopicBrowse、TopicFormDialog、MyTopics、TopicReview、RoundFormDialog、FileDropzone | 22 处原生 `<input>` |
| `Select` | `OperationLogFilters`×2、`RoundFormDialog`、`TopicFormDialog`、`TopicBrowse`、`SelectionRound`、`TopicReview`、`DateTimePicker`×2 | 9 处原生 `<select>` |
| `Textarea` | `TopicFormDialog`、`TopicReviewDrawer` | 2 处 |
| `Checkbox` | `Login.vue`（记住我）、`YearFormDialog.vue`（设为当前） | 2 处原生 checkbox + `accent-[#C0202E]` 硬调 |
| `Badge` | 3 份重复 `BADGE` 常量（`TopicReviewDrawer` / `TopicTeacherDrawer` / `TopicTable`）+ 多处内联 `rounded-full border px-2.5` 胶囊 | 3+ 处 |
| `Pagination` | OperationLog / TopicReview / TopicBrowse / MyTopics / SelectionRound 各自手写 `.pg` | 5 处 |
| `Alert` | 导入结果提示、表单错误提示，全部内联 div | 多处 |
| `DropdownMenu` | `components/Topbar.vue` 用户菜单 | 1 处 |
| `Skeleton` / `Spinner` | 各页「加载中…」纯文本 | 多处 |

---

## 四、顺带发现的规范违规（与组件库相关）

0. **已核实合规的部分**（避免误伤）：弹层 z-index 分层是一致且正确的 —— `PopoverContent` `z-[100]` > 弹窗 `z-[80]` > 抽屉面板 `z-[55]` > 抽屉遮罩 `z-50` > 侧边栏 `z-40` > 移动端遮罩 `z-30`，三处抽屉（`TopicReviewDrawer` / `TopicTeacherDrawer` / `TopicBrowse`）写法统一。
1. **`.act` / `.pg` / `.kv` 被重复定义为 scoped 样式**，与 `MEMORY.md`「列表行内操作按钮统一用全局 `.act`，不要在页面里重复定义 scoped `.act`」直接冲突：
   - 全局定义：`src/style.css`（`.act` / `.act-primary` / `.act-danger` + `.card-wrap` 媒体查询）
   - 又各自 scoped 重定义：`TopicTable.vue`、`views/teacher/MyTopics.vue`、`views/admin/AcademicYear.vue`、`views/admin/ImportUsers.vue`、`views/admin/OperationLog.vue`、`views/admin/TopicReview.vue`（6 处），另有 `.pg` 4 处、`.kv` 5 处。
   - 风险：局部版本与全局版本已出现不一致（如 `OperationLog.vue` 的 `.act` 默认色是 `#c0202e`，全局版是 `#4b5563`），改全局样式不会生效于这些页面。
2. **3 份完全相同的 `BADGE` 常量**（`TopicReviewDrawer.vue:17`、`TopicTeacherDrawer.vue:17`、`TopicTable.vue:15`）——违反「可复用组件抽象」要求，应抽成 `components/topics/StatusBadge.vue` 或复用 `utils/topics.js`。
3. **所有弹窗（6 个）与抽屉（4 个）缺无障碍能力**：全项目 `role="dialog"` 0 处、`aria-modal` 0 处、Escape 关闭 0 处、焦点陷阱 0 处、`Teleport` 0 处。键盘用户 Tab 会把焦点移到遮罩后面的页面元素上，屏幕阅读器也读不出这是弹层。shadcn 的 Dialog / Sheet / AlertDialog 自带这些能力，后续替换可一次性补齐。

---

## 五、工程风险（建议优先处理）

### P0：运行时而用的依赖没有声明在 `package.json`（会导致构建直接失败）

| 包 | 在 `src/` 中的运行时 import | `package.json` 声明情况 |
|---|---|---|
| `reka-ui` | `ui/popover/*.vue`（3 处）、`ui/calendar/Calendar.vue` | ❌ 未声明。目前仅作为 `devDependencies.shadcn-vue`（CLI）的**传递依赖**存在 |
| `@internationalized/date` | `selection/DateTimePicker.vue` | ❌ 未声明。目前仅作为 `reka-ui` 的传递依赖存在 |

后果：`bun install --production` / `NODE_ENV=production` 安装、或将来移除/替换 `shadcn-vue` CLI 时，这两个包不会被安装 → 构建与运行直接报 `Failed to resolve import "reka-ui"`。官方 shadcn-vue 的做法是把 `reka-ui` 写进 `dependencies`。

另：`lucide-vue-next` 已在 `dependencies` 但 `src/` 内**零引用**（42 处图标全是内联 SVG），属冗余；要么用它替换内联 SVG，要么移除。

### P1：主题令牌与设计体系不一致

`src/style.css` 的 shadcn 令牌 `--primary: #4f46e5`（indigo）、`--ring: #4f46e5`，而项目设计体系主色是**山能红 `#C0202E`**。因此 shadcn 组件的默认外观（Button default、focus ring、Calendar 今天高亮）与设计稿不符 —— `Calendar.vue` 只能靠硬编码 `data-[selected]:bg-[#C0202E]` 打补丁。若要大规模引入 shadcn 组件，需先把 `--primary` / `--primary-foreground` / `--ring` / `--accent` 对齐山能红（`--color-brand` 按既有约定保持 indigo 不动）。

---

## 六、处理建议（按优先级）

### P0 — 纯工程安全，不改视觉
1. `bun add reka-ui @internationalized/date`，把运行时而用的依赖显式声明到 `dependencies`。
2. 决定 `lucide-vue-next` 去留（推荐保留并替换内联 SVG，统一图标来源）。

### P1 — 真正贯彻 shadcn-vue
3. 按官方目录补齐缺失基础组件（新增到 `src/components/ui/`，**不得自己直接 import reka-ui 手搓**）：
   `dialog`、`alert-dialog`、`sheet`、`input`、`label`、`textarea`、`select`、`checkbox`、`table`、`badge`、`alert`、`dropdown-menu`、`avatar`、`skeleton`。
4. 分批替换手写实现，**建议从弹窗与抽屉开始**（收益最大：portal + 焦点陷阱 + Escape 关闭 + `role="dialog"` 一次到位）。
5. 先把 `--primary` / `--ring` 对齐山能红，再替换，避免新组件上线即「配色不对」。

### P2 — 顺带修规范
6. 清理 6 处 scoped `.act` / 4 处 `.pg` / 5 处 `.kv`，统一收敛到 `src/style.css`。
7. 抽 `StatusBadge` 公共组件，消除 3 份重复 `BADGE` 常量。
8. 抽 `Pagination` 公共组件，消除 5 处手写分页。

---

## 七、说明

- 本次为**只读检查**，未修改任何 `src/` 代码。
- 按项目「设计稿先行」红线，上述 P1 的组件替换属于会改变视觉与交互的改动，需先出设计稿并经显式批准后再落地。
