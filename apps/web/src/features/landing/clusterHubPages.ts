import type { FAQItem } from "./constants";
import {
  getIntentPagesByCluster,
  type IntentLandingCluster,
  type IntentLandingPageConfig,
} from "./intentLandingPages";

type LandingLocale = "en" | "zh";

export type ClusterHubGuideLink = {
  path: string;
  label: string;
  description: string;
};

export type ClusterHubSection = {
  title: string;
  description: string;
  intentKeys: string[];
};

export type ClusterHubPageConfig = {
  path: string;
  cluster: IntentLandingCluster;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  subheadline: string;
  summaryBullets: string[];
  sections: ClusterHubSection[];
  guideLinks: ClusterHubGuideLink[];
  faqs: FAQItem[];
  ctaLabel: string;
  conversionPromise: string;
  changefreq?: "weekly" | "monthly";
  priority?: number;
};

type ClusterHubLocalizedFields = Pick<
  ClusterHubPageConfig,
  | "title"
  | "description"
  | "keywords"
  | "h1"
  | "subheadline"
  | "summaryBullets"
  | "sections"
  | "guideLinks"
  | "faqs"
  | "ctaLabel"
  | "conversionPromise"
>;

type ClusterHubPageSourceConfig = ClusterHubPageConfig & {
  localized?: Partial<Record<LandingLocale, Partial<ClusterHubLocalizedFields>>>;
};

