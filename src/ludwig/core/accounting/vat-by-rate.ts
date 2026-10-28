/**
 * Die Umsatzsteuer eines Belegs nach Steuersatz — die Aufteilung, die es
 * nirgends fertig gab (Befund L-279).
 *
 * Am Kopf stehen nur `subtotal_value` und `tax_total_value`; welcher Teil davon
 * mit 19 % und welcher mit 7 % läuft, steht ausschließlich an den Positionen.
 * Die Übersicht zeigt die Aufteilung, **sobald zwei Sätze vorkommen** — bei
 * einem Satz sagt sie nichts, was Netto und Steuer nicht schon sagen, und die
 * Zeichnung lässt sie dann weg (0150).
 *
 * **Gemessen (Staging, 2026-09-10):** 1083 Positionen, davon 1078 mit Netto;
 * 192 mit Netto ohne Steuersatz und 630 mit Netto ohne Steuerbetrag. Von 419
 * Rechnungen mit Positionen tragen **10** zwei oder mehr Sätze, neun davon
 * lückenlos. Die Aufteilung ist also der Ausnahmefall — und genau deshalb darf
 * sie nicht geschätzt werden.
 *
 * **Keine halbe Aufteilung, keine gerechnete Steuer.** Fehlt einer Position mit
 * Netto der Satz oder der Steuerbetrag, entfällt die Aufteilung ganz. Die
 * Alternative wäre, den fehlenden Betrag aus Satz × Netto zu rechnen — das
 * ergäbe eine zweite Wahrheit neben dem, was auf dem Beleg ausgewiesen ist,
 * und bei 630 lückenhaften Positionen wäre sie der Regelfall statt der
 * Ausnahme.
 */

/** Ein Steuersatz des Belegs mit seinen Summen. Form wie `VatRateShare` (0150). */
export interface VatRateShare {
  /** 19, 7, 0 — die Prozentzahl, nicht der formatierte Text. */
  rate: number;
  net: number;
  vat: number;
}

/** Was die Aufteilung von einer Position braucht. */
export interface VatLineAmounts {
  taxRatePercent: number | null;
  taxValue: number | null;
  lineTotalNetValue: number | null;
}

export function vatByRate(lines: readonly VatLineAmounts[]): VatRateShare[] {
  const mitNetto = lines.filter((l) => l.lineTotalNetValue != null);
  if (mitNetto.length === 0) return [];
  // Eine Lücke macht jede Summe darunter falsch — dann lieber gar keine.
  if (mitNetto.some((l) => l.taxRatePercent == null || l.taxValue == null)) return [];

  const jeSatz = new Map<number, VatRateShare>();
  for (const l of mitNetto) {
    // Zahlen sind hier wirklich Zahlen: die Abfrage schickt jede Position durch
    // `num()`, und die Schranke oben hat die NULL-Fälle ausgeschlossen.
    const rate = l.taxRatePercent!;
    const share = jeSatz.get(rate) ?? { rate, net: 0, vat: 0 };
    share.net += l.lineTotalNetValue!;
    share.vat += l.taxValue!;
    jeSatz.set(rate, share);
  }
  // Der höhere Satz zuerst: er trägt in aller Regel den größeren Teil, und die
  // Reihenfolge soll nicht je Beleg wechseln.
  return [...jeSatz.values()]
    .map((s) => ({ rate: s.rate, net: round2(s.net), vat: round2(s.vat) }))
    .sort((a, b) => b.rate - a.rate);
}

/** Cent, nicht Gleitkomma-Rauschen: 38,25 + 0,77 darf nicht 39,019999 werden. */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
