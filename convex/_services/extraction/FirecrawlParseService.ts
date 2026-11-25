"use node";

/**
 * Firecrawl Parse backend (`POST https://api.firecrawl.dev/v2/parse`), a drop-in alternative
 * to `MistralOCRService` for self-hosted deployments that set `FIRECRAWL_API_KEY` (selected by
 * `createOcrService`). Billing: 1 credit per PDF page — text pages and OCR pages alike — with
 * `mode: "auto"` reading embedded text first and OCR only where needed. Diffs vs Mistral worth
 * knowing:
 *
 * - The file itself is uploaded (`multipart/form-data`), not passed as a URL: the service first
 *   downloads `url` (a public Convex storage URL or a paper PDF), then re-uploads the bytes.
 * - Word/PowerPoint/Excel/ODF/RTF/EPUB also convert (anydoc engine), not just PDF and images.
 * - `maxPages` maps to `parsers[0].maxPages` (caps the bill, same semantics as Mistral's range).
 * - Markdown comes back whole (`data.markdown`); `pages: true` also returns per-page markdown
 *   we stitch with the same `**Page N**` labels the chunker parses. `pageMarkers` inserts
 *   `<!-- page N -->` comments we strip, keeping our own labels.
 * - No figure annotations: `options.annotations` is not consulted.
 * - Office and other non-PDF parses are unpaginated (the API's `pages` option is PDF-only):
 *   `data.pages` stays empty, the whole `data.markdown` is used, and the bill is one credit
 *   per document (live-verified: a 10-slide deck reported `metadata.creditsUsed: 1`) — charged
 *   to the user's page quota as one page, not zero.
 */

import { invokeWithHttpRetry } from "../../_agents/_shared/retry";
import { createExternalServiceErrorFromResponse, ExternalServiceError } from "../../_lib/errors";
import { createServiceLogger } from "../../_lib/logging/serviceLogger";
import { UserFacingSourceError } from "../../_lib/sourceFailure";
import {
  hasOcrContent,
  MistralOCRService,
  MistralOcrTimeoutError,
  type OcrInputKind,
  OcrNothingReadableError,
  type OcrReadResult,
} from "./MistralOCRService";

const PARSE_ENDPOINT = "https://api.firecrawl.dev/v2/parse";

/** Firecrawl's own generous budget; leave headroom on our side of the clock. */
const PARSE_TIMEOUT_MS = 170_000;

/** Downloads precede the parse upload, not part of its budget. */
const DOWNLOAD_TIMEOUT_MS = 60_000;

type FirecrawlParseResponse = {
  success?: boolean;
  data?: {
    markdown?: string;
    /** Present when `pages: true`: one entry per page, 1-based `pageNumber`. */
    pages?: Array<{ pageNumber?: number; markdown?: string }>;
    /** The parse's actual credit cost: per page for PDFs, per document for office formats. */
    metadata?: { creditsUsed?: number; [key: string]: unknown };
    warning?: string;
  };
  error?: string;
};

/** A filename for the upload; Firecrawl detects the real format from the bytes. */
function uploadFileName(kind: OcrInputKind): string {
  switch (kind) {
    case "image":
      return "image.png";
    case "office":
      return "document.docx";
    default:
      return "document.pdf";
  }
}

/** Firecrawl's `<!-- page N -->` marker, if `pageMarkers` slips into a response. */
const PAGE_MARKER_COMMENT = /<!--\s*page\s+\d+\s*-->\n?/gi;

/**
 * Stitch Firecrawl's per-page markdown into one string with the same labels as
 * `markdownFromMistralOcrResponse`: a `**Page N**` line opens each page, later pages get a
 * `---` separator. `maxPageLabel`/`chunkPage` in `processing/pageLabels.ts` parse that format.
 */
export function markdownFromFirecrawlPages(
  pages: Array<{ pageNumber?: number; markdown?: string }>
): string {
  const sorted = [...pages].sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
  return sorted
    .map((page, i) => {
      const body = (page.markdown ?? "").replace(PAGE_MARKER_COMMENT, "").trim();
      // The API's pageNumber is the physical page (1-based, per the live capture); position
      // only backs it up when an entry arrives without one.
      const label = `**Page ${page.pageNumber ?? i + 1}**`;
      return i === 0 ? `${label}\n\n${body}` : `---\n\n${label}\n\n${body}`;
    })
    .join("\n\n");
}

/**
 * A Firecrawl timeout: extends `MistralOcrTimeoutError` so the embedding job's `instanceof`
 * checks (`ocrTimedOut`, "pages stay spent") hold unchanged. Pages we stopped waiting for were
 * still processed and billed, so timeouts are never retried.
 */
export class FirecrawlTimeoutError extends MistralOcrTimeoutError {
  constructor(options?: { cause?: unknown }) {
    super(options);
    this.name = "FirecrawlTimeoutError";
    this.message = "Firecrawl Parse request timed out";
  }
}

/**
 * Out of credits / paywall (HTTP 402). Not retryable, and the user can act on it.
 */
export class FirecrawlCreditsError extends UserFacingSourceError {
  constructor(detail: string) {
    super(
      "The document parsing service ran out of credits. Top up the Firecrawl account and retry this source.",
      detail
    );
    this.name = "FirecrawlCreditsError";
  }
}

