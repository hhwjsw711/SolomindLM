"use node";

import Together from "together-ai";
import { env } from "../../_lib/env";
import { synthesizeGatewaySpeech, ttsViaGateway } from "./audioGateway";

/**
 * The Together SDK client — used directly when TTS_VIA_GATEWAY is unset, and as the
 * fallback path when the gateway fails. Constructed lazily in gateway mode so a
 * deployment without TOGETHER_AI_API_KEY still constructs cleanly.
 */
export function createTogetherTtsClient(): Together {
  const apiKey = env.TOGETHER_AI_API_KEY;
  if (!apiKey && !ttsViaGateway()) {
    throw new Error(
      "TOGETHER_AI_API_KEY is not set (or set TTS_VIA_GATEWAY=1 to route speech through the Convex AI Gateway)"
    );
  }
  if (!apiKey) {
    // Gateway-only: the SDK client is never used; a dummy key keeps its constructor happy.
    return new Together({ apiKey: "gateway-only-placeholder" });
  }
  return new Together({ apiKey });
}

/** Direct (non-gateway) synthesis; also the fallback for the gateway route. */
async function synthesizeDirectToBuffer(
  client: Together,
  params: {
    model: string;
    input: string;
    voice: string;
    timeoutMs: number;
  }
): Promise<Buffer> {
  const { model, input, voice, timeoutMs } = params;
  const response = await Promise.race([
    client.audio.speech.create({
      model,
      input,
      voice,
      response_format: "wav",
      sample_rate: 24000,
      language: "en",
      stream: false,
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TTS timeout")), timeoutMs)
    ),
  ]);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Non-streaming TTS via Together `/v1/audio/speech` (Kokoro, Orpheus, etc.).
 * We request WAV per line so multi-voice snippets can be concatenated as PCM;
 * callers encode the final combined file once for compact, seekable playback.
 *
 * With TTS_VIA_GATEWAY set, the gateway route runs first (PCM returned raw, wrapped
 * into a WAV buffer locally at the content-type's sample rate) and the direct Together
 * call is the fallback while an API key is set; without a key the gateway error
 * propagates. The returned buffer is a valid WAV on every route.
 */
export async function synthesizeSpeechToBuffer(
  client: Together,
  params: {
    model: string;
    input: string;
    voice: string;
    timeoutMs: number;
  }
): Promise<Buffer> {
  if (!ttsViaGateway()) {
    return synthesizeDirectToBuffer(client, params);
  }
  try {
    return await synthesizeGatewaySpeech(params);
  } catch (error) {
    const apiKey = env.TOGETHER_AI_API_KEY;
    if (!apiKey) throw error;
    console.warn(
      "[TTS] Gateway speech failed, falling back to direct Together:",
      error instanceof Error ? error.message : String(error)
    );
    // The passed client was built for the direct path; use it as-is.
    return synthesizeDirectToBuffer(client, params);
  }
}
