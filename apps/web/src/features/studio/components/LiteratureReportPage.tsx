import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
/** Legacy full-page route — redirects into notebook split view (studio panel). */
export const LiteratureReportPage: React.FC = () => {
  const { t } = useTranslation("studio");
  const { id, reportId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !reportId) return;
    navigate(`/notebook/${id}?literatureReport=${reportId}`, { replace: true });
  }, [id, reportId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">{t("literatureReportPage.openingReport")}</div>
    </div>
  );
};
