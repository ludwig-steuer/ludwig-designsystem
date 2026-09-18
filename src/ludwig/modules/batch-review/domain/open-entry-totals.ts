import type { ReviewTab } from "@/ludwig/modules/accounting-cases";

/**
 * Wie viele offene Vorschläge die Karten der Abnahme zeigen — je Reiter (F200).
 *
 * Gegen die Zahl am Stapel gehalten, macht sie sichtbar, wenn Sätze auf keiner
 * Karte auftauchen — sonst sieht ein fehlender Satz aus wie einer im anderen
 * Reiter (Willems 07-2026: elf Vorschläge standen in „Wiederkehrende").
 *
 * Reiter-Zuordnung wie in Schritt 3: nach Prüfbedarf des Falls (F232).
 */
export function openEntryTotals<
  C extends { proposals: ReadonlyArray<{ status: string; origin: string | null }> },
>(cards: ReadonlyArray<C>, tabOf: (card: C) => ReviewTab): Record<ReviewTab, number> {
  const out: Record<ReviewTab, number> = { needs_review: 0, likely_correct: 0, client_batch: 0 };
  for (const c of cards) {
    out[tabOf(c)] += c.proposals.filter((p) => p.status === "proposed").length;
  }
  return out;
}
