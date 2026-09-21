/**
 * F263 — die Zeilen einer Generalumkehr: dieselben Zeilen, nur Soll und Haben
 * getauscht. Konto, Betrag, Steuerschlüssel, Belegfelder, Kostenstellen,
 * Steuerzeilen-Bezug bleiben 1:1 — in DATEV hebt die Umkehr das Original so
 * Zeile für Zeile auf.
 */
export function buildReversalLines<T extends { side: "debit" | "credit" }>(lines: readonly T[]): T[] {
  return lines.map((l) => ({ ...l, side: l.side === "debit" ? "credit" : "debit" }));
}
