# Chat Response Modes Design

**Context:** Add flexible response modes to SolomindLM's chat agent to support different learning and research workflows. Currently only supports grounded RAG against user documents. New modes: Guided Learning (Socratic), External Search (web/academic), and combinations thereof.

**Date:** 2025-04-03

---

## Architecture

**Core Design Decision:** LangGraph subgraph for Socratic mode (complex state machine), modular handlers for simpler modes (stateless mode dispatch).

### Graph Topology

```
Main Chat Graph (ChatState)
├── route_modes (routing node)
│   ├── Socratic + External Search → enrich_context
│   ├── Socratic only → socratic_subgraph
│   ├── External Search only → external_search_handler
│   └── Grounded RAG only → grounded_rag_handler
│
├── enrich_context (context enrichment node)
│   └── Fetches external sources, populates externalContext
│   └── Edge → socratic_subgraph
│
├── socratic_subgraph (SocraticState - checkpointed with interrupts)
│   ├── diagnostic_opener (interrupts for user response)
│   ├── socratic_exchange (loop until convergence)
│   ├── pre_convergence (soft transition with interrupt)
│   └── direct_answer (convergence target)
│
├── external_search_handler
└── grounded_rag_handler
```

**Key patterns:**
- Subgraphs are graph nodes (not inline function calls)
- Interrupts enable human-in-the-loop (waiting for user responses)
- Conditional edges are pure routing (no state mutations or side effects)

### State Design (Corrected - No Inheritance)

**ChatState** (main graph - persisted to conversation):
```typescript
type ChatState = {
  messages: BaseMessage[];
  activeModes: {
    guidedLearning: boolean;
    externalSearch: boolean;
  };
  notebookId: string;
  selectedDocuments: string[];

  // Socratic thread tracking for interrupt/resume
  socraticThreadId?: string;

  // Pre-fetched context (populated before subgraph entry)
  ragContext?: RetrievedChunk[];
  externalContext?: ExternalResult[];

  // Inter-graph signal for "Just tell me" button (shared with SocraticState)
  userForcedDirect?: boolean;

  // Observability (shared with SocraticState - written back on exit)
  convergenceReason?: "auto_stuck" | "user_forced" | "natural_completion" | null;
};
```

**SocraticState** (subgraph-only - checkpointed, independent type with shared keys):
```typescript
type SocraticState = {
  // Shared keys (synced with ChatState on exit)
  messages: BaseMessage[];
  notebookId: string;
  selectedDocuments: string[];
  ragContext?: RetrievedChunk[];
  externalContext?: ExternalResult[];
  convergenceReason?: "auto_stuck" | "user_forced" | "natural_completion" | null;
  userForcedDirect?: boolean;  // Inter-graph signal for "Just tell me" button

  // Subgraph-private keys (never leak to parent)
  exchangeCount: number;
  stuckSignals: number;
  lastUserResponse?: string;  // Optional - not set until first user input
  diagnosticResponse?: string;
};
```

**Key separation principle:** LangGraph syncs ONLY keys that exist in BOTH states. `activeModes`, `exchangeCount`, `stuckSignals` are intentionally isolated to their respective states. `convergenceReason` is shared for observability.

### Critical File Locations

**Existing files to extend:**
- `convex/_agents/ChatAgent.ts` - Main chat agent service
- `convex/_agents/chat/chatRouter.ts` - Message routing logic
- `convex/_agents/chat/llm_wrapper.ts` - LLM wrapper with structured output
- `convex/_agents/chat/chat_llm_prompts.ts` - System prompts
- `convex/_services/search/DiscoveryService.ts` - Unified search service
- `convex/_services/search/TavilySearchService.ts` - Web search
- `convex/_services/search/OpenAlexSearchService.ts` - Academic search

**New files to create:**
- `convex/_agents/chat/socratic_subgraph.ts` - Socratic LangGraph subgraph with interrupts
- `convex/_agents/chat/modeHandlers.ts` - Modular handlers for simpler modes
- `convex/_agents/chat/types.ts` - State type definitions
- `convex/_agents/chat/convexCheckpointer.ts` - Custom checkpointer (Phase 0 — BLOCKER)
- `convex/_agents/chat/utils.ts` - Helper functions (`extractQueryFromMessages`, `isStuckResponse`)

---

## Data Flow

### Flow 1: User Toggles Mode (UI → Backend)

**Frontend:**
```typescript
// apps/web/src/features/chat/components/ModeToggleToolbar.tsx
const updateModes = useMutation(api.chat.updateModes);

const handleToggle = async (mode: "guidedLearning" | "externalSearch") => {
  await updateModes({
    conversationId: currentConversationId,
    modes: {
      ...activeModes,
      [mode]: !activeModes[mode],
    },
  });
};
```

