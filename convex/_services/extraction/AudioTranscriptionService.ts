"use node";

import { invokeWithHttpRetry } from "../../_agents/_shared/retry";
import { createExternalServiceErrorFromResponse } from "../../_lib/errors";
import { createServiceLogger } from "../../_lib/logging/serviceLogger";
import {
  GATEWAY_TRANSCRIPTION_MAX_BYTES,
  transcribeGatewayAudio,
  transcriptionViaGateway,
} from "../ai/audioGateway";

/**
 * AudioTranscriptionService — transcribes audio files using Together AI's
 * Whisper large v3 model. Follows the same pattern as MistralOCRService.
 *
 * Supported formats: .wav, .mp3, .m4a, .webm, .flac
 *
 * With TRANSCRIPTION_VIA_GATEWAY set, the Convex AI Gateway route runs first
 * (base64 JSON `input_audio`, not multipart) and the direct Together call is the
 * fallback while an API key is set; without a key the gateway error propagates.
 * Gateway audio is capped by its JSON body limit; larger files go straight to
 * the direct Together route when a key exists.
 */

/**
 * Derive a lowercase extension (without the dot) from a storage URL's file name,
 * falling back to byte sniffing (magic numbers) — never a blind WAV default, so the
 * gateway's `input_audio.format` reflects the actual encoding.
 */
function audioFormatFromUrl(fileUrl: string, audioBytes?: Uint8Array): string {
  let ext = "";
  try {
    const pathname = new URL(fileUrl).pathname;
    const name = pathname.split("/").pop() ?? "";
    const dot = name.lastIndexOf(".");
    if (dot !== -1) ext = name.slice(dot + 1).toLowerCase();
  } catch {
    // Fall through to byte sniffing.
  }
  if (ext) return ext;
  if (audioBytes) {
    const b = audioBytes;
    if (b[0] === 0x66 && b[1] === 0x4c && b[2] === 0x61 && b[3] === 0x43) return "flac";
    if (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return "ogg";
    if (b[0] === 0xff && b[1] === 0xfb) return "mp3";
    if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) return "mp3";
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return "wav";
    if (b.length > 7 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
      // ISO container (m4a/aac/mp4 family).
      return "m4a";
    }
  }
  // Undetermined: keep the historical behavior (Together's multipart route also
  // received extensionless files); Whisper treats wav as the raw-container default.
  return "wav";
}

export class AudioTranscriptionService {
  private apiKey: string;
  private baseUrl = "https://api.together.xyz/v1";
  private model = "openai/whisper-large-v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribe(fileUrl: string): Promise<string> {
    const logger = createServiceLogger("together", "audioTranscribe");
    logger.operationStart({ model: this.model });

    // The flag alone selects the gateway route — a Together key is only required for
    // the direct fallback, so gateway-only deployments (no stored key) still transcribe.
    if (transcriptionViaGateway()) {
      try {
        const download = await fetch(fileUrl, { signal: AbortSignal.timeout(60_000) });
        if (!download.ok) {
          throw new Error(`audio download failed: HTTP ${download.status}`);
        }
        const audioBytes = new Uint8Array(await download.arrayBuffer());
        if (audioBytes.byteLength > GATEWAY_TRANSCRIPTION_MAX_BYTES) {
          // Too large for the gateway's JSON body: fall through to direct Together.
          console.warn(
            `[AudioTranscription] audio too large for the gateway (${(
              audioBytes.byteLength / 1024 / 1024
            ).toFixed(1)} MB); transcribing directly via Together`
          );
        } else {
          const text = await transcribeGatewayAudio({
            model: this.model,
            audio: audioBytes,
            format: audioFormatFromUrl(fileUrl, audioBytes),
            timeoutMs: 120_000,
          });
          logger.operationComplete({ textChars: text.length, route: "gateway" });
          return text;
        }
      } catch (error) {
        if (!this.apiKey) throw error;
        logger.warn("Gateway transcription failed; falling back to direct Together", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (!this.apiKey) {
      throw new Error(
        "TOGETHER_AI_API_KEY is not set (or set TRANSCRIPTION_VIA_GATEWAY=1 to transcribe through the Convex AI Gateway)"
      );
    }
    const text = await this.transcribeDirect(fileUrl);
    logger.operationComplete({ textChars: text.length, route: "direct" });
    return text;
  }

  /** Original multipart upload against Together's transcription endpoint. */
  private async transcribeDirect(fileUrl: string): Promise<string> {
    const logger = createServiceLogger("together", "audioTranscribe");
    const text = await invokeWithHttpRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120_000);
      try {
        const t0 = Date.now();
        logger.apiCall("together", "/audio/transcriptions", {});

        const formData = new FormData();
        formData.append("file", fileUrl);
        formData.append("model", this.model);
        formData.append("response_format", "json");

        const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
          const details = data ? JSON.stringify(data) : response.statusText;
          logger.apiError(
            "together",
            "/audio/transcriptions",
            new Error(`HTTP ${response.status}`)
          );
          throw createExternalServiceErrorFromResponse(
            "together",
            response.status,
            "/audio/transcriptions",
            details.slice(0, 400)
          );
        }

        logger.apiSuccess("together", "/audio/transcriptions", Date.now() - t0, {});

        const out = data.text;
        if (!out || typeof out !== "string" || out.trim().length === 0) {
          throw new Error("Audio transcription returned empty text");
        }
        return out as string;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Audio transcription request timed out", { cause: error });
        }
        throw error;
      }
    }, "together_transcribe");

    return text;
  }
}
