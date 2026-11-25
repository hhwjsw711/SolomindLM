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

/** Derive a lowercase extension (without the dot) from a storage URL's file name. */
function audioFormatFromUrl(fileUrl: string): string {
  try {
    const pathname = new URL(fileUrl).pathname;
    const name = pathname.split("/").pop() ?? "";
    const dot = name.lastIndexOf(".");
    const ext = dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
    return ext || "wav";
  } catch {
    return "wav";
  }
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

    const viaGateway = transcriptionViaGateway() && this.apiKey !== "";
    // Download once; the gateway route needs the bytes, the direct route reuses them
    // as a Blob (multipart) instead of the URL string Together also accepts.
    let audioBytes: Uint8Array | null = null;
    if (viaGateway) {
      try {
        const download = await fetch(fileUrl, { signal: AbortSignal.timeout(60_000) });
        if (!download.ok) {
          throw new Error(`audio download failed: HTTP ${download.status}`);
        }
        audioBytes = new Uint8Array(await download.arrayBuffer());
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
            format: audioFormatFromUrl(fileUrl),
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
