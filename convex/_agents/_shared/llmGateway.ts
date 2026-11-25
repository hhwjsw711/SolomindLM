"use node";

/**
 * Convex AI Gateway routing for Together-hosted chat models (CHAT_VIA_GATEWAY=1).
 * The gateway serves the same OpenAI-compatible chat/completions shape, so the existing
 * request-body builder and response parsing carry over; only the endpoint, auth (a
 * short-lived deployment service token minted per request, no stored provider key), and
 * the model id namespace (`Qwen/Qwen3.5-9B` → `qwen/qwen3.5-9b`) change. Callers with no
 * Together quota run gateway-only: failures propagate, there is no Together fallback.
 * Flag unset (self-hosted default) keeps the direct Together path unchanged.
 */

import { getServiceToken } from "convex/server";

export const GATEWAY_API_BASE = "https://ai-gateway.convex.dev/v1";
export const GATEWAY_CHAT_COMPLETIONS_URL = `${GATEWAY_API_BASE}/chat/completions`;

/** Read per request (not via the static env object) so tests can stub it. */
export function chatViaGateway(): boolean {
  return /^(1|true|yes)$/i.test(process.env.CHAT_VIA_GATEWAY ?? "");
}

/** Together model-id prefixes → gateway provider prefixes; unmapped prefixes lowercase. */
const MODEL_PREFIX_MAP: Record<string, string> = {
  Qwen: "qwen",
  "deepseek-ai": "deepseek",
  openai: "openai",
  "meta-llama": "meta-llama",
  mistralai: "mistralai",
  togethercomputer: "togethercomputer",
};

export function mapGatewayModelId(model: string): string {
  const slash = model.indexOf("/");
  if (slash === -1) return model;
  const prefix = model.slice(0, slash);
  // Gateway ids are all-lowercase (`qwen/qwen3.5-9b`, `deepseek/deepseek-v4.1-flash`).
  const mapped = MODEL_PREFIX_MAP[prefix] ?? prefix.toLowerCase();
  return `${mapped}${model.slice(slash).toLowerCase()}`;
}

/** Mint a short-lived gateway token; only callable inside an action. */
export async function gatewayServiceToken(): Promise<string> {
  return getServiceToken("ai-gateway");
}

/**
 * fetch with gateway auth, for OpenAI/LangChain clients that take a custom fetch
 * (their own Authorization header is replaced per request, so tokens never go stale).
 */
export async function gatewayAuthFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = await gatewayServiceToken();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}

/** POST a chat-completions body to the gateway. Non-streaming JSON responses. */
export async function gatewayChatCompletions(
  body: Record<string, unknown>,
  opts: { signal?: AbortSignal } = {}
): Promise<Response> {
  const token = await gatewayServiceToken();
  return fetch(GATEWAY_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
}
