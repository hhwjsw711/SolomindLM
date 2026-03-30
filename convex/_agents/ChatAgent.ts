"use node"
/**
 * Chat Agent Service
 *
 * Orchestrates chat responses using a constrained tool-calling loop:
 * 1. LLM decides what to search for (search_documents / ask_clarification tools)
 * 2. HyDE embedding improves retrieval quality
 * 3. Structured generation with citations
 * 4. Grounding validation with one retry on failure
 * 5. Follow-up question generation
 */

import { env } from '../_lib/env';
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';

import { VectorSearchHandler } from './chat/vector_search.js';
import { ChatLLMWrapper, type ChatResponse } from './chat/llm_wrapper.js';
import { validateGrounding, validateSemanticGrounding } from './chat/grounding_validator.js';
import { EmbeddingService } from '../_services/processing/EmbeddingServiceClient';
import type { ReferenceChunk } from '../storage/ChatHistoryService';

// ============================================================
// Types
// ============================================================

export interface ChatAgentContext {
  userId: string;
  noteId: string;
  conversationHistory: Array<{ role: string; content: string }>;
  documentIds?: string[];
}

export interface StreamChunk {
  type: 'token' | 'references' | 'done' | 'error' | 'warning' | 'grounding_check' | 'status' | 'tool_call' | 'followups' | 'clarification';
  data?: any;
  status?: string;
  message?: string;
}

export interface ChatAgentOptions {
  vectorSearchHandler?: VectorSearchHandler;
}

// ============================================================
// Constants
// ============================================================

const MAX_SEARCH_ITERATIONS = 3;

/** HyDE + embed + hybrid search must finish before Convex action limits kill the stream (client saw only `searching` then disconnect). */
const SEARCH_PIPELINE_TIMEOUT_MS = parseInt(
  process.env.CHAT_SEARCH_PIPELINE_TIMEOUT_MS ?? '70000',
  10
);
const FOLLOWUP_GENERATION_TIMEOUT_MS = parseInt(
  process.env.CHAT_FOLLOWUP_TIMEOUT_MS ?? '15000',
  10
);
const RESPONSE_GENERATION_TIMEOUT_MS = parseInt(
  process.env.CHAT_RESPONSE_TIMEOUT_MS ?? '90000',
  10
);

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

const TOOL_DECISION_SYSTEM_PROMPT = `You are a study assistant helping a student understand their uploaded documents.

Your job is to decide what information to retrieve before answering.

RULES:
1. You MUST call search_documents before answering any content question about the study material.
2. You may skip searching ONLY for: greetings, meta-questions about the app itself, or follow-ups already fully covered by a prior tool result in this conversation.
3. If the question is too ambiguous to search effectively, call ask_clarification instead.
4. When calling search_documents, rephrase the question as a declarative statement for better retrieval (e.g. "photosynthesis converts light into chemical energy" not "How does photosynthesis work?").
5. You may call search_documents multiple times with different queries to gather comprehensive information.`;

/** OpenAI-style tool defs so LangChain/Together receive `type: "function"` (required by inference v2). */
const SEARCH_TOOL_DEF = {
  type: 'function' as const,
  function: {
    name: 'search_documents',
    description: "Search the user's uploaded documents for relevant information. Always call this before answering content questions.",
    parameters: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query — rephrase the user question as a declarative statement for better retrieval',
        },
      },
      required: ['query'],
    },
  },
};

const CLARIFY_TOOL_DEF = {
  type: 'function' as const,
  function: {
    name: 'ask_clarification',
    description: 'Ask the user to clarify their question when it is too ambiguous to search effectively.',
    parameters: {
      type: 'object' as const,
      properties: {
        question: {
          type: 'string',
          description: 'The clarifying question to show the user',
        },
      },
      required: ['question'],
    },
  },
};

// ============================================================
// Chat Agent Service
// ============================================================

export class ChatAgent {
  private llmWrapper: ChatLLMWrapper;
  private vectorSearch: VectorSearchHandler;
  private embeddingService: EmbeddingService;

  constructor(options?: ChatAgentOptions) {
  this.llmWrapper = new ChatLLMWrapper({
    apiKey: env.TOGETHER_AI_API_KEY,
    model: env.SMART_LLM || 'openai/gpt-oss-120b',
    temperature: parseFloat(env.CHAT_LLM_TEMPERATURE ?? '0.1'),
    fastModel: env.FAST_LLM,
    fastApiKey: env.TOGETHER_AI_API_KEY,
  });

  this.vectorSearch =
    options?.vectorSearchHandler ??
    new VectorSearchHandler({
      vectorMatchThreshold: parseFloat(env.CHAT_VECTOR_MATCH_THRESHOLD ?? '0.3'),
      vectorMatchCount: parseInt(env.CHAT_VECTOR_MATCH_COUNT ?? '25', 10),
      rerankThreshold: parseInt(env.CHAT_RERANK_THRESHOLD ?? '5', 10),
      rerankTopN: parseInt(env.CHAT_RERANK_TOP_N ?? '15', 10),
      maxResults: parseInt(env.CHAT_MAX_RESULTS ?? '7', 10),
    });

  this.embeddingService = new EmbeddingService(env.OPENAI_API_KEY);
}

