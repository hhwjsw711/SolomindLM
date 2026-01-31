# SolomindLM

AI-powered research platform with multi-source content ingestion, RAG-based chat, and automated content generation.

## Features

### Content Ingestion
- **Multi-format uploads**: PDF, TXT, MD, DOCX, Images, Audio files
- **Web scraping**: Extract content from any URL
- **Social media transcripts**: YouTube, TikTok, Instagram, X (Twitter)
- **Web discovery**: Search and add sources using Tavily API
- **Text input**: Direct text paste support

### AI Tools
- **Chat**: RAG-powered chat with citation support and streaming responses
- **Reports**: Generate reports in multiple formats:
  - Briefing Document, Study Guide, Blog Post, Summary
  - Technical Report, Concept Explainer, Methodology Overview, Custom
- **Flashcards**: AI-generated study cards with configurable difficulty
- **Quizzes**: Interactive multiple-choice quizzes with hints and scoring
- **Mind Maps**: Visual knowledge graphs using Mind Elixir
- **Audio Overviews**: Convert content to audio summaries using Eleven Labs
- **Slide Decks**: Generate presentation slides from research
- **Spreadsheets**: Data analysis and spreadsheet generation
- **Written Questions**: Educational question generation from sources

### Organization
- **Notebooks**: Create and organize research with custom icons and colors
- **Sources Panel**: Track and manage all your sources
- **Status Tracking**: Real-time updates for background generation jobs

## Tech Stack

### Frontend
- React 19.2, Vite, TypeScript
- TailwindCSS 4.x, Radix UI components (lucide-react)
- React Router DOM 7.x for routing
- Mind Elixir 5.x (mind maps), React Flip Toolkit (flashcards)
- Stripe for billing
- React Markdown with KaTeX (math rendering)

### Backend
- Convex 1.31+ (backend, auth, storage, real-time)
- Bun runtime, TypeScript, LangChain
- @convex-dev/auth for authentication
- Zod for schema validation
- @convex-dev/persistent-text-streaming for streaming

### AI Services
- **LLMs**: Qwen3 80B (smart model), Mistral (fast model)
- **Embeddings**: LangChain integration
- **Reranking**: ZeroEntropy
- **OCR**: Mistral for images
- **Web Search**: Tavily API
- **Content Extraction**: Supadata (YouTube, TikTok, Instagram, X, web scraping)
- **Audio**: Eleven Labs (shimmer, echo voices)

## Project Structure

```
SolomindLM/
├── apps/
│   └── web/                        # React frontend
│       └── src/
│           ├── features/
│           │   ├── auth/           # Authentication with @convex-dev/auth
│           │   ├── billing/        # Stripe subscription management
│           │   ├── chat/           # Chat interface with citations & streaming
│           │   ├── notebooks/      # Notebook management
│           │   ├── sources/        # Source discovery and management
│           │   └── studio/         # AI generation tools (reports, flashcards, quizzes, etc.)
│           └── shared/
│               └── types/          # Shared TypeScript types
├── convex/                         # Convex backend
│   ├── auth/                       # Authentication configuration
│   ├── jobs/                       # Generation jobs (reports, flashcards, quizzes, etc.)
│   ├── storage/                    # Vector store, chat history
│   └── *.ts                        # Functions, schema, mutations
├── lib/                            # Shared agents & utilities (used by Convex)
│   └── services/
│       ├── agents/                 # AI agents for different content types
│       ├── processing/             # Content processing utilities
│       └── shared/                 # Common agent utilities
├── bun.lockb
└── package.json                    # Workspace configuration
```

## Setup

### Prerequisites
- **Bun** v1.0+ (install: `curl -fsSL https://bun.sh/install | bash`)

### 1. Install dependencies
```bash
bun install
```

### 2. Configure environment

- **Convex**: Copy `.env.example` to `.env` in the project root and set:
  - `CONVEX_DEPLOYMENT` – your Convex deployment URL
  - AI service keys (Qwen, Mistral, Tavily, Supadata, Eleven Labs, etc.)

- **Web**: Copy `apps/web/.env.example` to `apps/web/.env` and set:
  - `VITE_CONVEX_URL` – your Convex deployment URL (e.g. `https://your-deployment.convex.cloud`)
  - `VITE_CONVEX_SITE_URL` – Convex site URL for HTTP actions (e.g. `https://your-deployment.convex.site`), or omit and it will be derived from `VITE_CONVEX_URL`.

**Dev vs prod:** Convex dev and prod deployments have different URLs. Use dev URLs in `apps/web/.env.local` when running locally; set **prod** `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL` in your production hosting (e.g. Vercel env vars) so the production build talks to your prod Convex deployment.

### 3. Start the application

```bash
# Terminal 1: Convex
bunx convex dev

# Terminal 2: Web
bun run dev:web
```

Open http://localhost:5173

### Additional Commands

```bash
# Build for production
bun run build:prod

# Push Convex env vars (from .env)
bun run convex:env:push

# Deploy to Vercel
vercel deploy
```

## Architecture

### Content Processing Pipeline

1. **Ingestion**: Upload file/URL/text → Stored in Convex storage
2. **Extraction**: Convex job extracts content
   - Images → Mistral OCR
   - Videos/Social → Supadata (transcripts)
   - Web → Supadata (scraping)
3. **Splitting**: Chunk content with smart strategies per content type
4. **Embedding**: Vectors stored in Convex with hybrid search support
5. **Reranking**: ZeroEntropy reranks results for relevance

### Generation Pipeline

1. **Request**: User selects format and sources
2. **Job Creation**: Convex action/mutation queues the job
3. **Processing**: LangChain agent generates content using RAG
4. **Streaming**: Real-time response streaming via persistent text streaming
5. **Delivery**: Generated content displayed when complete

### Authentication

- Uses `@convex-dev/auth` for secure authentication
- OTT (One-Time Token) handler for API routes
- CORS handling for Convex site integration
