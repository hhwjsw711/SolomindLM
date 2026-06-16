import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProgressBar } from "./ProgressBar";

export type GenerationStatus = "draft" | "generating" | "completed" | "failed";

export interface GenerationMetadata {
  progress?: number;
  currentStep?: string;
  phase?: string;
  error?: string;
}

interface GenerationProgressProps {
  status: GenerationStatus;
  metadata?: GenerationMetadata;
  title?: string;
  compact?: boolean;
}

export function GenerationProgress({
  status,
  metadata,
  title,
  compact = false,
}: GenerationProgressProps) {
  const { t } = useTranslation("common");

  if (status === "generating") {
    const progress = metadata?.progress ?? 0;
    const currentStep = metadata?.currentStep || t("generation.generating");

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-muted-foreground">{currentStep}</span>
          {progress > 0 && <span className="text-xs text-muted-foreground">({progress}%)</span>}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <div className="flex-1">
            {title && <p className="font-medium text-foreground">{title}</p>}
            <p className="text-sm text-muted-foreground">{currentStep}</p>
          </div>
          {progress > 0 && <span className="text-sm font-medium text-primary">{progress}%</span>}
        </div>
        {progress > 0 && <ProgressBar value={progress} />}
      </div>
    );
  }

  if (status === "completed") {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">{t("generation.completed")}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <div className="flex-1">
          {title && <p className="font-medium text-foreground">{title}</p>}
          <p className="text-sm text-muted-foreground">{t("generation.generationCompleted")}</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    const error = metadata?.error || t("generation.generationFailed");

    if (compact) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <XCircle className="w-4 h-4 text-destructive" />
          <span className="text-destructive">{t("generation.failed")}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <XCircle className="w-5 h-5 text-destructive" />
        <div className="flex-1">
          {title && <p className="font-medium text-foreground">{title}</p>}
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">{t("generation.draft")}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Clock className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1">
        {title && <p className="font-medium text-foreground">{title}</p>}
        <p className="text-sm text-muted-foreground">{t("generation.readyToGenerate")}</p>
      </div>
    </div>
  );
}
