import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uncachedLlmCall } from "./cachedLlm";
import { chatViaGateway, mapGatewayModelId } from "./llmGateway";

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
});
