"use node";

/**
 * Convex AI Gateway routing for audio (TTS_VIA_GATEWAY / TRANSCRIPTION_VIA_GATEWAY=1).
 * The gateway's speech route returns raw PCM (mp3 also available); Kokoro voices carry over
 * (`af_sky` et al.), and the response's `audio/pcm;rate=N;channels=1` content type states
 * the sample rate authoritatively (live-verified: rate=24000, channels=1 for Kokoro). The
 * PCM bytes are wrapped in a WAV header locally so the existing pipeline — per-line WAV
 * concatenation, duration, and MP3 encoding — keeps working unchanged. A gateway failure
 * falls back to the direct Together call while a key is set; otherwise the error propagates.
 * Transcription on the gateway takes base64 JSON (`input_audio`), not multipart; audio
 * above the gateway's 16 MiB JSON limit is rejected up front with a clear message.
 */

import { getServiceToken } from "convex/server";
import { createServiceLogger } from "../../_lib/logging/serviceLogger";

const GATEWAY_API_BASE = "https://ai-gateway.convex.dev/v1";

export function ttsViaGateway(): boolean {
  return /^(1|true|yes)$/i.test(process.env.TTS_VIA_GATEWAY ?? "");
}

export function transcriptionViaGateway(): boolean {
  return /^(1|true|yes)$/i.test(process.env.TRANSCRIPTION_VIA_GATEWAY ?? "");
}

/** Gateway model id for a Together TTS model (all-lowercase namespace). */
export function mapGatewayTtsModel(model: string): string {
  // hexgrad/Kokoro-82M → hexgrad/kokoro-82m; single-segment ids pass through.
  const slash = model.indexOf("/");
  if (slash === -1) return model;
  return model.toLowerCase();
}

export function mapGatewayTranscriptionModel(model: string): string {
  // openai/whisper-large-v3 is already the gateway namespace, lowercased for safety.
  const slash = model.indexOf("/");
  if (slash === -1) return model;
  return model.toLowerCase();
}

async function gatewayServiceToken(): Promise<string> {
  return getServiceToken("ai-gateway");
}

/** Wrap raw 16-bit little-endian mono PCM in a WAV header at the given sample rate. */
export function pcmToWavBuffer(pcm: Uint8Array, sampleRate: number): Buffer {
  const out = Buffer.alloc(44 + pcm.byteLength);
  const dv = new DataView(out.buffer, out.byteOffset, out.byteLength);
  const ascii = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) out[offset + i] = s.charCodeAt(i);
  };
  ascii(0, "RIFF");
  dv.setUint32(4, 36 + pcm.byteLength, true);
  ascii(8, "WAVE");
  ascii(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  ascii(36, "data");
  dv.setUint32(40, pcm.byteLength, true);
  out.set(pcm, 44);
  return out;
}

/** Parse `audio/pcm;rate=N;channels=1` (or `audio/pcm`) into the sample rate. */
export function parsePcmContentType(contentType: string | null): {
  sampleRate: number;
  mono: boolean;
} {
  const defaultRate = 24000; // live-verified Kokoro rate; used when the header is absent.
  if (!contentType) return { sampleRate: defaultRate, mono: true };
  const rateMatch = contentType.match(/rate=(\d+)/i);
  const channelsMatch = contentType.match(/channels=(\d+)/i);
  return {
    sampleRate: rateMatch ? parseInt(rateMatch[1], 10) : defaultRate,
    mono: channelsMatch ? channelsMatch[1] === "1" : true,
  };
}

export interface GatewaySpeechParams {
  model: string;
  input: string;
  voice: string;
  timeoutMs: number;
}

/**
 * Synthesize speech through the gateway and return a WAV Buffer (PCM wrapped locally,
 * sample rate taken from the response content type). Throws on non-2xx or timeout.
 */
export async function synthesizeGatewaySpeech(params: GatewaySpeechParams): Promise<Buffer> {
  const logger = createServiceLogger("ai-gateway", "synthesizeGatewaySpeech");
  const { model, input, voice, timeoutMs } = params;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = await gatewayServiceToken();
    const response = await fetch(`${GATEWAY_API_BASE}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: mapGatewayTtsModel(model),
        input,
        voice,
        response_format: "pcm",
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`ai-gateway speech failed: HTTP ${response.status} ${body.slice(0, 200)}`);
    }
    const pcm = new Uint8Array(await response.arrayBuffer());
    if (pcm.byteLength === 0) {
      throw new Error("ai-gateway speech returned no audio bytes");
    }
    const { sampleRate, mono } = parsePcmContentType(response.headers.get("content-type"));
    if (!mono) {
      logger.warn("Gateway speech returned multi-channel audio; expected mono", {
        contentType: response.headers.get("content-type"),
      });
    }
    return pcmToWavBuffer(pcm, sampleRate);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The gateway's 16 MiB JSON body limit as an audio-byte ceiling: base64 inflates bytes
 * by 4/3 (12 MiB → 16 MiB exactly) and the JSON fields (model, input_audio) add more,
 * so 11 MiB of audio stays inside the limit with overhead budget to spare.
 */
export const GATEWAY_TRANSCRIPTION_MAX_BYTES = 11 * 1024 * 1024;

export interface GatewayTranscriptionParams {
  model: string;
  /** Raw audio bytes (wav, mp3, m4a, …). */
  audio: Uint8Array;
  /** Audio filename or extension, e.g. "upload.wav". */
  format: string;
  timeoutMs: number;
}

/**
 * Transcribe audio through the gateway's base64 JSON route. `format` is the extension
 * without the dot (wav, mp3, flac, m4a, ogg, webm, aac).
 */
export async function transcribeGatewayAudio(params: GatewayTranscriptionParams): Promise<string> {
  const { model, audio, format, timeoutMs } = params;
  if (audio.byteLength > GATEWAY_TRANSCRIPTION_MAX_BYTES) {
    throw new Error(
      `audio too large for gateway transcription (${(audio.byteLength / 1024 / 1024).toFixed(1)} MB > ${(
        GATEWAY_TRANSCRIPTION_MAX_BYTES / 1024 / 1024
      ).toFixed(0)} MB); transcribe directly via Together instead`
    );
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = await gatewayServiceToken();
    const response = await fetch(`${GATEWAY_API_BASE}/audio/transcriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: mapGatewayTranscriptionModel(model),
        input_audio: {
          data: Buffer.from(audio).toString("base64"),
          format,
        },
      }),
      signal: controller.signal,
    });
    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(
        `ai-gateway transcription failed: HTTP ${response.status} ${bodyText.slice(0, 200)}`
      );
    }
    const data = JSON.parse(bodyText) as { text?: string };
    const text = data.text;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new Error("ai-gateway transcription returned empty text");
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}
