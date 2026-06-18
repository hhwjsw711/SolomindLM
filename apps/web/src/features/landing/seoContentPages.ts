import type { FAQItem } from "./constants";

type LandingLocale = "en" | "zh";

export const SEO_CONTENT_LAST_UPDATED = "2026-06-07";

export type SeoContentPageType = "compare" | "guide";

export type SeoContentSection = {
  h2: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoContentComparisonRow = {
  topic: string;
  betterMemory: string;
  competitor: string;
};

export type SeoContentQuickAnswer = {
  chooseBetterMemory: string;
  chooseCompetitor?: string;
};

export type SeoContentRelatedLink = {
  path: string;
  label: string;
  description: string;
};

export type SeoContentPageConfig = {
  path: string;
  pageType: SeoContentPageType;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  intro: string;
  quickAnswer?: SeoContentQuickAnswer;
  comparisonTable?: SeoContentComparisonRow[];
  sections: SeoContentSection[];
  faqs: FAQItem[];
  ctaLabel: string;
  conversionPromise: string;
  signupIntentKey: string;
  breadcrumbParent: { name: string; path: string };
  navLabel: string;
  relatedLinks: SeoContentRelatedLink[];
  articleType: "Article" | "TechArticle";
  changefreq?: "weekly" | "monthly";
  priority?: number;
};

type SeoContentLocalizedFields = Pick<
  SeoContentPageConfig,
  | "title"
  | "description"
  | "keywords"
  | "h1"
  | "intro"
  | "quickAnswer"
  | "comparisonTable"
  | "sections"
  | "faqs"
  | "ctaLabel"
  | "conversionPromise"
  | "breadcrumbParent"
  | "navLabel"
  | "relatedLinks"
>;

type SeoContentPageSourceConfig = SeoContentPageConfig & {
  localized?: Partial<Record<LandingLocale, Partial<SeoContentLocalizedFields>>>;
};

const SEO_CONTENT_PAGE_SOURCES: SeoContentPageSourceConfig[] = [
  {
    path: "/compare/better-memory-vs-notebooklm",
    pageType: "compare",
    title: "Best NotebookLM Alternative for Students & Researchers | Better Memory",
    description:
      "Looking for a NotebookLM alternative? Compare Better Memory and NotebookLM for free PDF study, audio overviews, flashcards, literature review, and research workflows.",
    keywords:
      "NotebookLM alternative, best NotebookLM alternative, NotebookLM alternative free, NotebookLM alternatives for studying, NotebookLM audio overview alternative, Better Memory vs NotebookLM",
    h1: "Best NotebookLM alternative for PDFs, flashcards, and research",
    intro:
      "Better Memory is a strong NotebookLM alternative when you want source-grounded chat with citations plus notebook folders, web and academic discovery, literature review with twelve citation styles, and study tools such as written questions with feedback and spaced-repetition flashcards. NotebookLM fits users anchored in Google Workspace who want Audio Overviews, Video Overviews, and the Learning Guide. This page compares both so you can pick the best NotebookLM alternative for your workflow—not just a feature checklist.",
    quickAnswer: {
      chooseCompetitor:
        "Choose NotebookLM if you want Google's ecosystem integration plus Audio Overviews, Video Overviews, flashcards, quizzes, reports, and the Learning Guide AI tutor on top of source-grounded chat with citations.",
      chooseBetterMemory:
        "Choose Better Memory if you want source-grounded chat with citations plus folders for notebooks, web and academic source discovery, literature review with twelve citation styles, chat search with one-click save to your notebook, a model switcher, voice input in chat, audio transcription, written questions with feedback, spaced-repetition flashcards, editable reports, and academic import workflows.",
    },
    comparisonTable: [
      {
        topic: "Source-grounded chat",
        betterMemory:
          "Source-grounded chat with citations across notebook sources; RAG-backed answers and Studio outputs synthesized from your uploads.",
        competitor:
          "Source-grounded chat with citations against uploaded sources; synthesis and study outputs from the same materials.",
      },
      {
        topic: "Student outputs",
        betterMemory:
          "Flashcards with spaced repetition, quizzes, mind maps, audio overviews, editable reports, infographics, spreadsheets.",
        competitor:
          "Audio Overviews, Video Overviews, flashcards, quizzes, mind maps, reports, infographics, Learning Guide.",
      },
      {
        topic: "Written questions",
        betterMemory:
          "Short-answer and essay prompts from your sources with AI feedback on responses you submit—not multiple-choice only.",
        competitor:
          "Quizzes and the Learning Guide AI tutor; no written-response practice with feedback on product pages.",
      },
      {
        topic: "Research workflows",
        betterMemory:
          "Academic paper discovery, import papers, AI literature review, deep research, and formatted citations in multiple styles.",
        competitor:
          "Source discovery, Deep Research, and literature review synthesis on its plans and product pages.",
      },
      {
        topic: "Literature review citations",
        betterMemory:
          "Twelve citation styles—including APA, MLA, Chicago, IEEE, Vancouver, and Harvard—for literature reviews, reports, and the Cite Paper modal.",
        competitor:
          "No multi-style academic citation formatting for literature review outputs described on product pages.",
      },
      {
        topic: "Notebook organization",
        betterMemory: "Organize notebooks in folders and move them between folders.",
        competitor: "No equivalent folder organization described on official product pages.",
      },
      {
        topic: "Source discovery",
        betterMemory:
          "Built-in web and academic discovery with results you can add directly to notebooks.",
        competitor:
          "Emphasizes uploads and plan-tier source discovery rather than the same web plus academic discovery workflow.",
      },
      {
        topic: "Chat search & models",
        betterMemory:
          "Optional web and academic search in chat; save external hits to the notebook; multiple model choices; voice transcription in chat.",
        competitor:
          "Google's model stack only; no model switcher, in-chat web/academic search, or voice input called out on product pages.",
      },
      {
        topic: "Audio & source panel",
        betterMemory:
          "Upload audio for transcription; delete and refresh sources from the source panel.",
        competitor:
          "No audio ingestion or source-panel delete and refresh workflow described on product pages.",
      },
      {
        topic: "Academic import",
        betterMemory: "DOI, BibTeX, Zotero, and Mendeley import into research notebooks.",
        competitor:
          "Official pages emphasize uploads and source discovery rather than academic reference-manager imports.",
      },
      {
        topic: "Pricing model",
        betterMemory:
          "Free ($0): 5 notebooks, 200 sources per notebook, daily generation caps. Pro ($7.50/mo billed yearly or $15/mo monthly): 100 notebooks, 200 sources per notebook, higher daily limits.",
        competitor:
          "Free, Plus, Pro, and Ultra tiers; source limits of 50, 100, 300, and 600 per notebook respectively.",
      },
      {
        topic: "Best fit",
        betterMemory:
          "Students and researchers who want grounded synthesis with citations plus folders, discovery, and academic workflows.",
        competitor:
          "Users anchored in Google Workspace who want Google's study features on top of grounded chat.",
      },
    ],
    sections: [
      {
        h2: "Why choose Better Memory as a NotebookLM alternative?",
        paragraphs: [
          "Most people searching for a NotebookLM alternative want the same core idea—upload sources, chat with citations, and generate study or research outputs. Better Memory matches that foundation and adds workflows NotebookLM does not emphasize on its product pages: academic paper import, literature review with multiple citation styles, written questions with feedback, notebook folders, and in-app web and academic discovery.",
          "If you need a free NotebookLM alternative for studying from PDFs, generating flashcards and quizzes, or running literature review on a reading list, Better Memory is built for that path. If you primarily want Google's ecosystem, Video Overviews, and the Learning Guide AI tutor, NotebookLM may still be the better fit.",
        ],
      },
      {
        h2: "What do Better Memory and NotebookLM have in common?",
        paragraphs: [
          "Both tools are built around source-grounded AI with citations: you add documents, ask questions, and get answers and outputs that refer back to those materials rather than inventing facts from general training data alone.",
          "Each supports study-oriented outputs such as flashcards, quizzes, mind maps, audio-style recaps, reports, and infographics. Both are useful when you need to review course readings or research papers inside a dedicated workspace instead of copying text into a blank chat window.",
        ],
      },
      {
        h2: "When is Better Memory the better choice?",
        paragraphs: [
          "Better Memory fits when your workflow needs more than upload-and-chat inside one Google stack. It combines notebook folders, built-in discovery, flexible chat search, and study and research tools that NotebookLM does not emphasize on its product pages.",
        ],
        bullets: [
          "You want notebooks organized in folders and moved between them",
          "You need web or academic discovery with one-click add to a notebook",
          "You want web or academic search in chat and to save external sources from chat into the notebook",
          "You prefer choosing among multiple models instead of a single Google model stack",
          "You need voice transcription in chat or audio file ingestion with transcription",
          "You want written questions with feedback on your answers—a standout Better Memory feature",
          "You want flashcards with a spaced-repetition study mode",
          "You need to edit generated reports in place",
          "You want delete and refresh controls in the source panel",
          "You need DOI, BibTeX, Zotero, or Mendeley imports for a reading list",
          "You need literature review outputs with references formatted in APA, MLA, Chicago, IEEE, Vancouver, Harvard, or other academic styles",
        ],
      },
      {
        h2: "What sets Better Memory apart?",
        paragraphs: [
          "Both products generate flashcards, quizzes, mind maps, reports, infographics, and spreadsheets from sources. The meaningful differences are workflow depth and control—not a longer list of output types.",
        ],
        bullets: [
          "Notebook folders: group notebooks and move them between folders",
          "Written questions with feedback on short and essay answers",
          "Flashcards with spaced-repetition review",
          "Editable reports after generation",
          "Web and academic source discovery built into the app",
          "Web and academic search in chat, with external sources easy to add to the notebook",
          "Model switcher across multiple models",
          "Voice transcription in chat and audio source ingestion",
          "Delete and refresh options in the source panel",
          "Academic import via DOI, BibTeX, Zotero, and Mendeley",
          "Twelve citation styles for literature reviews and reports (APA, MLA, Chicago, IEEE, Vancouver, Harvard, and more)",
        ],
      },
      {
        h2: "When is NotebookLM the better choice?",
        paragraphs: [
          "NotebookLM is a strong fit when you already live in Google Workspace, want polished source-grounded chat with citations, and plan to use Google's study features such as Audio Overviews, Video Overviews, and the Learning Guide—a personal AI tutor that uses probing questions and adapts explanations to your learning style—on supported plans.",
          "If your workflow is mostly upload → chat → generate study aids inside Google's ecosystem, NotebookLM's integration advantages may outweigh a separate notebook product.",
        ],
      },
      {
        h2: "Which tool is better for students?",
        paragraphs: [
          "For students, the better tool depends on scope. Both offer strong grounded chat with citations from uploads. NotebookLM adds Video Overviews and the Learning Guide AI tutor on supported plans. Better Memory differentiates with written questions with feedback, spaced-repetition flashcards, notebook folders, in-app discovery, chat search that saves sources to your notebook, voice input, and editable reports.",
          "Neither replaces reviewing your original PDFs before exams. Pick the tool whose outputs match how you actually study.",
        ],
      },
      {
        h2: "Which tool is better for literature review?",
        paragraphs: [
          "Better Memory is designed for research notebooks with academic discovery, paper import, chat across papers, and dedicated literature review mode—with twelve citation styles (APA, MLA, Chicago, IEEE, Vancouver, Harvard, and more) for formatted references in reviews and reports. NotebookLM offers source discovery, Deep Research, and literature review synthesis, but does not offer the same multi-style citation formatting for literature review deliverables.",
          "For a reading-list-first literature review where you need import, synthesis, and field-appropriate citations, Better Memory is the closer match. For exploratory synthesis from mixed uploads inside Google, NotebookLM remains competitive.",
        ],
      },
      {
        h2: "Which tool is better for studying from PDFs?",
        paragraphs: [
          "Both handle PDF-grounded study well. Upload chapters or lecture slides, ask clarifying questions, then generate flashcards or quizzes. Each can also produce mind maps, audio recaps, reports, and infographics from the same sources.",
          "NotebookLM adds Video Overviews and the Learning Guide AI tutor on supported plans. Better Memory adds written questions with feedback, spaced-repetition flashcards, voice and audio ingestion, discovery and chat search workflows, and editable reports—pick based on control and workflow fit, not on who lists more output types.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the best NotebookLM alternative?",
        answer:
          "The best NotebookLM alternative depends on your workflow. Better Memory is a strong fit for students and researchers who want source-grounded chat plus folders, discovery, academic imports, literature review with twelve citation styles, written questions with feedback, and spaced-repetition flashcards. NotebookLM remains competitive if you prioritize Google's ecosystem, Video Overviews, and the Learning Guide AI tutor.",
      },
      {
        question: "Is there a free NotebookLM alternative?",
        answer:
          "Yes. Better Memory offers a free tier with notebooks, per-notebook source limits, and daily generation caps so you can upload PDFs, chat with sources, and try flashcards, quizzes, and literature review before upgrading.",
      },
      {
        question: "Is Better Memory a NotebookLM alternative for audio overviews?",
        answer:
          "Yes. Better Memory generates audio overviews from your uploaded sources so you can listen to study recaps on the go—similar to NotebookLM's Audio Overviews, alongside flashcards, quizzes, and research tools in the same notebook.",
      },
      {
        question: "Is Better Memory a NotebookLM alternative?",
        answer:
          "Yes, for many workflows. Both support source-grounded chat with citations. Better Memory is the stronger fit when you also need folders, web and academic discovery, chat search with save-to-notebook, multiple models, written questions with feedback, spaced-repetition flashcards, editable reports, and academic imports. NotebookLM remains the better fit if you prioritize Google's ecosystem, Video Overviews, and the Learning Guide AI tutor.",
      },
      {
        question: "Which tool is better for students?",
        answer:
          "Both handle grounded chat with citations well. NotebookLM adds Video Overviews and the Learning Guide AI tutor on supported plans. Better Memory fits students who want written questions with feedback, spaced-repetition flashcards, discovery and chat search workflows, voice input, notebook folders, and editable reports. Compare workflows against how you actually study—not just output checklists.",
      },
      {
        question: "Which tool is better for literature review?",
        answer:
          "Better Memory is built for research notebooks with paper discovery, DOI and reference-manager import, AI literature review, and twelve citation styles for formatted references in reviews and reports. NotebookLM supports discovery, Deep Research, and literature review synthesis but does not offer the same multi-style citation formatting or academic import workflow.",
      },
      {
        question: "Does NotebookLM have written questions with feedback?",
        answer:
          "NotebookLM offers quizzes and the Learning Guide AI tutor, but its product pages do not describe short-answer or essay practice with feedback on your written responses. Better Memory's Written Questions tool generates prompts from your sources and gives feedback on what you submit—useful when exams require written answers, not only multiple choice.",
      },
    ],
    ctaLabel: "Try Better Memory free",
    conversionPromise: "Try Better Memory free with your own PDFs, papers, and lecture materials.",
    signupIntentKey: "sourceUpload",
    breadcrumbParent: { name: "Compare", path: "/compare/better-memory-vs-notebooklm" },
    navLabel: "Better Memory vs NotebookLM",
    relatedLinks: [
      {
        path: "/students/ai-written-questions",
        label: "Written questions with feedback",
        description:
          "Practice short-answer and essay responses from your sources—Better Memory grades your answers, not just multiple choice.",
      },
      {
        path: "/guides/how-to-study-from-pdfs-with-ai",
        label: "How to study from PDFs with AI",
        description:
          "Step-by-step workflow for turning readings into flashcards, quizzes, and study guides.",
      },
      {
        path: "/students/ai-flashcards",
        label: "AI flashcards",
        description: "Generate flashcard decks grounded in your uploaded sources.",
      },
      {
        path: "/research/ai-literature-review",
        label: "AI literature review",
        description: "Synthesize themes and gaps across papers in a research notebook.",
      },
    ],
    articleType: "TechArticle",
    changefreq: "monthly",
    priority: 0.85,
  },
  {
    path: "/guides/how-to-study-from-pdfs-with-ai",
    pageType: "guide",
    title: "How to Study From PDFs With AI",
    description:
      "Learn how to turn PDFs, lecture notes, and class readings into flashcards, quizzes, mind maps, audio overviews, and study guides with Better Memory.",
    keywords:
      "how to study from PDFs with AI, AI flashcards from PDF, turn lecture slides into quizzes, chat with PDF study guide",
    h1: "How to Study From PDFs With AI",
    intro:
      "The best AI study workflow starts with your own material: textbook chapters, lecture slides, reading packets, and notes. Better Memory is built for this workflow by letting you upload sources into a notebook, chat with them, and turn them into flashcards, quizzes, written questions with feedback, mind maps, reports, and audio overviews—all grounded in the documents you provide.",
    sections: [
      {
        h2: "Step 1 — Add your source material",
        paragraphs: [
          "Create a notebook and upload textbook PDFs, lecture slides, notes, or other study documents. You can also add discovered web sources alongside class material when you need extra context.",
        ],
        bullets: [
          "Upload PDFs, Word files, PowerPoint slides, images, or audio",
          "Paste text or import transcripts from supported video platforms",
          "Discover web articles to supplement your readings",
        ],
      },
      {
        h2: "Step 2 — Ask grounded questions first",
        paragraphs: [
          "Before generating study aids, ask the notebook to explain difficult sections, define terms, compare ideas, or summarize a chapter from your uploaded sources. This checks whether your source set is complete and helps you understand the material before you memorize outputs.",
        ],
      },
      {
        h2: "Step 3 — Generate the right output for the task",
        paragraphs: [
          "Select the sources you want, then open the Studio tool that matches how you study. Each output is drafted from your materials—you review and edit before relying on it.",
        ],
        bullets: [
          "Flashcards for definitions and recall-heavy subjects",
          "Quizzes for multiple-choice self-testing before exams",
          "Written questions for short-answer and essay practice with feedback on your responses",
          "Mind maps for dense conceptual topics",
          "Reports or study guides for chapter review",
          "Audio overviews for recap-style revision",
        ],
      },
      {
        h2: "Step 4 — Edit before memorizing",
        paragraphs: [
          "Generated study content should be reviewed against the original material before you use it for exams or assignments. Treat AI outputs as drafts built from your sources, not as a substitute for verifying the source text.",
        ],
      },
      {
        h2: "Best workflow by use case",
        paragraphs: [
          "Match the output type to how the class is assessed. The same notebook can support different flows each week.",
        ],
        bullets: [
          "Memorization-heavy class: PDF → flashcards → quiz",
          "Essay or short-answer exams: PDF → written questions → review feedback against sources",
          "Theory-heavy class: PDF + slides → mind map → study guide",
          "Fast revision: readings → audio overview → short quiz",
        ],
      },
      {
        h2: "Why this works better than manual copying",
        paragraphs: [
          "Better Memory starts from your actual study sources rather than asking you to build everything card by card. That makes it closer to a source-grounded study workflow than a blank flashcard app—you upload once, then branch into the formats you need for each exam.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can AI make flashcards from PDFs?",
        answer:
          "Yes. Upload or paste your PDF into a Better Memory notebook, select the sources, and generate a flashcard deck. Review and edit each card against the original text before studying.",
      },
      {
        question: "Can I turn lecture slides into quizzes?",
        answer:
          "Yes. Add slide decks to your notebook, select them in Studio, and generate a multiple-choice quiz. Use chat first to clarify confusing slides, then generate the quiz from the same sources.",
      },
      {
        question: "Should I trust AI-generated study materials?",
        answer:
          "Treat them as drafts. Better Memory grounds outputs in your uploads, but you should verify wording, definitions, and edge cases against the original PDFs before exams or graded work.",
      },
      {
        question: "Do I need to upload sources first?",
        answer:
          "Yes. Studio tools work on sources in your notebook. Add PDFs, slides, or other materials first, then generate flashcards, quizzes, mind maps, and other outputs from the selection you choose.",
      },
      {
        question: "Can I practice essay answers, not just multiple choice?",
        answer:
          "Yes. Use Written Questions in Studio for short-answer and essay prompts grounded in your PDFs, with feedback on responses you submit. Use Quizzes when you specifically want multiple-choice practice.",
      },
    ],
    ctaLabel: "Create free account",
    conversionPromise:
      "Upload your first PDFs and generate study materials in minutes—no credit card required.",
    signupIntentKey: "flashcards",
    breadcrumbParent: { name: "Guides", path: "/guides/how-to-study-from-pdfs-with-ai" },
    navLabel: "Study from PDFs with AI",
    relatedLinks: [
      {
        path: "/students/ai-written-questions",
        label: "Written questions with feedback",
        description:
          "Generate short-answer and essay prompts from your PDFs and get feedback on what you write.",
      },
      {
        path: "/students/ai-flashcards",
        label: "AI flashcards",
        description: "Generate and edit flashcard decks from notebook sources.",
      },
      {
        path: "/students/ai-quizzes",
        label: "AI quizzes",
        description: "Build multiple-choice practice from lectures and readings.",
      },
      {
        path: "/compare/better-memory-vs-notebooklm",
        label: "Better Memory vs NotebookLM",
        description: "See how written questions with feedback compares to NotebookLM study tools.",
      },
    ],
    articleType: "TechArticle",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/guides/how-to-do-an-ai-literature-review",
    pageType: "guide",
    title: "How to Do an AI Literature Review With Your Papers (Step-by-Step)",
    description:
      "Learn how to use AI for literature review: build a paper set, chat across sources, run literature review mode, and synthesize themes and gaps with Better Memory—without replacing scholarly judgment.",
    keywords:
      "ai for literature review, how to do literature review with AI, ai for research literature review, AI literature review from papers, import DOI BibTeX Zotero",
    h1: "How to use AI for literature review with your papers",
    intro:
      "Using AI for literature review works best when you start with a real paper set, not a blank prompt. This guide walks through a practical workflow—discover and import papers, chat across your reading list, run literature review mode, and format citations—while you stay responsible for rigor, inclusion criteria, and final claims. For the product overview, see our AI literature review tool page.",
    sections: [
      {
        h2: "Step 1 — Build the paper set",
        paragraphs: [
          "Start by discovering or importing papers into one research notebook. Scope the topic early so chat and literature review run on a coherent reading list rather than a random pile of PDFs.",
        ],
        bullets: [
          "Discover papers through academic search in Better Memory",
          "Import via DOI, BibTeX, Zotero, or Mendeley",
          "Upload PDFs directly when you already have files",
        ],
      },
      {
        h2: "Step 2 — Read through chat before synthesis",
        paragraphs: [
          "Use notebook chat to orient yourself before running a full literature review. Ask about themes, disagreements, methods, recurring limitations, and missing angles across the papers you selected.",
        ],
        bullets: [
          "What are the main themes across these papers?",
          "Where do authors disagree on methods or conclusions?",
          "What limitations appear repeatedly?",
          "Which subtopics are under-covered?",
        ],
      },
      {
        h2: "Step 3 — Run literature review mode",
        paragraphs: [
          "When the source set is scoped and cleaned, use AI literature review to synthesize themes and gaps across papers already in the notebook. This step works best after you have removed irrelevant uploads and confirmed the reading list matches your research question.",
        ],
      },
      {
        h2: "Step 4 — Format citations and outputs",
        paragraphs: [
          "Format references in the citation style you need, then turn the notebook into a report or deep research output when you need a longer deliverable. Verify every citation against the original papers and your style guide before submission.",
        ],
      },
      {
        h2: "What AI literature review is good for",
        paragraphs: [
          "AI-assisted literature review helps you move faster on structured note-taking and orientation—not on replacing scholarly judgment.",
        ],
        bullets: [
          "Thematic synthesis across many papers",
          "Faster orientation in a new field",
          "Drafting structured review notes",
          "Finding gaps or under-covered subtopics",
        ],
      },
      {
        h2: "What it is not",
        paragraphs: [
          "Better Memory is not a substitute for a preregistered or fully systematic review protocol. It does not replace manual judgment on paper quality, inclusion criteria, or claims evaluation. Use it to accelerate reading and drafting while you retain responsibility for methodology and conclusions.",
        ],
      },
      {
        h2: "How to avoid overreliance on AI in literature review",
        paragraphs: [
          "Treat every AI synthesis as a draft. Spot-check quotes and claims against original PDFs, keep a manual log of inclusion decisions, and use chat to question the reading list—not only to confirm what you already believe. AI literature review tools speed orientation and note-taking; they do not remove your responsibility for methods and conclusions.",
        ],
      },
    ],
    faqs: [
      {
        question: "How do I use AI for literature review responsibly?",
        answer:
          "Start with a scoped paper set, verify AI summaries against originals, document which papers you included or excluded, and edit synthesis drafts before submission. Use AI to orient and draft—not to replace reading or methodological judgment.",
      },
      {
        question: "Can AI summarize multiple papers?",
        answer:
          "Yes. Add papers to a notebook, then use chat or literature review mode to summarize themes, methods, and gaps across the set. Always verify summaries against the original PDFs.",
      },
      {
        question: "Is Better Memory a systematic review tool?",
        answer:
          "No. It supports AI-assisted literature review and synthesis, but not preregistered systematic review protocols, screening workflows, or meta-analysis. Use it to orient and draft—not as a replacement for formal systematic methods.",
      },
      {
        question: "Can I import papers from Zotero or DOI?",
        answer:
          "Yes. Better Memory supports imports from DOI, BibTeX, Zotero, and Mendeley into research notebooks alongside direct PDF uploads.",
      },
      {
        question: "Can I chat with my reading list?",
        answer:
          "Yes. Notebook chat answers questions grounded in the papers you added—useful for comparing methods, finding disagreements, and checking whether your source set is complete before synthesis.",
      },
    ],
    ctaLabel: "Start a research notebook",
    conversionPromise:
      "Import your reading list and run your first literature review synthesis in minutes.",
    signupIntentKey: "literatureReview",
    breadcrumbParent: { name: "Guides", path: "/guides/how-to-do-an-ai-literature-review" },
    navLabel: "AI literature review guide",
    relatedLinks: [
      {
        path: "/research/ai-literature-review",
        label: "AI literature review",
        description: "Product overview for synthesizing themes across papers.",
      },
      {
        path: "/research/import-papers",
        label: "Import papers",
        description: "Bring in DOI, BibTeX, Zotero, and Mendeley libraries.",
      },
      {
        path: "/research",
        label: "Research tools",
        description: "Full research workflow hub.",
      },
    ],
    articleType: "TechArticle",
    changefreq: "monthly",
    priority: 0.8,
  },
];

const SEO_CONTENT_ZH: Record<string, Partial<SeoContentLocalizedFields>> = {
  "/compare/better-memory-vs-notebooklm": {
    title: "适合学生和研究者的 NotebookLM 替代方案 | Better Memory",
    description:
      "在寻找 NotebookLM 替代方案？比较 Better Memory 与 NotebookLM 在 PDF 学习、音频概览、闪卡、文献综述和研究流程上的差异。",
    keywords:
      "NotebookLM 替代方案, NotebookLM alternative, 免费 NotebookLM 替代, 学习工具, Better Memory vs NotebookLM",
    h1: "适合 PDF、闪卡和研究的 NotebookLM 替代方案",
    intro:
      "如果你想要带引用的基于来源聊天，同时需要笔记本文件夹、网页和学术发现、支持十二种引用格式的文献综述，以及带反馈的问答题和间隔复习闪卡等学习工具，Better Memory 是一个有力的 NotebookLM 替代方案。NotebookLM 更适合深度使用 Google Workspace，并需要 Audio Overviews、Video Overviews 和 Learning Guide 的用户。本页帮助你按真实工作流比较两者，而不只是看功能清单。",
    quickAnswer: {
      chooseCompetitor:
        "如果你想要 Google 生态集成，以及在带引用的基于来源聊天之外使用 Audio Overviews、Video Overviews、闪卡、测验、报告和 Learning Guide AI 导师，可以选择 NotebookLM。",
      chooseBetterMemory:
        "如果你想要带引用的基于来源聊天，同时需要笔记本文件夹、网页和学术来源发现、十二种引用格式的文献综述、聊天搜索并一键保存到笔记本、模型切换、聊天语音输入、音频转录、带反馈的问答题、间隔复习闪卡、可编辑报告和学术导入流程，可以选择 Better Memory。",
    },
    comparisonTable: [
      {
        topic: "基于来源的聊天",
        betterMemory:
          "跨笔记本来源进行带引用的聊天；RAG 回答和 Studio 输出会从你的上传内容综合生成。",
        competitor: "围绕上传来源进行带引用的聊天；从相同材料生成综合和学习输出。",
      },
      {
        topic: "学生学习输出",
        betterMemory: "带间隔复习的闪卡、测验、思维导图、音频概览、可编辑报告、信息图和电子表格。",
        competitor:
          "Audio Overviews、Video Overviews、闪卡、测验、思维导图、报告、信息图和 Learning Guide。",
      },
      {
        topic: "问答题",
        betterMemory: "从你的来源生成短答和论文题，并对你提交的回答给出 AI 反馈，不只限于选择题。",
        competitor: "提供测验和 Learning Guide AI 导师；产品页未说明带反馈的书面回答练习。",
      },
      {
        topic: "研究流程",
        betterMemory: "学术论文发现、论文导入、AI 文献综述、深度研究，以及多种格式引用。",
        competitor: "其方案和产品页中提供来源发现、Deep Research 和文献综述综合。",
      },
      {
        topic: "文献综述引用",
        betterMemory:
          "为文献综述、报告和 Cite Paper 弹窗提供十二种引用格式，包括 APA、MLA、Chicago、IEEE、Vancouver 和 Harvard。",
        competitor: "产品页未描述用于文献综述输出的多格式学术引用能力。",
      },
      {
        topic: "笔记本组织",
        betterMemory: "用文件夹组织笔记本，并在文件夹之间移动。",
        competitor: "官方产品页未描述等价的文件夹组织能力。",
      },
      {
        topic: "来源发现",
        betterMemory: "内置网页和学术发现，可将结果直接加入笔记本。",
        competitor: "更强调上传和按方案提供的来源发现，而不是同样的网页加学术发现流程。",
      },
      {
        topic: "聊天搜索与模型",
        betterMemory:
          "聊天中可选网页和学术搜索；可将外部结果保存到笔记本；支持多个模型选择和聊天语音转录。",
        competitor: "仅使用 Google 模型栈；产品页未突出模型切换、聊天内网页/学术搜索或语音输入。",
      },
      {
        topic: "音频与来源面板",
        betterMemory: "可上传音频转录；可在来源面板删除和刷新来源。",
        competitor: "产品页未描述音频导入或来源面板删除/刷新流程。",
      },
      {
        topic: "学术导入",
        betterMemory: "通过 DOI、BibTeX、Zotero 和 Mendeley 将论文导入研究笔记本。",
        competitor: "官方页面更强调上传和来源发现，而不是学术文献管理器导入。",
      },
      {
        topic: "价格模式",
        betterMemory:
          "免费（$0）：5 个笔记本，每个 200 个来源，并有每日生成额度。Pro（年付 $7.50/月或月付 $15/月）：100 个笔记本，每个 200 个来源，并提高每日额度。",
        competitor:
          "提供 Free、Plus、Pro 和 Ultra 层级；每个笔记本来源上限分别为 50、100、300 和 600。",
      },
      {
        topic: "最适合",
        betterMemory: "需要带引用的综合、文件夹、发现和学术流程的学生和研究者。",
        competitor:
          "深度依赖 Google Workspace，并希望在基于来源聊天之上使用 Google 学习功能的用户。",
      },
    ],
    sections: [
      {
        h2: "为什么选择 Better Memory 作为 NotebookLM 替代方案？",
        paragraphs: [
          "大多数寻找 NotebookLM 替代方案的人都想要同一个核心能力：上传来源、带引用聊天，并生成学习或研究输出。Better Memory 覆盖这个基础，并加入 NotebookLM 产品页不太强调的工作流：学术论文导入、多引用格式文献综述、带反馈的问答题、笔记本文件夹，以及应用内网页和学术发现。",
          "如果你需要一个免费的 NotebookLM 替代方案，用于从 PDF 学习、生成闪卡和测验，或围绕阅读清单做文献综述，Better Memory 就是为这个路径设计的。如果你主要需要 Google 生态、Video Overviews 和 Learning Guide AI 导师，NotebookLM 仍可能更适合。",
        ],
      },
      {
        h2: "Better Memory 和 NotebookLM 有哪些共同点？",
        paragraphs: [
          "两者都围绕带引用的基于来源 AI 构建：你添加文档、提出问题，并获得会回到材料本身的回答和输出，而不是只依赖通用训练数据编造事实。",
          "两者都支持面向学习的输出，例如闪卡、测验、思维导图、音频式回顾、报告和信息图。需要在专门工作区复习课程阅读或研究论文时，它们都比把文本复制到空白聊天窗口更合适。",
        ],
      },
      {
        h2: "什么时候 Better Memory 更合适？",
        paragraphs: [
          "当你的工作流不只是上传和聊天，并且不想完全放在 Google 栈里时，Better Memory 更适合。它结合了笔记本文件夹、内置发现、灵活聊天搜索，以及 NotebookLM 产品页不太强调的学习和研究工具。",
        ],
        bullets: [
          "你想用文件夹组织笔记本，并在文件夹之间移动",
          "你需要网页或学术发现，并一键加入笔记本",
          "你想在聊天中进行网页或学术搜索，并把外部来源保存到笔记本",
          "你希望在多个模型之间选择，而不是只使用单一 Google 模型栈",
          "你需要聊天语音转录或音频文件导入转录",
          "你想要带答案反馈的问答题，这是 Better Memory 的突出功能",
          "你想要带间隔复习模式的闪卡",
          "你需要在生成后编辑报告",
          "你想在来源面板中删除和刷新来源",
          "你需要通过 DOI、BibTeX、Zotero 或 Mendeley 导入阅读清单",
          "你需要文献综述输出按 APA、MLA、Chicago、IEEE、Vancouver、Harvard 或其他学术格式生成参考文献",
        ],
      },
      {
        h2: "Better Memory 的差异点是什么？",
        paragraphs: [
          "两款产品都能从来源生成闪卡、测验、思维导图、报告、信息图和电子表格。真正的差异在于工作流深度和控制力，而不是输出类型清单更长。",
        ],
        bullets: [
          "笔记本文件夹：分组笔记本并在文件夹之间移动",
          "对短答和论文回答提供反馈的问答题",
          "带间隔复习的闪卡",
          "生成后可编辑报告",
          "内置网页和学术来源发现",
          "聊天中的网页和学术搜索，并可轻松把外部来源加入笔记本",
          "多模型切换",
          "聊天语音转录和音频来源导入",
          "来源面板中的删除和刷新选项",
          "通过 DOI、BibTeX、Zotero 和 Mendeley 进行学术导入",
          "为文献综述和报告提供十二种引用格式（APA、MLA、Chicago、IEEE、Vancouver、Harvard 等）",
        ],
      },
      {
        h2: "什么时候 NotebookLM 更合适？",
        paragraphs: [
          "如果你已经深度使用 Google Workspace，想要带引用的成熟来源聊天，并计划在支持的方案中使用 Google 的 Audio Overviews、Video Overviews 和 Learning Guide，NotebookLM 很适合。Learning Guide 是一种个人 AI 导师，会通过追问和适配解释帮助学习。",
          "如果你的流程主要是上传、聊天、在 Google 生态内生成学习辅助内容，NotebookLM 的集成优势可能超过单独的笔记本产品。",
        ],
      },
      {
        h2: "哪款工具更适合学生？",
        paragraphs: [
          "对学生来说，取决于需求范围。两者都能围绕上传内容提供强大的带引用聊天。NotebookLM 在支持的方案中加入 Video Overviews 和 Learning Guide AI 导师。Better Memory 的差异点是带反馈的问答题、间隔复习闪卡、笔记本文件夹、应用内发现、可把来源保存到笔记本的聊天搜索、语音输入和可编辑报告。",
          "两者都不能替代考前阅读原始 PDF。请选择输出形式真正匹配你学习方式的工具。",
        ],
      },
      {
        h2: "哪款工具更适合文献综述？",
        paragraphs: [
          "Better Memory 面向研究笔记本设计，包含学术发现、论文导入、跨论文聊天和专用文献综述模式，并为综述和报告中的参考文献提供十二种引用格式（APA、MLA、Chicago、IEEE、Vancouver、Harvard 等）。NotebookLM 提供来源发现、Deep Research 和文献综述综合，但没有同样的多格式引用能力。",
          "如果你的文献综述以阅读清单为中心，需要导入、综合和符合领域要求的引用，Better Memory 更贴近这个流程。如果你是在 Google 中对混合上传材料做探索式综合，NotebookLM 仍有竞争力。",
        ],
      },
      {
        h2: "哪款工具更适合从 PDF 学习？",
        paragraphs: [
          "两者都能很好地支持基于 PDF 的学习。上传章节或课堂幻灯片，提出澄清问题，然后生成闪卡或测验。两者也都能从相同来源生成思维导图、音频回顾、报告和信息图。",
          "NotebookLM 在支持的方案中加入 Video Overviews 和 Learning Guide AI 导师。Better Memory 增加了带反馈的问答题、间隔复习闪卡、语音和音频导入、发现和聊天搜索流程，以及可编辑报告。选择时应看控制力和工作流是否匹配，而不只是输出类型数量。",
        ],
      },
    ],
    faqs: [
      {
        question: "最好的 NotebookLM 替代方案是什么？",
        answer:
          "最佳选择取决于你的工作流。Better Memory 适合需要基于来源聊天、文件夹、发现、学术导入、十二种引用格式文献综述、带反馈问答题和间隔复习闪卡的学生和研究者。若你优先考虑 Google 生态、Video Overviews 和 Learning Guide AI 导师，NotebookLM 仍很有竞争力。",
      },
      {
        question: "有免费的 NotebookLM 替代方案吗？",
        answer:
          "有。Better Memory 提供免费层级，包含笔记本、每个笔记本来源限制和每日生成额度，你可以上传 PDF、与来源聊天，并在升级前试用闪卡、测验和文献综述。",
      },
      {
        question: "Better Memory 是音频概览方面的 NotebookLM 替代方案吗？",
        answer:
          "是。Better Memory 会从你上传的来源生成音频概览，便于路上收听学习回顾，类似 NotebookLM 的 Audio Overviews，并与同一笔记本中的闪卡、测验和研究工具配合使用。",
      },
      {
        question: "Better Memory 是 NotebookLM 替代方案吗？",
        answer:
          "对许多工作流来说，是的。两者都支持带引用的基于来源聊天。Better Memory 更适合需要文件夹、网页和学术发现、聊天搜索并保存到笔记本、多模型、带反馈问答题、间隔复习闪卡、可编辑报告和学术导入的用户。NotebookLM 更适合优先考虑 Google 生态、Video Overviews 和 Learning Guide AI 导师的用户。",
      },
      {
        question: "哪款工具更适合学生？",
        answer:
          "两者都能很好地处理基于来源的带引用聊天。NotebookLM 在支持方案中加入 Video Overviews 和 Learning Guide AI 导师。Better Memory 适合需要带反馈问答题、间隔复习闪卡、发现和聊天搜索流程、语音输入、笔记本文件夹和可编辑报告的学生。应按实际学习方式比较，而不是只看功能清单。",
      },
      {
        question: "哪款工具更适合文献综述？",
        answer:
          "Better Memory 面向研究笔记本设计，包含论文发现、DOI 和文献管理器导入、AI 文献综述，以及为综述和报告生成参考文献的十二种引用格式。NotebookLM 支持发现、Deep Research 和文献综述综合，但没有同样的多格式引用或学术导入流程。",
      },
      {
        question: "NotebookLM 有带反馈的问答题吗？",
        answer:
          "NotebookLM 提供测验和 Learning Guide AI 导师，但其产品页未描述会对你书面回答给出反馈的短答或论文练习。Better Memory 的 Written Questions 会从来源生成问题，并对你提交的回答给出反馈，适合需要书面作答而不只是选择题的考试。",
      },
    ],
    ctaLabel: "免费试用 Better Memory",
    conversionPromise: "用你自己的 PDF、论文和课堂材料免费试用 Better Memory。",
    breadcrumbParent: { name: "对比", path: "/compare/better-memory-vs-notebooklm" },
    navLabel: "Better Memory 与 NotebookLM 对比",
    relatedLinks: [
      {
        path: "/students/ai-written-questions",
        label: "带反馈的问答题",
        description: "从你的来源练习短答和论文回答，Better Memory 会评价你的答案，而不只是选择题。",
      },
      {
        path: "/guides/how-to-study-from-pdfs-with-ai",
        label: "如何用 AI 从 PDF 学习",
        description: "把阅读材料转成闪卡、测验和学习指南的分步流程。",
      },
      {
        path: "/students/ai-flashcards",
        label: "AI 闪卡",
        description: "生成基于上传来源的闪卡卡组。",
      },
      {
        path: "/research/ai-literature-review",
        label: "AI 文献综述",
        description: "在研究笔记本中综合多篇论文的主题和研究空白。",
      },
    ],
  },
  "/guides/how-to-study-from-pdfs-with-ai": {
    title: "如何用 AI 从 PDF 学习",
    description:
      "了解如何用 Better Memory 将 PDF、课堂笔记和阅读材料转化为闪卡、测验、思维导图、音频概览和学习指南。",
    keywords: "如何用 AI 从 PDF 学习, PDF 生成 AI 闪卡, 讲义转测验, 与 PDF 聊天学习指南",
    h1: "如何用 AI 从 PDF 学习",
    intro:
      "最好的 AI 学习流程从你自己的材料开始：教材章节、课堂幻灯片、阅读包和笔记。Better Memory 让你把来源上传到笔记本，与它们聊天，并生成闪卡、测验、带反馈的问答题、思维导图、报告和音频概览；这些输出都基于你提供的文档。",
    sections: [
      {
        h2: "第 1 步：添加来源材料",
        paragraphs: [
          "创建笔记本，上传教材 PDF、课堂幻灯片、笔记或其他学习文档。需要额外背景时，也可以把发现的网页来源加入课堂材料旁边。",
        ],
        bullets: [
          "上传 PDF、Word、PowerPoint、图片或音频",
          "粘贴文本，或从受支持的视频平台导入转录文本",
          "发现网页文章补充阅读材料",
        ],
      },
      {
        h2: "第 2 步：先提出基于来源的问题",
        paragraphs: [
          "生成学习材料前，先让笔记本解释难懂段落、定义术语、比较观点，或根据上传来源总结章节。这能检查来源集合是否完整，也能在记忆输出前帮助你理解材料。",
        ],
      },
      {
        h2: "第 3 步：为任务生成合适的输出",
        paragraphs: [
          "选择你要使用的来源，然后打开匹配学习方式的 Studio 工具。每种输出都是从你的材料起草的，你需要在依赖前审阅和编辑。",
        ],
        bullets: [
          "闪卡适合定义和记忆量大的科目",
          "测验适合考前选择题自测",
          "问答题适合短答和论文练习，并对你的回答给出反馈",
          "思维导图适合概念密集的主题",
          "报告或学习指南适合章节复习",
          "音频概览适合回顾式复习",
        ],
      },
      {
        h2: "第 4 步：记忆前先编辑",
        paragraphs: [
          "生成的学习内容在用于考试或作业前，应对照原始材料检查。把 AI 输出看作基于来源的草稿，而不是替代源文本核验的最终答案。",
        ],
      },
      {
        h2: "按用途选择最佳流程",
        paragraphs: ["把输出类型和课程考核方式匹配。同一个笔记本每周可以支持不同流程。"],
        bullets: [
          "记忆型课程：PDF → 闪卡 → 测验",
          "论文题或短答考试：PDF → 问答题 → 对照来源检查反馈",
          "理论密集课程：PDF + 幻灯片 → 思维导图 → 学习指南",
          "快速复习：阅读材料 → 音频概览 → 简短测验",
        ],
      },
      {
        h2: "为什么比手动复制更有效",
        paragraphs: [
          "Better Memory 从你的真实学习来源出发，而不是要求你一张张手动创建卡片。它更像一个基于来源的学习流程：上传一次，然后按每次考试需要分支到不同格式。",
        ],
      },
    ],
    faqs: [
      {
        question: "AI 可以从 PDF 制作闪卡吗？",
        answer:
          "可以。把 PDF 上传或粘贴到 Better Memory 笔记本中，选择来源，然后生成闪卡卡组。学习前请对照原文检查和编辑每张卡片。",
      },
      {
        question: "可以把课堂幻灯片转成测验吗？",
        answer:
          "可以。将幻灯片加入笔记本，在 Studio 中选择它们，然后生成选择题测验。建议先用聊天澄清难懂幻灯片，再从相同来源生成测验。",
      },
      {
        question: "AI 生成的学习材料可以直接相信吗？",
        answer:
          "请把它们当作草稿。Better Memory 会基于你的上传内容生成，但考试或评分作业前仍应对照原始 PDF 核对措辞、定义和特殊情况。",
      },
      {
        question: "必须先上传来源吗？",
        answer:
          "是的。Studio 工具会基于笔记本中的来源运行。先添加 PDF、幻灯片或其他材料，再从你选择的来源生成闪卡、测验、思维导图等输出。",
      },
      {
        question: "可以练习论文题，而不只是选择题吗？",
        answer:
          "可以。使用 Studio 中的 Written Questions 从 PDF 生成短答和论文题，并对你提交的回答给出反馈。想练选择题时再使用 Quizzes。",
      },
    ],
    ctaLabel: "创建免费账户",
    conversionPromise: "上传第一批 PDF，并在几分钟内生成学习材料，无需信用卡。",
    breadcrumbParent: { name: "指南", path: "/guides/how-to-study-from-pdfs-with-ai" },
    navLabel: "用 AI 从 PDF 学习",
    relatedLinks: [
      {
        path: "/students/ai-written-questions",
        label: "带反馈的问答题",
        description: "从 PDF 生成短答和论文题，并获得对你回答的反馈。",
      },
      {
        path: "/students/ai-flashcards",
        label: "AI 闪卡",
        description: "从笔记本来源生成并编辑闪卡卡组。",
      },
      {
        path: "/students/ai-quizzes",
        label: "AI 测验",
        description: "从讲义和阅读材料生成选择题练习。",
      },
      {
        path: "/compare/better-memory-vs-notebooklm",
        label: "Better Memory vs NotebookLM",
        description: "了解带反馈问答题与 NotebookLM 学习工具的差异。",
      },
    ],
  },
  "/guides/how-to-do-an-ai-literature-review": {
    title: "如何用你的论文做 AI 文献综述（分步指南）",
    description:
      "学习如何用 AI 做文献综述：构建论文集合、跨来源聊天、运行文献综述模式，并用 Better Memory 综合主题和空白，同时不替代学术判断。",
    keywords:
      "AI 文献综述, 如何用 AI 做文献综述, AI 辅助研究综述, 从论文生成文献综述, DOI BibTeX Zotero 导入",
    h1: "如何用 AI 基于你的论文做文献综述",
    intro:
      "用 AI 做文献综述时，最好从真实论文集合开始，而不是从空白提示开始。本指南介绍一个实用流程：发现和导入论文、跨阅读清单聊天、运行文献综述模式并格式化引用，同时由你负责严谨性、纳入标准和最终结论。产品概览请查看我们的 AI 文献综述工具页面。",
    sections: [
      {
        h2: "第 1 步：构建论文集合",
        paragraphs: [
          "先把论文发现或导入到一个研究笔记本中。尽早限定主题，让聊天和文献综述运行在连贯的阅读清单上，而不是一堆随机 PDF。",
        ],
        bullets: [
          "通过 Better Memory 的学术搜索发现论文",
          "通过 DOI、BibTeX、Zotero 或 Mendeley 导入",
          "已有文件时直接上传 PDF",
        ],
      },
      {
        h2: "第 2 步：综合前先通过聊天阅读",
        paragraphs: [
          "运行完整文献综述前，先用笔记本聊天建立方向感。询问论文集合中的主题、分歧、方法、反复出现的局限和缺失角度。",
        ],
        bullets: [
          "这些论文的主要主题是什么？",
          "作者在方法或结论上有哪些分歧？",
          "哪些局限反复出现？",
          "哪些子主题覆盖不足？",
        ],
      },
      {
        h2: "第 3 步：运行文献综述模式",
        paragraphs: [
          "当来源集合已经限定并清理好后，使用 AI 文献综述综合笔记本中已有论文的主题和空白。最好先移除无关上传，并确认阅读清单与研究问题匹配。",
        ],
      },
      {
        h2: "第 4 步：格式化引用和输出",
        paragraphs: [
          "按需要的引用格式生成参考文献；需要更长交付物时，再把笔记本转成报告或深度研究输出。提交前请对照原始论文和格式指南核对每条引用。",
        ],
      },
      {
        h2: "AI 文献综述适合做什么",
        paragraphs: ["AI 辅助文献综述能加快结构化笔记和领域入门，但不能替代学术判断。"],
        bullets: [
          "跨多篇论文进行主题综合",
          "更快进入新领域",
          "起草结构化综述笔记",
          "发现研究空白或覆盖不足的子主题",
        ],
      },
      {
        h2: "它不是什么",
        paragraphs: [
          "Better Memory 不能替代预注册或完整系统综述方案，也不能替代你对论文质量、纳入标准或论断评价的人工判断。它可以加速阅读和起草，但方法和结论仍由你负责。",
        ],
      },
      {
        h2: "如何避免在文献综述中过度依赖 AI",
        paragraphs: [
          "把每次 AI 综合都当作草稿。抽查引文和论断是否符合原始 PDF，手动记录纳入决策，并用聊天质疑你的阅读清单，而不只是确认已有观点。AI 文献综述工具能加快入门和记笔记，但不能免除你对方法和结论的责任。",
        ],
      },
    ],
    faqs: [
      {
        question: "如何负责任地用 AI 做文献综述？",
        answer:
          "从范围明确的论文集合开始，对照原文核实 AI 总结，记录纳入或排除的论文，并在提交前编辑综合草稿。用 AI 帮助入门和起草，而不是替代阅读或方法判断。",
      },
      {
        question: "AI 可以总结多篇论文吗？",
        answer:
          "可以。将论文加入笔记本，然后使用聊天或文献综述模式总结整个集合的主题、方法和空白。请始终对照原始 PDF 核实总结。",
      },
      {
        question: "Better Memory 是系统综述工具吗？",
        answer:
          "不是。它支持 AI 辅助文献综述和综合，但不提供预注册系统综述方案、完整筛选工作流或元分析。请用它来入门和起草，而不是替代正式系统方法。",
      },
      {
        question: "可以从 Zotero 或 DOI 导入论文吗？",
        answer:
          "可以。Better Memory 支持通过 DOI、BibTeX、Zotero 和 Mendeley 将论文导入研究笔记本，也支持直接上传 PDF。",
      },
      {
        question: "可以和阅读清单聊天吗？",
        answer:
          "可以。笔记本聊天会基于你添加的论文回答问题，适合比较方法、发现分歧，并在综合前检查来源集合是否完整。",
      },
    ],
    ctaLabel: "开始研究笔记本",
    conversionPromise: "导入阅读清单，几分钟内运行第一次文献综述综合。",
    breadcrumbParent: { name: "指南", path: "/guides/how-to-do-an-ai-literature-review" },
    navLabel: "AI 文献综述指南",
    relatedLinks: [
      {
        path: "/research/ai-literature-review",
        label: "AI 文献综述",
        description: "跨论文综合主题的产品概览。",
      },
      {
        path: "/research/import-papers",
        label: "导入论文",
        description: "导入 DOI、BibTeX、Zotero 和 Mendeley 文献库。",
      },
      {
        path: "/research",
        label: "研究工具",
        description: "完整研究工作流中心。",
      },
    ],
  },
};

function localizeSeoContentPage(
  page: SeoContentPageSourceConfig,
  locale: LandingLocale = "en"
): SeoContentPageConfig {
  if (locale === "en") {
    const { localized: _localized, ...base } = page;
    return base;
  }

  const localized = page.localized?.[locale] ?? SEO_CONTENT_ZH[page.path];
  if (!localized) {
    const { localized: _localized, ...base } = page;
    return base;
  }

  const { localized: _localized, ...base } = page;
  return { ...base, ...localized };
}

export const SEO_CONTENT_PAGES: SeoContentPageConfig[] = SEO_CONTENT_PAGE_SOURCES.map((page) =>
  localizeSeoContentPage(page)
);

export type SeoContentBreadcrumbItem = {
  name: string;
  path: string;
};

export function getSeoContentPageByPath(
  path: string,
  locale: LandingLocale = "en"
): SeoContentPageConfig | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const page = SEO_CONTENT_PAGE_SOURCES.find((entry) => entry.path === normalized);
  return page ? localizeSeoContentPage(page, locale) : undefined;
}

export function getSeoContentPaths(): string[] {
  return SEO_CONTENT_PAGES.map((page) => page.path);
}

export function getComparisonPages(): SeoContentPageConfig[] {
  return SEO_CONTENT_PAGES.filter((page) => page.pageType === "compare");
}

export function getGuidePages(): SeoContentPageConfig[] {
  return SEO_CONTENT_PAGES.filter((page) => page.pageType === "guide");
}

export function isSeoContentPath(path: string): boolean {
  return getSeoContentPageByPath(path) !== undefined;
}

export function getSeoContentBreadcrumbItems(
  page: SeoContentPageConfig
): SeoContentBreadcrumbItem[] {
  const compareHubPath = "/compare/better-memory-vs-notebooklm";
  const guideHubPath = "/guides/how-to-study-from-pdfs-with-ai";

  if (page.pageType === "compare") {
    return [
      { name: "Home", path: "/" },
      { name: "Compare", path: compareHubPath },
      { name: page.navLabel, path: page.path },
    ];
  }

  return [
    { name: "Home", path: "/" },
    { name: "Guides", path: guideHubPath },
    { name: page.navLabel, path: page.path },
  ];
}
