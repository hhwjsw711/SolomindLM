import { StateGraph, START, END, Send, Annotation } from '@langchain/langgraph';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';

// Zod Schema for mind map validation
// Note: Cannot use .optional() with structured outputs - must use .nullable() or make required
const MindMapNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    topic: z.string().refine((val) => val.split(' ').length <= 7, {
      message: "Max 7 words per node"
    }),
    children: z.array(MindMapNodeSchema).min(0).max(8),
  })
);

const MindMapSchema = z.object({
  nodeData: z.object({
    id: z.string(),
    topic: z.string().refine((val) => val.split(' ').length <= 7, {
      message: "Root max 7 words"
    }),
    children: z.array(MindMapNodeSchema).min(5).max(10),
  })
});

// State definitions using the newer Annotation API
export const OverallState = Annotation.Root({
  documentIds: Annotation<string[]>({
    reducer: (_x: string[], y?: string[]) => y ?? _x,
    default: () => [],
  }),
  chunks: Annotation<string[]>({
    reducer: (_x: string[], y?: string[]) => y ?? _x,
    default: () => [],
  }),
  mapOutputs: Annotation<string[]>({
    // Reducer concatenates arrays - critical for aggregating parallel outputs
    reducer: (x: string[], y: string[]) => x.concat(y),
    default: () => [],
  }),
  collapsedOutputs: Annotation<string[]>({
    reducer: (_x: string[], y?: string[]) => y ?? _x,
    default: () => [],
  }),
  finalOutput: Annotation<any>({
    reducer: (_x: any, y?: any) => y ?? _x,
    default: () => null,
  }),
  status: Annotation<string>({
    reducer: (_x: string, y?: string) => y ?? _x,
    default: () => 'generating',
  }),
});

export type OverallStateType = typeof OverallState.State;

// Minimal state for parallel map processing - only what each chunk needs
export interface ChunkProcessState {
  chunk: string;
}

// Map Phase Prompt: Generate study guides from chunks
const MAP_PROMPT = `You are an Expert Curriculum Designer creating comprehensive study guides for visual mind mapping.

Transform document content into rich, multi-level hierarchical study guide. MAX 7 WORDS PER NODE.

Format your response as:

# MAIN TOPIC (2-4 words)
## PRIMARY BRANCH (3-6 words)
- KEY CONCEPT (2-5 words)
  ### SUB-CONCEPT (2-4 words)
  ### RELATED IDEA (2-4 words)
- CORE PROCESS (2-5 words)
  ### STEP/DETAIL (2-4 words)
  ### APPLICATION (2-4 words)

RULES:
- ABSOLUTE MAX: 7 words per header/bullet
- 5-10 primary branches (## level) - create comprehensive coverage
- 3-8 key concepts per branch (- bullets)
- MUST include sub-details (### level) for each concept - aim for 2-5 sub-items per concept
- Create depth: root → branches → concepts → sub-concepts (3-4 levels minimum)
- Keywords only, no sentences
- Remove articles/prepositions
- Extract ALL major themes, don't summarize too aggressively

End with: --- END STUDY GUIDE ---

Content:
{chunk}

STUDY GUIDE:`;

// Reduce Phase Prompt: Convert study guides to Mind Elixir JSON
const REDUCE_PROMPT = `You are a Visual Learning Architect creating comprehensive, multi-level mind maps from study guides.

MAX 7 WORDS PER NODE. Keywords only.

REQUIREMENTS:
1. Root: 2-5 words (main subject)
2. 5-10 main branches (all major themes from content)
3. Main branches: 3-7 words each
4. Each branch MUST have 3-8 child nodes
5. Each child node SHOULD have 2-5 grandchildren when content supports it
6. Create 3-4 levels of depth minimum
7. Balanced visual distribution across all branches
8. Don't lose information - capture all key concepts

JSON STRUCTURE - NO OTHER TEXT:
{{
  "nodeData": {{
    "id": "root",
    "topic": "MAIN TOPIC",
    "children": [
      {{
        "id": "branch1",
        "topic": "PRIMARY BRANCH",
        "children": [
          {{
            "id": "1a",
            "topic": "KEY CONCEPT",
            "children": [
              {{"id": "1a1", "topic": "SUB-DETAIL", "children": []}},
              {{"id": "1a2", "topic": "RELATED POINT", "children": []}}
            ]
          }},
          {{
            "id": "1b",
            "topic": "CORE PROCESS",
            "children": [
              {{"id": "1b1", "topic": "STEP ONE", "children": []}},
              {{"id": "1b2", "topic": "STEP TWO", "children": []}}
            ]
          }}
        ]
      }}
    ]
  }}
}}

Study guides:
{content}

MIND MAP JSON:`;

