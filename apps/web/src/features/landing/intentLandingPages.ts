import type { FAQItem } from "./constants";

type LandingLocale = "en" | "zh";

export type IntentLandingCluster = "students" | "research";

export type IntentLandingPageConfig = {
  path: string;
  cluster: IntentLandingCluster;
  intentKey: string;
  title: string;
  description: string;
  keywords: string;
  h1: string;
  subheadline: string;
  conversionPromise: string;
  proofBullets: string[];
  sourceToOutput: { source: string; output: string };
  /** Prominent hero cross-link to a related intent page (e.g. quizzes → written questions). */
  heroCrossLink?: { path: string; label: string; description: string };
  faqs: FAQItem[];
  ctaLabel: string;
  navLabel: string;
  changefreq?: "weekly" | "monthly";
  priority?: number;
};

type IntentLandingLocalizedFields = Pick<
  IntentLandingPageConfig,
  | "title"
  | "description"
  | "keywords"
  | "h1"
  | "subheadline"
  | "conversionPromise"
  | "proofBullets"
  | "sourceToOutput"
  | "faqs"
  | "ctaLabel"
  | "navLabel"
> & {
  heroCrossLink?: NonNullable<IntentLandingPageConfig["heroCrossLink"]>;
};

type IntentLandingPageSourceConfig = IntentLandingPageConfig & {
  localized?: Partial<Record<LandingLocale, Partial<IntentLandingLocalizedFields>>>;
};

export const FEATURE_INTENT_PATHS: Partial<Record<string, string>> = {
  audio: "/students/ai-audio-overview",
  mindmap: "/students/ai-mind-maps",
  reports: "/students/ai-reports",
  flashcards: "/students/ai-flashcards",
  quiz: "/students/ai-quizzes",
  infographic: "/students/ai-infographics",
  writtenQuestions: "/students/ai-written-questions",
  spreadsheets: "/students/ai-spreadsheets",
  literatureReview: "/research/ai-literature-review",
  chat: "/research/chat-with-papers",
  deepResearch: "/research/deep-research",
  sourceUpload: "/students/upload-sources",
  sourceDiscovery: "/students/discover-sources",
  academicDiscovery: "/research/academic-paper-discovery",
  paperImport: "/research/import-papers",
  citationStyles: "/research/citation-styles",
  notebookSharing: "/students/share-notebooks",
};