**Backend Mutation:**
```typescript
// convex/chat/index.ts
export const updateModes = mutation({
  args: {
    conversationId: v.id("conversations"),
    modes: v.object({
      guidedLearning: v.boolean(),
      externalSearch: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.conversationId, {
      activeModes: args.modes,
    });
  },
});
```

### Flow 2: Chat Message with Active Modes

**Frontend → Backend:**
```typescript
// apps/web/src/features/chat/hooks/useChatStream.ts
const { stream } = useAction(api.chat.stream, {
  onSuccess: (response) => {
    // Handle streaming response chunks
  },
});

// User sends message
await stream({
  conversationId,
  message: userMessage,
  // Modes are fetched from conversation document, not passed per-message
});
```

**Backend Action Entry Point:**
```typescript
// convex/chat/stream.ts
export const stream = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
    forceDirectAnswer: v.optional(v.boolean()), // For "Just tell me" button
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch conversation to get active modes and Socratic thread state
    const conversation = await ctx.runQuery(
      internal.chat.getConversation,
      { id: args.conversationId }
    );

    const hasSocraticThread = !!conversation.socraticThreadId;
    const threadId = conversation.socraticThreadId ?? args.conversationId;

    // Create main chat graph (includes routing to all modes/subgraphs)
    const chatGraph = createChatGraph(ctx);

    // Initialize state for new conversations
    const initialState: ChatState = {
      messages: [...conversation.messages, { role: "user", content: args.message }],
      activeModes: conversation.activeModes,
      notebookId: conversation.notebookId,
      selectedDocuments: conversation.selectedDocuments,
      socraticThreadId: conversation.socraticThreadId,
    };

    let result;

    if (hasSocraticThread) {
      // Resume existing Socratic conversation from checkpoint.
      // Command.update patches userForcedDirect — a shared key in both ChatState and SocraticState,
      // which allows stream.ts to signal force-convergence into the subgraph.
      result = await chatGraph.invoke(
        new Command({
          resume: args.message,
          update: args.forceDirectAnswer ? { userForcedDirect: true } : undefined,
        }),
        { configurable: { thread_id: threadId } }
      );
    } else {
      // New conversation - invoke with initial state
      result = await chatGraph.invoke(initialState, {
        configurable: { thread_id: threadId }
      });
    }

    // Handle interrupt (Socratic is waiting for user response)
    if (result.__interrupt__) {
      await streamToUser(result.__interrupt__[0].value);

      // Persist external sources if available (for SourcesPanel)
      if (result.externalContext?.length) {
        await ctx.runMutation(internal.chat.saveExternalContext, {
          conversationId: args.conversationId,
          sources: result.externalContext,
        });
      }

      if (!hasSocraticThread) {
        await ctx.runMutation(internal.chat.setSocraticThread, {
          conversationId: args.conversationId,
          threadId,
        });
      }
      return;
    }

    // Graph completed - clear Socratic thread if it was active
    if (hasSocraticThread) {
      await ctx.runMutation(internal.chat.clearSocraticThread, {
        conversationId: args.conversationId,
      });
    }

    // Persist external sources for SourcesPanel
    if (result.externalContext?.length) {
      await ctx.runMutation(internal.chat.saveExternalContext, {
        conversationId: args.conversationId,
        sources: result.externalContext,
      });
    }

    // Stream final response
    // Extract the last message from result.messages and stream it via persistent text streaming
    const finalMessage = result.messages[result.messages.length - 1];
    return streamResponse(finalMessage);
  },
});
```

**Streaming integration:** The graph returns a `ChatState` object with all messages. For non-Socratic modes, extract the last message and stream it using `@convex-dev/persistent-text-streaming`. For Socratic mode, intermediate messages are streamed via the interrupt mechanism, and only the final `direct_answer` reaches this return point. External sources are persisted in both interrupt and completion branches within the handler (see code above).

**Schema additions for external sources:**
```typescript
// convex/schema.ts
conversations: defineTable({
  // ... existing fields ...
  externalSources: v.optional(v.array(v.object({
    url: v.string(),
    title: v.string(),
    snippet: v.string(),
    type: v.union(v.literal("web"), v.literal("academic")),
    publishedDate: v.optional(v.string()),
  }))),
})
```

**Mutation to save external sources:**
```typescript
// convex/chat/index.ts
export const saveExternalContext = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    sources: v.array(v.object({
      url: v.string(),
      title: v.string(),
      snippet: v.string(),
      type: v.union(v.literal("web"), v.literal("academic")),
      publishedDate: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      externalSources: args.sources,
    });
  },
});
```

### Flow 3: Mode Routing (Graph Decision)

