import i18next from "@/i18n";
import {
  extractSearchQueriesFromDetails,
  parseResearchStepMetadata,
  type ResearchStep,
} from "../components/researchStepTypes";

/** Steps shown in the deep research chat timeline. */
export const VISIBLE_DEEP_RESEARCH_STEP_TYPES = new Set(["searching", "generating_report"]);

export function getDeepResearchStepConfig(): Record<
  string,
  { title: string; description: string }
> {
  return {
    searching: {
      title: i18next.t("chat:deepResearchStep.searching.title"),
      description: i18next.t("chat:deepResearchStep.searching.description"),
    },
    generating_report: {
      title: i18next.t("chat:deepResearchStep.generating_report.title"),
      description: i18next.t("chat:deepResearchStep.generating_report.description"),
    },
  };
}

export interface SubQuestionForSteps {
  searchQueries: string[];
}

export function mapDeepResearchSteps(
  stepsData: Array<{
    stepType: string;
    status: string;
    details?: string;
    metadata?: unknown;
  }>,
  subQuestions: SubQuestionForSteps[]
): ResearchStep[] {
  const planningQueries = subQuestions.flatMap((sq) =>
    sq.searchQueries.filter((q) => q.trim().length > 0)
  );

  return stepsData
    .filter((step) => VISIBLE_DEEP_RESEARCH_STEP_TYPES.has(step.stepType))
    .map((step) => {
      const { searchQueries, papersFound } = parseResearchStepMetadata(step.metadata);
      const detailsQueries = step.details
        ? extractSearchQueriesFromDetails(step.details)
        : undefined;
      const resolvedQueries =
        step.stepType === "searching" && planningQueries.length > 0
          ? planningQueries
          : (searchQueries ?? detailsQueries);

      const stepConfig = getDeepResearchStepConfig()[step.stepType];

      return {
        type: step.stepType,
        status: step.status as ResearchStep["status"],
        title: stepConfig?.title ?? step.stepType,
        description: stepConfig?.description ?? "",
        details: step.details?.trim() === "Report generation complete" ? undefined : step.details,
        searchQueries: resolvedQueries,
        papersFound,
      };
    });
}
