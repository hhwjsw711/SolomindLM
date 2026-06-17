import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { isNativeShell } from "@/utils/platformDetection";
import { useForkNotebookFromToken, usePeekShareToken } from "../../services/notebooksApi";

/**
 * Landing page for fork-only share links: /share/fork/:token
 */
export function ForkNotebookPage() {
  const { t } = useTranslation("notebooks");
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => {
    const m = location.pathname.match(/^\/share\/fork\/([^/]+)\/?$/);
    return m?.[1] ?? null;
  }, [location.pathname]);
  const fork = useForkNotebookFromToken();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const preview = usePeekShareToken(token);

  const handleFork = async () => {
    if (!token) return;
    setWorking(true);
    setError(null);
    try {
      const { newNotebookId } = await fork({ token });
      navigate(`/notebook/${newNotebookId}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("forkNotebookPage.couldNotDuplicate"));
    } finally {
      setWorking(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold font-sans mb-2">{t("forkNotebookPage.title")}</h1>
      {preview === undefined && (
        <p className="text-muted-foreground text-sm">{t("forkNotebookPage.loading")}</p>
      )}
      {preview === null && (
        <p className="text-destructive text-sm">{t("forkNotebookPage.invalidLink")}</p>
      )}
      {preview && preview.kind !== "fork" && (
        <p className="text-destructive text-sm">{t("forkNotebookPage.notForkLink")}</p>
      )}
      {preview && preview.kind === "fork" && (
        <>
          <p className="text-muted-foreground text-sm mb-6">
            {t("forkNotebookPage.youWillGetCopy")}
            <span className="font-medium text-foreground">{preview.title}</span>{" "}
            {t("forkNotebookPage.copyDescription")}
          </p>
          <button
            type="button"
            disabled={working}
            onClick={() => void handleFork()}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50"
          >
            {working
              ? t("forkNotebookPage.duplicating")
              : t("forkNotebookPage.duplicateToMyAccount")}
          </button>
        </>
      )}
      {error && <p className="text-destructive text-sm mt-4">{error}</p>}
      {!isNativeShell() && (
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mt-8 text-sm text-muted-foreground hover:text-foreground underline"
        >
          {t("forkNotebookPage.backToHome")}
        </button>
      )}
    </main>
  );
}
