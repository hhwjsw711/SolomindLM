import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/shared/contexts/useToast";
import {
  getLimitErrorMessage,
  getServiceErrorMessage,
  type ParsedLimitError,
  type ParsedServiceError,
  parseAppError,
} from "@/shared/utils/errorParser";

/**
 * Maps Convex / structured app errors to in-app toasts (ToastProvider).
 */
export function useServiceErrorToast() {
  const { error: toastError } = useToast();
  const { t } = useTranslation("common");

  const showError = useCallback(
    (err: unknown) => {
      const parsed = parseAppError(err);
      if (!parsed) {
        toastError(err instanceof Error ? err.message : t("errors.somethingWentWrong"));
        return;
      }
      if ("isLimitError" in parsed && (parsed as ParsedLimitError).isLimitError) {
        toastError(getLimitErrorMessage(parsed as ParsedLimitError));
        return;
      }
      toastError(getServiceErrorMessage(parsed as ParsedServiceError));
    },
    [toastError, t]
  );

  return { showError };
}
