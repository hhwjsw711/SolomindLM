#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getIndexablePublicSeoPages } from "../src/shared/seo/publicSeoPages.ts";
import { SEO_BASE_URL } from "../src/shared/seo/seoConstants.ts";
import { canonicalUrl } from "../src/shared/seo/seoHtml.ts";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, "../dist");
const publicDir = path.resolve(scriptDir, "../public");
const buildDate = new Date().toISOString().slice(0, 10);

function buildSitemapXml(): string {
  const urls = getIndexablePublicSeoPages()
    .map((page) => {
      const loc = canonicalUrl(SEO_BASE_URL, page.path);
      const lastmod = page.lastmod ?? buildDate;
      const changefreq = page.changefreq ?? "monthly";
      const priority = page.priority ?? 0.5;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const sitemap = buildSitemapXml();

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf-8");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf-8");

console.log(`[generate-sitemap] Wrote sitemap.xml (${getIndexablePublicSeoPages().length} URLs)`);
