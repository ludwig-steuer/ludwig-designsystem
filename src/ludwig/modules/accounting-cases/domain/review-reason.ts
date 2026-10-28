import type { ReviewReason } from "./review-score";

/**
 * F355/F357 — der **Prüfgrund**: der stärkste Grund aus dem Prüfbedarf-Score,
 * als ein Wort in der Zeile. Wörter, Ton und Erklärung stehen in der
 * Status-Registry (Achse `review_reason`); hier nur die Codes.
 *
 * Die Reihenfolge des Arrays **ist die Rangfolge** bei Punktgleichstand
 * (Tabelle in F355 Abschnitt 1). Tragweite „Aufwand oder Ertrag" und
 * Präzedenz haben keinen Code: sie zählen in Punkten und im (i), sind aber
 * nie der stärkste Grund.
 *
 * `check_red`, `check_yellow` und `tax_sensitive` tragen den Prüfpunkt als
 * Zusatz (`ReviewReason.checkCode`); ihr Wort ist dessen Kurzwort
 * (`PRUEFPUNKT_KURZWORT`).
 */
export const REVIEW_REASON_CODES = [
  "check_red",
  // F348 (llcto 2026-10-02): hinter check_red — „so nicht richtig" ist dringender.
  "general_reversal",
  "judge_flag",
  "judge_missing",
  "confidence_red",
  "reverse_charge",
  "special_tax_key",
  "tax_sensitive",
  "judge_adjust",
  "check_yellow",
  "confidence_low",
  "judge_note",
  // H5: nur, wenn sonst kein Grund vorliegt — erklärt „Bitte anschauen" aus
  // Grundlast + fehlender Präzedenz (25 + 25), ohne Punkte zu ändern.
  "first_time",
] as const;
export type ReviewReasonCode = (typeof REVIEW_REASON_CODES)[number];

export interface TopReviewReason {
  reason: ReviewReason;
  /** Weitere Gründe mit Prüfgrund-Code — „+n" hinter dem Wort. */
  moreCount: number;
}

/**
 * Die Prüfgründe, stärkster zuerst: die meisten Punkte, bei Gleichstand nach
 * der Rangfolge. Gründe ohne Code (Grundlast, Präzedenz) fallen heraus. So
 * erwartet sie die Zeile (`ProposalRow.reviewReasons`, DS 0218).
 */
export function rankReviewReasons(reasons: readonly ReviewReason[]): ReviewReason[] {
  const rang = (r: ReviewReason) => REVIEW_REASON_CODES.indexOf(r.code!);
  const mitCode = reasons.filter((r) => r.code !== null);
  // „Erstmals so gebucht" ist nur Prüfgrund, wenn es keinen anderen gibt (H5).
  const andere = mitCode.filter((r) => r.code !== "first_time");
  return (andere.length > 0 ? andere : mitCode).sort((a, b) => b.points - a.points || rang(a) - rang(b));
}

/** Der stärkste Grund und wie viele dahinter stehen — null = Routine, die Zelle bleibt leer. */
export function topReviewReason(reasons: readonly ReviewReason[]): TopReviewReason | null {
  const [top, ...rest] = rankReviewReasons(reasons);
  return top ? { reason: top, moreCount: rest.length } : null;
}
