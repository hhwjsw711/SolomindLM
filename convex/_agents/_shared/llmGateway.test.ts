import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uncachedLlmCall } from "./cachedLlm";
import {
  chatViaGateway,
  createGatewayChatFetch,
  mapGatewayModelId,
  streamGatewayChatCompletions,
} from "./llmGateway";

// Keep the real convex/server exports; only getServiceToken is stubbed — the real one
// would throw "outside of a Convex backend" in tests.
vi.mock("convex/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex/server")>();
  return { ...actual, getServiceToken: vi.fn(async () => "gateway-test-token") };
});
// cachedLlm reads env.TOGETHER_AI_API_KEY at module load; stub it for the direct-path test.
vi.mock("../../_lib/env", () => ({ env: { TOGETHER_AI_API_KEY: "direct-test-key" } }));

describe("mapGatewayModelId", () => {
  it("maps Together model ids to the all-lowercase gateway namespace", () => {
    expect(mapGatewayModelId("Qwen/Qwen3.5-9B")).toBe("qwen/qwen3.5-9b");
    expect(mapGatewayModelId("deepseek-ai/DeepSeek-V4.1-Flash")).toBe(
      "deepseek/deepseek-v4.1-flash"
    );
    expect(mapGatewayModelId("openai/gpt-oss-120b")).toBe("openai/gpt-oss-120b");
    expect(mapGatewayModelId("mistralai/Mistral-7B-Instruct-v0.1")).toBe(
      "mistralai/mistral-7b-instruct-v0.1"
    );
  });

  it("maps every chat-picker model id to its gateway catalog id", () => {
    // Mirrors apps/web/src/shared/constants/models.ts AVAILABLE_SMART_MODELS +
    // DEFAULT_SMART_MODEL_ID. Together namespaces differ from gateway ones for
    // MiniMaxAI→minimax and zai-org→z-ai; the rest match after lowercasing.
    expect(mapGatewayModelId("deepseek-ai/DeepSeek-V4.1-Flash")).toBe(
      "deepseek/deepseek-v4.1-flash"
    );
    expect(mapGatewayModelId("openai/gpt-oss-120b")).toBe("openai/gpt-oss-120b");
    expect(mapGatewayModelId("MiniMaxAI/MiniMax-M3")).toBe("minimax/minimax-m3");
    expect(mapGatewayModelId("google/gemma-4-31B-it")).toBe("google/gemma-4-31b-it");
    expect(mapGatewayModelId("Qwen/Qwen3.8-Flash")).toBe("qwen/qwen3.8-flash");
    expect(mapGatewayModelId("zai-org/GLM-5.3-Flash")).toBe("z-ai/glm-5.3-flash");
  });

  it("passes unknown prefixes lowercased and bare names through", () => {
    expect(mapGatewayModelId("SomeVendor/model-x")).toBe("somevendor/model-x");
    expect(mapGatewayModelId("bare-name")).toBe("bare-name");
  });
});

describe("chatViaGateway", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts the usual truthy spellings and rejects the rest", () => {
    for (const truthy of ["1", "true", "YES", "True"]) {
      vi.stubEnv("CHAT_VIA_GATEWAY", truthy);
      expect(chatViaGateway()).toBe(true);
    }
    for (const falsy of ["", "0", "no"]) {
      vi.stubEnv("CHAT_VIA_GATEWAY", falsy);
      expect(chatViaGateway()).toBe(false);
    }
  });
});

describe("uncachedLlmCall gateway routing (CHAT_VIA_GATEWAY)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const okChat = (content: string) => ({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
        usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
      }),
  });

  it("routes through the gateway with a mapped model and minted token", async () => {
    vi.stubEnv("CHAT_VIA_GATEWAY", "1");
    fetchMock.mockResolvedValue(okChat("hello"));

    const res = await uncachedLlmCall({
      model: "Qwen/Qwen3.5-9B",
      messages: [{ role: "user", content: "hi" }],
      reasoningEnabled: false,
      toolChoice: "none",
    });

    expect(res.content).toBe("hello");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ai-gateway.convex.dev/v1/chat/completions");
    expect(init.headers.Authorization).toBe("Bearer gateway-test-token");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("qwen/qwen3.5-9b");
    // Together-specific reasoning kwargs forward unchanged.
    expect(body.reasoning).toEqual({ enabled: false });
  });

  it("keeps the direct Together path when the flag is off", async () => {
    vi.stubEnv("CHAT_VIA_GATEWAY", "");
    fetchMock.mockResolvedValue(okChat("direct"));

    await uncachedLlmCall({
      model: "Qwen/Qwen3.5-9B",
      messages: [{ role: "user", content: "hi" }],
      reasoningEnabled: false,
      toolChoice: "none",
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.together.xyz/v1/chat/completions");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer direct-test-key");
  });

  it("falls back to the direct Together call when the gateway fails and a key is set", async () => {
    vi.stubEnv("CHAT_VIA_GATEWAY", "1");
    // A non-transient 401 fails the gateway path immediately (no retry backoff);
    // uncachedLlmCall then retries the same request direct against Together.
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, text: async () => "invalid token" })
      .mockResolvedValueOnce(okChat("recovered"));

    const res = await uncachedLlmCall({
      model: "Qwen/Qwen3.5-9B",
      messages: [{ role: "user", content: "hi" }],
      reasoningEnabled: false,
      toolChoice: "none",
    });

    expect(res.content).toBe("recovered");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const lastCall = fetchMock.mock.calls.at(-1);
    expect(String(lastCall[0])).toBe("https://api.together.xyz/v1/chat/completions");
    expect(lastCall[1].headers.Authorization).toBe("Bearer direct-test-key");
    expect(JSON.parse(lastCall[1].body).model).toBe("Qwen/Qwen3.5-9B");
  });
});