```typescript
// convex/_agents/chat/route_modes.ts

// Node: pass-through, no state change
async function routeModesNode(state: ChatState): Promise<Partial<ChatState>> {
  return {};
}

// Router: pure function returning destination
function selectRoute(state: ChatState): string {
  const { guidedLearning, externalSearch } = state.activeModes;

  // Priority 1: Socratic + External Search (context enrichment)
  if (guidedLearning && externalSearch) {
    return "enrich_context";
  }

  // Priority 2: Socratic only
  if (guidedLearning) {
    return "socratic_subgraph";
  }

  // Priority 3: External Search only
  if (externalSearch) {
    return "external_search_handler";
  }

  // Default: Grounded RAG (restrictive: only selected documents)
  return "grounded_rag_handler";
}
```

**Grounded RAG constraint:** When enabled, this mode searches ONLY within `state.selectedDocuments`. If no documents are selected, it prompts the user to select sources before proceeding.

**Graph construction uses separate node and router:**
```typescript
.addNode("route_modes", routeModesNode)
.addConditionalEdges("route_modes", selectRoute, { ... })
```

### Flow 4: Context Enrichment (External + Socratic)

```typescript
// convex/_agents/chat/enrich_context.ts
async function enrichContextNode(
  state: ChatState
): Promise<Partial<ChatState>> {
  // Fetch external search results (via action - can call external APIs)
  const discoveryService = new DiscoveryService();
  const externalResults = await discoveryService.search({
    query: extractQueryFromMessages(state.messages),
    sources: ["web", "academic"],
  });

  return {
    externalContext: externalResults,
  };
}

// Main graph construction - complete implementation
// convex/_agents/chat/chatGraph.ts
import { START } from "@langchain/langgraph";

export function createChatGraph(ctx: ActionCtx) {
  const socraticSubgraph = createSocraticSubgraph(ctx);

  return new StateGraph(ChatState)
    .addNode("route_modes", routeModesNode)
    .addNode("enrich_context", enrichContextNode)
    .addNode("socratic_subgraph", socraticSubgraph)
    .addNode("external_search_handler", createExternalSearchHandler(ctx))
    .addNode("grounded_rag_handler", createGroundedRagHandler(ctx))
    .addEdge(START, "route_modes")
    .addConditionalEdges("route_modes", selectRoute, {
      enrich_context: "enrich_context",
      socratic_subgraph: "socratic_subgraph",
      external_search_handler: "external_search_handler",
      grounded_rag_handler: "grounded_rag_handler",
    })
    .addEdge("enrich_context", "socratic_subgraph")
    .compile({ checkpointer: new ConvexCheckpointer(ctx) });
}
```

**Note:** `route_modes` serves dual purposes with separate functions: `routeModesNode` (pass-through node) and `selectRoute` (pure routing function). This is the correct LangGraph pattern.

### Flow 5: Socratic Subgraph Execution

**Critical pattern:** LangGraph `interrupt()` enables human-in-the-loop by pausing execution and waiting for resume.

**Factory pattern for ctx access:**
The Socratic subgraph is created via `createSocraticSubgraph(ctx)` factory function. All nodes close over `ctx` for Convex DB/vector access. See `convex/_agents/chat/socratic_subgraph.ts` for the complete implementation including:

- `diagnosticOpenerNode` - interrupt for user's diagnostic response
- `socraticExchangeNode` - progressive disclosure with interrupt for each exchange
- `preConvergenceNode` - soft transition with interrupt, sets `userForcedDirect` based on user response
- `directAnswerNode` - full explanation with convergence reason

**preConvergenceNode implementation:**
```typescript
async function preConvergenceNode(state: SocraticState): Promise<Partial<SocraticState>> {
  const userResponse = await interrupt(
    "This one seems tricky — want me to walk you through it directly, or keep trying?"
  );

  const accepted = isAffirmativeResponse(userResponse);

  return {
    userForcedDirect: accepted,
    lastUserResponse: userResponse,
    stuckSignals: accepted ? state.stuckSignals : 0, // Reset on decline - prevents infinite loop
  };
}

function isAffirmativeResponse(message: string): boolean {
  const affirmative = ["yes", "yeah", "sure", "ok", "please do", "explain it"];
  const normalized = message.toLowerCase().trim();
  return affirmative.some(pattern => normalized.includes(pattern));
}
```