export class MindMapGraph {
  private llm: ChatTogetherAI;
  private maxTokens: number;

  constructor(apiKey: string, model: string, maxTokens: number = 24000) {
    this.llm = new ChatTogetherAI({
      apiKey,
      model,
      temperature: 0.5,
    });
    this.maxTokens = maxTokens;
  }

  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Node: Split chunks for routing
  splitChunks(state: OverallStateType): Partial<OverallStateType> {
    return {
      ...state,
      status: 'mapping',
      mapOutputs: state.mapOutputs || [],
      collapsedOutputs: state.collapsedOutputs || [],
      finalOutput: state.finalOutput || null,
    };
  }

  // Conditional routing function - returns Send objects for fan-out or 'collapse' string
  routeToMap(state: OverallStateType): Send[] | 'collapse' {
    // If no chunks, skip to collapse
    if (state.chunks.length === 0) {
      console.warn('[MindMapGraph] No chunks to process, routing to collapse');
      return 'collapse';
    }

    console.log(`[MindMapGraph] Creating ${state.chunks.length} parallel map tasks`);

    // Create Send objects with minimal state - only what each parallel task needs
    return state.chunks.map((chunk) =>
      new Send('map_process', {
        chunk,
      })
    );
  }

  // Node: Map phase (runs in parallel via Send)
  // Accepts ChunkProcessState with minimal data for this branch
  async mapProcess(state: ChunkProcessState): Promise<Partial<OverallStateType>> {
    const { chunk } = state;

    console.log(`[MindMapGraph] Processing chunk (${chunk.length} chars) in map phase`);

    const prompt = MAP_PROMPT.replace('{chunk}', chunk);

    const response = await this.llm.invoke([
      new SystemMessage('You are an expert curriculum designer creating hierarchical study guides for mind mapping.'),
      new HumanMessage(prompt),
    ]);

    const output = response.content.toString();
    console.log(`[MindMapGraph] Generated study guide (${output.length} chars)`);

    // Return single output in array - reducer will concatenate all outputs
    return {
      mapOutputs: [output],
    };
  }

  // Node: Collapse phase (if needed)
  async collapse(state: OverallStateType): Promise<Partial<OverallStateType>> {
    console.log(`[MindMapGraph] Collapse: received ${state.mapOutputs.length} mapOutputs`);
    console.log(
      `[MindMapGraph] Collapse: first mapOutput preview: ${state.mapOutputs[0]?.substring(0, 100) || 'EMPTY'}...`
    );

    // Safety check: if no mapOutputs, return early
    if (!state.mapOutputs || state.mapOutputs.length === 0) {
      console.error('[MindMapGraph] Collapse: ERROR - No mapOutputs received!');
      return {
        ...state,
        collapsedOutputs: [],
        status: 'reducing',
      };
    }

    const totalTokens = state.mapOutputs.reduce(
      (sum, s) => sum + this.estimateTokens(s),
      0
    );

    console.log(`[MindMapGraph] Collapse: total tokens ${totalTokens}, max tokens ${this.maxTokens}`);

    if (totalTokens <= this.maxTokens) {
      console.log('[MindMapGraph] Collapse: skipping recursive collapse, using mapOutputs directly');
      return {
        ...state,
        collapsedOutputs: state.mapOutputs,
        status: 'reducing',
      };
    }

    // Recursive collapse
    console.log('[MindMapGraph] Collapse: performing recursive collapse');
    const collapsed = await this.recursiveCollapse(state.mapOutputs);
    return {
      ...state,
      collapsedOutputs: collapsed,
      status: 'reducing',
    };
  }

  private async recursiveCollapse(summaries: string[]): Promise<string[]> {
    const totalTokens = summaries.reduce(
      (sum, s) => sum + this.estimateTokens(s),
      0
    );

    if (totalTokens <= this.maxTokens) {
      return summaries;
    }

    // Group and collapse
    const groupSize = 3;
    const collapsed: string[] = [];

    for (let i = 0; i < summaries.length; i += groupSize) {
      const group = summaries.slice(i, i + groupSize);
      const combined = group.join('\n\n---\n\n');

      const prompt = `Condense these study guides into a single study guide while retaining all key topics and hierarchical structure:\n\n${combined}\n\nCONDENSED:`;

      const response = await this.llm.invoke([
        new SystemMessage('You are an expert at synthesizing study guides while preserving hierarchical structure.'),
        new HumanMessage(prompt),
      ]);

      collapsed.push(response.content.toString());
    }

    // Recursively check if still too large
    return this.recursiveCollapse(collapsed);
  }

