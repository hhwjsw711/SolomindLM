export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "bn", label: "বাংলা" },
  { code: "zh-CN", label: "中文(简体)" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "tr", label: "Türkçe" },
  { code: "ur", label: "اردو" },
  { code: "vi", label: "Tiếng Việt" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
