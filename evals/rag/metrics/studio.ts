/**
 * Studio-specific deterministic metric scorers.
 *
 * Reads `artifact.studioOutput.raw` for structural checks and the existing
 * `artifact.answer` (serialized text) for content checks. Returns the same
 * `MetricResult` shape as the RAG metrics so reports/aggregation work without
 * change.
 */
import type {
  EvalFixture,
  EvalRunArtifact,
  EvalBaseline,
  MetricResult,
  MetricStatus,
} from "../types";

function baseMetric(
  metric: string,
  fixture: EvalFixture,
  artifact: EvalRunArtifact,
  status: MetricStatus,
  score: number,
  detail: string,
  breakdown?: Record<string, unknown>
): MetricResult {
  return {
    metric,
    caseId: fixture.id,
    runner: artifact.runner,
    configHash: artifact.configHash,
    status,
    score,
    detail,
    ...(breakdown ? { breakdown } : {}),
  };
}

// ─── Generic count gate ──────────────────────────────────────

function countGate(
  metric: string,
  fixture: EvalFixture,
  artifact: EvalRunArtifact,
  actual: number,
  expected: number | undefined,
  label: string
): MetricResult {
  if (expected == null) {
    return baseMetric(
      metric,
      fixture,
      artifact,
      "info",
      1,
      `${label} count: ${actual} (no minItems gate set).`,
      { actual }
    );
  }
  if (actual >= expected) {
    return baseMetric(
      metric,
      fixture,
      artifact,
      "pass",
      1,
      `${label} count ${actual} ≥ ${expected}.`,
      { actual, expected }
    );
  }
  const ratio = expected === 0 ? 1 : actual / expected;
  const status: MetricStatus = ratio >= 0.7 ? "warn" : "fail";
  return baseMetric(
    metric,
    fixture,
    artifact,
    status,
    ratio,
    `${label} count ${actual} below expected ${expected}.`,
    { actual, expected, ratio }
  );
}

// ─── Per-kind scorers ────────────────────────────────────────

interface ItemArrayPayload {
  cards?: unknown[];
  questions?: unknown[];
}

interface MindmapPayload {
  data?:
    | { nodeData?: { children?: unknown[] }; root?: { children?: unknown[] } }
    | { children?: unknown[] };
}

interface SlidesPayload {
  data?: unknown[] | { slides?: unknown[]; deck?: unknown[] };
}

interface SpreadsheetPayload {
  data?: string | { rows?: unknown[]; columns?: unknown[]; headers?: unknown[] };
}

function flashcardCountMatch(
  fixture: EvalFixture,
  artifact: EvalRunArtifact
): MetricResult {
  const cards = (artifact.studioOutput?.raw as ItemArrayPayload | undefined)?.cards ?? [];
  return countGate(
    "flashcard_count_match",
    fixture,
    artifact,
    cards.length,
    fixture.expectedStructure?.minItems,
    "Flashcards"
  );
}

function quizCountMatch(fixture: EvalFixture, artifact: EvalRunArtifact): MetricResult {
  const qs = (artifact.studioOutput?.raw as ItemArrayPayload | undefined)?.questions ?? [];
  return countGate(
    "quiz_count_match",
    fixture,
    artifact,
    qs.length,
    fixture.expectedStructure?.minItems,
    "Quiz questions"
  );
}

function writtenQuestionsCountMatch(
  fixture: EvalFixture,
  artifact: EvalRunArtifact
): MetricResult {
  const qs = (artifact.studioOutput?.raw as ItemArrayPayload | undefined)?.questions ?? [];
  return countGate(
    "written_questions_count_match",
    fixture,
    artifact,
    qs.length,
    fixture.expectedStructure?.minItems,
    "Written questions"
  );
}

function countMindmapNodes(node: { children?: unknown[] } | undefined): number {
  if (!node) return 0;
  let count = 1;
  for (const child of node.children ?? []) {
    count += countMindmapNodes(child as { children?: unknown[] });
  }
  return count;
}

function mindmapNodeCount(fixture: EvalFixture, artifact: EvalRunArtifact): MetricResult {
  const data = (artifact.studioOutput?.raw as MindmapPayload | undefined)?.data;
  const wrapped = data as
    | { nodeData?: { children?: unknown[] }; root?: { children?: unknown[] } }
    | undefined;
  const root =
    wrapped?.nodeData ??
    wrapped?.root ??
    (data as { children?: unknown[] } | undefined);
  const total = countMindmapNodes(root as { children?: unknown[] });
  return countGate(
    "mindmap_node_count",
    fixture,
    artifact,
    total,
    fixture.expectedStructure?.minItems,
    "Mindmap nodes"
  );
}

