import { BookOpen, Globe, Loader2, PenTool, Sparkles } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const PHASE_ICONS: Record<string, React.ElementType> = {
  planning: Sparkles,
  retrieving_notebook: BookOpen,
  retrieving_web: Globe,
  synthesizing: Sparkles,
  gap_analysis: Sparkles,
  writing: PenTool,
};

interface ResearchProgressProps {
  phase: string;
  subQuestionId?: string;
  sourcesFound?: number;
  iteration?: number;
}

export const ResearchProgress: React.FC<ResearchProgressProps> = ({
  phase,
  sourcesFound,
  iteration,
}) => {
  const { t } = useTranslation();
  const Icon = PHASE_ICONS[phase] ?? Loader2;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-lg text-sm">
      <Icon className="w-4 h-4 text-primary animate-pulse" />
      <span className="text-foreground font-medium">
        {t(`researchProgress.${phase}`, { defaultValue: phase })}
      </span>
      {sourcesFound !== undefined && (
        <span className="text-muted-foreground text-xs">
          {t("researchProgress.sourcesFound", { count: sourcesFound })}
        </span>
      )}
      {iteration !== undefined && iteration > 0 && (
        <span className="text-muted-foreground text-xs">
          {t("researchProgress.pass", { n: iteration + 1 })}
        </span>
      )}
    </div>
  );
};
