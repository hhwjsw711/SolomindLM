import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import commonEn from "./locales/en/common.json";
import landingEn from "./locales/en/landing.json";
import commonZh from "./locales/zh/common.json";
import landingZh from "./locales/zh/landing.json";

export const SUPPORTED_LANGS = ["en", "zh"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: "English",
  zh: "简体中文",
};

const resources = {
  en: { common: commonEn, landing: landingEn },
  zh: { common: commonZh, landing: landingZh },
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
