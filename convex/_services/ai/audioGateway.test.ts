import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GATEWAY_TRANSCRIPTION_MAX_BYTES,
  mapGatewayTranscriptionModel,
  mapGatewayTtsModel,
  parsePcmContentType,
  pcmToWavBuffer,
  transcribeGatewayAudio,
} from "./audioGateway";
import { synthesizeSpeechToBuffer } from "./togetherTts";
import { getPcmWavDurationSeconds } from "./wav";

// Keep the real convex/server exports; only getServiceToken is stubbed.
vi.mock("convex/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex/server")>();
  return { ...actual, getServiceToken: vi.fn(async () => "gateway-test-token") };
});
// togetherTts reads env.TOGETHER_AI_API_KEY at module load; stub it for the fallback test.
vi.mock("../../_lib/env", () => ({ env: { TOGETHER_AI_API_KEY: "together-fallback-key" } }));

describe("mapGatewayTtsModel / mapGatewayTranscriptionModel", () => {
  it("lowercases Together audio model ids into the gateway namespace", () => {
    expect(mapGatewayTtsModel("hexgrad/Kokoro-82M")).toBe("hexgrad/kokoro-82m");
    expect(mapGatewayTranscriptionModel("openai/whisper-large-v3")).toBe("openai/whisper-large-v3");
    expect(mapGatewayTtsModel("bare-model")).toBe("bare-model");
  });
});

describe("parsePcmContentType", () => {
  it("reads rate and channels from the gateway's PCM content type", () => {
    const { sampleRate, mono } = parsePcmContentType("audio/pcm;rate=24000;channels=1");
    expect(sampleRate).toBe(24000);
    expect(mono).toBe(true);
  });

  it("defaults to the live-verified Kokoro rate when absent", () => {
    expect(parsePcmContentType(null).sampleRate).toBe(24000);
    expect(parsePcmContentType("audio/pcm").sampleRate).toBe(24000);
    expect(parsePcmContentType("audio/pcm;rate=16000;channels=2").mono).toBe(false);
  });
});

describe("pcmToWavBuffer", () => {
  it("wraps PCM in a parseable WAV header at the given sample rate", () => {
    const pcm = new Uint8Array(48000); // 1 second at 24kHz mono 16-bit.
    const wav = pcmToWavBuffer(pcm, 24000);
    expect(getPcmWavDurationSeconds(wav)).toBeCloseTo(1.0, 2);
    // RIFF/WAVE magic for downstream parsers.
    expect(wav.subarray(0, 4).toString("latin1")).toBe("RIFF");
    expect(wav.subarray(8, 12).toString("latin1")).toBe("WAVE");
  });
});

describe("transcribeGatewayAudio", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends base64 JSON and returns the text", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ text: " hello world" }),
    });

    const text = await transcribeGatewayAudio({
      model: "openai/whisper-large-v3",
      audio: new Uint8Array([1, 2, 3]),
      format: "wav",
      timeoutMs: 1000,
    });

    expect(text).toBe(" hello world");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ai-gateway.convex.dev/v1/audio/transcriptions");
    expect(init.headers.Authorization).toBe("Bearer gateway-test-token");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("openai/whisper-large-v3");
    expect(body.input_audio.format).toBe("wav");
    expect(body.input_audio.data).toBe(Buffer.from([1, 2, 3]).toString("base64"));
  });

  it("rejects oversized audio before any network call", async () => {
    const big = new Uint8Array(GATEWAY_TRANSCRIPTION_MAX_BYTES + 1);
    await expect(
      transcribeGatewayAudio({ model: "m", audio: big, format: "wav", timeoutMs: 1000 })
    ).rejects.toThrow(/too large/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws with status and body on a non-2xx response", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => '{"error":"rate limited"}',
    });
    await expect(
      transcribeGatewayAudio({
        model: "m",
        audio: new Uint8Array([1]),
        format: "wav",
        timeoutMs: 1000,
      })
    ).rejects.toThrow(/429/);
  });

  it("throws on empty text", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ text: "  " }),
    });
    await expect(
      transcribeGatewayAudio({
        model: "m",
        audio: new Uint8Array([1]),
        format: "wav",
        timeoutMs: 1000,
      })
    ).rejects.toThrow(/empty/i);
  });
});

describe("synthesizeSpeechToBuffer (TTS_VIA_GATEWAY)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  // A Together stub whose audio.speech.create is only reached on the fallback path.
  const createSpeechMock = vi.fn(async () => new Response(new Uint8Array(100)));
  const togetherStub = {
    audio: { speech: { create: createSpeechMock } },
  } as unknown as Parameters<typeof synthesizeSpeechToBuffer>[0];

  it("routes through the gateway and returns a valid WAV from raw PCM", async () => {
    vi.stubEnv("TTS_VIA_GATEWAY", "1");
    const pcm = new Uint8Array(24000); // 0.5s at 24kHz.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "audio/pcm;rate=24000;channels=1" }),
      arrayBuffer: async () => pcm.buffer,
    });

    const wav = await synthesizeSpeechToBuffer(togetherStub, {
      model: "hexgrad/Kokoro-82M",
      input: "hello",
      voice: "af_sky",
      timeoutMs: 5000,
    });

    expect(getPcmWavDurationSeconds(wav)).toBeCloseTo(0.5, 2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ai-gateway.convex.dev/v1/audio/speech");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("hexgrad/kokoro-82m");
    expect(body.voice).toBe("af_sky");
    expect(body.response_format).toBe("pcm");
  });

  it("falls back to the direct Together call when the gateway fails", async () => {
    vi.stubEnv("TTS_VIA_GATEWAY", "1");
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "upstream unavailable",
    });
    createSpeechMock.mockReset();
    createSpeechMock.mockResolvedValueOnce(new Response(new Uint8Array(200)));

    const buffer = await synthesizeSpeechToBuffer(togetherStub, {
      model: "hexgrad/Kokoro-82M",
      input: "hello",
      voice: "af_sky",
      timeoutMs: 5000,
    });

    expect(buffer.byteLength).toBe(200);
    expect(createSpeechMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the direct Together path when the flag is off", async () => {
    vi.stubEnv("TTS_VIA_GATEWAY", "");
    createSpeechMock.mockReset();
    createSpeechMock.mockResolvedValueOnce(new Response(new Uint8Array(50)));

    const buffer = await synthesizeSpeechToBuffer(togetherStub, {
      model: "hexgrad/Kokoro-82M",
      input: "hello",
      voice: "af_sky",
      timeoutMs: 5000,
    });

    expect(buffer.byteLength).toBe(50);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(createSpeechMock).toHaveBeenCalledTimes(1);
    const call = createSpeechMock.mock.calls[0][0] as Record<string, unknown>;
    expect(call.response_format).toBe("wav");
    expect(call.sample_rate).toBe(24000);
  });
});
