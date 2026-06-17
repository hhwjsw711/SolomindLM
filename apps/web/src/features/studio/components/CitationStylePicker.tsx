import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils/cn";

export type CitationStyle =
  | "apa7"
  | "apa6"
  | "mla9"
  | "mla8"
  | "chicago17"
  | "chicago17_notes"
  | "ama11"
  | "ama10"
  | "acs"
  | "ieee"
  | "vancouver"
  | "harvard";

export interface CitationStylePickerProps {
  value: CitationStyle;
  onChange: (style: CitationStyle) => void;
  disabled?: boolean;
  className?: string;
}

export const CitationStylePicker: React.FC<CitationStylePickerProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const { t } = useTranslation("studio");

  const STYLE_OPTIONS: { value: CitationStyle; label: string }[] = [
    { value: "apa7", label: t("citationStylePicker.apa7th") },
    { value: "apa6", label: t("citationStylePicker.apa6th") },
    { value: "mla9", label: t("citationStylePicker.mla9th") },
    { value: "mla8", label: t("citationStylePicker.mla8th") },
    { value: "chicago17", label: t("citationStylePicker.chicago17AuthorDate") },
    { value: "chicago17_notes", label: t("citationStylePicker.chicago17Notes") },
    { value: "ama11", label: t("citationStylePicker.ama11th") },
    { value: "ama10", label: t("citationStylePicker.ama10th") },
    { value: "acs", label: t("citationStylePicker.acs") },
    { value: "ieee", label: t("citationStylePicker.ieee") },
    { value: "vancouver", label: t("citationStylePicker.vancouver") },
    { value: "harvard", label: t("citationStylePicker.harvard") },
  ];

  return (
    <div className={cn("relative inline-block min-w-0 max-w-full", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CitationStyle)}
        disabled={disabled}
        className="w-full max-w-full appearance-none truncate bg-background border border-border rounded-md px-3 py-1.5 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        aria-label={t("citationStylePicker.selectStyle")}
      >
        {STYLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
