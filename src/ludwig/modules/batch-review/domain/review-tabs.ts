import type { ReviewTab } from "@/ludwig/modules/accounting-cases";

/**
 * Die Reiter von Schritt 3 nach Prüfbedarf (F232): „Bitte anschauen",
 * „Wahrscheinlich richtig" und — nur wenn er etwas enthält — „Mandantenstapel".
 * Die Zahlen sind die offenen Fälle je Reiter.
 */
export type ReviewTabCounts = Record<ReviewTab, number>;

export function visibleReviewTabs(counts: ReviewTabCounts): ReviewTab[] {
  return counts.client_batch > 0
    ? ["needs_review", "likely_correct", "client_batch"]
    : ["needs_review", "likely_correct"];
}

/**
 * Der Reiter aus `?tab=`. Ohne (oder mit einem alten Wert aus einem
 * Lesezeichen — `recurring`, `single`, `liste`) beginnt die Arbeit dort, wo
 * etwas anzuschauen ist, sonst bei den wahrscheinlich richtigen; der
 * Mandantenstapel nur, wenn sonst nichts offen ist.
 */
export function pickReviewTab(raw: string | null, counts: ReviewTabCounts): ReviewTab {
  const visible: readonly string[] = visibleReviewTabs(counts);
  if (raw !== null && visible.includes(raw)) return raw as ReviewTab;
  if (counts.needs_review > 0) return "needs_review";
  if (counts.likely_correct === 0 && counts.client_batch > 0) return "client_batch";
  return "likely_correct";
}
