import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import authEn from "./locales/en/auth.json";
import billingEn from "./locales/en/billing.json";
import chatEn from "./locales/en/chat.json";
import commonEn from "./locales/en/common.json";
import landingEn from "./locales/en/landing.json";
import notebooksEn from "./locales/en/notebooks.json";
import onboardingEn from "./locales/en/onboarding.json";
import sourcesEn from "./locales/en/sources.json";
import studioEn from "./locales/en/studio.json";
import authZh from "./locales/zh/auth.json";
import billingZh from "./locales/zh/billing.json";
import chatZh from "./locales/zh/chat.json";
import commonZh from "./locales/zh/common.json";
import landingZh from "./locales/zh/landing.json";
import notebooksZh from "./locales/zh/notebooks.json";
import onboardingZh from "./locales/zh/onboarding.json";
import sourcesZh from "./locales/zh/sources.json";
import studioZh from "./locales/zh/studio.json";

export const SUPPORTED_LANGS = ["en", "zh"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: "English",
  zh: "简体中文",
};

const resources = {
  en: {
    common: commonEn,
    landing: landingEn,
    notebooks: notebooksEn,
    onboarding: onboardingEn,
    chat: chatEn,
    sources: sourcesEn,
    studio: studioEn,
    auth: authEn,
    billing: billingEn,
  },
  zh: {
    common: commonZh,
    landing: landingZh,
    notebooks: notebooksZh,
    onboarding: onboardingZh,
    chat: chatZh,
    sources: sourcesZh,
    studio: studioZh,
    auth: authZh,
    billing: billingZh,
  },
};

export const FALLBACK_LANG: SupportedLang = "en";

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: FALLBACK_LANG,
    supportedLngs: SUPPORTED_LANGS,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "better-memory_lang",
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18next;
