import { LANDING_FAQS } from "@/features/landing/constants";
import { LEGAL_LAST_UPDATED_ISO } from "@/features/legal/legalMeta";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
  SEO_DEFAULT_OG_IMAGE,
  SEO_DEFAULT_TITLE,
} from "./seoConstants";
import {
  generateFAQStructuredData,
  generateOrganizationStructuredData,
  generateSoftwareApplicationStructuredData,
  generateWebSiteStructuredData,
} from "./structuredData";

export type PublicSeoPage = {
  /** Canonical path, e.g. `/` or `/privacy` */
  path: string;
  title: string;
  description: string;
  keywords?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: "summary" | "summary_large_image";
  /** When true, page is omitted from sitemap and gets noindex robots. */
  noindex?: boolean;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
  /** ISO date (YYYY-MM-DD); sitemap generator may override with build date. */
  lastmod?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
};

const HOME_STRUCTURED_DATA = [
  generateOrganizationStructuredData(),
  generateWebSiteStructuredData(),
  generateSoftwareApplicationStructuredData(),
  generateFAQStructuredData(LANDING_FAQS),
];

export const PUBLIC_SEO_PAGES: PublicSeoPage[] = [
  {
    path: "/",
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: SEO_DEFAULT_KEYWORDS,
    ogImage: SEO_DEFAULT_OG_IMAGE,
    ogImageAlt: "SolomindLM logo",
    changefreq: "weekly",
    priority: 1.0,
    structuredData: HOME_STRUCTURED_DATA,
  },
  {
    path: "/privacy",
    title: "Privacy Policy - SolomindLM",
    description:
      "How SolomindLM collects, uses, and shares information when you use our notebooks, sources, AI features, and billing.",
    changefreq: "monthly",
    priority: 0.3,
    lastmod: LEGAL_LAST_UPDATED_ISO,
  },
  {
    path: "/terms",
    title: "Terms of Service - SolomindLM",
    description:
      "Terms that apply when you use SolomindLM’s AI research notebooks, sources, chat, and study tools.",
    changefreq: "monthly",
    priority: 0.3,
    lastmod: LEGAL_LAST_UPDATED_ISO,
  },
];

export function getPublicSeoPageByPath(path: string): PublicSeoPage | undefined {
  const normalized = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return PUBLIC_SEO_PAGES.find((page) => page.path === normalized);
}

export function getIndexablePublicSeoPages(): PublicSeoPage[] {
  return PUBLIC_SEO_PAGES.filter((page) => !page.noindex);
}
