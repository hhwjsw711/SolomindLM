import type { ReactNode } from "react";
import { useCallback, useSyncExternalStore } from "react";
import { I18nextProvider } from "react-i18next";
import i18next, { type SupportedLang } from "@/i18n";
import { LanguageContext } from "./useLanguage";

function subscribeToLanguage(callback: () => void) {
  i18next.on("languageChanged", callback);
  return () => {
    i18next.off("languageChanged", callback);
  };
}

function getSnapshot(): SupportedLang {
  const l = i18next.language;
  return l === "zh" ? "zh" : "en";
}

function getServerSnapshot(): SupportedLang {
  return (i18next.options.fallbackLng as SupportedLang) ?? "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribeToLanguage, getSnapshot, getServerSnapshot);

  const setLanguage = useCallback((lang: SupportedLang) => {
    void i18next.changeLanguage(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
    </LanguageContext.Provider>
  );
}