function slideCount(fixture: EvalFixture, artifact: EvalRunArtifact): MetricResult {
  const data = (artifact.studioOutput?.raw as SlidesPayload | undefined)?.data;
  const slides = Array.isArray(data)
    ? data
    : (data?.slides ?? data?.deck ?? []);
  return countGate(
    "slide_count_match",
    fixture,
    artifact,
    slides.length,
    fixture.expectedStructure?.minItems,
    "Slides"
  );
}

function spreadsheetRowCount(
  fixture: EvalFixture,
  artifact: EvalRunArtifact
): MetricResult {
  const data = (artifact.studioOutput?.raw as SpreadsheetPayload | undefined)?.data;
  let rowCount = 0;
  if (typeof data === "string") {
    // CSV: first line is the header. Count non-empty data rows.
    const lines = data.split(/\r?\n/).filter((l) => l.trim().length > 0);
    rowCount = Math.max(0, lines.length - 1);
  } else if (data && Array.isArray(data.rows)) {
    rowCount = data.rows.length;
  }
  return countGate(
    "spreadsheet_row_count",
    fixture,
    artifact,
    rowCount,
    fixture.expectedStructure?.minItems,
    "Spreadsheet rows"
  );
}

// ─── Report: required-section presence ───────────────────────

function reportSectionPresence(
  fixture: EvalFixture,
  artifact: EvalRunArtifact
): MetricResult {
  const required = fixture.expectedStructure?.requiredSections;
  if (!required || required.length === 0) {
    return baseMetric(
      "report_section_presence",
      fixture,
      artifact,
      "info",
      1,
      "No requiredSections set — skipping section-presence check."
    );
  }
  const text = artifact.answer.toLowerCase();
  const missing = required.filter((s) => !text.includes(s.toLowerCase()));
  const found = required.length - missing.length;
  const score = required.length === 0 ? 1 : found / required.length;
  let status: MetricStatus;
  if (score >= 0.9) status = "pass";
  else if (score >= 0.6) status = "warn";
  else status = "fail";
  return baseMetric(
    "report_section_presence",
    fixture,
    artifact,
    status,
    score,
    missing.length === 0
      ? `All ${found} required sections present.`
      : `Missing ${missing.length}/${required.length} sections: ${missing.join(", ")}`,
    { found, required: required.length, missing }
  );
}

// ─── Audio script length sanity ──────────────────────────────

function audioScriptLength(
  fixture: EvalFixture,
  artifact: EvalRunArtifact
): MetricResult {
  const transcript =
    (artifact.studioOutput?.raw as { transcript?: string } | undefined)?.transcript ?? "";
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  // Soft sanity: any non-trivial script (>50 words) passes; the LLM-judge
  // metrics handle quality. Below 50 words is almost certainly a generation
  // failure rather than a stylistic choice.
  const status: MetricStatus = wordCount >= 50 ? "pass" : wordCount >= 20 ? "warn" : "fail";
  const score = wordCount >= 50 ? 1 : wordCount / 50;
  return baseMetric(
    "audio_script_length",
    fixture,
    artifact,
    status,
    score,
    `Transcript word count: ${wordCount}.`,
    { wordCount }
  );
}

// ─── Studio dispatcher ───────────────────────────────────────

/** Run all studio scorers applicable to the given artifact. */
export function scoreStudioMetrics(
  fixture: EvalFixture,
  artifact: EvalRunArtifact,
  _baseline?: EvalBaseline
): MetricResult[] {
  const results: MetricResult[] = [];
  if (!artifact.studioOutput) return results;

  switch (artifact.studioOutput.kind) {
    case "report":
      results.push(reportSectionPresence(fixture, artifact));
      break;
    case "flashcards":
      results.push(flashcardCountMatch(fixture, artifact));
      break;
    case "quiz":
      results.push(quizCountMatch(fixture, artifact));
      break;
    case "writtenQuestions":
      results.push(writtenQuestionsCountMatch(fixture, artifact));
      break;
    case "mindmap":
      results.push(mindmapNodeCount(fixture, artifact));
      break;
    case "slides":
      results.push(slideCount(fixture, artifact));
      break;
    case "spreadsheet":
      results.push(spreadsheetRowCount(fixture, artifact));
      break;
    case "audioScript":
      results.push(audioScriptLength(fixture, artifact));
      break;
    default:
      break;
  }
  return results;
}
