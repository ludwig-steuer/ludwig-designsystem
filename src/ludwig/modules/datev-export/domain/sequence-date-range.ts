/**
 * Der DATEV-Zeitraum eines Push-Bodys (F199): der Stapel-Zeitraum, erweitert
 * um jedes Buchungsdatum außerhalb. Die Grundmenge ist der Stempel, nicht der
 * Zeitraum — ein im Zyklus gestempelter Nachzügler mit älterem Datum muss vom
 * DATEV-Zeitraum gedeckt sein.
 *
 * ISO-Daten (`YYYY-MM-DD`) vergleichen sich als Strings korrekt.
 */
export function sequenceDateRange(
  period: { from: string; to: string },
  bookingDates: readonly string[],
): { from: string; to: string } {
  let from = period.from;
  let to = period.to;
  for (const d of bookingDates) {
    if (d < from) from = d;
    if (d > to) to = d;
  }
  return { from, to };
}
