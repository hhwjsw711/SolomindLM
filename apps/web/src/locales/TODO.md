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
- [x] `ChatPanel.tsx` — toolbar tooltips, history/new chat/options buttons, dropdown menu
- [x] `ConfigureChatModal.tsx` — instruction modes, response length, custom instructions
- [x] `MessageBubble.tsx` — copy, retry, feedback, sources count, follow-ups
- [ ] `AgentActivityPanel.tsx`, `ResearchPlanMessage.tsx`, `LiteratureReviewMessage.tsx`, etc.
- [ ] Toast messages in ChatPanel
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
- [x] `AddSourceModal.tsx` — 上传弹窗（~25 条）
- [ ] `DiscoverSourcesModal.tsx` — 搜索面板（~49 条）
- [ ] 输入弹窗：`UrlInputModal`, `TextInputModal`, `SocialMediaInputModal`, `ManualPaperModal`, `DoiInputModal`, `BibtexImportModal`, `MendeleyImportModal`, `ZoteroImportModal`
- [ ] `AcademicDiscoveryFiltersSection.tsx`, `academicFieldTaxonomy.ts`

---

## Studio

**namespace**: `studio`

- [ ] `features/studio/StudioPanelHeader.tsx` — 面板标题
- [ ] `features/studio/ToolGrid.tsx` — 工具卡片标签/描述
- [ ] 各视图定制弹窗（ReportView, FlashcardView, QuizView, MindMapView 等）

---

## Auth

**namespace**: `auth`

- [ ] `features/auth/AuthFormPanel.tsx` — 表单标签、错误回退文案
- [ ] `features/auth/components/AuthPage.tsx` — 登录页文案

---

## Billing

**namespace**: `billing`

- [ ] `features/billing/BillingPage.tsx` — 计划详情（feature 列表目前未翻译）

---

## 未使用的翻译 key

`locales/{en,zh}/landing.json` 中的 `features.*` 有 6 个 key 未使用（`sourceUpload`, `sourceDiscovery`, `academicDiscovery`, `paperImport`, `citationStyles`, `notebookSharing`），因为 `LANDING_TOOLS` 不含这些 id。可保留供未来使用，或清理。

---

## 操作方法

对每个 namespace：

1. 创建 `locales/en/{namespace}.json` 和 `locales/zh/{namespace}.json`
2. 在 `src/i18n.ts` 的 `resources` 中加载新文件
3. 在组件中调用 `useTranslation('{namespace}')`，用 `t('key')` 替换硬编码文案
