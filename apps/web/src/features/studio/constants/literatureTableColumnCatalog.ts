import i18next from "@/i18n";
import type { TableColumn } from "../components/ColumnManager";

/** Optional extraction columns users can add from Manage Columns → Default Columns. */
export const LITERATURE_TABLE_COLUMN_CATALOG: Omit<TableColumn, "isVisible" | "order">[] = [
  {
    id: "insights",
    name: i18next.t("studio:literatureTableColumnCatalog.insights.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.insights.instructions"),
    isSystem: false,
  },
  {
    id: "tldr",
    name: i18next.t("studio:literatureTableColumnCatalog.tldr.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.tldr.instructions"),
    isSystem: false,
  },
  {
    id: "summary",
    name: i18next.t("studio:literatureTableColumnCatalog.summary.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.summary.instructions"),
    isSystem: false,
  },
  {
    id: "research_question",
    name: i18next.t("studio:literatureTableColumnCatalog.research_question.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.research_question.instructions"),
    isSystem: false,
  },
  {
    id: "methodology",
    name: i18next.t("studio:literatureTableColumnCatalog.methodology.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.methodology.instructions"),
    isSystem: false,
  },
  {
    id: "key_findings",
    name: i18next.t("studio:literatureTableColumnCatalog.key_findings.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.key_findings.instructions"),
    isSystem: false,
  },
  {
    id: "primary_outcomes",
    name: i18next.t("studio:literatureTableColumnCatalog.primary_outcomes.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.primary_outcomes.instructions"),
    isSystem: false,
  },
  {
    id: "limitations",
    name: i18next.t("studio:literatureTableColumnCatalog.limitations.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.limitations.instructions"),
    isSystem: false,
  },
  {
    id: "interventions",
    name: i18next.t("studio:literatureTableColumnCatalog.interventions.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.interventions.instructions"),
    isSystem: false,
  },
  {
    id: "conclusion",
    name: i18next.t("studio:literatureTableColumnCatalog.conclusion.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.conclusion.instructions"),
    isSystem: false,
  },
  {
    id: "research_gaps",
    name: i18next.t("studio:literatureTableColumnCatalog.research_gaps.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.research_gaps.instructions"),
    isSystem: false,
  },
  {
    id: "funding_source",
    name: i18next.t("studio:literatureTableColumnCatalog.funding_source.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.funding_source.instructions"),
    isSystem: false,
  },
  {
    id: "introduction_summary",
    name: i18next.t("studio:literatureTableColumnCatalog.introduction_summary.name"),
    type: "custom",
    instructions: i18next.t(
      "studio:literatureTableColumnCatalog.introduction_summary.instructions"
    ),
    isSystem: false,
  },
  {
    id: "discussion_summary",
    name: i18next.t("studio:literatureTableColumnCatalog.discussion_summary.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.discussion_summary.instructions"),
    isSystem: false,
  },
  {
    id: "hypotheses_tested",
    name: i18next.t("studio:literatureTableColumnCatalog.hypotheses_tested.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.hypotheses_tested.instructions"),
    isSystem: false,
  },
  {
    id: "future_research",
    name: i18next.t("studio:literatureTableColumnCatalog.future_research.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.future_research.instructions"),
    isSystem: false,
  },
  {
    id: "dependent_variables",
    name: i18next.t("studio:literatureTableColumnCatalog.dependent_variables.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.dependent_variables.instructions"),
    isSystem: false,
  },
  {
    id: "independent_variables",
    name: i18next.t("studio:literatureTableColumnCatalog.independent_variables.name"),
    type: "custom",
    instructions: i18next.t(
      "studio:literatureTableColumnCatalog.independent_variables.instructions"
    ),
    isSystem: false,
  },
  {
    id: "study_design_col",
    name: i18next.t("studio:literatureTableColumnCatalog.study_design_col.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.study_design_col.instructions"),
    isSystem: false,
  },
  {
    id: "objectives",
    name: i18next.t("studio:literatureTableColumnCatalog.objectives.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.objectives.instructions"),
    isSystem: false,
  },
  {
    id: "sample_size",
    name: i18next.t("studio:literatureTableColumnCatalog.sample_size.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.sample_size.instructions"),
    isSystem: false,
  },
  {
    id: "notable_results",
    name: i18next.t("studio:literatureTableColumnCatalog.notable_results.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.notable_results.instructions"),
    isSystem: false,
  },
  {
    id: "real_world_metric",
    name: i18next.t("studio:literatureTableColumnCatalog.real_world_metric.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.real_world_metric.instructions"),
    isSystem: false,
  },
  {
    id: "domain",
    name: i18next.t("studio:literatureTableColumnCatalog.domain.name"),
    type: "custom",
    instructions: i18next.t("studio:literatureTableColumnCatalog.domain.instructions"),
    isSystem: false,
  },
];

export function catalogColumnInTable(
  catalogId: string,
  columns: TableColumn[]
): TableColumn | undefined {
  const catalogEntry = LITERATURE_TABLE_COLUMN_CATALOG.find((c) => c.id === catalogId);
  const catalogName = catalogEntry?.name.toLowerCase();
  return columns.find(
    (c) => c.id === catalogId || (catalogName && c.name.toLowerCase() === catalogName)
  );
}