describe("createGatewayChatFetch (LangChain fetch-layer fallback)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const ok = { ok: true, status: 200 };
  const bad = { ok: false, status: 502 };
  const bodyWith = (model: string) => JSON.stringify({ model, messages: [] });
  const headersWith = (key: string) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  });

  it("rewrites the model to the gateway namespace and mints a token on the happy path", async () => {
    fetchMock.mockResolvedValue(ok);
    const gatewayFetch = createGatewayChatFetch("Qwen/Qwen3.5-9B", () => "together-key");

    const resp = await gatewayFetch("https://ai-gateway.convex.dev/v1/chat/completions", {
      method: "POST",
      headers: headersWith("placeholder"),
      body: bodyWith("Qwen/Qwen3.5-9B"),
    });

    expect(resp.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ai-gateway.convex.dev/v1/chat/completions");
    expect(init.headers.get("Authorization")).toBe("Bearer gateway-test-token");
    expect(JSON.parse(init.body).model).toBe("qwen/qwen3.5-9b");
  });

  it("retries a failed gateway call directly against Together with the original model id", async () => {
    fetchMock.mockResolvedValueOnce(bad).mockResolvedValueOnce(ok);
    const gatewayFetch = createGatewayChatFetch("Qwen/Qwen3.5-9B", () => "together-key");

    const resp = await gatewayFetch("https://ai-gateway.convex.dev/v1/chat/completions", {
      method: "POST",
      headers: headersWith("placeholder"),
      body: bodyWith("Qwen/Qwen3.5-9B"),
    });

    expect(resp.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [fallbackUrl, fallbackInit] = fetchMock.mock.calls[1];
    expect(String(fallbackUrl)).toBe("https://api.together.xyz/v1/chat/completions");
    expect(fallbackInit.headers.get("Authorization")).toBe("Bearer together-key");
    expect(JSON.parse(fallbackInit.body).model).toBe("Qwen/Qwen3.5-9B");
  });

  it("propagates the gateway failure when no Together key is available", async () => {
    fetchMock.mockResolvedValueOnce(bad);
    const gatewayFetch = createGatewayChatFetch("Qwen/Qwen3.5-9B", () => "");

    const resp = await gatewayFetch("https://ai-gateway.convex.dev/v1/chat/completions", {
      method: "POST",
      headers: headersWith("placeholder"),
      body: bodyWith("Qwen/Qwen3.5-9B"),
    });

    expect(resp.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("streamGatewayChatCompletions", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("yields parsed SSE chunks with delta content and the final usage", async () => {
    const sse = [
      'data: {"choices":[{"delta":{"content":"Hel"}}]}',
      "",
      'data: {"choices":[{"delta":{"content":"lo"}}],"usage":{"prompt_tokens":2,"completion_tokens":2,"total_tokens":4}}',
      "data: [DONE]",
      "",
    ].join("\n");
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sse));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, body: stream }));

    const chunks = [];
    for await (const chunk of streamGatewayChatCompletions({ model: "qwen/qwen3.5-9b" })) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(2);
    expect(chunks[0].choices?.[0]?.delta?.content).toBe("Hel");
    expect(chunks[1].usage).toEqual({ prompt_tokens: 2, completion_tokens: 2, total_tokens: 4 });
  });

  it("throws with the status and body snippet on a non-2xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => '{"error":"rate limited"}',
        body: null,
      })
    );

    // An async generator only throws when iterated; the first next() reaches the
    // non-2xx response and rejects.
    const iterator = streamGatewayChatCompletions({});
    await expect(iterator.next()).rejects.toThrow(/429/);
  });
});
