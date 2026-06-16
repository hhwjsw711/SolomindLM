# i18n TODO

> 已安装 `i18next` + `react-i18next` + `i18next-browser-languagedetector`，框架搭建完毕（详见 `src/i18n.ts`）。
> 着陆页 + 共享组件已翻译（`locales/{en,zh}/common.json` + `landing.json`）。
> 下面列出待提取的模块，渐进迁移。

---

## NavigationHeader

**文件**: `features/landing/components/NavigationHeader.tsx`  
**namespace**: `landing`

- [ ] nav 链接: `Features`, `Use Cases`, `Pricing`, `FAQ`
- [ ] 按钮: `Log in`, `Get Started`（桌面 + 移动端）

---

## Chat

**namespace**: `chat`

- [ ] `features/chat/ChatInput.tsx` — 模式切换标签、filter 文案、input placeholder
- [ ] `features/chat/ChatEmptyState.tsx` — 空状态提示
- [ ] `features/chat/ConversationList.tsx` — 对话列表标题/操作
- [ ] `features/chat/ExternalSources.tsx` — 来源标记

---

## Sources

**namespace**: `sources`

- [ ] `features/sources/AddSourceModal.tsx` — 上传弹窗标签/提示
- [ ] `features/sources/DiscoverSourcesModal.tsx` — 搜索面板文案
- [ ] `features/sources/SourcesPanel.tsx` — 来源列表操作

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
