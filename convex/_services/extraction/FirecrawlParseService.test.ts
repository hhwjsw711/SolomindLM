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
    expect(options.parsers).toEqual([{ type: "pdf" }]);
    expect(options.pages).toBe(true);
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
    expect(options.parsers).toEqual([{ type: "pdf", maxPages: 30 }]);
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
    // No pages array: pagesRead is 0, markdown keeps the whole-document text with markers stripped.
    expect(result.pagesRead).toBe(0);
    expect(result.markdown).toBe("whole body");
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
