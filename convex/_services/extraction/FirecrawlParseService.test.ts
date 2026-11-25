import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createOcrService,
  FirecrawlParseService,
  FirecrawlTimeoutError,
  markdownFromFirecrawlPages,
} from "./FirecrawlParseService";
import {
  MistralOCRService,
  MistralOcrTimeoutError,
  NOTHING_READABLE_MESSAGE,
  OcrNothingReadableError,
} from "./MistralOCRService";

describe("markdownFromFirecrawlPages", () => {
  it("labels and joins pages in the Mistral label format", () => {
    expect(
      markdownFromFirecrawlPages([
        { pageNumber: 1, markdown: "one" },
        { pageNumber: 2, markdown: "two" },
      ])
    ).toBe("**Page 1**\n\none\n\n---\n\n**Page 2**\n\ntwo");
  });

  it("sorts pages by pageNumber and strips page-marker comments", () => {
    const md = markdownFromFirecrawlPages([
      { pageNumber: 2, markdown: "<!-- page 2 -->\ntwo" },
      { pageNumber: 1, markdown: "<!-- page 1 -->\none" },
    ]);
    expect(md).toBe("**Page 1**\n\none\n\n---\n\n**Page 2**\n\ntwo");
  });

  it("labels the API's pageNumber, falling back to position when absent", () => {
    expect(markdownFromFirecrawlPages([{ markdown: "one" }, { markdown: "two" }])).toBe(
      "**Page 1**\n\none\n\n---\n\n**Page 2**\n\ntwo"
    );
    // Sparse pageNumbers keep their physical numbers instead of being renumbered by position.
    expect(
      markdownFromFirecrawlPages([
        { pageNumber: 3, markdown: "c" },
        { pageNumber: 5, markdown: "e" },
      ])
    ).toBe("**Page 3**\n\nc\n\n---\n\n**Page 5**\n\ne");
  });
});

describe("FirecrawlParseService.readDocument", () => {
  afterEach(() => vi.unstubAllGlobals());

  const ok = (body: unknown) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  const rejected = (status: number, body?: unknown) =>
    new Response(JSON.stringify(body ?? { message: "rejected" }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  const file = () => new Response(new Uint8Array([1, 2, 3]));
  const parseOk = (pages: Array<{ pageNumber?: number; markdown?: string }>) =>
    ok({ success: true, data: { pages } });

  it("downloads the file, uploads it as multipart, and returns labelled markdown", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(file())
      .mockResolvedValueOnce(parseOk([{ pageNumber: 1, markdown: "手册第一页" }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new FirecrawlParseService("fc-key").readDocument("https://storage/file");

    expect(result).toEqual({ markdown: "**Page 1**\n\n手册第一页", pagesRead: 1 });

    // First call downloads the source URL.
    expect(fetchMock.mock.calls[0][0]).toBe("https://storage/file");
    // Second call hits the parse endpoint with a FormData body.
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://api.firecrawl.dev/v2/parse");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ Authorization: "Bearer fc-key" });
    expect(init.body).toBeInstanceOf(FormData);

    const options = JSON.parse((init.body as FormData).get("options") as string);
    expect(options.formats).toEqual([{ type: "markdown" }]);
    expect(options.parsers).toEqual([{ type: "pdf", pages: true }]);
    expect((init.body as FormData).get("file")).toBeInstanceOf(Blob);
  });

  it("maps maxPages into the pdf parser options", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(file())
      .mockResolvedValueOnce(parseOk([{ pageNumber: 1, markdown: "a" }]));
    vi.stubGlobal("fetch", fetchMock);

    await new FirecrawlParseService("fc-key").readDocument("https://x/a.pdf", { maxPages: 30 });

    const options = JSON.parse(
      (fetchMock.mock.calls[1][1].body as FormData).get("options") as string
    );
    expect(options.parsers).toEqual([{ type: "pdf", maxPages: 30, pages: true }]);
  });

  it("falls back to data.markdown when pages is absent", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(file())
      .mockResolvedValueOnce(
        ok({ success: true, data: { markdown: "whole<!-- page 1 -->\n body" } })
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new FirecrawlParseService("fc-key").readDocument("https://x/a.pdf");
    // No pages array (office and other non-PDF parses): markdown keeps the whole-document text
    // with markers stripped, and the quota is charged one page — the credit the parse billed.
    expect(result.pagesRead).toBe(1);
    expect(result.markdown).toBe("whole body");
  });

  it("charges the reported credits for an unpaged parse", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(file())
      .mockResolvedValueOnce(
        ok({
          success: true,
          data: { markdown: "deck text", metadata: { creditsUsed: 3 } },
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new FirecrawlParseService("fc-key").readDocument("https://x/a.pptx");
    expect(result.pagesRead).toBe(3);
  });

  it("maps HTTP 402 to the credits error", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(file()).mockResolvedValueOnce(rejected(402));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      new FirecrawlParseService("fc-key").readDocument("https://x/a.pdf")
    ).rejects.toMatchObject({ name: "FirecrawlCreditsError" });
  });

  it("retries a failed success:false body and then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(file())
      .mockResolvedValueOnce(ok({ success: false, error: "Parse failed upstream" }))
      .mockResolvedValueOnce(parseOk([{ pageNumber: 1, markdown: "recovered" }]));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new FirecrawlParseService("fc-key").readDocument("https://x/a.pdf");
    expect(result.markdown).toContain("recovered");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws OcrNothingReadableError for a blank document", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(file())
      .mockResolvedValueOnce(parseOk([{ pageNumber: 1, markdown: "" }]));
    vi.stubGlobal("fetch", fetchMock);

    const error = await new FirecrawlParseService("fc-key")
      .readDocument("https://x/a.pdf")
      .catch((e) => e);
    expect(error).toBeInstanceOf(OcrNothingReadableError);
    expect(error.userMessage).toBe(NOTHING_READABLE_MESSAGE);
  });

  it("wraps a parse-phase abort in a timeout error the embedding job understands", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: unknown) => {
      if (String(url).endsWith("/v2/parse")) {
        return new Promise((_, reject) => {
          const timer = new AbortController();
          timer.abort();
          reject(timer.signal.reason);
        });
      }
      return file();
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = await new FirecrawlParseService("fc-key")
      .readDocument("https://x/a.pdf")
      .catch((e) => e);
    expect(error).toBeInstanceOf(FirecrawlTimeoutError);
    expect(error).toBeInstanceOf(MistralOcrTimeoutError);
  });
});

describe("createOcrService", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("picks Firecrawl when FIRECRAWL_API_KEY is set", () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-key");
    expect(createOcrService()).toBeInstanceOf(FirecrawlParseService);
  });

  it("picks Mistral otherwise, passing the annotations option", () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "");
    vi.stubEnv("MISTRAL_API_KEY", "mistral");
    expect(createOcrService({ annotations: false })).toBeInstanceOf(MistralOCRService);
  });
});

