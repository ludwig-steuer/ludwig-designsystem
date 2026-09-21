import type { ReviewTab } from "@/ludwig/modules/accounting-cases";

/**
 * Die Reiter von Schritt 3: das Offene nach Prüfbedarf (F232) — „Bitte
 * anschauen", „Wahrscheinlich richtig" und, nur wenn er etwas enthält,
 * „Mandantenstapel" — und dahinter „Freigegeben" für alles Entschiedene.
 * Ein Fall wandert nach der Entscheidung dorthin, statt im Reiter liegen zu
 * bleiben; ein Filter „nur offene" braucht es deshalb nicht. Davor, nur wenn
 * es welche gibt, „Zurück an KI" (F260): zurückgegebene Vorschläge, die der
 * Agent noch nicht neu gemacht hat.
 * Die Zahlen sind die Fälle je Reiter.
 */
export type Step3Tab = ReviewTab | "returned" | "released";
export type ReviewTabCounts = Record<Step3Tab, number>;

export function visibleReviewTabs(counts: ReviewTabCounts): Step3Tab[] {
  const tabs: Step3Tab[] = ["needs_review", "likely_correct"];
  if (counts.client_batch > 0) tabs.push("client_batch");
  if (counts.returned > 0) tabs.push("returned");
  tabs.push("released");
  return tabs;
}

/**
 * Der Reiter aus `?tab=`. Ohne (oder mit einem alten Wert aus einem
 * Lesezeichen — `recurring`, `single`, `liste`) beginnt die Arbeit dort, wo
 * etwas offen ist, in der Reihenfolge der Reiter; ist nichts mehr offen, bei
 * „Freigegeben". „Zurück an KI" wählt er nie von selbst — dort ist nichts zu tun.
 */
export function pickReviewTab(raw: string | null, counts: ReviewTabCounts): Step3Tab {
  const visible: readonly string[] = visibleReviewTabs(counts);
  if (raw !== null && visible.includes(raw)) return raw as Step3Tab;
  if (counts.needs_review > 0) return "needs_review";
  if (counts.likely_correct > 0) return "likely_correct";
  if (counts.client_batch > 0) return "client_batch";
  if (counts.released > 0) return "released";
  return "likely_correct";
}
