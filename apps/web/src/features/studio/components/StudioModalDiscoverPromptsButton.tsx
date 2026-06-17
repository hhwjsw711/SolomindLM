import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { StudioTool } from "../services/promptsApi";
import { DiscoverStudioPromptsModal } from "./DiscoverStudioPromptsModal";

interface StudioModalDiscoverPromptsButtonProps {
  studioTool: StudioTool;
  onApplyPrompt: (promptText: string) => void;
}

export function StudioModalDiscoverPromptsButton({
  studioTool,
  onApplyPrompt,
}: StudioModalDiscoverPromptsButtonProps) {
  const { t } = useTranslation("studio");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="shrink-0 rounded-xl border border-border bg-background px-2.5 py-2 text-[11px] font-bold tracking-wide text-foreground shadow-sm transition-colors hover:bg-accent/50 sm:px-3 sm:text-xs"
        aria-label={t("studioModalDiscoverPromptsButton.discoverPromptsAria")}
      >
        {t("studioModalDiscoverPromptsButton.discoverPrompts")}
      </button>
      <DiscoverStudioPromptsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        studioTool={studioTool}
        onApplyPrompt={onApplyPrompt}
      />
    </>
  );
}