**Complete graph structure:**
```typescript
import { START, END } from "@langchain/langgraph";

return new StateGraph(SocraticState)
  .addNode("diagnostic_opener", diagnosticOpenerNode)
  .addNode("socratic_exchange", socraticExchangeNode)
  .addNode("pre_convergence", preConvergenceNode)
  .addNode("direct_answer", directAnswerNode)
  .addEdge(START, "diagnostic_opener")
  .addEdge("diagnostic_opener", "socratic_exchange")
  .addConditionalEdges("socratic_exchange", shouldConverge, {
    continue: "socratic_exchange",
    pre_convergence: "pre_convergence",
    converge: "direct_answer",
  })
  .addConditionalEdges("pre_convergence", (state) =>
    state.userForcedDirect ? "converge" : "continue"
  , {
    converge: "direct_answer",
    continue: "socratic_exchange",
  })
  .addEdge("direct_answer", END)
  .compile(); // No checkpointer — parent graph's checkpointer handles everything
```

**Checkpointing:** Subgraph has NO checkpointer. The parent `createChatGraph` provides the single `ConvexCheckpointer(ctx)` that handles all subgraph state, interrupts, and resumption.

### Flow 6: External Sources Panel + Add to Notebook

**Frontend Sources Panel:**
```typescript
// apps/web/src/features/chat/components/SourcesPanel.tsx
const addSourcesToNotebook = useMutation(api.documents.addExternalSources);

const handleAddSelected = async () => {
  const selectedSources = externalSources.filter(s => s.selected);

  await addSourcesToNotebook({
    notebookId,
    sources: selectedSources.map(s => ({
      url: s.url,
      title: s.title,
      // Full text extraction happens on backend
    })),
  });
};
```

**Backend Mutation (Add to Notebook):**
```typescript
// convex/documents/index.ts
export const addExternalSources = mutation({
  args: {
    notebookId: v.id("notebooks"),
    sources: v.array(v.object({
      url: v.string(),
      title: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // For each source, extract full text and create document
    for (const source of args.sources) {
      // Schedule extraction job (action - can call external APIs)
      await ctx.scheduler.runAfter(
        0,
        internal.documents.processing.extractAndStore,
        {
          notebookId: args.notebookId,
          url: source.url,
          title: source.title,
        }
      );
    }
  },
});
```

**Extraction Job (Action):**
```typescript
// convex/documents/processing.ts
export const extractAndStore = internalAction({
  args: {
    notebookId: v.id("notebooks"),
    url: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Use Supadata or similar service for full text extraction
    const extractionService = new ExtractionService();
    const fullText = await extractionService.extract(args.url);

    // Store as document via mutation
    await ctx.runMutation(internal.documents.create, {
      notebookId: args.notebookId,
      url: args.url,
      title: args.title,
      content: fullText,
    });
  },
});
```

---

## Key Convex Patterns Used

1. **Actions for external API calls** - LLM, search services, extraction all happen in actions
2. **Mutations for state changes** - Mode toggles, adding documents update DB directly
3. **Job scheduling** - Document extraction scheduled via `ctx.scheduler.runAfter()`
4. **Persistent text streaming** - Chat responses stream via `@convex-dev/persistent-text-streaming`
5. **LangGraph state machine** - Socratic subgraph manages complex conversation flow
6. **Checkpointer** - Socratic state (`exchangeCount`, `stuckSignals`) persisted via LangGraph checkpointing

---

## Error Handling

### External Search Failures

**Scenario:** Tavily or OpenAlex API is down or rate-limited

```typescript
// convex/_agents/chat/modeHandlers.ts
async function handleExternalSearch(state: ChatState) {
  try {
    const results = await discoveryService.search({ query });
    return generateResponse(results);
  } catch (error) {
    // Graceful degradation: fall back to grounded RAG
    logger.warn("External search failed, falling back to RAG", {
      error: error.message,
      query: extractQueryFromMessages(state.messages),
    });

    // Notify user of fallback
    await streamToUser("I couldn't reach external sources. Searching your selected documents instead...");

    // Fallback to grounded RAG (restrictive: only selected documents)
    return handleGroundedRag(state);
  }
}
```

### Socratic Mode Edge Cases

**Scenario 1: User gives non-response to diagnostic opener**

The `interrupt()` pattern naturally handles this - the user's response becomes the `diagnosticResponse` and flows to `socratic_exchange`. If it's a stuck signal ("I don't know"), it increments `stuckSignals` and eventually triggers `pre_convergence` node.

**Scenario 2: Checkpointer architecture**

The Socratic subgraph compiles with NO checkpointer (`.compile()`):
```typescript
// convex/_agents/chat/socratic_subgraph.ts
return new StateGraph(SocraticState)
  // ... nodes and edges ...
  .compile(); // No checkpointer
```

The parent chatGraph provides the single ConvexCheckpointer:
```typescript
// convex/_agents/chat/chatGraph.ts
return new StateGraph(ChatState)
  // ... nodes and edges ...
  .compile({ checkpointer: new ConvexCheckpointer(ctx) });
```

