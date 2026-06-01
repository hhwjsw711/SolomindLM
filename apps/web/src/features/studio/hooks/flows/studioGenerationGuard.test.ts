import { describe, expect, it } from "vitest";
import { getStudioGenerationBlocker } from "./studioGenerationGuard";

describe("getStudioGenerationBlocker", () => {
  it("requires sign-in when not authenticated", () => {
    expect(getStudioGenerationBlocker({ isAuthenticated: false, notebookId: "nb_123" })).toBe(
      "Please sign in to continue."
    );
  });

  it("requires a notebook when authenticated but notebook id is missing", () => {
    expect(getStudioGenerationBlocker({ isAuthenticated: true, notebookId: null })).toBe(
      "Open a notebook before creating studio content."
    );
  });

  it("returns null when authenticated with a notebook id", () => {
    expect(getStudioGenerationBlocker({ isAuthenticated: true, notebookId: "nb_123" })).toBeNull();
  });
});
