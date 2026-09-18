/**
 * Ist ein Sachverhalt regelgebucht? (F202) — seit F232 kein eigener Reiter mehr,
 * sondern der Schalter für die Kontext-Zone „Regel & Periode".
 *
 * Kriterium ist die **Herkunft der Sätze**, nicht die Sachverhaltsart: nur
 * wenn **alle** Sätze im Stapel aus der Regel kommen (`origin =
 * 'recurring_rule'`). Gemischt (Regel-Sollstellung + Agent-Zahlung) und ein von
 * Hand korrigierter Regel-Satz (`manual`) gehören nicht dazu — dort gibt es
 * etwas zu prüfen. Ohne Satz: nicht regelgebucht.
 */
export function isRuleBooked(card: {
  proposals: ReadonlyArray<{ origin: string | null }>;
}): boolean {
  return card.proposals.length > 0 && card.proposals.every((p) => p.origin === "recurring_rule");
}
