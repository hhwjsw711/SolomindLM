import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import chatEn from "./locales/en/chat.json";
import commonEn from "./locales/en/common.json";
import landingEn from "./locales/en/landing.json";
import sourcesEn from "./locales/en/sources.json";
import chatZh from "./locales/zh/chat.json";
import commonZh from "./locales/zh/common.json";
import landingZh from "./locales/zh/landing.json";
import sourcesZh from "./locales/zh/sources.json";

export const SUPPORTED_LANGS = ["en", "zh"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: "English",
  zh: "简体中文",
};

const resources = {
  en: { common: commonEn, landing: landingEn, chat: chatEn, sources: sourcesEn },
  zh: { common: commonZh, landing: landingZh, chat: chatZh, sources: sourcesZh },
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
      lookupLocalStorage: "solomindlm_lang",
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18next;
