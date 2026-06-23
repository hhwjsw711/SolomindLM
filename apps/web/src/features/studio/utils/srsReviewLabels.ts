import { calculateNextReview, initializeProficiency } from "@convex/_lib/srsScheduling";
import i18next from "@/i18n";
import type { Flashcard } from "@/shared/types";

const MS_MIN = 60_000;
const MS_HOUR = 3_600_000;
const MS_DAY = 24 * MS_HOUR;

export type SrsRating = "again" | "hard" | "good" | "easy";

/**
 * Human-readable time until next review (matches convex/_lib/srsScheduling.ts).
 */
export function formatIntervalUntilNextReview(deltaMs: number): string {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
    return i18next.t("studio:srsReview.dueSoon");
  }

  const minutes = Math.ceil(deltaMs / MS_MIN);
  if (minutes < 90) {
    return i18next.t("studio:srsReview.inMin", { n: Math.max(1, minutes) });
  }

  const hours = Math.round(deltaMs / MS_HOUR);
  if (hours < 48) {
    return i18next.t("studio:srsReview.inHour", { n: hours });
  }

  const days = Math.round(deltaMs / MS_DAY);
  if (days < 14) {
    return i18next.t(days === 1 ? "studio:srsReview.inDay_one" : "studio:srsReview.inDay_other", {
      n: days,
    });
  }

  if (days < 56) {
    const weeks = Math.round(deltaMs / (7 * MS_DAY));
    return i18next.t("studio:srsReview.inWeek", { n: weeks });
  }

  const months = Math.round(days / 30);
  return i18next.t("studio:srsReview.inMonth", { n: Math.max(1, months) });
}

/**
 * Subtitle for a rating button: time until this card would be due if you chose that rating.
 */
export function srsSubtextForRating(
  proficiency: Flashcard["proficiency"] | undefined,
  rating: SrsRating
): string {
  const base = proficiency ?? initializeProficiency();
  const { nextReviewDate } = calculateNextReview(
    {
      interval: base.interval,
      easeFactor: base.easeFactor,
      phase: base.phase,
      learningStep: base.learningStep,
      totalReviews: base.totalReviews,
    },
    rating
  );
  return formatIntervalUntilNextReview(nextReviewDate - Date.now());
}