  async *streamResponse(
  context: ChatAgentContext,
  userMessage: string
): AsyncGenerator<StreamChunk> {
  console.log('[ChatAgent] ========== STREAM START ==========');
  console.log(`[ChatAgent] User message: "${userMessage}"`);

  try {
    const recentTurns = context.conversationHistory.slice(-6);
    const allChunks: ReferenceChunk[] = [];

    // ============================================================
    // PHASE 1: Tool-calling loop — LLM decides what to search
    // ============================================================

    console.log('[ChatAgent] Phase 1: Tool-calling decision loop');

    const messages: BaseMessage[] = [
      new SystemMessage(TOOL_DECISION_SYSTEM_PROMPT),
      ...recentTurns.map((t) =>
        t.role === 'user' ? new HumanMessage(t.content) : new AIMessage(t.content)
      ),
      new HumanMessage(userMessage),
    ];

    const llmWithTools = this.llmWrapper.bindDecisionTools([SEARCH_TOOL_DEF, CLARIFY_TOOL_DEF]);

    let iterations = 0;
    while (iterations < MAX_SEARCH_ITERATIONS) {
      const response = await llmWithTools.invoke(messages);
      messages.push(response as AIMessage);

      const toolCalls = (response as any).tool_calls as Array<{ name: string; args: any; id?: string }> | undefined;

      if (!toolCalls || toolCalls.length === 0) {
        // LLM decided no search needed (greeting, meta-question, etc.)
        console.log('[ChatAgent] LLM skipped search — generating direct response');
        break;
      }

      for (const call of toolCalls) {
        if (call.name === 'ask_clarification') {
          const question = call.args?.question ?? 'Could you clarify your question?';
          console.log(`[ChatAgent] LLM requested clarification: "${question}"`);
          yield { type: 'clarification', data: { question } };
          yield { type: 'done' };
          return;
        }

        if (call.name === 'search_documents') {
          const query: string = call.args?.query ?? userMessage;
          console.log(`[ChatAgent] search_documents called with query: "${query}"`);

          yield { type: 'tool_call', data: { tool: 'search_documents', query, status: 'searching' } };

          let newChunks: ReferenceChunk[] = [];
          try {
            newChunks = await withTimeout(
              (async () => {
                const hydeText = await this.llmWrapper.generateHypotheticalDocument(query);
                const hydeEmbedding = await this.embeddingService.embedText(hydeText);
                return await this.vectorSearch.search(
                  context.userId,
                  context.noteId,
                  query,
                  context.documentIds,
                  hydeEmbedding
                );
              })(),
              SEARCH_PIPELINE_TIMEOUT_MS,
              'search_pipeline'
            );
          } catch (e) {
            console.warn('[ChatAgent] Search pipeline failed or timed out:', e);
            newChunks = [];
          }

          // Deduplicate by sourceId + chunkIndex
          for (const chunk of newChunks) {
            const key = `${chunk.sourceId}:${chunk.chunkIndex}`;
            if (!allChunks.some((c) => `${c.sourceId}:${c.chunkIndex}` === key)) {
              allChunks.push(chunk);
            }
          }

          console.log(`[ChatAgent] search returned ${newChunks.length} chunks (total: ${allChunks.length})`);

          yield {
            type: 'tool_call',
            data: { tool: 'search_documents', query, status: 'done', resultCount: newChunks.length },
          };

          messages.push(
            new ToolMessage({
              content: `Found ${newChunks.length} relevant passages.`,
              tool_call_id: call.id ?? `call_${iterations}`,
            })
          );
        }
      }

      iterations++;
    }

    // ============================================================
    // DIRECT RESPONSE: LLM chose not to search (no RAG needed)
    // ============================================================

    if (allChunks.length === 0) {
      console.log('[ChatAgent] No chunks — streaming direct response');
      yield { type: 'status', status: 'thinking', message: 'Generating response...' };
      const directAnswer = await this.llmWrapper.generateDirectResponse(userMessage, recentTurns);
      for (const para of directAnswer.split(/\n\n+/)) {
        if (para.trim().length > 0) {
          yield { type: 'token', data: para + '\n\n' };
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
      }
      yield { type: 'done' };
      console.log('[ChatAgent] ========== STREAM COMPLETE (direct) ==========');
      return;
    }

    // Send references so the UI can show what's being used
    yield { type: 'status', status: 'reading', message: `Reading ${allChunks.length} passages...` };
    yield { type: 'references', data: allChunks };

    // ============================================================
    // PHASE 2: Generate structured response with citations
    // ============================================================

    console.log('[ChatAgent] Phase 2: Generating grounded response');
    yield { type: 'status', status: 'thinking', message: 'Formulating answer...' };

    let structuredResponse: ChatResponse = await withTimeout(
      this.llmWrapper.generateStructuredResponse(allChunks, userMessage, recentTurns),
      RESPONSE_GENERATION_TIMEOUT_MS,
      'response_generation'
    );

    // ============================================================
    // PHASE 3: Grounding validation + one retry on failure
    // ============================================================

    console.log('[ChatAgent] Phase 3: Validating grounding');

    // Run syntactic check first (sync, free). Only run the semantic embedding
    // check (async, costs an API call) when syntactic passes.
    const syntacticValidation = validateGrounding(structuredResponse.answer_markdown, allChunks);
    const semanticValidation = syntacticValidation.isGrounded
      ? await validateSemanticGrounding(structuredResponse.answer_markdown, allChunks, this.embeddingService)
      : { isGrounded: false, issues: [], missingCitations: false };

    let isGrounded = syntacticValidation.isGrounded && semanticValidation.isGrounded;

    if (!isGrounded) {
      console.warn('[ChatAgent] Grounding failed — retrying with strict grounding');
      structuredResponse = await withTimeout(
        this.llmWrapper.generateWithStrictGrounding(allChunks, userMessage, recentTurns),
        RESPONSE_GENERATION_TIMEOUT_MS,
        'strict_grounding_retry'
      );

      // Re-validate after retry so the warning reflects the retried response
      const retrySyntactic = validateGrounding(structuredResponse.answer_markdown, allChunks);
      const retrySemantic = retrySyntactic.isGrounded
        ? await validateSemanticGrounding(structuredResponse.answer_markdown, allChunks, this.embeddingService)
        : { isGrounded: false, issues: [], missingCitations: false };
      isGrounded = retrySyntactic.isGrounded && retrySemantic.isGrounded;
    }

    // Stream final answer by paragraphs
    yield { type: 'status', status: 'generating', message: 'Generating response...' };
    const finalText = structuredResponse.answer_markdown;
    for (const para of finalText.split(/\n\n+/)) {
      if (para.trim().length > 0) {
        yield { type: 'token', data: para + '\n\n' };
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }

    // Only surface grounding warning if retry still failed
    if (!isGrounded) {
      const allIssues = [
        ...validateGrounding(structuredResponse.answer_markdown, allChunks).issues,
      ];
      yield {
        type: 'grounding_check',
        data: {
          passed: false,
          issues: allIssues,
          message: 'Note: This response may not be fully grounded in your documents',
        },
      };
    }

    if (structuredResponse.confidence !== 'high') {
      yield {
        type: 'grounding_check',
        data: {
          passed: structuredResponse.confidence !== 'low',
          issues: structuredResponse.confidence === 'low' ? ['Low confidence in source coverage'] : [],
          message: `Response confidence: ${structuredResponse.confidence}`,
        },
      };
    }

    // ============================================================
    // PHASE 4: Follow-up question suggestions
    // ============================================================

    let followUps: string[] = [];
    try {
      followUps = await withTimeout(
        this.llmWrapper.generateFollowUpQuestions(userMessage, finalText),
        FOLLOWUP_GENERATION_TIMEOUT_MS,
        'follow_up_questions'
      );
    } catch (e) {
      console.warn('[ChatAgent] Follow-up generation timed out or failed:', e);
    }
    if (followUps.length > 0) {
      yield { type: 'followups', data: followUps };
    }

    yield { type: 'done' };

    console.log('[ChatAgent] ========== STREAM COMPLETE ==========');
  } catch (error) {
    console.error('[ChatAgent] ========== ERROR ==========', error);

    let errorMessage = 'Unknown error occurred';
    let errorType = 'unknown';

    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('No results found') || error.message.includes('No relevant documents')) {
        errorType = 'no_documents';
      } else if (error.message.includes('Vector search failed') || error.message.includes('Hybrid search failed')) {
        errorType = 'search_failed';
      } else if (error.message.includes('API key')) {
        errorType = 'api_error';
      } else if (error.message.includes('Invalid document ID')) {
        errorType = 'validation_error';
      } else if (error.message.includes('timed out')) {
        errorType = 'timeout';
      }
    }

    yield { type: 'error', data: { message: errorMessage, type: errorType } };
  }
}
}

// ============================================================
// Re-exports for backward compatibility
// ============================================================

export type { ChatResponse } from './chat/llm_wrapper.js';
export { validateGrounding, isArtifactContent, validateSemanticGrounding } from './chat/grounding_validator.js';
export { VectorSearchHandler } from './chat/vector_search.js';
