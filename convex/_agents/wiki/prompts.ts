"use node";
/**
 * Prompt templates and schemas for WikiGraph.
 *
 * Contains all prompt template functions, Zod schemas, and constants
 * related to wiki knowledge base compilation.
 */

import { z } from "zod";

// ============================================================
// SCHEMAS
// ============================================================

export const ConceptExtractionSchema = z.object({
  concepts: z.array(
    z.object({
      name: z.string().describe("Short specific title, not a broad category"),
      summary: z.string().describe("One sentence, ≤100 chars"),
      importance: z.enum(["high", "medium", "low"]).describe("high = central to the notebook subject"),
      description: z.string().describe("≤200 chars: what it is + why it matters. No filler."),
      relatedConcepts: z.array(z.string()).describe("0–4 other concept names from this chunk only"),
    })
  ),
});

export const WikiArticleGenerationSchema = z.object({
  summary: z.string().describe("Index line, ≤80 chars, factual, no filler"),
  relatedConcepts: z.array(z.string()).describe("0–5 related concept names (not paths)"),
  content: z
    .string()
    .describe(
      "Markdown body. No fluff, no boilerplate. " +
      "Lead with 1-sentence definition. [[wikilink]] related concepts inline. " +
      "high = ≤250 words, medium = ≤120 words, low = ≤60 words. " +
      "Bullet points over prose. Omit sections with nothing concrete. No YAML."
    ),
  hasSourceCoverage: z
    .boolean()
    .describe(
      "true if source excerpt contains sufficient information to write a meaningful article, " +
      "false if the source lacks relevant details about this concept. " +
      "Set to false when: source doesn't mention the concept, only mentions it in passing, " +
      "or lacks substantive explanation."
    ),
});

export const ConnectionDetectionSchema = z.object({
  connections: z.array(
    z.object({
      path: z.string().describe("connections/slug-two-or-three-words"),
      title: z.string().describe("≤60 chars, names the relationship concisely"),
      relationship: z.string().describe("400–600 chars: standalone explanation of the interaction pattern. Include: how the concepts compose, why this pattern matters, concrete examples, and implications. DO NOT just say 'dependency' or 'trade-off' — explain the MECHANISM."),
      concepts: z.array(z.string()).describe("2–3 paths: concepts/slug"),
      importance: z.enum(["high", "medium", "low"]),
    })
  ),
});

// ============================================================
// TYPES
// ============================================================

export interface ConceptExtraction {
  name: string;
  summary: string;
  importance: "high" | "medium" | "low";
  description: string;
  relatedConcepts: string[];
}

export interface WikiArticle {
  path: string;
  type: "concept" | "connection" | "qa" | "index" | "log";
  title: string;
  content: string;
  frontmatter: {
    slug: string;
    summary: string;
    sources: string[];
    relatedConcepts: string[];
    lastUpdated: string;
  };
}

// ============================================================
// SYSTEM PROMPTS
// ============================================================

export const CONCEPT_EXTRACTION_SYSTEM_PROMPT = `Extract distinct, lookup-worthy concepts from the chunk. Output JSON only per schema.

CRITICAL: KNOWLEDGE vs DATA — mandatory distinction:
- KNOWLEDGE: ideas, methods, principles, or frameworks the author is explaining → EXTRACT
- DATA: content used as an example or demonstration → extract the technique being demonstrated, NOT the example content itself

When you encounter sample data, examples, or illustrations:
- Extract the CONCEPT or TECHNIQUE being illustrated (what's being taught)
- DO NOT extract the specific content, subjects, or details of the example (what's being used to teach it)
- DO NOT extract proper nouns, titles, or names that appear only in examples

Example patterns to IGNORE:
- Specific people, places, products, or events mentioned in example data
- Quotes, stories, or narratives used purely as illustration
- Dataset entries, table rows, or specific example instances
- Content that serves as raw material for demonstrating a concept

Focus on what the author is EXPLAINING or TEACHING, not the examples they use to illustrate it.

Also ignore: metadata, headers, import statements, download links, author bios.`;

export const ARTICLE_GENERATION_SYSTEM_PROMPT = `Write concise, scannable wiki articles based ONLY on the provided source text. Output JSON only per schema.

CRITICAL: Ground all content in the source excerpt
- ONLY use information explicitly stated in the source text
- DO NOT add external knowledge, training data, or prior information
- DO NOT expand on concepts beyond what the source states
- When the source contains examples, describe the technique being illustrated, not the example content

SOURCE COVERAGE (hasSourceCoverage field):
- Set hasSourceCoverage = false if the source lacks sufficient information about this concept
- Set false when: concept is only mentioned in passing, source lacks substantive explanation, or details are absent
- Set false instead of writing "source doesn't contain" in the summary/content
- Set true when source has enough detail to write a meaningful article (≥50 words for medium/low importance)

Formatting:
- 1-sentence definition up front, then only what adds value
- [[wikilink]] related concepts inline, not in a trailing list
- Bullet points over prose wherever possible
- Include concrete examples, numbers, or formulas when present in the source
- Respect word limits strictly: high ≤250w, medium ≤120w, low ≤60w
- Omit any section you cannot fill with something concrete from the source`;

