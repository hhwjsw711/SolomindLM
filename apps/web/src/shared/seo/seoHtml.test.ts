import { describe, expect, it } from "vitest";
import { getPublicSeoPageByPath } from "./publicSeoPages";
import { applySeoToHtml, canonicalUrl, seoPageToHeadInput } from "./seoHtml";

const MINIMAL_HTML = `<!doctype html>
<html lang="en">
  <head>
    <title>Old Title</title>
    <meta name="description" content="Old description" />
    <link rel="canonical" href="https://example.com/" />
  </head>
  <body><div id="root"></div></body>
</html>`;

describe("canonicalUrl", () => {
  it("normalizes root path", () => {
    expect(canonicalUrl("https://solomindlm.com", "/")).toBe("https://solomindlm.com/");
  });

  it("joins nested paths", () => {
    expect(canonicalUrl("https://solomindlm.com", "/privacy")).toBe(
      "https://solomindlm.com/privacy"
    );
  });
});

describe("applySeoToHtml", () => {
  it("injects privacy page title and canonical", () => {
    const page = getPublicSeoPageByPath("/privacy");
    expect(page).toBeDefined();

    const html = applySeoToHtml(MINIMAL_HTML, "https://solomindlm.com", seoPageToHeadInput(page!));

    expect(html).toContain("<title>Privacy Policy - SolomindLM</title>");
    expect(html).toContain('rel="canonical" href="https://solomindlm.com/privacy"');
    expect(html).toContain('name="robots" content="index, follow"');
  });

  it("injects JSON-LD for homepage", () => {
    const page = getPublicSeoPageByPath("/");
    expect(page).toBeDefined();

    const html = applySeoToHtml(MINIMAL_HTML, "https://solomindlm.com", seoPageToHeadInput(page!));

    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).not.toContain("SearchAction");
  });
});