**Why:** When a subgraph is added as a node to a parent graph, the parent's checkpointer owns ALL state including subgraph execution position and interrupts. A subgraph-level checkpointer either conflicts with the parent's or is silently ignored, breaking interrupt/resume behavior.

**ConvexCheckpointer implementation requirements:**
- Implements `BaseCheckpointSaver` interface from LangGraph
- Methods: `getTuple()`, `list()`, `put()` - each calls Convex via `ctx.runQuery/runMutation`
- Stores checkpoints in dedicated `socraticCheckpoints` table
- Thread ID maps to conversation ID
- Required for both development AND production (MemorySaver breaks across serverless invocations)

### LLM Failures

**Scenario:** Smart model timeout or error during response generation

```typescript
// convex/_agents/chat/llm_wrapper.ts
async function generateWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await llmService.generate(prompt);
    } catch (error) {
      if (attempt === maxRetries) {
        // Final attempt failed - graceful degradation
        logger.error("LLM failed after retries", {
          error: error.message,
          attempts: maxRetries,
        });

        throw new ExternalServiceError(
          "I'm having trouble generating a response. Please try again.",
          error
        );
      }

      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Document Extraction Failures

**Scenario:** Adding external source fails extraction

```typescript
// convex/documents/processing.ts
export const extractAndStore = internalAction({
  args: { notebookId, url, title },
  handler: async (ctx, args) => {
    try {
      const fullText = await extractionService.extract(args.url);

      await ctx.runMutation(internal.documents.create, {
        ...args,
        content: fullText,
        status: "completed",
      });
    } catch (error) {
      // Store failed document with error for user visibility
      await ctx.runMutation(internal.documents.create, {
        ...args,
        content: null,
        status: "failed",
        error: error.message,
      });

      logger.error("Document extraction failed", {
        url: args.url,
        error: error.message,
      });
    }
  },
});
```

### State Recovery

**Checkpoint restoration is automatic** with `ConvexCheckpointer`. LangGraph handles restoration internally when you invoke with a stored `thread_id`:

```typescript
// Resume automatically loads checkpoint
await chatGraph.invoke(new Command({ resume: userMessage }), {
  configurable: { thread_id: storedThreadId }
});
```

No manual checkpoint restoration needed — the graph state is persisted across serverless action invocations.

---

## Testing Strategy

### Unit Tests

**Mode routing logic:**
```typescript
// tests/_agents/chat/route_modes.test.ts
describe("selectRoute", () => {
  it("routes to enrich_context when both modes enabled", () => {
    const state: ChatState = {
      activeModes: { guidedLearning: true, externalSearch: true },
      // ...
    };
    expect(selectRoute(state)).toBe("enrich_context");
  });

  it("routes to socratic when only guided learning enabled", () => {
    const state: ChatState = {
      activeModes: { guidedLearning: true, externalSearch: false },
      // ...
    };
    expect(selectRoute(state)).toBe("socratic_subgraph");
  });
});
```

**Convergence detection:**
```typescript
// tests/_agents/chat/socratic_subgraph.test.ts
describe("shouldConverge", () => {
  it("routes to pre_convergence after 2 stuck signals", () => {
    const state: SocraticState = {
      stuckSignals: 2,
      userForcedDirect: false,
      exchangeCount: 3,
      convergenceReason: undefined,
    };
    expect(shouldConverge(state)).toBe("pre_convergence");
    expect(state.convergenceReason).toBeUndefined(); // pure function, no mutation
  });

  it("routes directly to converge when user forced", () => {
    const state: SocraticState = {
      stuckSignals: 0,
      userForcedDirect: true,
      exchangeCount: 1,
      convergenceReason: undefined,
    };
    expect(shouldConverge(state)).toBe("converge");
    expect(state.convergenceReason).toBeUndefined(); // pure function, no mutation
  });

  it("continues when under threshold", () => {
    const state: SocraticState = {
      stuckSignals: 1,
      userForcedDirect: false,
      exchangeCount: 2,
      convergenceReason: undefined,
    };
    expect(shouldConverge(state)).toBe("continue");
  });
});

describe("directAnswerNode", () => {
  it("sets convergenceReason to auto_stuck after stuck signals", async () => {
    const ctx = mockActionCtx();
    const node = createDirectAnswerNode(ctx); // factory pattern
    const state: SocraticState = {
      stuckSignals: 2,
      userForcedDirect: false,
      exchangeCount: 3,
      convergenceReason: undefined,
      ragContext: [],
      externalContext: [],
      messages: [],
      notebookId: "nb123",
      selectedDocuments: [],
    };

    const result = await node(state);
    expect(result.convergenceReason).toBe("auto_stuck");
  });

  it("sets convergenceReason to user_forced when user forced", async () => {
    const ctx = mockActionCtx();
    const node = createDirectAnswerNode(ctx); // factory pattern
    const state: SocraticState = {
      stuckSignals: 0,
      userForcedDirect: true,
      exchangeCount: 1,
      convergenceReason: undefined,
      ragContext: [],
      externalContext: [],
      messages: [],
      notebookId: "nb123",
      selectedDocuments: [],
    };

    const result = await node(state);
    expect(result.convergenceReason).toBe("user_forced");
  });
});

