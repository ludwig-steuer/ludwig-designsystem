/**
 * Steht ein Sachverhalt unter „Wiederkehrende"? (F202)
 *
 * Kriterium ist die **Herkunft der Sätze**, nicht die Sachverhaltsart: nur
 * wenn **alle** Sätze im Stapel aus der Regel kommen (`origin =
 * 'recurring_rule'`). Gemischt (Regel-Sollstellung + Agent-Zahlung) und ein von
 * Hand korrigierter Regel-Satz (`manual`) gehören zu den Einzelfällen — dort
 * gibt es etwas zu prüfen. Ohne Satz: Einzelfälle. Ein Fall steht nie in
 * beiden Reitern (Owner 2026-09-10).
 */
export function isRuleBooked(card: {
  proposals: ReadonlyArray<{ origin: string | null }>;
}): boolean {
  return card.proposals.length > 0 && card.proposals.every((p) => p.origin === "recurring_rule");
}
