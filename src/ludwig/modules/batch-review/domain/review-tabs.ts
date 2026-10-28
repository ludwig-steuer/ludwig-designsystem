import type { ReviewTab } from "@/ludwig/modules/accounting-cases";

/**
 * Die Reiter von Schritt 3: das Offene nach Prüfbedarf (F232) — „Bitte
 * anschauen", „Wahrscheinlich richtig" und, nur wenn sie etwas enthalten,
 * „Geparkt (Klärung)" (F496) und „Mandantenstapel" — und dahinter
 * „Freigegeben" für alles Entschiedene.
 * Ein Fall wandert nach der Entscheidung dorthin, statt im Reiter liegen zu
 * bleiben; ein Filter „nur offene" braucht es deshalb nicht. Davor, nur wenn
 * es welche gibt, „Zurück an KI" (F260): zurückgegebene Vorschläge, die der
 * Agent noch nicht neu gemacht hat. Nach dem Mandantenstapel, nur wenn es
 * welche gibt, „Ohne Vorschlag" (F350): Fälle am Stapel ohne lebenden Satz.
 * Danach, ebenso nur mit Inhalt, „Sammelzahlungen" (F354): Sammelfälle des
 * Mandanten mit Rest auf dem Personenkonto — die Menge von Gate 4d.
 * Die Zahlen sind die Fälle je Reiter.
 */
/** Die Reiter, die `Step3Single` rendert. */
export type CaseListTab = ReviewTab | "returned" | "released";
/** Alle Reiter von Schritt 3 — „Ohne Vorschlag" (F350) und „Sammelzahlungen" (F354) rendern `Step3WithoutProposal`. */
export type Step3Tab = CaseListTab | "without_proposal" | "collective";
export type ReviewTabCounts = Record<Step3Tab, number>;

export function visibleReviewTabs(counts: ReviewTabCounts): Step3Tab[] {
  const tabs: Step3Tab[] = ["needs_review", "likely_correct"];
  // F496: geparkte Sätze (Klärungskonto) — nur mit Inhalt.
  if (counts.parked > 0) tabs.push("parked");
  if (counts.client_batch > 0) tabs.push("client_batch");
  if (counts.without_proposal > 0) tabs.push("without_proposal");
  if (counts.collective > 0) tabs.push("collective");
  if (counts.returned > 0) tabs.push("returned");
  tabs.push("released");
  return tabs;
}

/**
 * Der Reiter aus `?tab=`. Ohne Angabe beginnt die Arbeit dort, wo
 * etwas offen ist, in der Reihenfolge der Reiter; ist nichts mehr offen, bei
 * „Freigegeben". „Zurück an KI" wählt er nie von selbst — dort ist nichts zu tun.
 */
export function pickReviewTab(raw: string | null, counts: ReviewTabCounts): Step3Tab {
  const visible: readonly string[] = visibleReviewTabs(counts);
  if (raw !== null && visible.includes(raw)) return raw as Step3Tab;
  if (counts.needs_review > 0) return "needs_review";
  if (counts.likely_correct > 0) return "likely_correct";
  if (counts.parked > 0) return "parked";
  if (counts.client_batch > 0) return "client_batch";
  if (counts.without_proposal > 0) return "without_proposal";
  if (counts.collective > 0) return "collective";
  if (counts.released > 0) return "released";
  return "likely_correct";
}