const INTENT_LANDING_PAGE_SOURCES: IntentLandingPageSourceConfig[] = [
  {
    path: "/students/upload-sources",
    cluster: "students",
    intentKey: "sourceUpload",
    title: "Upload Study Sources | Better Memory",
    description:
      "Add PDFs, Word docs, slides, images, audio, video transcripts, Google Drive files, or pasted text to your notebook. Build one place for all your course materials.",
    keywords:
      "upload PDF, study sources, YouTube transcript, Google Drive, paste text, course materials",
    h1: "Upload all your study sources in one place",
    subheadline:
      "Bring lectures, readings, and media into a notebook so you can search, chat, and generate study materials from your own content.",
    conversionPromise:
      "Start a free account and add your first sources in minutes—no credit card required.",
    proofBullets: [
      "Supports PDF, Word, PowerPoint, images, and audio files",
      "Import transcripts from YouTube, TikTok, Instagram, and X",
      "Connect Google Drive or paste text directly",
      "Organize sources inside notebooks and folders",
    ],
    sourceToOutput: {
      source: "A folder of lecture PDFs and a YouTube recap",
      output: "Searchable sources ready for flashcards, quizzes, and chat",
    },
    faqs: [
      {
        question: "What file types can I upload?",
        answer:
          "You can upload PDFs, Word documents, PowerPoint slides, images, and audio files. You can also paste plain text or import content from supported video and social platforms as transcripts.",
      },
      {
        question: "Can I import from Google Drive?",
        answer:
          "Yes. You can connect Google Drive to pull files into your notebook without downloading them to your device first.",
      },
      {
        question: "Is there a limit on how many sources I can add?",
        answer:
          "Free accounts include notebooks with a per-notebook source limit. Pro plans raise notebook limits. See the pricing page for current caps.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Upload Sources",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/students/discover-sources",
    cluster: "students",
    intentKey: "sourceDiscovery",
    title: "Discover Web Sources for Study | Better Memory",
    description:
      "Find web and news articles to add to your notebook. Search general web or finance-focused channels and import up to 20 results per search.",
    keywords: "discover sources, web search, news articles, study research, finance news",
    h1: "Discover web and news sources for your notebook",
    subheadline:
      "Search the web or news channels, preview results, and add relevant pages to your notebook for reading and generation.",
    conversionPromise:
      "Create a free account to run discovery searches and save sources alongside your uploads.",
    proofBullets: [
      "Search general web or news-focused channels",
      "Finance channel option for market and business topics",
      "Preview results before adding to your notebook",
      "Up to 20 results per discovery search",
    ],
    sourceToOutput: {
      source: "A topic query on climate policy in the news channel",
      output: "Up to 20 imported articles ready to summarize or quiz",
    },
    faqs: [
      {
        question: "How many results can I import at once?",
        answer:
          "Each discovery search returns up to 20 results. You choose which items to add to your notebook.",
      },
      {
        question: "What is the finance channel?",
        answer:
          "The finance channel focuses discovery on business and market news sources, useful for economics and finance coursework.",
      },
      {
        question: "Do discovered pages become full sources in my notebook?",
        answer:
          "Yes. Selected results are added as sources you can read, search, and use for chat and studio generation like uploaded files.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Discover Sources",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/students/share-notebooks",
    cluster: "students",
    intentKey: "notebookSharing",
    title: "Share Notebooks with Classmates | Better Memory",
    description:
      "Share notebooks with coworkers via view links or let others fork a copy. Revoke access when you no longer want to share.",
    keywords: "share notebook, study group, fork notebook, collaborate, revoke link",
    h1: "Share notebooks with classmates or study groups",
    subheadline:
      "Send a link for view-only access or let others fork their own copy. You stay in control and can revoke sharing anytime.",
    conversionPromise: "Sign up free to create a notebook and generate your first share link.",
    proofBullets: [
      "Cowork links for view-only access to your notebook",
      "Fork links so others get their own editable copy",
      "Revoke sharing when the project ends",
      "Shared viewers see sources and content you have already added",
    ],
    sourceToOutput: {
      source: "Your shared course notebook with readings and notes",
      output: "A link classmates can open or fork into their account",
    },
    faqs: [
      {
        question: "What is the difference between cowork and fork links?",
        answer:
          "Cowork links let others view your notebook. Fork links create a separate copy in their account that they can edit without changing yours.",
      },
      {
        question: "Can I stop sharing later?",
        answer:
          "Yes. You can revoke a share link at any time. Revoked links no longer grant access.",
      },
      {
        question: "Do shared users need their own account?",
        answer:
          "Viewers typically need an account to open shared notebooks. Forking always requires signing in so the copy is saved to their workspace.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Share Notebooks",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/students/ai-flashcards",
    cluster: "students",
    intentKey: "flashcards",
    title: "AI Flashcards from PDF — Free Generator | Better Memory",
    description:
      "Make AI flashcards from PDF online free: upload a reading, generate a draft deck grounded in your source, edit cards, and study in your notebook.",
    keywords:
      "AI flashcards from PDF, pdf to flashcards free, ai flashcard generator free, make ai flashcards from pdf, ai generate flashcards from pdf",
    h1: "Make AI flashcards from your PDF in minutes",
    subheadline:
      "Upload a PDF or lecture notes, generate flashcards online, review the draft deck, and study with spaced repetition inside your notebook.",
    conversionPromise:
      "Create a free account, upload a PDF, and generate your first flashcard deck online.",
    proofBullets: [
      "Generate flashcards from PDFs and other sources in your notebook",
      "Free to start—upload, generate, and study online",
      "Review and edit every card before you study",
      "Built-in study view with spaced repetition",
    ],
    sourceToOutput: {
      source: "A chapter PDF and lecture slides",
      output: "A draft flashcard deck with front and back pairs",
    },
    faqs: [
      {
        question: "Can I make AI flashcards from a PDF for free?",
        answer:
          "Yes. Better Memory offers a free tier so you can upload a PDF, generate a draft flashcard deck, and study online. Paid plans raise notebook and generation limits.",
      },
      {
        question: "How do I generate flashcards from a PDF online?",
        answer:
          "Create a notebook, upload your PDF, select the source, and run the Flashcards tool. Better Memory drafts cards from your document so you can edit them before studying.",
      },
      {
        question: "Can I edit cards after generation?",
        answer:
          "Yes. The deck opens as a draft so you can change wording, remove cards, or add your own before studying.",
      },
      {
        question: "Are flashcards tied to my uploaded sources?",
        answer:
          "Generation uses the sources you select in the notebook, so cards reflect your materials rather than generic topics.",
      },
      {
        question: "How is this different from other AI flashcard generators?",
        answer:
          "Better Memory keeps flashcards inside a notebook with quizzes, mind maps, audio overviews, and chat on the same PDFs—so you do not need a separate tool for each study format.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Flashcards",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/students/ai-quizzes",
    cluster: "students",
    intentKey: "quiz",
    title: "AI Multiple-Choice Quizzes | Better Memory",
    description:
      "Create multiple-choice quizzes from your sources. Set question count, difficulty, and focus areas. Separate from the Written Questions tool for short and essay answers.",
    keywords: "AI quiz, multiple choice, practice test, exam prep, study quiz",
    h1: "Multiple-choice quizzes from your study materials",
    subheadline:
      "Generate practice quizzes with configurable count, difficulty, and topic focus—all multiple-choice. For essay or short-answer exams, use Written Questions instead.",
    heroCrossLink: {
      path: "/students/ai-written-questions",
      label: "Practicing for essay or short-answer exams?",
      description:
        "Written Questions generates prompts from your sources and gives AI feedback on responses you submit—not multiple choice.",
    },
    conversionPromise: "Start free and build a practice quiz from your next reading assignment.",
    proofBullets: [
      "Multiple-choice questions only",
      "Choose question count, difficulty, and focus topics",
      "Grounded in sources you select in the notebook",
      "Different tool from Written Questions for essays and short answers",
    ],
    sourceToOutput: {
      source: "Unit notes and a textbook section",
      output: "A multiple-choice quiz with answer key for self-check",
    },
    faqs: [
      {
        question: "Does the quiz tool support short-answer or essay questions?",
        answer:
          "No. This tool creates multiple-choice quizzes only. For short and essay practice with feedback, use Written Questions in Studio.",
      },
      {
        question: "Can I control how hard the quiz is?",
        answer:
          "Yes. You can set difficulty and how many questions to generate, plus optional focus areas within your sources.",
      },
      {
        question: "Should I verify answers before relying on them?",
        answer:
          "Yes. Review generated quizzes against your materials, especially for high-stakes exams. Automated questions can occasionally be imprecise.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Quizzes",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/students/ai-audio-overview",
    cluster: "students",
    intentKey: "audio",
    title: "AI Audio Overviews for Studying | Better Memory",
    description:
      "Listen to AI-narrated overviews of your sources. Choose format—deep dive, brief, critique, or debate—plus length and focus.",
    keywords: "audio study, podcast summary, listen to notes, AI narration, deep dive",
    h1: "Audio overviews you can listen to on the go",
    subheadline:
      "Generate narrated summaries from your notebook sources with format, length, and focus options.",
    conversionPromise:
      "Create a free account and generate an audio overview from your next lecture set.",
    proofBullets: [
      "Formats include deep dive, brief, critique, and debate",
      "Adjust length and topic focus",
      "Built from sources in your notebook",
      "Play in the browser when you are ready",
    ],
    sourceToOutput: {
      source: "Two articles and a set of class notes",
      output: "A narrated audio overview you can play while commuting",
    },
    faqs: [
      {
        question: "What audio formats are available?",
        answer:
          "You can choose deep dive, brief, critique, or debate-style overviews, depending on how you want to review the material.",
      },
      {
        question: "Can I set how long the overview runs?",
        answer: "Yes. Length and focus settings help shape how much detail the narration covers.",
      },
      {
        question: "Is the audio generated from my sources?",
        answer:
          "Overviews are produced from the sources you select in the notebook, so the narration follows your uploaded content.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Audio Overview",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/students/ai-mind-maps",
    cluster: "students",
    intentKey: "mindmap",
    title: "AI Mind Maps from Sources | Better Memory",
    description:
      "Build visual mind maps from your uploaded sources. See how concepts connect across readings and lectures.",
    keywords: "mind map, concept map, visual study, AI mind map, study diagram",
    h1: "Visual mind maps from your sources",
    subheadline:
      "Map concepts and relationships from your notebook materials in an interactive diagram you can explore and adjust.",
    conversionPromise: "Sign up free and map your first chapter or lecture in a mind map.",
    proofBullets: [
      "Visual layout generated from selected sources",
      "Explore branches and relationships interactively",
      "Useful for seeing how topics connect across readings",
      "Edit and refine the map in your notebook",
    ],
    sourceToOutput: {
      source: "A dense textbook chapter",
      output: "A branching mind map of key concepts and links",
    },
    faqs: [
      {
        question: "What sources can mind maps use?",
        answer:
          "Mind maps draw from documents, transcripts, and text sources you have added to the notebook.",
      },
      {
        question: "Can I edit the map after it is generated?",
        answer: "Yes. You can adjust nodes and structure in the mind map editor after generation.",
      },
      {
        question: "Is this a replacement for taking notes by hand?",
        answer:
          "It is a supplement. Maps help you see structure quickly; you should still verify details against your originals.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Mind Maps",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/students/ai-reports",
    cluster: "students",
    intentKey: "reports",
    title: "AI Reports and Study Guides | Better Memory",
    description:
      "Generate reports from your sources: study guide, summary, briefing, concept explainer, or custom. Grounded in the materials you select.",
    keywords: "study guide, AI summary, briefing, concept explainer, report generator",
    h1: "Reports and study guides from your materials",
    subheadline:
      "Pick a report type—study guide, summary, briefing, concept explainer, or custom—and generate a draft from your sources.",
    conversionPromise:
      "Create a free account and draft your first study guide from course readings.",
    proofBullets: [
      "Report types: study guide, summary, briefing, concept explainer, custom",
      "Uses only the sources you choose in the notebook",
      "Editable draft you can refine before sharing",
      "Helpful for review sheets and exam prep outlines",
    ],
    sourceToOutput: {
      source: "Syllabus readings for one exam unit",
      output: "A structured study guide draft with sections and key points",
    },
    faqs: [
      {
        question: "What report types can I create?",
        answer:
          "Options include study guide, summary, briefing, concept explainer, and custom prompts for other structured outputs.",
      },
      {
        question: "Will the report cite only my sources?",
        answer:
          "Generation is grounded in your selected notebook sources. You should still verify facts and wording before submitting work.",
      },
      {
        question: "Can I customize the prompt?",
        answer:
          "Yes. The custom report type lets you describe the structure or angle you want within your source set.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Reports",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/students/ai-infographics",
    cluster: "students",
    intentKey: "infographic",
    title: "AI Infographics from Study Sources | Better Memory",
    description:
      "Create infographic images from your sources. Choose style, orientation, and detail level for visual study aids.",
    keywords: "infographic, visual summary, study poster, AI image, learning visual",
    h1: "Infographics that visualize your study content",
    subheadline:
      "Turn key ideas from your sources into an image with controls for style, orientation, and detail.",
    conversionPromise: "Start free and generate a visual summary of your next topic.",
    proofBullets: [
      "Image output based on notebook sources",
      "Style, orientation, and detail settings",
      "Useful for posters, slides, and quick visual review",
      "Review the image against your materials before presenting",
    ],
    sourceToOutput: {
      source: "A process explained across two lecture PDFs",
      output: "A single infographic image highlighting main steps",
    },
    faqs: [
      {
        question: "What can I customize about the infographic?",
        answer:
          "You can adjust style, orientation (such as portrait or landscape), and how much detail to include.",
      },
      {
        question: "Is the infographic text always accurate?",
        answer:
          "Images are generated from your sources but can simplify or mislabel details. Verify against your originals before using in graded work.",
      },
      {
        question: "What file format do I get?",
        answer:
          "Infographics are delivered as images you can view and download from your notebook.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Infographics",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/students/ai-written-questions",
    cluster: "students",
    intentKey: "writtenQuestions",
    title: "Written Questions with AI Feedback | Better Memory",
    description:
      "Practice short-answer and essay questions from your sources. Submit responses for feedback—separate from multiple-choice Quizzes.",
    keywords: "essay practice, short answer, written response, study feedback, exam practice",
    h1: "Written questions with feedback on your answers",
    subheadline:
      "Generate short-answer and essay prompts from your sources, write responses, and submit for AI feedback—not multiple-choice.",
    conversionPromise:
      "Create a free account to practice written responses on your course material.",
    proofBullets: [
      "Short-answer and essay-style prompts",
      "Submit your response for feedback",
      "Grounded in sources you select",
      "Separate from the multiple-choice Quiz tool",
    ],
    sourceToOutput: {
      source: "Primary sources for a history unit",
      output: "Essay prompts plus feedback on your submitted answer",
    },
    faqs: [
      {
        question: "How is this different from Quizzes?",
        answer:
          "Written Questions focuses on short and essay responses with feedback. Quizzes only produce multiple-choice practice.",
      },
      {
        question: "Does feedback replace a teacher or grader?",
        answer:
          "No. Feedback is a study aid. Use it to spot gaps and improve drafts, not as a final grade.",
      },
      {
        question: "Can I choose question length?",
        answer:
          "You can generate short-answer or longer essay-style prompts depending on how you configure the tool.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Written Questions",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/students/ai-spreadsheets",
    cluster: "students",
    intentKey: "spreadsheets",
    title: "AI Spreadsheets from Sources | Better Memory",
    description:
      "Extract structured data from your sources into spreadsheets. Modes include data extraction, comparison, timeline, financial, and custom layouts.",
    keywords: "spreadsheet, data extraction, comparison table, timeline, study data",
    h1: "Spreadsheets that organize data from your sources",
    subheadline:
      "Pull structured tables from readings—comparison, timeline, financial, or custom formats—for analysis and review.",
    conversionPromise: "Sign up free and extract your first table from a reading set.",
    proofBullets: [
      "Modes: data extraction, comparison, timeline, financial, custom",
      "Rows and columns grounded in selected sources",
      "Easier than copying figures by hand from PDFs",
      "Review extracted values against originals",
    ],
    sourceToOutput: {
      source: "Case studies with figures across three PDFs",
      output: "A comparison spreadsheet with key metrics per case",
    },
    faqs: [
      {
        question: "What spreadsheet modes are available?",
        answer:
          "You can use data extraction, comparison, timeline, financial, or custom layouts depending on what you need from your sources.",
      },
      {
        question: "Should I trust extracted numbers without checking?",
        answer:
          "No. Always verify extracted data against your source documents, especially for assignments and exams.",
      },
      {
        question: "Can I export the spreadsheet?",
        answer:
          "You can work with the generated table in the notebook and export depending on the formats supported in the product.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Spreadsheets",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/research/academic-paper-discovery",
    cluster: "research",
    intentKey: "academicDiscovery",
    title: "Academic Paper Discovery | Better Memory",
    description:
      "Search academic literature with filters for year, citations, open access, and field. Import paper records with deduplication by DOI and OpenAlex.",
    keywords: "paper discovery, academic search, OpenAlex, DOI, literature search",
    h1: "Discover academic papers for your research notebook",
    subheadline:
      "Search the academic channel, filter by year, citations, open access, and field, then import deduplicated paper records.",
    conversionPromise:
      "Create a free account to search academic literature and save papers to a notebook.",
    proofBullets: [
      "Academic-focused discovery channel",
      "Filters: year, citation count, open access, field",
      "Imports structured paper records into your notebook",
      "Deduplicates by DOI and OpenAlex identifiers",
    ],
    sourceToOutput: {
      source: "A query on transformer architectures in biology papers",
      output: "Imported paper records ready to read and cite",
    },
    faqs: [
      {
        question: "How does deduplication work?",
        answer:
          "When you import papers, records with the same DOI or OpenAlex ID are treated as duplicates so your notebook stays clean.",
      },
      {
        question: "Can I filter to open-access papers only?",
        answer: "Yes. Open access is one of the filters you can apply before importing results.",
      },
      {
        question: "Does discovery replace a full systematic review?",
        answer:
          "No. It helps you find and collect papers quickly. Formal systematic reviews need explicit protocols and exhaustive search strategies.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Paper Discovery",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/research/import-papers",
    cluster: "research",
    intentKey: "paperImport",
    title: "Import Research Papers | Better Memory",
    description:
      "Import papers by DOI, BibTeX, RIS, Zotero, Mendeley, or manual entry. Build your reading list inside a research notebook.",
    keywords: "import papers, DOI, BibTeX, RIS, Zotero, Mendeley, reference manager",
    h1: "Import papers from DOI, BibTeX, and reference managers",
    subheadline:
      "Bring literature in via DOI, BibTeX, RIS, Zotero, Mendeley, or manual metadata—then read and work with them in one notebook.",
    conversionPromise: "Start free and import your first paper by DOI or from a reference file.",
    proofBullets: [
      "Import by DOI, BibTeX, RIS, Zotero, or Mendeley",
      "Manual entry when metadata is incomplete",
      "Papers become sources in your research notebook",
      "Combine imports with discovery and chat tools",
    ],
    sourceToOutput: {
      source: "A Zotero library export for one project",
      output: "Paper sources attached to your notebook with metadata",
    },
    faqs: [
      {
        question: "Which import formats are supported?",
        answer:
          "You can import using DOI lookup, BibTeX, RIS, Zotero, Mendeley integrations, or by entering details manually.",
      },
      {
        question: "Do I need the PDF for every import?",
        answer:
          "Metadata imports can add paper records; PDFs can be attached when available so you can read and chat with full text.",
      },
      {
        question: "Can I mix imports with discovered papers?",
        answer: "Yes. Imported and discovered papers live in the same notebook alongside uploads.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Import Papers",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/research/citation-styles",
    cluster: "research",
    intentKey: "citationStyles",
    title: "Citation Styles for Research | Better Memory",
    description:
      "Format citations in 12 styles including APA, MLA, Chicago, AMA, ACS, IEEE, Vancouver, and Harvard. Use in literature reviews, reports, and the Cite Paper modal.",
    keywords: "citation styles, APA, MLA, Chicago, IEEE, Vancouver, Harvard, cite paper",
    h1: "Twelve citation styles for your research output",
    subheadline:
      "Apply APA, MLA, Chicago, AMA, ACS, IEEE, Vancouver, Harvard, and more in literature reviews, reports, and when citing papers—then verify before submitting.",
    conversionPromise:
      "Create a free account to format citations in the style your field requires.",
    proofBullets: [
      "Twelve styles: APA, MLA, Chicago, AMA, ACS, IEEE, Vancouver, Harvard, and others",
      "Available in literature reviews and reports",
      "Cite Paper modal for quick references",
      "Always verify formatted citations against official guides",
    ],
    sourceToOutput: {
      source: "A set of imported journal articles",
      output: "Bibliography entries in your chosen citation style",
    },
    faqs: [
      {
        question: "Which citation styles are supported?",
        answer:
          "The product supports twelve styles, including APA, MLA, Chicago, AMA, ACS, IEEE, Vancouver, and Harvard. See in-app options for the full list.",
      },
      {
        question: "Where can I use citation formatting?",
        answer:
          "Styles apply in literature review and report outputs, and in the Cite Paper modal when referencing notebook sources.",
      },
      {
        question: "Are automated citations always correct?",
        answer:
          "No. Automated formatting can miss edge cases. Check each citation against your style manual before submitting formal work.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Citation Styles",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/research/ai-literature-review",
    cluster: "research",
    intentKey: "literatureReview",
    title: "AI Literature Review Tool — Generator Free | Better Memory",
    description:
      "Free AI literature review tool: import papers, screen and rank your reading list, and generate synthesis drafts across your sources. A research aid—not a systematic review replacement.",
    keywords:
      "ai literature review tool, ai literature review generator, ai for literature review, ai tools for literature review, free ai literature review",
    h1: "AI literature review tool for your paper set",
    subheadline:
      "Import papers, screen and rank sources, and use AI to draft literature review synthesis—grounded in the documents you add to your notebook.",
    conversionPromise:
      "Sign up free to run the AI literature review generator on your imported papers.",
    proofBullets: [
      "AI literature review mode across notebook sources",
      "Screening and ranking to prioritize papers",
      "Synthesis drafts with themes and gaps noted",
      "Twelve citation styles for formatted references",
      "Not a substitute for formal systematic review methods",
    ],
    sourceToOutput: {
      source: "Twenty papers on a narrow research question",
      output: "A structured synthesis draft with themes and gaps noted",
    },
    faqs: [
      {
        question: "Is there a free AI literature review tool?",
        answer:
          "Yes. Better Memory offers a free tier so you can import papers and run literature review mode on your reading list. Paid plans raise notebook and generation limits.",
      },
      {
        question: "How does the AI literature review generator work?",
        answer:
          "Add papers to a research notebook, then run literature review mode to screen, rank, and synthesize across your collection. Output is a draft you should verify against the original PDFs.",
      },
      {
        question: "Is this a systematic review tool?",
        answer:
          "No. It assists with screening, ranking, and synthesis, but does not replace preregistered systematic review protocols or exhaustive search requirements.",
      },
      {
        question: "What sources does literature review use?",
        answer:
          "It works on papers and documents you have added to the notebook, including imports and discoveries.",
      },
      {
        question: "Should I cite the synthesis directly?",
        answer:
          "Treat output as a draft. Edit, verify claims against originals, and follow your institution's integrity rules.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Literature Review",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/research/chat-with-papers",
    cluster: "research",
    intentKey: "chat",
    title: "Chat with Your Papers | Better Memory",
    description:
      "Ask questions across notebook sources and get answers that reference your materials. Grounded chat for research reading—not a guarantee of completeness.",
    keywords: "chat with PDF, research chat, grounded answers, paper Q&A, notebook chat",
    h1: "Chat with papers across your notebook",
    subheadline:
      "Ask questions over your sources and see responses tied to your uploaded and imported materials.",
    conversionPromise: "Create a free account to chat with your first paper or reading set.",
    proofBullets: [
      "Chat across multiple sources in one notebook",
      "Responses aim to reference your materials",
      "Useful while reading and annotating",
      "Verify important claims against the original PDFs",
    ],
    sourceToOutput: {
      source: "Five PDFs for a seminar paper",
      output: "Answers with pointers back to relevant passages",
    },
    faqs: [
      {
        question: "Does chat only use my notebook sources?",
        answer:
          "Chat is grounded in the sources you include in the conversation context for that notebook, not the open web by default.",
      },
      {
        question: "Can chat miss information in long PDFs?",
        answer:
          "Yes. Very long or dense documents may not surface every detail. Open the source when accuracy matters.",
      },
      {
        question: "Should I trust chat for citations without checking?",
        answer:
          "No. Confirm quotes, page references, and interpretations in the original documents before citing.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Chat with PDF",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/research/deep-research",
    cluster: "research",
    intentKey: "deepResearch",
    title: "Deep Research Reports | Better Memory",
    description:
      "Run multi-step research that combines web search with your notebook sources and produces a report draft for you to refine.",
    keywords: "deep research, research report, web search, multi-step research, draft report",
    h1: "Deep research that combines web and your sources",
    subheadline:
      "Multi-step workflows search the web and your notebook, then assemble a report draft you can edit and verify.",
    conversionPromise:
      "Start free and run deep research on a question using your notebook plus the web.",
    proofBullets: [
      "Multi-step research across web and notebook sources",
      "Produces a structured report draft",
      "Combines external findings with your imported papers",
      "Review and edit before treating as final output",
    ],
    sourceToOutput: {
      source: "A research question plus ten notebook papers",
      output: "A multi-section report draft with web and source context",
    },
    faqs: [
      {
        question: "What does deep research do differently from chat?",
        answer:
          "Deep research runs a longer, multi-step process that searches the web and synthesizes findings into a report draft, not just short answers.",
      },
      {
        question: "Does it use my notebook sources?",
        answer:
          "Yes. It can combine web results with papers and documents already in your notebook.",
      },
      {
        question: "Is the report ready to publish as-is?",
        answer:
          "No. Treat it as a draft. Check facts, citations, and bias before sharing or submitting.",
      },
    ],
    ctaLabel: "Create free account",
    navLabel: "Deep Research",
    changefreq: "weekly",
    priority: 0.9,
  },
];

const INTENT_LANDING_ZH: Record<string, Partial<IntentLandingLocalizedFields>> = {
  "/students/upload-sources": {
    title: "上传学习资料 | Better Memory",
    description:
      "将 PDF、Word 文档、幻灯片、图片、音频、视频转录、Google Drive 文件或粘贴文本加入笔记本，把课程材料集中到一处。",
    keywords: "上传 PDF, 学习资料, YouTube 转录, Google Drive, 粘贴文本, 课程材料",
    h1: "把所有学习资料放进同一个地方",
    subheadline:
      "把讲义、阅读材料和媒体加入笔记本，然后基于自己的内容进行搜索、聊天并生成学习材料。",
    conversionPromise: "创建免费账户，几分钟内添加第一批资料，无需信用卡。",
    proofBullets: [
      "支持 PDF、Word、PowerPoint、图片和音频文件",
      "从 YouTube、TikTok、Instagram 和 X 导入转录文本",
      "连接 Google Drive，或直接粘贴文本",
      "在笔记本和文件夹中整理来源",
    ],
    sourceToOutput: {
      source: "一组课堂 PDF 和一段 YouTube 复习视频",
      output: "可搜索的来源，可用于闪卡、测验和聊天",
    },
    faqs: [
      {
        question: "可以上传哪些文件类型？",
        answer:
          "你可以上传 PDF、Word 文档、PowerPoint 幻灯片、图片和音频文件，也可以粘贴纯文本，或从受支持的视频和社交平台导入转录文本。",
      },
      {
        question: "可以从 Google Drive 导入吗？",
        answer: "可以。你可以连接 Google Drive，把文件拉入笔记本，无需先下载到本地设备。",
      },
      {
        question: "可以添加多少个来源？",
        answer:
          "免费账户包含笔记本和每个笔记本的来源数量限制。Pro 方案会提高笔记本额度。当前限制请查看价格页面。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "上传来源",
  },
  "/students/discover-sources": {
    title: "发现学习用网页来源 | Better Memory",
    description:
      "查找可加入笔记本的网页和新闻文章。搜索通用网页或财经频道，每次搜索最多导入 20 条结果。",
    keywords: "发现来源, 网页搜索, 新闻文章, 学习研究, 财经新闻",
    h1: "为你的笔记本发现网页和新闻来源",
    subheadline: "搜索网页或新闻频道，预览结果，并把相关页面加入笔记本，用于阅读和生成内容。",
    conversionPromise: "创建免费账户，运行来源发现搜索，并把结果与你的上传资料放在一起。",
    proofBullets: [
      "搜索通用网页或新闻频道",
      "财经频道适合市场和商业主题",
      "添加到笔记本前可预览结果",
      "每次发现搜索最多 20 条结果",
    ],
    sourceToOutput: {
      source: "在新闻频道中搜索气候政策主题",
      output: "最多 20 篇导入文章，可用于总结或测验",
    },
    faqs: [
      {
        question: "一次可以导入多少条结果？",
        answer: "每次发现搜索最多返回 20 条结果。你可以选择要加入笔记本的项目。",
      },
      {
        question: "财经频道是什么？",
        answer: "财经频道会把发现范围聚焦在商业和市场新闻来源，适合经济学和金融课程。",
      },
      {
        question: "发现的页面会成为笔记本中的完整来源吗？",
        answer:
          "会。选中的结果会作为来源加入，你可以像使用上传文件一样阅读、搜索、聊天和生成 Studio 内容。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "发现来源",
  },
  "/students/share-notebooks": {
    title: "与同学分享笔记本 | Better Memory",
    description: "通过查看链接与同伴分享笔记本，或允许他人复制一份。无需继续分享时可以撤销访问。",
    keywords: "分享笔记本, 学习小组, 复制笔记本, 协作, 撤销链接",
    h1: "与同学或学习小组分享笔记本",
    subheadline: "发送只读链接，或让他人复制自己的副本。你保留控制权，并可随时撤销分享。",
    conversionPromise: "免费注册，创建笔记本并生成第一条分享链接。",
    proofBullets: [
      "同伴链接可只读访问你的笔记本",
      "复制链接让他人获得可编辑的独立副本",
      "项目结束后可以撤销分享",
      "共享查看者可看到你已添加的来源和内容",
    ],
    sourceToOutput: {
      source: "包含阅读材料和笔记的共享课程笔记本",
      output: "同学可打开或复制到自己账户的链接",
    },
    faqs: [
      {
        question: "协作链接和复制链接有什么区别？",
        answer:
          "协作链接让他人查看你的笔记本。复制链接会在对方账户中创建独立副本，对方编辑不会影响你的原始笔记本。",
      },
      {
        question: "之后可以停止分享吗？",
        answer: "可以。你可以随时撤销分享链接。撤销后的链接不再授予访问权限。",
      },
      {
        question: "被分享的人需要账户吗？",
        answer:
          "查看共享笔记本通常需要账户。复制笔记本一定需要登录，这样副本才能保存到对方工作区。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "分享笔记本",
  },
  "/students/ai-flashcards": {
    title: "从 PDF 生成 AI 闪卡 | Better Memory",
    description:
      "在线从 PDF 制作 AI 闪卡：上传阅读材料，生成基于来源的卡组草稿，编辑卡片，并在笔记本中学习。",
    keywords: "PDF 生成 AI 闪卡, PDF 转闪卡, AI 闪卡生成器, 从 PDF 制作闪卡",
    h1: "几分钟内从 PDF 制作 AI 闪卡",
    subheadline: "上传 PDF 或课堂笔记，在线生成闪卡，检查卡组草稿，并在笔记本中用间隔复习学习。",
    conversionPromise: "创建免费账户，上传 PDF，并在线生成第一套闪卡。",
    proofBullets: [
      "从 PDF 和笔记本中的其他来源生成闪卡",
      "免费开始，在线上传、生成和学习",
      "学习前可检查和编辑每张卡片",
      "内置带间隔复习的学习视图",
    ],
    sourceToOutput: {
      source: "一章 PDF 和课堂幻灯片",
      output: "一套包含正反面内容的闪卡草稿",
    },
    faqs: [
      {
        question: "可以免费从 PDF 制作 AI 闪卡吗？",
        answer:
          "可以。Better Memory 提供免费层级，你可以上传 PDF、生成闪卡草稿并在线学习。付费方案会提高笔记本和生成额度。",
      },
      {
        question: "如何在线从 PDF 生成闪卡？",
        answer:
          "创建笔记本，上传 PDF，选择来源，然后运行 Flashcards 工具。Better Memory 会从文档中起草卡片，你可以在学习前编辑。",
      },
      {
        question: "生成后可以编辑卡片吗？",
        answer: "可以。卡组会以草稿形式打开，你可以修改措辞、删除卡片或添加自己的内容。",
      },
      {
        question: "闪卡会绑定到我上传的来源吗？",
        answer: "生成会使用你在笔记本中选择的来源，因此卡片反映的是你的材料，而不是泛泛的主题。",
      },
      {
        question: "它和其他 AI 闪卡生成器有什么不同？",
        answer:
          "Better Memory 会把闪卡保存在同一个笔记本中，并与测验、思维导图、音频概览和聊天一起使用，不需要为每种学习格式切换工具。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "闪卡",
  },
  "/students/ai-quizzes": {
    title: "AI 选择题测验 | Better Memory",
    description:
      "从你的来源创建选择题测验。设置题目数量、难度和重点范围。短答和论文题请使用单独的 Written Questions 工具。",
    keywords: "AI 测验, 选择题, 练习测试, 考试复习, 学习测验",
    h1: "从学习材料生成选择题测验",
    subheadline:
      "生成可配置题量、难度和主题重点的练习测验，全部为选择题。短答或论文考试请使用 Written Questions。",
    heroCrossLink: {
      path: "/students/ai-written-questions",
      label: "在准备论文题或短答题考试？",
      description:
        "Written Questions 会从你的来源生成问题，并对你提交的回答给出 AI 反馈，不是选择题。",
    },
    conversionPromise: "免费开始，从下一份阅读作业生成一套练习测验。",
    proofBullets: [
      "仅生成选择题",
      "选择题目数量、难度和重点主题",
      "基于你在笔记本中选择的来源",
      "不同于用于论文题和短答题的 Written Questions 工具",
    ],
    sourceToOutput: {
      source: "单元笔记和教材章节",
      output: "一套带答案的选择题自测",
    },
    faqs: [
      {
        question: "测验工具支持短答或论文题吗？",
        answer:
          "不支持。这个工具只创建选择题测验。短答和论文练习以及反馈，请使用 Studio 中的 Written Questions。",
      },
      {
        question: "可以控制测验难度吗？",
        answer: "可以。你可以设置难度、生成题数，以及来源中的可选重点范围。",
      },
      {
        question: "依赖生成答案前需要核对吗？",
        answer:
          "需要。尤其是高风险考试，应该根据材料检查生成的测验。自动生成的问题偶尔会不够精确。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "测验",
  },
  "/students/ai-audio-overview": {
    title: "学习用 AI 音频概览 | Better Memory",
    description:
      "收听由 AI 朗读的来源概览。选择深度讲解、简短摘要、批判分析或辩论等格式，并设置长度和重点。",
    keywords: "音频学习, 播客摘要, 听笔记, AI 朗读, 深度讲解",
    h1: "适合路上收听的音频概览",
    subheadline: "从笔记本来源生成带格式、长度和重点选项的朗读摘要。",
    conversionPromise: "创建免费账户，从下一组课堂资料生成音频概览。",
    proofBullets: [
      "格式包括深度讲解、简短摘要、批判分析和辩论",
      "可调整长度和主题重点",
      "基于笔记本中的来源",
      "准备好后可在浏览器中播放",
    ],
    sourceToOutput: {
      source: "两篇文章和一组课堂笔记",
      output: "通勤时可播放的朗读音频概览",
    },
    faqs: [
      {
        question: "有哪些音频格式？",
        answer: "你可以选择深度讲解、简短摘要、批判分析或辩论式概览，取决于你想如何复习材料。",
      },
      {
        question: "可以设置概览时长吗？",
        answer: "可以。长度和重点设置会影响朗读覆盖的细节程度。",
      },
      {
        question: "音频是根据我的来源生成的吗？",
        answer: "概览会从你在笔记本中选择的来源生成，因此朗读内容会跟随你上传的材料。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "音频概览",
  },
  "/students/ai-mind-maps": {
    title: "从来源生成 AI 思维导图 | Better Memory",
    description: "从上传来源构建可视化思维导图，查看阅读材料和课堂内容之间的概念连接。",
    keywords: "思维导图, 概念图, 可视化学习, AI 思维导图, 学习图表",
    h1: "从你的来源生成可视化思维导图",
    subheadline: "把笔记本材料中的概念和关系映射成可探索、可调整的交互式图表。",
    conversionPromise: "免费注册，把第一章或第一节课内容做成思维导图。",
    proofBullets: [
      "从所选来源生成可视化布局",
      "交互式探索分支和关系",
      "适合查看不同阅读材料之间的主题连接",
      "在笔记本中编辑和完善导图",
    ],
    sourceToOutput: {
      source: "一章信息密集的教材内容",
      output: "包含关键概念和关联的分支思维导图",
    },
    faqs: [
      {
        question: "思维导图可以使用哪些来源？",
        answer: "思维导图会使用你添加到笔记本中的文档、转录文本和文本来源。",
      },
      {
        question: "生成后可以编辑导图吗？",
        answer: "可以。生成后你可以在思维导图编辑器中调整节点和结构。",
      },
      {
        question: "它能替代手写笔记吗？",
        answer: "它是补充工具。导图能帮助你快速看到结构，但细节仍应对照原始材料核实。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "思维导图",
  },
  "/students/ai-reports": {
    title: "AI 报告和学习指南 | Better Memory",
    description:
      "从你的来源生成报告：学习指南、摘要、简报、概念解释或自定义。内容基于你选择的材料。",
    keywords: "学习指南, AI 摘要, 简报, 概念解释, 报告生成器",
    h1: "从学习材料生成报告和学习指南",
    subheadline:
      "选择报告类型，例如学习指南、摘要、简报、概念解释或自定义，然后从你的来源生成草稿。",
    conversionPromise: "创建免费账户，从课程阅读材料起草第一份学习指南。",
    proofBullets: [
      "报告类型：学习指南、摘要、简报、概念解释、自定义",
      "只使用你在笔记本中选择的来源",
      "可编辑草稿，便于分享前完善",
      "适合复习提纲和考前整理",
    ],
    sourceToOutput: {
      source: "一个考试单元的教学大纲阅读材料",
      output: "包含章节和要点的结构化学习指南草稿",
    },
    faqs: [
      {
        question: "可以创建哪些报告类型？",
        answer: "选项包括学习指南、摘要、简报、概念解释，以及用于其他结构化输出的自定义提示。",
      },
      {
        question: "报告只会引用我的来源吗？",
        answer: "生成会基于你选择的笔记本来源。提交作业前仍应核实事实和措辞。",
      },
      {
        question: "可以自定义提示吗？",
        answer: "可以。自定义报告类型允许你描述想要的结构或角度，并限定在你的来源集合内。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "报告",
  },
  "/students/ai-infographics": {
    title: "从学习来源生成 AI 信息图 | Better Memory",
    description: "从你的来源创建信息图图片。选择风格、方向和细节程度，制作可视化学习材料。",
    keywords: "信息图, 可视化摘要, 学习海报, AI 图片, 学习视觉材料",
    h1: "把学习内容可视化成信息图",
    subheadline: "将来源中的关键想法转化为图片，并可控制风格、方向和细节程度。",
    conversionPromise: "免费开始，为下一个主题生成可视化摘要。",
    proofBullets: [
      "基于笔记本来源的图片输出",
      "风格、方向和细节设置",
      "适合海报、幻灯片和快速视觉复习",
      "展示前请对照材料检查图片内容",
    ],
    sourceToOutput: {
      source: "两份讲义中解释的一个流程",
      output: "突出主要步骤的一张信息图",
    },
    faqs: [
      {
        question: "信息图可以自定义什么？",
        answer: "你可以调整风格、方向（如竖版或横版）以及包含的细节程度。",
      },
      {
        question: "信息图上的文字一定准确吗？",
        answer: "图片会根据你的来源生成，但可能简化或误标细节。用于评分作业前请对照原文核实。",
      },
      {
        question: "会得到什么文件格式？",
        answer: "信息图会以图片形式提供，你可以在笔记本中查看和下载。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "信息图",
  },
  "/students/ai-written-questions": {
    title: "带 AI 反馈的问答题练习 | Better Memory",
    description: "从你的来源练习短答题和论文题。提交回答后获得反馈，和选择题测验是不同工具。",
    keywords: "论文题练习, 短答题, 书面回答, 学习反馈, 考试练习",
    h1: "为你的回答提供反馈的问答题",
    subheadline: "从来源生成短答和论文题，写下回答并提交获取 AI 反馈，不是选择题。",
    conversionPromise: "创建免费账户，用课程材料练习书面回答。",
    proofBullets: [
      "短答题和论文题提示",
      "提交回答后获得反馈",
      "基于你选择的来源",
      "不同于选择题 Quiz 工具",
    ],
    sourceToOutput: {
      source: "历史单元的一组原始资料",
      output: "论文题提示，以及对你提交答案的反馈",
    },
    faqs: [
      {
        question: "它和 Quizzes 有什么不同？",
        answer:
          "Written Questions 专注于短答和论文回答，并对答案给出反馈。Quizzes 只生成选择题练习。",
      },
      {
        question: "反馈能代替老师或评分者吗？",
        answer: "不能。反馈是学习辅助，用来发现薄弱点和改进草稿，不是最终评分。",
      },
      {
        question: "可以选择题目长度吗？",
        answer: "可以。你可以根据工具配置生成短答题或更长的论文式问题。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "问答题",
  },
  "/students/ai-spreadsheets": {
    title: "从来源生成 AI 电子表格 | Better Memory",
    description:
      "从你的来源提取结构化数据到电子表格。模式包括数据提取、比较、时间线、财务和自定义布局。",
    keywords: "电子表格, 数据提取, 比较表, 时间线, 学习数据",
    h1: "用电子表格整理来源中的数据",
    subheadline: "从阅读材料中提取结构化表格，例如比较、时间线、财务或自定义格式，便于分析和复习。",
    conversionPromise: "免费注册，从一组阅读材料中提取第一张表格。",
    proofBullets: [
      "模式：数据提取、比较、时间线、财务、自定义",
      "行列基于所选来源",
      "比从 PDF 手动复制数据更轻松",
      "请对照原文核查提取值",
    ],
    sourceToOutput: {
      source: "三份 PDF 中的案例研究和数据",
      output: "按案例列出关键指标的比较表格",
    },
    faqs: [
      {
        question: "有哪些电子表格模式？",
        answer: "你可以根据来源需求使用数据提取、比较、时间线、财务或自定义布局。",
      },
      {
        question: "提取的数字可以不核对就使用吗？",
        answer: "不建议。尤其是作业和考试，请始终对照源文档核实提取数据。",
      },
      {
        question: "可以导出电子表格吗？",
        answer: "你可以在笔记本中处理生成的表格，并根据产品支持的格式进行导出。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "电子表格",
  },
  "/research/academic-paper-discovery": {
    title: "学术论文发现 | Better Memory",
    description:
      "使用年份、引用数、开放获取和领域筛选条件搜索学术文献。导入论文记录，并按 DOI 和 OpenAlex 去重。",
    keywords: "论文发现, 学术搜索, OpenAlex, DOI, 文献搜索",
    h1: "为研究笔记本发现学术论文",
    subheadline: "搜索学术频道，按年份、引用数、开放获取和领域筛选，然后导入去重后的论文记录。",
    conversionPromise: "创建免费账户，搜索学术文献并保存到笔记本。",
    proofBullets: [
      "面向学术的发现频道",
      "筛选条件：年份、引用数、开放获取、领域",
      "将结构化论文记录导入笔记本",
      "按 DOI 和 OpenAlex 标识符去重",
    ],
    sourceToOutput: {
      source: "关于生物学论文中 Transformer 架构的查询",
      output: "可阅读和引用的导入论文记录",
    },
    faqs: [
      {
        question: "去重如何工作？",
        answer:
          "导入论文时，具有相同 DOI 或 OpenAlex ID 的记录会被视为重复项，帮助保持笔记本整洁。",
      },
      {
        question: "可以只筛选开放获取论文吗？",
        answer: "可以。开放获取是导入结果前可应用的筛选条件之一。",
      },
      {
        question: "论文发现能替代完整系统综述吗？",
        answer: "不能。它能帮助你快速查找和收集论文。正式系统综述仍需要明确方案和穷尽式检索策略。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "论文发现",
  },
  "/research/import-papers": {
    title: "导入研究论文 | Better Memory",
    description:
      "通过 DOI、BibTeX、RIS、Zotero、Mendeley 或手动录入导入论文，在研究笔记本中构建阅读清单。",
    keywords: "导入论文, DOI, BibTeX, RIS, Zotero, Mendeley, 文献管理器",
    h1: "从 DOI、BibTeX 和文献管理器导入论文",
    subheadline:
      "通过 DOI、BibTeX、RIS、Zotero、Mendeley 或手动元数据导入文献，然后在同一笔记本中阅读和处理。",
    conversionPromise: "免费开始，通过 DOI 或参考文献文件导入第一篇论文。",
    proofBullets: [
      "支持 DOI、BibTeX、RIS、Zotero 或 Mendeley 导入",
      "元数据不完整时可手动录入",
      "论文会成为研究笔记本中的来源",
      "可与发现和聊天工具结合使用",
    ],
    sourceToOutput: {
      source: "某个项目的 Zotero 文献库导出",
      output: "带元数据的论文来源附加到你的笔记本",
    },
    faqs: [
      {
        question: "支持哪些导入格式？",
        answer: "你可以使用 DOI 查询、BibTeX、RIS、Zotero、Mendeley 集成，或手动输入详情。",
      },
      {
        question: "每次导入都需要 PDF 吗？",
        answer: "元数据导入可以添加论文记录；有 PDF 时可以附加全文，用于阅读和聊天。",
      },
      {
        question: "可以把导入论文和发现论文混合使用吗？",
        answer: "可以。导入和发现的论文会和上传文件一起存在同一个笔记本中。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "导入论文",
  },
  "/research/citation-styles": {
    title: "研究引用格式 | Better Memory",
    description:
      "支持 APA、MLA、Chicago、AMA、ACS、IEEE、Vancouver、Harvard 等 12 种引用格式，可用于文献综述、报告和 Cite Paper 弹窗。",
    keywords: "引用格式, APA, MLA, Chicago, IEEE, Vancouver, Harvard, 引用论文",
    h1: "为研究输出提供 12 种引用格式",
    subheadline:
      "在文献综述、报告和论文引用中应用 APA、MLA、Chicago、AMA、ACS、IEEE、Vancouver、Harvard 等格式，并在提交前核验。",
    conversionPromise: "创建免费账户，按你所在领域要求的格式生成引用。",
    proofBullets: [
      "12 种格式：APA、MLA、Chicago、AMA、ACS、IEEE、Vancouver、Harvard 等",
      "可用于文献综述和报告",
      "Cite Paper 弹窗可快速生成参考文献",
      "请始终根据官方指南核对格式化引用",
    ],
    sourceToOutput: {
      source: "一组导入的期刊文章",
      output: "按所选引用格式生成的参考文献条目",
    },
    faqs: [
      {
        question: "支持哪些引用格式？",
        answer:
          "产品支持 12 种格式，包括 APA、MLA、Chicago、AMA、ACS、IEEE、Vancouver 和 Harvard。完整列表请查看应用内选项。",
      },
      {
        question: "在哪里可以使用引用格式？",
        answer: "引用格式可用于文献综述和报告输出，也可在 Cite Paper 弹窗中引用笔记本来源。",
      },
      {
        question: "自动引用一定正确吗？",
        answer: "不一定。自动格式化可能遗漏特殊情况。正式提交前请根据格式手册检查每条引用。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "引用格式",
  },
  "/research/ai-literature-review": {
    title: "AI 文献综述工具 | Better Memory",
    description:
      "免费 AI 文献综述工具：导入论文，筛选和排序阅读清单，并跨来源生成综合草稿。它是研究辅助，不替代系统综述。",
    keywords: "AI 文献综述工具, AI 文献综述生成器, AI 辅助文献综述, 免费 AI 文献综述",
    h1: "面向你的论文集合的 AI 文献综述工具",
    subheadline:
      "导入论文，筛选和排序来源，并使用 AI 起草基于你添加到笔记本中的文档的文献综述综合内容。",
    conversionPromise: "免费注册，在导入论文上运行 AI 文献综述生成器。",
    proofBullets: [
      "跨笔记本来源的 AI 文献综述模式",
      "筛选和排序以优先处理论文",
      "生成包含主题和研究空白的综合草稿",
      "12 种引用格式用于格式化参考文献",
      "不替代正式系统综述方法",
    ],
    sourceToOutput: {
      source: "围绕一个窄研究问题的 20 篇论文",
      output: "标注主题和空白的结构化综合草稿",
    },
    faqs: [
      {
        question: "有免费的 AI 文献综述工具吗？",
        answer:
          "有。Better Memory 提供免费层级，你可以导入论文，并在阅读清单上运行文献综述模式。付费方案会提高笔记本和生成额度。",
      },
      {
        question: "AI 文献综述生成器如何工作？",
        answer:
          "将论文添加到研究笔记本，然后运行文献综述模式，对论文集合进行筛选、排序和综合。输出是草稿，应对照原始 PDF 核实。",
      },
      {
        question: "这是系统综述工具吗？",
        answer: "不是。它辅助筛选、排序和综合，但不能替代预注册系统综述方案或穷尽式检索要求。",
      },
      {
        question: "文献综述会使用哪些来源？",
        answer: "它会使用你添加到笔记本中的论文和文档，包括导入和发现的来源。",
      },
      {
        question: "可以直接引用综合结果吗？",
        answer: "请把输出当作草稿。编辑内容、核实原文中的说法，并遵守你所在机构的学术诚信规则。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "文献综述",
  },
  "/research/chat-with-papers": {
    title: "与你的论文聊天 | Better Memory",
    description:
      "跨笔记本来源提问，并获得引用你材料的回答。适合研究阅读的基于来源聊天，但不保证完整性。",
    keywords: "与 PDF 聊天, 研究聊天, 基于来源的回答, 论文问答, 笔记本聊天",
    h1: "跨笔记本论文进行聊天",
    subheadline: "围绕你的来源提问，查看与你上传和导入材料相关的回答。",
    conversionPromise: "创建免费账户，开始与第一篇论文或阅读材料聊天。",
    proofBullets: [
      "在一个笔记本中跨多个来源聊天",
      "回答会尽量引用你的材料",
      "适合阅读和批注时使用",
      "重要说法请对照原始 PDF 核实",
    ],
    sourceToOutput: {
      source: "一篇研讨论文所需的五份 PDF",
      output: "带有相关段落指向的回答",
    },
    faqs: [
      {
        question: "聊天只会使用我的笔记本来源吗？",
        answer: "聊天默认基于该笔记本当前对话上下文中包含的来源，而不是开放网页。",
      },
      {
        question: "聊天会漏掉长 PDF 中的信息吗？",
        answer: "会。非常长或密集的文档可能不会呈现所有细节。准确性重要时请打开原始来源。",
      },
      {
        question: "引用前可以不核对聊天结果吗？",
        answer: "不建议。引用前请在原始文档中确认引文、页码引用和解释。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "与 PDF 聊天",
  },
  "/research/deep-research": {
    title: "深度研究报告 | Better Memory",
    description: "运行多步骤研究，将网页搜索与你的笔记本来源结合，生成可进一步完善的报告草稿。",
    keywords: "深度研究, 研究报告, 网页搜索, 多步骤研究, 报告草稿",
    h1: "结合网页和你的来源进行深度研究",
    subheadline: "多步骤流程会搜索网页和你的笔记本，然后组装成可编辑、可核验的报告草稿。",
    conversionPromise: "免费开始，用你的笔记本和网页围绕一个问题运行深度研究。",
    proofBullets: [
      "跨网页和笔记本来源的多步骤研究",
      "生成结构化报告草稿",
      "把外部发现与你导入的论文结合",
      "作为最终输出前请审阅和编辑",
    ],
    sourceToOutput: {
      source: "一个研究问题加上十篇笔记本论文",
      output: "包含网页和来源上下文的多章节报告草稿",
    },
    faqs: [
      {
        question: "深度研究和聊天有什么不同？",
        answer: "深度研究会运行更长的多步骤流程，搜索网页并将发现综合成报告草稿，而不只是短回答。",
      },
      {
        question: "它会使用我的笔记本来源吗？",
        answer: "会。它可以把网页结果与你笔记本中已有的论文和文档结合起来。",
      },
      {
        question: "报告可以直接发布吗？",
        answer: "不能。请把它当作草稿。分享或提交前请检查事实、引用和偏见。",
      },
    ],
    ctaLabel: "创建免费账户",
    navLabel: "深度研究",
  },
};

function localizeIntentPage(
  page: IntentLandingPageSourceConfig,
  locale: LandingLocale = "en"
): IntentLandingPageConfig {
  if (locale === "en") {
    const { localized: _localized, ...base } = page;
    return base;
  }

  const localized = page.localized?.[locale] ?? INTENT_LANDING_ZH[page.path];
  if (!localized) {
    const { localized: _localized, ...base } = page;
    return base;
  }

  const { localized: _localized, ...base } = page;
  return { ...base, ...localized };
}

export const INTENT_LANDING_PAGES: IntentLandingPageConfig[] = INTENT_LANDING_PAGE_SOURCES.map(
  (page) => localizeIntentPage(page)
);

export function getIntentPagesByCluster(
  cluster: IntentLandingCluster,
  locale: LandingLocale = "en"
): IntentLandingPageConfig[] {
  return INTENT_LANDING_PAGE_SOURCES.filter((page) => page.cluster === cluster).map((page) =>
    localizeIntentPage(page, locale)
  );
}

export function getIntentLandingPageByPath(
  path: string,
  locale: LandingLocale = "en"
): IntentLandingPageConfig | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const page = INTENT_LANDING_PAGE_SOURCES.find((entry) => entry.path === normalized);
  return page ? localizeIntentPage(page, locale) : undefined;
}

export function getIntentLandingPaths(): string[] {
  return INTENT_LANDING_PAGES.map((page) => page.path);
}

export function isIntentLandingPath(path: string): boolean {
  return getIntentLandingPageByPath(path) !== undefined;
}

export const CLUSTER_HUB_PATHS: Record<IntentLandingCluster, string> = {
  students: "/students",
  research: "/research",
};

export const CLUSTER_HUB_LABELS: Record<IntentLandingCluster, string> = {
  students: "Students",
  research: "Research",
};

export type IntentBreadcrumbItem = {
  name: string;
  path: string;
};

export function getIntentBreadcrumbItems(
  page: IntentLandingPageConfig,
  locale: LandingLocale = "en"
): IntentBreadcrumbItem[] {
  const isZh = locale === "zh";
  const clusterLabel = isZh
    ? page.cluster === "students"
      ? "学生"
      : "研究"
    : CLUSTER_HUB_LABELS[page.cluster];
  return [
    { name: isZh ? "首页" : "Home", path: "/" },
    { name: clusterLabel, path: CLUSTER_HUB_PATHS[page.cluster] },
    { name: page.navLabel, path: page.path },
  ];
}

function getClusterFeatureIntentKeys(cluster: IntentLandingCluster): string[] {
  return Object.keys(FEATURE_INTENT_PATHS).filter((key) => {
    const path = FEATURE_INTENT_PATHS[key];
    if (!path) return false;
    const intentPage = INTENT_LANDING_PAGE_SOURCES.find((entry) => entry.path === path);
    return intentPage?.cluster === cluster;
  });
}

export function getRelatedIntentPages(
  page: IntentLandingPageConfig,
  maxCount = 3,
  locale: LandingLocale = "en"
): IntentLandingPageConfig[] {
  const clusterKeys = getClusterFeatureIntentKeys(page.cluster);
  const currentIndex = clusterKeys.indexOf(page.intentKey);
  if (currentIndex === -1) return [];

  const related: IntentLandingPageConfig[] = [];
  for (let offset = 1; related.length < maxCount && offset < clusterKeys.length; offset++) {
    for (const delta of [-offset, offset] as const) {
      const index = currentIndex + delta;
      if (index < 0 || index >= clusterKeys.length) continue;

      const path = FEATURE_INTENT_PATHS[clusterKeys[index]!];
      if (!path || path === page.path) continue;

      const relatedPage = getIntentLandingPageByPath(path, locale);
      if (relatedPage && !related.some((entry) => entry.path === relatedPage.path)) {
        related.push(relatedPage);
        if (related.length >= maxCount) break;
      }
    }
  }

  return related;
}