const CLUSTER_HUB_PAGE_SOURCES: ClusterHubPageSourceConfig[] = [
  {
    path: "/students",
    cluster: "students",
    title: "AI Study Tools for Students — Free | Better Memory",
    description:
      "AI study tools for college students: upload PDFs and lectures, then generate flashcards, quizzes, mind maps, audio overviews, and reports grounded in your course materials.",
    keywords:
      "ai study tools for students, ai study tools for college students, ai for studying, student study tools, AI flashcards, quiz generator",
    h1: "AI study tools built around your course materials",
    subheadline:
      "Better Memory is a free AI study tool for students—bring lectures, PDFs, and media into one notebook, then turn them into flashcards, quizzes, reports, and other outputs you can review and edit.",
    summaryBullets: [
      "Upload PDFs, slides, audio, video transcripts, Google Drive files, or pasted text",
      "Discover web and news articles to add alongside your uploads",
      "Generate flashcards, quizzes, mind maps, audio overviews, reports, infographics, written questions, and spreadsheets from selected sources",
      "Share notebooks with classmates via view or fork links",
    ],
    sections: [
      {
        title: "Bring your materials in",
        description:
          "Start by adding course content to a notebook—upload files, discover articles, or share a notebook with your study group.",
        intentKeys: ["sourceUpload", "sourceDiscovery", "notebookSharing"],
      },
      {
        title: "Generate study materials",
        description:
          "Use Studio tools to draft study outputs from the sources you select. Review and edit every draft before you rely on it for exams.",
        intentKeys: [
          "flashcards",
          "quiz",
          "audio",
          "mindmap",
          "reports",
          "infographic",
          "writtenQuestions",
          "spreadsheets",
        ],
      },
    ],
    guideLinks: [
      {
        path: "/students/ai-written-questions",
        label: "Written questions with feedback",
        description:
          "Practice short-answer and essay responses from your course material—distinct from multiple-choice quizzes.",
      },
      {
        path: "/guides/how-to-study-from-pdfs-with-ai",
        label: "How to study from PDFs with AI",
        description:
          "Step-by-step workflow for turning readings and lecture slides into flashcards, quizzes, mind maps, and study guides.",
      },
      {
        path: "/compare/better-memory-vs-notebooklm",
        label: "Better Memory vs NotebookLM",
        description:
          "Fair comparison of source-grounded study tools—outputs, pricing, and which workflow fits your classes.",
      },
    ],
    faqs: [
      {
        question: "What study tools does Better Memory offer?",
        answer:
          "You can upload and discover sources, then generate flashcards, multiple-choice quizzes, written questions with feedback, mind maps, audio overviews, reports and study guides, infographics, and spreadsheets—all from materials in your notebook.",
      },
      {
        question: "Do I need to upload sources before generating study materials?",
        answer:
          "Yes. Studio tools work on sources you add to a notebook—uploads, discovered articles, or pasted text. You choose which sources to include for each generation.",
      },
      {
        question: "How is the Quiz tool different from Written Questions?",
        answer:
          "Quizzes produce multiple-choice practice only. Written Questions generates short-answer and essay prompts and gives feedback on responses you submit.",
      },
      {
        question: "Is there a free plan for students?",
        answer:
          "Yes. Free accounts include notebooks with per-notebook source limits and daily caps on AI generation. Pro plans raise notebook limits. See pricing on the homepage for current numbers.",
      },
    ],
    ctaLabel: "Create free account",
    conversionPromise:
      "Create a free account, upload your first sources, and generate study materials in minutes.",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/research",
    cluster: "research",
    title: "AI Research & Literature Review Tools | Better Memory",
    description:
      "AI tools for literature review and research: discover and import papers, chat with your reading list, run literature review mode, format citations in 12 styles, and draft deep research reports.",
    keywords:
      "ai tools for literature review, ai literature review tools, ai for research literature review, research tools, chat with papers, deep research",
    h1: "AI research and literature review tools for your papers",
    subheadline:
      "Collect papers in a research notebook, ask questions across your sources, screen and synthesize literature, and format citations—while you stay responsible for rigor and verification.",
    summaryBullets: [
      "Search academic literature with filters for year, citations, open access, and field",
      "Import papers by DOI, BibTeX, RIS, Zotero, Mendeley, or manual entry",
      "Chat with papers, run literature review mode, and produce deep research report drafts",
      "Format citations in twelve styles including APA, MLA, Chicago, IEEE, and Vancouver",
    ],
    sections: [
      {
        title: "Build your reading list",
        description:
          "Find papers through academic discovery or import them from reference managers and DOI lookups.",
        intentKeys: ["academicDiscovery", "paperImport"],
      },
      {
        title: "Analyze and write",
        description:
          "Work with your collection through chat, literature review, deep research, and citation formatting.",
        intentKeys: ["literatureReview", "chat", "deepResearch", "citationStyles"],
      },
    ],
    guideLinks: [
      {
        path: "/guides/how-to-do-an-ai-literature-review",
        label: "How to do an AI literature review",
        description:
          "Build a paper set, chat across sources, run literature review mode, and format citations.",
      },
      {
        path: "/compare/better-memory-vs-notebooklm",
        label: "Better Memory vs NotebookLM",
        description:
          "Compare academic import, literature review, and research outputs before you choose a notebook tool.",
      },
    ],
    faqs: [
      {
        question: "What research tools does Better Memory offer?",
        answer:
          "You can discover and import academic papers, chat with your sources, run literature review mode with screening and synthesis, produce deep research report drafts that combine web and notebook sources, and format citations in twelve styles.",
      },
      {
        question: "Is literature review mode a systematic review tool?",
        answer:
          "No. It assists with screening, ranking, and synthesis across papers in your notebook, but it does not replace preregistered systematic review protocols or exhaustive search requirements.",
      },
      {
        question: "Which citation styles are supported?",
        answer:
          "Twelve styles including APA, MLA, Chicago, AMA, ACS, IEEE, Vancouver, and Harvard. Use them in literature reviews, reports, and the Cite Paper modal—then verify against your style manual.",
      },
      {
        question: "Should I trust AI answers without checking the PDFs?",
        answer:
          "No. Chat, literature review, and deep research outputs are drafts. Confirm quotes, claims, and citations in the original documents before submitting formal work.",
      },
    ],
    ctaLabel: "Create free account",
    conversionPromise:
      "Start free—import your first papers and explore chat, literature review, and citation tools.",
    changefreq: "weekly",
    priority: 0.9,
  },
];

