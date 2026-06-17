import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
/** Legacy full-page route — redirects into notebook split view (studio panel). */
export const LiteratureTablePage: React.FC = () => {
  const { t } = useTranslation("studio");
  const { id, tableId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !tableId) return;
    navigate(`/notebook/${id}?literatureTable=${tableId}`, { replace: true });
  }, [id, tableId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">{t("literatureTablePage.openingTable")}</div>
    </div>
  );
};