  // Node: Reduce phase - convert study guides to Mind Elixir JSON
  async reduce(state: OverallStateType): Promise<Partial<OverallStateType>> {
    console.log(`[MindMapGraph] Reduce: received ${state.collapsedOutputs.length} collapsedOutputs`);

    const combined = state.collapsedOutputs.join('\n\n--- NEXT STUDY GUIDE ---\n\n');

    console.log(`[MindMapGraph] Reduce: combined study guides length: ${combined.length} chars`);

    const prompt = REDUCE_PROMPT.replace('{content}', combined);

    console.log(`[MindMapGraph] Reduce: prompt length: ${prompt.length} chars`);

    // Use regular LLM call with JSON parsing instead of structured outputs
    // Together AI doesn't always support structured outputs reliably
    const response = await this.llm.invoke([
      new SystemMessage('You are a visual learning architect creating mind map JSON structures from study guides. You must respond with valid JSON only, no other text.'),
      new HumanMessage(prompt),
    ]);

    const content = response.content.toString();
    console.log(`[MindMapGraph] Reduce: received response (${content.length} chars)`);

    // Parse JSON from the response - handle markdown code blocks
    let parsedData: any;
    try {
      // Remove markdown code blocks if present
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      parsedData = JSON.parse(jsonStr);
      console.log(`[MindMapGraph] Reduce: successfully parsed JSON`);

      // Handle case where LLM returns nodeData as array instead of object
      if (Array.isArray(parsedData.nodeData)) {
        console.warn(`[MindMapGraph] Reduce: nodeData is array, transforming to object structure`);
        // LLM returned array of nodes - use first node as root, rest as siblings
        const firstNode = parsedData.nodeData[0];
        if (firstNode && typeof firstNode === 'object') {
          parsedData = {
            nodeData: {
              id: firstNode.id || 'root',
              topic: firstNode.topic || 'Mind Map',
              children: firstNode.children || parsedData.nodeData.slice(1),
            },
          };
        } else {
          // Fallback: wrap entire array as children of new root
          parsedData = {
            nodeData: {
              id: 'root',
              topic: 'Mind Map',
              children: parsedData.nodeData,
            },
          };
        }
      }

      // If no nodeData key at all, create default structure
      if (!parsedData.nodeData) {
        console.warn(`[MindMapGraph] Reduce: no nodeData found, creating default structure`);
        parsedData = {
          nodeData: {
            id: 'root',
            topic: 'Mind Map',
            children: Array.isArray(parsedData) ? parsedData : [],
          },
        };
      }
    } catch (error) {
      console.error(`[MindMapGraph] Reduce: failed to parse JSON`, error);
      console.error(`[MindMapGraph] Reduce: response content preview: ${content.substring(0, 500)}...`);
      throw new Error('Failed to parse mind map JSON from LLM response');
    }

    // Validate against schema (optional, for logging only)
    try {
      MindMapSchema.parse(parsedData);
      console.log(`[MindMapGraph] Reduce: JSON validated successfully`);
    } catch (error) {
      // Zod errors have circular structure, log message only
      console.warn(`[MindMapGraph] Reduce: JSON validation warning (non-fatal): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      ...state,
      finalOutput: parsedData,
      status: 'completed',
    };
  }

  // Build the graph using the newer Annotation API
  buildGraph() {
    const builder = new StateGraph(OverallState);

    // Add nodes with proper types
    builder.addNode('split_chunks', (state: OverallStateType) => this.splitChunks(state));
    builder.addNode('map_process', (state: ChunkProcessState) => this.mapProcess(state));
    builder.addNode('collapse', (state: OverallStateType) => this.collapse(state));
    builder.addNode('reduce', (state: OverallStateType) => this.reduce(state));

    // Add edges
    // Type assertions are needed due to LangGraph JS's TypeScript limitations
    builder.addEdge(START, 'split_chunks' as never);

    // Conditional edge for Send API fan-out
    builder.addConditionalEdges('split_chunks' as never, (state: OverallStateType) =>
      this.routeToMap(state)
    );

    builder.addEdge('map_process' as never, 'collapse' as never);
    builder.addEdge('collapse' as never, 'reduce' as never);
    builder.addEdge('reduce' as never, END);

    return builder.compile();
  }
}