export class FirecrawlParseService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Parse a file into page-labelled markdown. `kind` only picks the upload filename (Firecrawl
   * detects the real format from content); `maxPages` caps the parse (and the bill).
   */
  async processDocument(
    url: string,
    options: { kind?: OcrInputKind; maxPages?: number } = {}
  ): Promise<string> {
    return (await this.readDocument(url, options)).markdown;
  }

  /** `processDocument` plus the number of pages Firecrawl parsed (and billed). */
  async readDocument(
    url: string,
    options: { kind?: OcrInputKind; maxPages?: number } = {}
  ): Promise<OcrReadResult> {
    const kind = options.kind ?? "document";
    const logger = createServiceLogger("firecrawl", "parse");

    // Phase 1: fetch the file bytes (a public Convex storage URL or a remote PDF).
    const download = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
    if (!download.ok) {
      throw createExternalServiceErrorFromResponse(
        "firecrawl",
        download.status,
        `download ${url}`,
        (await download.text().catch(() => "")).slice(0, 400)
      );
    }
    const bytes = new Uint8Array(await download.arrayBuffer());

    // Phase 2: upload and parse.
    const data = await invokeWithHttpRetry(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PARSE_TIMEOUT_MS);
        try {
          const t0 = Date.now();
          logger.apiCall("firecrawl", "/v2/parse", { bytes: bytes.byteLength, kind });

          const parser: Record<string, unknown> = { type: "pdf" };
          if (options.maxPages !== undefined) parser.maxPages = options.maxPages;
          // Per-page markdown so our labels match the chunker's format. A parser-level
          // option (`options.parsers[0].pages`), NOT top-level: v2 rejects unknown keys.
          parser.pages = true;
          const form = new FormData();
          form.append(
            "options",
            JSON.stringify({
              formats: [{ type: "markdown" }],
              // Text first, OCR only where needed: the same page budget either way.
              parsers: [parser],
            })
          );
          form.append("file", new Blob([bytes]), uploadFileName(kind));

          const response = await fetch(PARSE_ENDPOINT, {
            method: "POST",
            headers: { Authorization: `Bearer ${this.apiKey}` },
            body: form,
            signal: controller.signal,
          });

          // Read text, not JSON: an error page must still become a status-coded error.
          const raw = await response.text();

          if (!response.ok) {
            logger.apiError("firecrawl", "/v2/parse", new Error(`HTTP ${response.status}`));
            if (response.status === 402) {
              throw new FirecrawlCreditsError((raw || response.statusText).slice(0, 400));
            }
            throw createExternalServiceErrorFromResponse(
              "firecrawl",
              response.status,
              "/v2/parse",
              (raw || response.statusText).slice(0, 400)
            );
          }

          const parsed = JSON.parse(raw) as FirecrawlParseResponse;
          if (!parsed.success || parsed.error) {
            const message = parsed.error ?? "Firecrawl Parse failed";
            logger.apiError("firecrawl", "/v2/parse", new Error(message));
            throw new ExternalServiceError("firecrawl", `firecrawl parse: ${message}`, {
              endpoint: "/v2/parse",
              retryable: true,
              detail: message,
            });
          }

          logger.apiSuccess("firecrawl", "/v2/parse", Date.now() - t0, {
            bytes: bytes.byteLength,
          });
          return parsed.data ?? {};
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            throw new FirecrawlTimeoutError({ cause: error });
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }
      },
      "firecrawl_parse",
      {
        // A timeout bills server-side; one attempt per upload, retries only for 5xx/429.
        maxAttempts: 2,
        retryableErrors: (error) => {
          if (error instanceof FirecrawlTimeoutError || error instanceof MistralOcrTimeoutError)
            return false;
          if (error instanceof ExternalServiceError) return error.retryable;
          return false;
        },
      }
    );

    if (data.warning) {
      logger.warn("Firecrawl Parse warning", { warning: data.warning });
    }

    const pages = data.pages ?? [];
    const markdown =
      pages.length > 0
        ? markdownFromFirecrawlPages(pages)
        : (data.markdown ?? "").replace(PAGE_MARKER_COMMENT, "").trim();
    if (!hasOcrContent(markdown)) throw new OcrNothingReadableError(pages.length);
    // Office and other non-PDF parses are unpaginated (the API's pages option is PDF-only)
    // but still bill a credit per document, so an empty pages array must not read as a
    // zero-page, zero-cost parse: charge what the API says it charged, at least one page.
    const pagesRead =
      pages.length > 0 ? pages.length : Math.max(1, data.metadata?.creditsUsed ?? 1);
    return { markdown, pagesRead };
  }
}

/** Either OCR backend, as picked by `createOcrService`. */
export type OcrService = MistralOCRService | FirecrawlParseService;

/**
 * Pick the OCR backend for ingestion: Firecrawl Parse when `FIRECRAWL_API_KEY` is set (1
 * credit/page, table/reading-order-aware markdown), Mistral otherwise. `options.annotations`
 * only applies to Mistral (Firecrawl returns no figure annotations).
 */
export function createOcrService(options: { annotations?: boolean } = {}): OcrService {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY || "";
  if (firecrawlKey) return new FirecrawlParseService(firecrawlKey);
  return new MistralOCRService(process.env.MISTRAL_API_KEY || "", options);
}
