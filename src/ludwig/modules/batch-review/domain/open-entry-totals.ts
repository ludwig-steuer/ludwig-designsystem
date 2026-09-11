import { isRuleBooked } from "./rule-booked";

/**
 * Wie viele offene Vorschläge die Karten der Abnahme zeigen — je Reiter (F200).
 *
 * Gegen die Zahl am Stapel gehalten, macht sie sichtbar, wenn Sätze auf keiner
 * Karte auftauchen — sonst sieht ein fehlender Satz aus wie einer im anderen
 * Reiter (Willems 07-2026: elf Vorschläge standen in „Wiederkehrende").
 *
 * Reiter-Zuordnung wie in Schritt 3: nach Herkunft der Sätze (F202).
 */
export function openEntryTotals(
  cards: ReadonlyArray<{ proposals: ReadonlyArray<{ status: string; origin: string | null }> }>,
): { rule: number; individual: number } {
  let rule = 0;
  let individual = 0;
  for (const c of cards) {
    const n = c.proposals.filter((p) => p.status === "proposed").length;
    if (isRuleBooked(c)) rule += n;
    else individual += n;
  }
  return { rule, individual };
}
