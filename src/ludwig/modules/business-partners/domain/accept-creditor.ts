/**
 * Die Annahme eines vorgeschlagenen Kreditors (L-292) — was der Dialog prüft
 * und was der Toast danach sagt. Rein, damit beides ohne UI testbar ist.
 */

/** DATEV-Kontonummer: 4 bis 20 Ziffern, wie das Eingabefeld sie verlangt. */
export function isValidDatevAccountNumber(value: string): boolean {
  return /^\d{4,20}$/.test(value);
}

/**
 * Der Satz nach der Annahme. Umgezogene Buchungen werden genannt, weil die
 * Annahme sie still auf das neue Konto hängt — sonst wüsste niemand davon.
 */
export function acceptCreditorSuccessText(accountNumber: string, reLinkedEntries: number): string {
  if (reLinkedEntries <= 0) return `Konto ${accountNumber} angelegt.`;
  return `Konto ${accountNumber} angelegt — ${reLinkedEntries} ${
    reLinkedEntries === 1 ? "Buchung" : "Buchungen"
  } umgezogen.`;
}
