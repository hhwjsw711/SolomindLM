import { describe, expect, it } from "vitest";
import {
  getComparisonPages,
  getSeoContentBreadcrumbItems,
  getSeoContentPageByPath,
  getSeoContentPaths,
  SEO_CONTENT_PAGES,
} from "./seoContentPages";

describe("SEO_CONTENT_PAGES", () => {
  it("registers the three programmatic SEO pages at expected paths", () => {
    expect(getSeoContentPaths()).toEqual([
      "/compare/better-memory-vs-notebooklm",
      "/guides/how-to-study-from-pdfs-with-ai",
      "/guides/how-to-do-an-ai-literature-review",
    ]);
    expect(SEO_CONTENT_PAGES).toHaveLength(3);
  });
});

describe("getComparisonPages", () => {
  it("returns only compare-type SEO content pages", () => {
    const pages = getComparisonPages();
    expect(pages).toHaveLength(1);
    expect(pages[0]?.path).toBe("/compare/better-memory-vs-notebooklm");
    expect(pages.every((page) => page.pageType === "compare")).toBe(true);
  });
});

describe("getSeoContentBreadcrumbItems", () => {
  it("returns Home → Compare → page for comparison content", () => {
    const page = getSeoContentPageByPath("/compare/better-memory-vs-notebooklm");
    expect(page).toBeDefined();

    expect(getSeoContentBreadcrumbItems(page!)).toEqual([
      { name: "Home", path: "/" },
      { name: "Compare", path: "/compare/better-memory-vs-notebooklm" },
      { name: "BETTER-MEMORY vs NotebookLM", path: "/compare/better-memory-vs-notebooklm" },
    ]);
  });

  it("returns Home → Guides → page for guide content", () => {
    const page = getSeoContentPageByPath("/guides/how-to-do-an-ai-literature-review");
    expect(page).toBeDefined();

    expect(getSeoContentBreadcrumbItems(page!)).toEqual([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides/how-to-study-from-pdfs-with-ai" },
      { name: "AI literature review guide", path: "/guides/how-to-do-an-ai-literature-review" },
    ]);
  });
});

describe("compare page content", () => {
  it("includes a comparison table and quick answer", () => {
    const page = getSeoContentPageByPath("/compare/better-memory-vs-notebooklm");
    expect(page?.comparisonTable?.length).toBeGreaterThan(0);
    expect(page?.quickAnswer?.chooseBetterMemory).toBeTruthy();
    expect(page?.quickAnswer?.chooseCompetitor).toBeTruthy();
    expect(page?.faqs.some((faq) => faq.question.includes("NotebookLM alternative"))).toBe(true);
  });
});