export const CONNECTION_DETECTION_SYSTEM_PROMPT = `Identify 0–2 genuinely non-obvious cross-concept relationships worth a standalone explanation. Output JSON only per schema.

CRITICAL - Only create connections for:
1. **Composition patterns**: how concepts combine (e.g., "vectorizer → classifier pipeline")
2. **Trade-offs with nuance**: non-obvious tensions between approaches
3. **Causal mechanisms**: how A causes B through non-trivial steps

DO NOT create connections for:
- **Obvious taxonomy**: "X is a type of Y" → belongs in wikilinks
- **Simple dependencies**: "B requires A" → belongs in wikilinks
- **Sequential flows**: "A then B then C" → belongs in wikilinks
- **Co-occurrence**: concepts mentioned together → not a connection

Each connection must justify 400–600 chars of explanation. If no relationships meet this bar, return an empty array.`;

// ============================================================
// PROMPT TEMPLATES
// ============================================================

export const getConceptExtractionPrompt = (params: {
  content: string;
  documentCount: number;
  notebookTitle?: string;
  chunkIndex?: number;
  totalChunks?: number;
}): string => {
  const { content, documentCount, notebookTitle, chunkIndex, totalChunks } = params;

  const chunkContext =
    chunkIndex !== undefined && totalChunks !== undefined
      ? `Chunk ${chunkIndex + 1} of ${totalChunks}. Extract from this chunk only — concepts are merged later.`
      : "";

  const notebookContext = notebookTitle
    ? `Notebook: "${notebookTitle}" — only extract concepts directly relevant to this subject.`
    : "";

  return `${notebookContext}
Sources: ${documentCount} document(s). ${chunkContext}

Extract 3–6 concepts that represent knowledge being taught or explained.
When you see examples or sample data, extract the technique/concept being illustrated, NOT the example content.

Text:
${content}`;
};

export const getArticleGenerationPrompt = (params: {
  concept: ConceptExtraction;
  relevantContent: string;
  sources: string[];
  existingArticles?: string;
}): string => {
  const { concept, relevantContent, existingArticles } = params;

  const wordLimit =
    concept.importance === "high" ? "≥200 words, ≤250 words" :
    concept.importance === "low"  ? "≥50 words, ≤60 words"  : "≥100 words, ≤120 words";

  return `Concept: **${concept.name}** (${concept.importance})
Summary hint: ${concept.summary}
Detail hint: ${concept.description}
Related hints: ${concept.relatedConcepts.join(", ") || "—"}

Source excerpt (use ONLY this text):
${relevantContent}

${existingArticles ? `IMPORTANT - Only link to these existing concepts: ${existingArticles}
Do NOT invent or suggest related concepts that are not in this list.` : ""}

Write a ${wordLimit} article based ONLY on the source excerpt above.
- 1-sentence definition first
- Bullet points preferred over prose
- Use [[wikilink]] format ONLY for concepts from the existing list above
- Set hasSourceCoverage = false if the source lacks sufficient information about this concept
- If hasSourceCoverage = false, still provide a brief 1-2 sentence definition but don't expand beyond what the source states
- Concrete details: include formulas, numbers, or examples when present in the source`;
};

export const getConnectionDetectionPrompt = (params: {
  concepts: ConceptExtraction[];
  articles: string;
  notebookTitle?: string;
}): string => {
  const { concepts, articles, notebookTitle } = params;

  const conceptList = concepts
    .map((c) => `- ${c.name} (${c.importance})`)
    .join("\n");

  return `${notebookTitle ? `Notebook: "${notebookTitle}"\n` : ""}Concepts:
${conceptList}

Articles:
${articles}

Find 0–2 genuinely non-obvious relationships that justify standalone 400–600 char explanations:
- Composition patterns (how concepts combine)
- Non-obvious trade-offs with nuance
- Causal mechanisms through non-trivial steps

DO NOT connect:
- Obvious taxonomy ("X is a type of Y")
- Simple dependencies ("B requires A")
- Sequential flows ("A then B")
- Mere co-occurrence

Same domain only. Return empty array if nothing meets this bar.`;
};