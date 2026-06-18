import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANG_LABELS, SUPPORTED_LANGS, type SupportedLang } from "@/i18n";
import { useLanguage } from "@/shared/contexts/useLanguage";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation("common");

  const nextLang: SupportedLang = language === "en" ? "zh" : "en";

  const toggleLanguage = () => {
    setLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-secondary transition-colors shrink-0"
      title={LANG_LABELS[nextLang]}
      aria-label={t("languageSwitcher.switchTo", { language: LANG_LABELS[nextLang] })}
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">
        {SUPPORTED_LANGS.find((l) => l === nextLang)?.toUpperCase() ?? nextLang}
      </span>
    </button>
  );
}