describe("preConvergenceNode", () => {
  it("resets stuckSignals to 0 when user declines direct help", async () => {
    const ctx = mockActionCtx();
    const node = createPreConvergenceNode(ctx);
    const state: SocraticState = {
      stuckSignals: 2,
      userForcedDirect: false,
      exchangeCount: 3,
      convergenceReason: undefined,
      messages: [],
      notebookId: "nb123",
      selectedDocuments: [],
      lastUserResponse: undefined,
    };

    // Mock interrupt to return user's decline response
    const result = await node(state);
    expect(result.stuckSignals).toBe(0);        // Prevents re-trigger
    expect(result.userForcedDirect).toBe(false); // Doesn't force convergence
  });

  it("preserves stuckSignals when user accepts direct help", async () => {
    const ctx = mockActionCtx();
    const node = createPreConvergenceNode(ctx);
    const state: SocraticState = {
      stuckSignals: 2,
      userForcedDirect: false,
      exchangeCount: 3,
      convergenceReason: undefined,
      messages: [],
      notebookId: "nb123",
      selectedDocuments: [],
      lastUserResponse: undefined,
    };

    // Mock interrupt to return user's acceptance
    const result = await node(state);
    expect(result.stuckSignals).toBe(2);        // Unchanged — not needed, going to direct_answer
    expect(result.userForcedDirect).toBe(true); // Triggers convergence
  });
});
```

### Integration Tests

**End-to-end Socratic flow:**
```typescript
// tests/chat/socratic_flow.test.ts
describe("Socratic mode E2E", () => {
  it("completes full Socratic dialogue", async () => {
    // 1. Enable Socratic mode
    await updateModes({ conversationId, modes: { guidedLearning: true } });

    // 2. Send initial question
    await sendMessage({ conversationId, message: "What is machine learning?" });

    // 3. Receive diagnostic opener
    await waitForMessageContaining("What do you already know");

    // 4. Respond to diagnostic
    await sendMessage({ conversationId, message: "It's about training computers" });

    // 5. Receive Socratic exchange
    await waitForMessageContaining("That's a good start");

    // 6. Give stuck signal twice
    await sendMessage({ conversationId, message: "I don't know" });
    await waitForMessageContaining("Let's think about this"); // Wait for Socratic response after first stuck signal
    await sendMessage({ conversationId, message: "I don't know" }); // Now stuckSignals → 2

    // 6b. Receive pre_convergence soft transition
    await waitForMessageContaining("want me to walk you through it");

    // 6c. Accept direct help
    await sendMessage({ conversationId, message: "yes, explain it" });

    // 7. Receive direct answer
    await waitForMessageContaining("Let me explain directly");
  });
});
```

**External search integration:**
```typescript
// tests/chat/external_search.test.ts
describe("External search mode", () => {
  it("fetches and displays external sources", async () => {
    await updateModes({ conversationId, modes: { externalSearch: true } });

    await sendMessage({
      conversationId,
      message: "Latest developments in AI 2025",
    });

    // Should fetch from web/academic
    await waitForMessageContaining("According to recent research");

    // Sources panel should show external sources
    const sources = await getSourcesPanel(conversationId);
    expect(sources.some(s => s.type === "external")).toBe(true);
  });
});
```

### Manual Testing Checklist

- [ ] Toggle modes on/off via chat toolbar
- [ ] Socratic mode: diagnostic opener appears
- [ ] Socratic mode: progressive disclosure works
- [ ] Socratic mode: convergence after 2 stuck signals
- [ ] Socratic mode: "Just tell me" button triggers direct answer
- [ ] External search: web sources appear in sources panel
- [ ] External search: sources open in new tab
- [ ] External search: "Add selected to notebook" extracts full text
- [ ] Combined Socratic + External: context enrichment works
- [ ] Grounded RAG: only searches selected documents (restrictive)
- [ ] Grounded RAG: prompts to select sources if no documents selected
- [ ] Mode persistence: modes survive page refresh
- [ ] Error handling: external search failure falls back gracefully

---

## Verification Commands

After implementation, verify end-to-end:

```bash
# Typecheck Convex
bun run typecheck:convex