const CLUSTER_HUB_ZH: Record<string, Partial<ClusterHubLocalizedFields>> = {
  "/students": {
    title: "AI 学习工具（学生免费）| Better Memory",
    description:
      "面向大学生的 AI 学习工具：上传 PDF 和讲义，生成与你课程材料相关的闪卡、测验、思维导图、音频概览和报告。",
    keywords: "AI 学习工具, 大学生学习工具, AI 辅助学习, 学生工具, AI 闪卡, 测验生成器",
    h1: "围绕你的课程材料构建的 AI 学习工具",
    subheadline:
      "Better Memory 是面向学生的免费 AI 学习工具——将讲义、PDF 和多媒体整合到一个笔记本中，然后生成闪卡、测验、报告和其他可审阅编辑的输出。",
    summaryBullets: [
      "上传 PDF、幻灯片、音频、视频转录、Google Drive 文件或粘贴文本",
      "发现网页和新闻文章，与上传内容放在一起",
      "从选中的来源生成闪卡、测验、思维导图、音频概览、报告、信息图、问答题和电子表格",
      "通过查看链接或复制链接与同学分享笔记本",
    ],
    sections: [
      {
        title: "导入你的学习材料",
        description: "先将课程内容加入笔记本——上传文件、发现文章，或与学习小组分享笔记本。",
        intentKeys: ["sourceUpload", "sourceDiscovery", "notebookSharing"],
      },
      {
        title: "生成学习材料",
        description:
          "使用 Studio 工具从你选择的来源生成学习草稿。在用于考试前，请审阅和编辑每一份草稿。",
        intentKeys: [
          "flashcards",
          "quiz",
          "audio",
          "mindmap",
          "reports",
          "infographic",
          "writtenQuestions",
          "spreadsheets",
        ],
      },
    ],
    guideLinks: [
      {
        path: "/students/ai-written-questions",
        label: "带反馈的问答题练习",
        description: "从课程材料中练习简答和论文题——区别于选择题测验。",
      },
      {
        path: "/guides/how-to-study-from-pdfs-with-ai",
        label: "如何使用 AI 从 PDF 中学习",
        description: "将阅读材料和讲义转化为闪卡、测验、思维导图和学习指南的分步流程。",
      },
      {
        path: "/compare/better-memory-vs-notebooklm",
        label: "Better Memory 与 NotebookLM 对比",
        description: "关于基于来源的学习工具的公平比较——输出、价格，以及哪种流程更适合你的课程。",
      },
    ],
    faqs: [
      {
        question: "Better Memory 提供哪些学习工具？",
        answer:
          "你可以上传和发现来源，然后从笔记本中的材料生成闪卡、选择题测验、带反馈的问答题、思维导图、音频概览、报告和学习指南、信息图和电子表格。",
      },
      {
        question: "在生成学习材料之前需要上传来源吗？",
        answer:
          "是的。Studio 工具会基于你添加到笔记本中的来源工作——上传文件、发现的文章或粘贴的文本。你可以在每次生成时选择要包含的来源。",
      },
      {
        question: "Quiz 工具和 Written Questions 工具有什么区别？",
        answer:
          "Quiz 只生成选择题练习。Written Questions 生成简答和论文题，并对你提交的回答给出反馈。",
      },
      {
        question: "学生是否有免费方案？",
        answer:
          "有。免费账户包含笔记本，每个笔记本有来源数量限制，AI 生成有每日额度限制。Pro 方案提高笔记本限制。请查看首页的定价了解当前具体数字。",
      },
    ],
    ctaLabel: "创建免费账户",
    conversionPromise: "创建免费账户，上传第一批资料，几分钟内生成学习材料。",
  },
  "/research": {
    title: "AI 研究与文献综述工具 | Better Memory",
    description:
      "AI 文献综述和研究工具：发现和导入论文，与阅读列表聊天，运行文献综述模式，使用 12 种引用格式，起草深度研究报告。",
    keywords: "AI 文献综述工具, AI 研究工具, 文献综述 AI, 研究工具, 与论文对话, 深度研究",
    h1: "为你的论文准备的 AI 研究和文献综述工具",
    subheadline:
      "将论文收集到研究笔记本中，跨来源提问，筛选和综合文献，格式化引用——同时你仍需对严谨性和核验负责。",
    summaryBullets: [
      "按年份、引用量、开放获取和领域筛选学术文献",
      "通过 DOI、BibTeX、RIS、Zotero、Mendeley 或手动输入导入论文",
      "与论文聊天，运行文献综述模式，生成深度研究报告草稿",
      "使用 APA、MLA、Chicago、IEEE、Vancouver 等十二种格式格式化引用",
    ],
    sections: [
      {
        title: "构建你的阅读列表",
        description: "通过学术发现查找论文，或从参考文献管理器或 DOI 查询导入。",
        intentKeys: ["academicDiscovery", "paperImport"],
      },
      {
        title: "分析与写作",
        description: "通过聊天、文献综述、深度研究和引用格式化来处理你的论文集合。",
        intentKeys: ["literatureReview", "chat", "deepResearch", "citationStyles"],
      },
    ],
    guideLinks: [
      {
        path: "/guides/how-to-do-an-ai-literature-review",
        label: "如何进行 AI 文献综述",
        description: "构建论文集，跨来源聊天，运行文献综述模式，并格式化引用。",
      },
      {
        path: "/compare/better-memory-vs-notebooklm",
        label: "Better Memory 与 NotebookLM 对比",
        description: "在选择笔记本工具之前，比较学术导入、文献综述和研究输出。",
      },
    ],
    faqs: [
      {
        question: "Better Memory 提供哪些研究工具？",
        answer:
          "你可以发现和导入学术论文，与来源聊天，运行包含筛选和综合的文献综述模式，生成结合网页和笔记本来源的深度研究报告草稿，并使用十二种格式格式化引用。",
      },
      {
        question: "文献综述模式是系统性综述工具吗？",
        answer:
          "不是。它可以辅助筛选、排序和综合笔记本中的论文，但不能替代预注册的系统性综述方案或穷尽式检索要求。",
      },
      {
        question: "支持哪些引用格式？",
        answer:
          "支持 APA、MLA、Chicago、AMA、ACS、IEEE、Vancouver、Harvard 等十二种格式。在文献综述、报告和引用论文弹窗中使用，之后请对照你的格式手册核实。",
      },
      {
        question: "是否应该不核对 PDF 就信任 AI 的答案？",
        answer:
          "不应该。聊天、文献综述和深度研究的输出是草稿。在提交正式作业前，请在原始文献中核对引文、观点和引用。",
      },
    ],
    ctaLabel: "创建免费账户",
    conversionPromise: "免费开始——导入你的第一批论文，探索聊天、文献综述和引用工具。",
  },
};

