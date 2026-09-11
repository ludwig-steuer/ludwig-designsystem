/**
 * Der Vormonatsvergleich einer wiederkehrenden Buchung (F123 T123.4).
 *
 * Bewusst **nicht** die Drei-Monats-Engine aus `vergleich.ts`: die beantwortet
 * „sieht der Monat aus wie sonst?" für ein ganzes Konto und verweigert die
 * Aussage unter zwei Vormonaten. Ein Dauersachverhalt stellt eine andere
 * Frage — „ist die Miete dieselbe wie letzten Monat?" —, und die hat genau
 * einen Bezugswert. Beides in eine Funktion zu zwingen hieße, eine der beiden
 * Fragen falsch zu beantworten.
 *
 * Rein und ohne IO.
 */

const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** Bis hierhin ist die Abweichung Rundung, kein Unterschied. */
const GLEICH = 0.005;

/** Der übliche Preisgang. Darüber will die Zeile angesehen werden. */
export const PREVIOUS_MONTH_THRESHOLD = 0.1;

export interface PreviousMonthComparison {
  /** Die Zeile in der Spalte „Vormonat". */
  text: string;
  tone: "ok" | "warn" | "none";
}

export function compareWithPreviousMonth(
  betrag: number | null,
  vormonat: number | null,
): PreviousMonthComparison {
  // Ohne Bezugswert gibt es keinen Vergleich — und keine erfundene Beruhigung.
  if (betrag === null || vormonat === null || vormonat === 0) {
    return { text: "kein Vormonat", tone: "none" };
  }
  const abw = (Math.abs(betrag) - Math.abs(vormonat)) / Math.abs(vormonat);
  if (Math.abs(abw) < GLEICH) return { text: "wie Vormonat", tone: "ok" };
  const pz = `${abw > 0 ? "+" : "−"}${Math.round(Math.abs(abw) * 100)} %`;
  return {
    text: `${pz} zu ${EUR.format(Math.abs(vormonat))}`,
    tone: Math.abs(abw) < PREVIOUS_MONTH_THRESHOLD ? "ok" : "warn",
  };
}