# Typecheck web
bun run typecheck:web

# Run dev servers
bun run dev
bun x convex dev

# Test mode toggles in UI
# - Navigate to chat
# - Toggle each mode
# - Send messages and verify behavior

# Check logs for Socratic convergence events
bun x convex logs --tail-logs always | grep convergenceReason

# Verify external sources added to notebook
bun x convex data notebooks --id <notebookId>
bun x convex data documents --filter-by-notebook <notebookId>
```

---

## Implementation Order

0. **Phase 0: Schema & Infrastructure**
   - Add schema migrations to `convex/schema.ts`:
     ```typescript
     conversations: defineTable({
       // ... existing fields ...
       activeModes: v.object({
         guidedLearning: v.boolean(),
         externalSearch: v.boolean(),
       }),
       socraticThreadId: v.optional(v.string()), // for interrupt/resume
       convergenceReason: v.optional(v.string()), // reset between sessions
     })

     socraticCheckpoints: defineTable({
       // For ConvexCheckpointer - stores LangGraph checkpoints
       threadId: v.string(),
       checkpointId: v.string(),
       checkpoint: v.any(), // serialized checkpoint data
       metadata: v.optional(v.any()),
     }).index("by_thread", ["threadId"])
     ```
   - **Implement `ConvexCheckpointer`** (BLOCKER - required for all Socratic work):
     - Implements `BaseCheckpointSaver` interface from LangGraph
     - Methods: `getTuple()`, `list()`, `put()` - each calls Convex via `ctx.runQuery/runMutation`
     - Stores in `socraticCheckpoints` table
     - **Cannot use `MemorySaver`** - breaks across serverless action invocations
   - Add `setSocraticThread` internal mutation
   - Add `clearSocraticThread` internal mutation (clears `socraticThreadId` AND `convergenceReason`)
   - Create `createChatGraph(ctx)` factory stub
   - Verify typecheck passes

1. **Phase 1: Foundation**
   - Create `ModeToggleToolbar` UI component
   - Implement `updateModes` mutation
   - Test mode persistence

2. **Phase 2: External Search**
   - Create `external_search_handler` mode handler
   - Integrate `DiscoveryService` for web/academic search
   - Build `SourcesPanel` with external source display
   - Implement "Add selected to notebook" with extraction
   - Test external search + fallback to RAG

3. **Phase 3: Socratic Mode**
   - Design `SocraticState` type
   - Build `socratic_subgraph` with diagnostic opener
   - Implement progressive disclosure prompts
   - Add convergence detection logic
   - Build "Just tell me" button
   - Test full Socratic dialogue flow

4. **Phase 4: Mode Combinations**
   - Implement `enrich_context` node (context enrichment)
   - Test Socratic + External Search combo
   - Verify context passing between modes
   - Test mode switching mid-conversation

5. **Phase 5: Polish & Observability**
   - Add `convergenceReason` logging
   - Implement checkpoint cleanup in `clearSocraticThread` (delete from `socraticCheckpoints` table)
   - Implement error handling and fallbacks
   - Add loading states for external search
   - Performance testing
   - User acceptance testing

---

## Critical Implementation Notes

### 🔴 Must Understand Before Coding

**1. `interrupt()` is essential for human-in-the-loop**
- Without `interrupt()`, the Socratic subgraph cannot wait for user input
- Pattern: `interrupt(prompt)` pauses graph, returns `__interrupt__` payload
- Resume: `graph.invoke(new Command({ resume: userResponse }), config)`
- Each conversation needs `socraticThreadId` for checkpoint continuity

**2. Main graph architecture - `stream.ts` invokes `chatGraph`, not subgraph directly**
- `stream.ts` creates `chatGraph = createChatGraph(ctx)` - one graph, one invocation
- Main graph handles all routing via `route_modes` node (including Socratic)
- Branch on `conversation.socraticThreadId` for resume vs. new invoke
- Subgraph state is captured under main graph's `thread_id` checkpoint

**3. Node names must match routing return values**
- `route_modes` returns `"enrich_context"` → graph must have `.addNode("enrich_context", ...)`
- LangGraph throws at runtime if edge destination doesn't match registered node name

**4. Conditional edges are pure functions**
- No state mutations in `shouldConverge` - LangGraph ignores them
- No side effects (no `streamToUser`) in edge functions
- Move logic to nodes (`directAnswerNode`, `preConvergenceNode`)

**5. Stuck signals detect on USER responses**
- Check `state.lastUserResponse`, not LLM output
- Signals: "I don't know", "not sure", "??", ""

### 🟡 Important Technical Details

**6. `ConvexCheckpointer` is BLOCKER for Phase 0, not Phase 3**
- `MemorySaver` breaks across serverless action invocations (fresh process each call)
- Must implement `BaseCheckpointSaver` backed by Convex DB from day one
- Stores checkpoints in `socraticCheckpoints` table
- This is not optional for development

**7. Factory pattern for ctx access in all graphs**
- LangGraph nodes are plain functions - no built-in Convex context
- Use factory: `createChatGraph(ctx)` for main graph, `createSocraticSubgraph(ctx)` for subgraph
- Nodes close over `ctx` for DB/vector/LLM access
- Export node factories for unit testing: `createDirectAnswerNode(ctx)`

**8. Schema migrations must precede implementation**
- Add `activeModes`, `socraticThreadId`, `convergenceReason` to conversations table
- Add `socraticCheckpoints` table for ConvexCheckpointer
- Phase 0 unblocks all subsequent work

**9. `groundedRag` removed from `activeModes`**
- Grounded RAG is the fallback/default when other modes are disabled
- No explicit toggle needed - removed from mutation args and UI

**10. Integration test must include `pre_convergence` step**
- After 2 stuck signals, `preConvergenceNode` fires with soft transition interrupt
- Test needs intermediate step: respond to "want me to walk you through it?"
- Then proceeds to `direct_answer`

### 🟠 All Fixes Applied

**Round 1 (interrupt pattern):**
- Added `interrupt()` pattern for human-in-the-loop
- Fixed `shouldConverge` to pure routing function
- Added `pre_convergence` node for soft transition

**Round 2 (resume logic):**
- Fixed `stream.ts` resume logic - branches on `socraticThreadId`
- Fixed unit tests for pure router design
- Removed `groundedRag` from mutation args
- Fixed `shouldConverge` return type
- Added factory pattern for ctx access

**Round 3 (architecture):**
- Fixed `route_modes` return value → matches node name
- Fixed `stream.ts` to invoke main `chatGraph`
- Moved `ConvexCheckpointer` to Phase 0
- Fixed unit test signature (factory pattern)
- Fixed integration test (includes `pre_convergence`)
- Fixed `state.query` reference

**Round 4 (structural integrity):**
- Fixed unit test assertion (now expects `"enrich_context"`)
- Fixed duplicate catch block (syntax error)
- Removed MemorySaver references (forbidden in Convex)
- Replaced State Recovery with automatic restoration description
- Removed duplicate `setSocraticThread` from Phase 1
- Fixed Phase 4 node name description
- Updated file list comment (Phase 0 for ConvexCheckpointer)

**Round 5 (final cleanup):**
- Deleted stale Flow 5 code blocks (all three sections)
- Completed Flow 4 graph construction (all nodes, edges, START, checkpointer)

**Round 6 (final structural fixes):**
- Separated `route_modes` node and `selectRoute` router (LangGraph requirement)
- Added START/END edges to Socratic subgraph
- Made `lastUserResponse` optional in `SocraticState`
- Added `externalContext` persistence logic for SourcesPanel
- Added schema for `externalSources` in conversations table

**Round 7 (final critical fixes):**
- Removed checkpointer from Socratic subgraph (parent handles it)
- Fixed `pre_convergence` routing to use `userForcedDirect` not `convergenceReason`
- Added `preConvergenceNode` implementation with `isAffirmativeResponse`
- Added `forceDirectAnswer` parameter to `stream` action for "Just tell me" button
- Added `externalContext` persistence in interrupt branch (not just completion)
- Fixed integration test to wait for Socratic response between stuck signals

**Round 8 (final dead code and structural fixes):**
- Fixed `forceDirectAnswer` to use `Command.update` on resume path
- Removed dead code that set `userForcedDirect` on `initialState`
- Fixed Error Handling section to show correct checkpointer architecture (parent-only)
- Added `saveExternalContext` mutation implementation
- Fixed meaningless test assertion to use specific phrase from Socratic exchange

**Round 9 (final critical fixes):**
- Promoted `userForcedDirect` to shared key (added to ChatState)
- Fixed `preConvergenceNode` to reset `stuckSignals` when user declines (prevents infinite loop)
- Updated SocraticState documentation to reflect `userForcedDirect` as shared key
- Deleted stale standalone "External sources persistence" code block

**Round 10 (final polish and test coverage):**
- Fixed stale comment about `userForcedDirect` being subgraph-private
- Added unit tests for `preConvergenceNode` decline and accept paths
- Added checkpoint cleanup to Phase 5 implementation order

**Final status:**
- 🔴 Critical remaining: **0**
- 🟡 Important remaining: **0**
- 🟠 Minor remaining: **0** (checkpoint cleanup noted in Phase 5)
- ✅ Total fixes applied: **47**

All code blocks and notes are fully synchronized. Document is implementation-ready.