// Real Firecrawl Parse responses captured 2026-11-25 against /v2/parse (a 2-page fpdf test
// document, uploaded as multipart with parsers[0] = { type: "pdf", pages: true }). Guards the
// request shape (pages is a PARSER-level option — v2 rejects it top-level) and the response
// shape (data.pages[].pageNumber is 1-based; data.metadata.creditsUsed bills per page).
describe("real Firecrawl Parse capture (2026-11-25)", () => {
  const CAPTURED = {
    success: true,
    data: {
      markdown:
        "Product: XG-3000 Optical Terminal\n\nRelease date: 2026-11-25\n\n## AI生成\n\n生成时间: 2026-11-25\n\n第 1 页\n\n---\n\nPage 2 - Table\n\nModel  |  Port  |  Power\n\nXG-3000  |  16  |  12W\n\nXG-5000  |  24  |  18W\n\n## AI生成\n\n生成时间: 2026-11-25\n\n第 2 页",
      pages: [
        {
          pageNumber: 1,
          markdown:
            "Product: XG-3000 Optical Terminal\n\nRelease date: 2026-11-25\n\n## AI生成\n\n生成时间: 2026-11-25\n\n第 1 页",
        },
        {
          pageNumber: 2,
          markdown:
            "Page 2 - Table\n\nModel  |  Port  |  Power\n\nXG-3000  |  16  |  12W\n\nXG-5000  |  24  |  18W\n\n## AI生成\n\n生成时间: 2026-11-25\n\n第 2 页",
        },
      ],
      metadata: { numPages: 2, totalPages: 2, creditsUsed: 2, contentType: "application/pdf" },
    },
  };

  it("stitches the captured per-page markdown with labels and keeps the table rows", () => {
    const md = markdownFromFirecrawlPages(CAPTURED.data.pages!);
    expect(md).toContain("**Page 1**");
    expect(md).toContain("**Page 2**");
    expect(md).toContain("Product: XG-3000 Optical Terminal");
    expect(md).toContain("Model  |  Port  |  Power");
    expect(md).toContain("XG-3000  |  16  |  12W");
    expect(md).toContain("---");
  });

  it("requests pages as a parser-level option, never top-level", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3])))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(CAPTURED), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await new FirecrawlParseService("fc-key").readDocument("https://x/a.pdf");
    const options = JSON.parse(
      (fetchMock.mock.calls[1][1].body as FormData).get("options") as string
    );
    // v2 rejects a top-level "pages" key with 400 unrecognized_keys.
    expect(Object.keys(options)).not.toContain("pages");
    expect(options.parsers[0].pages).toBe(true);
    expect(result.pagesRead).toBe(2);
  });
});
