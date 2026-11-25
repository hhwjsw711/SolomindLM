import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callOpenAIEmbeddings, EmbeddingService } from "./embeddingClient";

// Keep the real convex/server exports (action/internalAction feed _generated/server); only
// getServiceToken is stubbed — in a test environment the real one would throw "outside of a
// Convex backend".
vi.mock("convex/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex/server")>();
  return { ...actual, getServiceToken: vi.fn(async () => "gateway-test-token") };
});

function mockOpenAIResponse(vectors: number[][]) {
  return {
    ok: true,
    text: async () =>
      JSON.stringify({
        data: vectors.map((embedding, index) => ({ index, embedding, object: "embedding" })),
      }),
    json: async () => ({
      data: vectors.map((embedding, index) => ({ index, embedding, object: "embedding" })),
    }),
  };
}

describe("callOpenAIEmbeddings", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an empty array without calling fetch for empty input", async () => {
    const result = await callOpenAIEmbeddings([], "test-key");
    expect(result).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends model, dimensions, and input, and returns vectors in request order", async () => {
    fetchMock.mockResolvedValue(
      mockOpenAIResponse([
        [0.1, 0.2],
        [0.3, 0.4],
      ])
    );

    const result = await callOpenAIEmbeddings(["first", "second"], "test-key");

    expect(result).toEqual([
      [0.1, 0.2],
      [0.3, 0.4],
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/embeddings");
    const body = JSON.parse(init.body);
    expect(body).toEqual({
      model: "text-embedding-3-small",
      input: ["first", "second"],
      dimensions: 1536,
    });
    expect(init.headers.Authorization).toBe("Bearer test-key");
  });

  it("re-sorts out-of-order response items back to request order", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => "",
      json: async () => ({
        data: [
          { index: 1, embedding: [0.9, 0.9] },
          { index: 0, embedding: [0.1, 0.1] },
        ],
      }),
    });

    const result = await callOpenAIEmbeddings(["a", "b"], "test-key");
    expect(result).toEqual([
      [0.1, 0.1],
      [0.9, 0.9],
    ]);
  });

  it("throws on a non-ok response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "invalid api key",
    });

    await expect(callOpenAIEmbeddings(["x"], "bad-key")).rejects.toThrow();
  });

  it("throws when the response vector count doesn't match the request count", async () => {
    fetchMock.mockResolvedValue(mockOpenAIResponse([[0.1, 0.1]]));

    await expect(callOpenAIEmbeddings(["a", "b"], "test-key")).rejects.toThrow(/expected 2/);
  });
});

describe("Convex AI Gateway routing (EMBEDDINGS_VIA_GATEWAY)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("routes through the gateway with a minted service token when the flag is on", async () => {
    vi.stubEnv("EMBEDDINGS_VIA_GATEWAY", "1");
    fetchMock.mockResolvedValue(mockOpenAIResponse([[0.1], [0.2]]));

    const result = await callOpenAIEmbeddings(["first", "second"], "");

    expect(result).toEqual([[0.1], [0.2]]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ai-gateway.convex.dev/v1/embeddings");
    expect(init.headers.Authorization).toBe("Bearer gateway-test-token");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("openai/text-embedding-3-small");
    expect(body.input).toEqual(["first", "second"]);
    expect(body.dimensions).toBe(1536);
  });

  it("keeps the direct OpenAI path when the flag is off", async () => {
    vi.stubEnv("EMBEDDINGS_VIA_GATEWAY", "");
    fetchMock.mockResolvedValue(mockOpenAIResponse([[0.3]]));

    await callOpenAIEmbeddings(["x"], "direct-key");

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.openai.com/v1/embeddings");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer direct-key");
  });

  it("falls back to the OpenAI API key when the gateway call fails", async () => {
    vi.stubEnv("EMBEDDINGS_VIA_GATEWAY", "1");
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, text: async () => "gateway auth failed" })
      .mockResolvedValueOnce(mockOpenAIResponse([[0.5]]));

    const result = await callOpenAIEmbeddings(["x"], "fallback-key");

    expect(result).toEqual([[0.5]]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.openai.com/v1/embeddings");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer fallback-key");
  });

  it("propagates the gateway error when no API key is available for fallback", async () => {
    vi.stubEnv("EMBEDDINGS_VIA_GATEWAY", "1");
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "gateway auth failed",
    });

    await expect(callOpenAIEmbeddings(["x"], "")).rejects.toThrow();
    // Only the gateway was attempted — no silent second provider.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("EmbeddingService", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("embedText trims input and returns a single vector", async () => {
    fetchMock.mockResolvedValue(mockOpenAIResponse([[0.5, 0.5]]));
    const service = new EmbeddingService("test-key");

    const result = await service.embedText("  hello world  ");

    expect(result).toEqual([0.5, 0.5]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.input).toEqual(["hello world"]);
  });

  it("embedBatch splits large inputs across multiple calls at the configured batch size", async () => {
    const texts = Array.from({ length: 70 }, (_, i) => `chunk-${i}`);
    fetchMock
      .mockResolvedValueOnce(mockOpenAIResponse(Array.from({ length: 64 }, () => [1])))
      .mockResolvedValueOnce(mockOpenAIResponse(Array.from({ length: 6 }, () => [2])));

    const service = new EmbeddingService("test-key");
    const result = await service.embedBatch(texts);

    expect(result).toHaveLength(70);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
