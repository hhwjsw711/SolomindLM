import { describe, expect, it } from "vitest";
import { LlmJudgeParseError, parseJsonResponse } from "./llmJudge";

describe("parseJsonResponse", () => {
  it("parses bare JSON objects", () => {
    const result = parseJsonResponse(
      '{"score":0.9,"reasoning":"Good","hallucinations":[],"missing":[]}'
    );
    expect(result.score).toBe(0.9);
  });

  it("strips markdown fences", () => {
    const result = parseJsonResponse(
      '```json\n{"score":0.7,"reasoning":"ok"}\n```'
    );
    expect(result.score).toBe(0.7);
  });

  it("extracts JSON embedded in prose", () => {
    const result = parseJsonResponse(
      'Here is my evaluation:\n{"score":0.6,"reasoning":"partial"}'
    );
    expect(result.score).toBe(0.6);
  });

  it("throws instead of returning a synthetic passing score", () => {
    expect(() => parseJsonResponse("not json at all")).toThrow(LlmJudgeParseError);
    expect(() => parseJsonResponse("not json at all")).toThrow(/parse/i);
  });

  it("rejects JSON arrays", () => {
    expect(() => parseJsonResponse("[1,2,3]")).toThrow(LlmJudgeParseError);
  });
});