function localizeClusterHubPage(
  page: ClusterHubPageSourceConfig,
  locale: LandingLocale = "en"
): ClusterHubPageConfig {
  if (locale === "en") {
    const { localized: _localized, ...base } = page;
    return base;
  }

  const localized = page.localized?.[locale] ?? CLUSTER_HUB_ZH[page.path];
  if (!localized) {
    const { localized: _localized, ...base } = page;
    return base;
  }

  const { localized: _localized, ...base } = page;
  return { ...base, ...localized };
}

export const CLUSTER_HUB_PAGES: ClusterHubPageConfig[] = CLUSTER_HUB_PAGE_SOURCES.map((page) =>
  localizeClusterHubPage(page)
);

export function getClusterHubPageByPath(
  path: string,
  locale: LandingLocale = "en"
): ClusterHubPageConfig | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const page = CLUSTER_HUB_PAGE_SOURCES.find((entry) => entry.path === normalized);
  return page ? localizeClusterHubPage(page, locale) : undefined;
}

export function getClusterHubPaths(): string[] {
  return CLUSTER_HUB_PAGE_SOURCES.map((page) => page.path);
}

export function isClusterHubPath(path: string): boolean {
  return getClusterHubPageByPath(path) !== undefined;
}

export function resolveHubSectionPages(
  hub: ClusterHubPageConfig,
  section: ClusterHubSection,
  locale: LandingLocale = "en"
): IntentLandingPageConfig[] {
  const clusterPages = getIntentPagesByCluster(hub.cluster, locale);
  const byKey = new Map(clusterPages.map((page) => [page.intentKey, page]));
  return section.intentKeys
    .map((key) => byKey.get(key))
    .filter((page): page is IntentLandingPageConfig => page !== undefined);
}
