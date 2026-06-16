# i18n TODO

> 已安装 `i18next` + `react-i18next` + `i18next-browser-languagedetector`，框架搭建完毕（详见 `src/i18n.ts`）。
> 着陆页 + 共享组件已翻译（`locales/{en,zh}/common.json` + `landing.json`）。
> 下面列出待提取的模块，渐进迁移。

---

## NavigationHeader ✅

**文件**: `features/landing/components/NavigationHeader.tsx`  
**namespace**: `landing`

- [x] nav 链接: `Features`, `Use Cases`, `Pricing`, `FAQ`
- [x] 按钮: `Log in`, `Get Started`（桌面 + 移动端）
- [x] `aria-label="Toggle menu"`

---

## Chat ✅

**namespace**: `chat`（`locales/{en,zh}/chat.json`）

- [x] `ChatInput.tsx` — placeholder, composer modes, filters, research databases, model selector, voice/send buttons, disclaimer
- [x] `ChatEmptyState.tsx` — starter prompts, headings, subtext, "Try asking" divider
- [x] `ConversationList.tsx` — loading/empty states, section labels, rename/delete/pin actions, confirm dialog
- [x] `ExternalSourcesModal.tsx` — heading, select/deselect, score, add/cancel buttons, aria-labels
- [x] `ChatPanel.tsx` — toast 消息（15 条）
- [x] `ConfigureChatModal.tsx` — instruction modes, response length, custom instructions
- [x] `MessageBubble.tsx` — copy, retry, feedback, sources count, follow-ups
- [x] `AgentActivityPanel.tsx` — 搜索/查询/完成状态标记
- [x] `ResearchPlanMessage.tsx` — 频道标签、计划状态、按钮
- [ ] `LiteratureReviewMessage.tsx` — 步骤配置、列确认、完成/错误状态
- [x] Toast messages in ChatPanel (已随 ChatPanel.tsx 一并翻译)
- [x] Utility files: `messageStatus.tsx`, `exportChat.ts`, `messageRendering.tsx`

> 核心交互已完成（ChatInput + 空状态 + 对话列表 + 外部来源 + 面板工具栏）。剩余文件为辅助消息显示和工具函数，影响范围较小。

---

## Sources 🔄

**namespace**: `sources`（`locales/{en,zh}/sources.json`，已创建 ~150 条翻译）

- [x] `SourceList.tsx` — 添加/发现/删除/刷新按钮、搜索、计数、空状态
- [x] `SourceListItem.tsx` — 论文提示、状态标记、右键菜单
- [x] `SourcesPanelHeader.tsx` — 面板标题、重命名、打开/复制/下载操作
- [x] `SourcesPanel.tsx` — 确认对话框、toast 消息
- [x] `SourceViewer.tsx` — 查看器标签、加载/错误状态
- [x] `SourceGuide.tsx` — 来源指南
- [x] `PdfViewer.tsx` — PDF 工具栏
- [x] `DiscoverSourcesModal.tsx` — 搜索面板（placeholder, empty/error states, OA tooltip ~10 条）
- [x] `ManualPaperModal.tsx` — 全部表单标签（13 条）
- [x] `DoiInputModal`, `BibtexImportModal`, `MendeleyImportModal`, `ZoteroImportModal`
- [ ] `AcademicDiscoveryFiltersSection.tsx`, `academicFieldTaxonomy.ts`

---

## Studio 🔄

**namespace**: `studio`（`locales/{en,zh}/studio.json`）

- [x] `StudioPanelHeader.tsx` — 全部按钮（mobile + desktop，17 条）
- [x] `ToolGrid.tsx` — "Create" 标题
- [ ] ~28 个视图/弹窗文件（`FlashcardView.tsx`, `QuizView.tsx`, `ReportView.tsx`, `CustomizeReportModal.tsx`, `SaveAsPromptModal.tsx`, ...）~250+ 条文案

---

## Auth ✅

**namespace**: `auth`（`locales/{en,zh}/auth.json`）

- [x] `AuthFormPanel.tsx` — 全部表单标签、按钮、占位符、错误回退、说明文字、链接（~30 条）
- [x] `AuthPage.tsx` — 标题、副标题、导航链接、hero mockup 文案、toast（~10 条）

---

## Billing ✅

**namespace**: `billing`（`locales/{en,zh}/billing.json`）

- [x] `BillingPage.tsx` — 全部方案标签、功能列表、按钮、确认对话框、状态提示（~38 条）

---

## 未使用的翻译 key ✅

- [x] `locales/{en,zh}/landing.json` — 已移除 6 个未使用的 `features.*` keys

---

## 操作方法

对每个 namespace：

1. 创建 `locales/en/{namespace}.json` 和 `locales/zh/{namespace}.json`
2. 在 `src/i18n.ts` 的 `resources` 中加载新文件
3. 在组件中调用 `useTranslation('{namespace}')`，用 `t('key')` 替换硬编码文案
