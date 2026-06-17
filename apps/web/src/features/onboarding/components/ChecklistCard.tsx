import { ChevronDown, ChevronUp, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useServiceErrorToast } from "@/shared/hooks/useServiceErrorToast";
import {
  useChecklistProgress,
  useDismissChecklist,
  useOnboardingState,
} from "../services/onboardingApi";
import { ChecklistItem } from "./ChecklistItem";

const COLLAPSED_KEY = "onboardingChecklistCollapsed";

function logOnboardingError(action: string, error: unknown) {
  console.error(`[onboarding] ${action}`, error);
}

const ORDER = ["createNotebook", "addSource", "askQuestion", "generateArtifact"] as const;

export const ChecklistCard: React.FC = () => {
  const { t } = useTranslation("onboarding");
  const location = useLocation();
  const state = useOnboardingState();
  const progress = useChecklistProgress();
  const dismiss = useDismissChecklist();
  const { showError } = useServiceErrorToast();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage?.getItem?.(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage?.setItem?.(COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      // ignore storage errors (private mode, quota, missing API)
    }
  }, [collapsed]);

  if (!state || !progress) return null;
  if ("tourStatus" in state && state.tourStatus === "completed") return null;
  if ("checklistDismissed" in state && state.checklistDismissed) return null;

  const isHome = location.pathname === "/home";
  const isNotebook = location.pathname.startsWith("/notebook/");
  if (!isHome && !isNotebook) return null;

  const completed = ORDER.filter((k) => progress[k]).length;
  if (completed === ORDER.length) return null;

  const handleDismiss = () => {
    void dismiss({}).catch((error) => {
      logOnboardingError("failed to dismiss checklist", error);
      showError(error);
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[45] w-72 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-semibold">
          {t("checklist.title", { completed, total: ORDER.length })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={collapsed ? t("checklist.expand") : t("checklist.collapse")}
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 hover:bg-accent rounded"
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            aria-label={t("checklist.dismiss")}
            onClick={handleDismiss}
            className="p-1 hover:bg-accent rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {!collapsed && (
        <ul className="p-3">
          {ORDER.map((id) => (
            <ChecklistItem key={id} label={t(`checklist.items.${id}`)} done={progress[id]} />
          ))}
        </ul>
      )}
    </div>
  );
};
