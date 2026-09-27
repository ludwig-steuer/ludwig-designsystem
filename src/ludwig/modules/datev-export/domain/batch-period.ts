/**
 * F297 — liegt ein Buchungsdatum außerhalb des Stapelzeitraums? Die reine
 * Vergleichslogik von Guard B5 (F189), damit Submit, Annahme und Freigabe
 * dieselbe Kante ziehen.
 *
 * Nur reguläre Stapel: ein Mandantenstapel trägt den Zeitraum seiner
 * Lieferung. Ohne Zeitraum keine Prüfung.
 */
export function isOutsideBatchPeriod(
  bookingDate: string,
  batch: { periodFrom: string | null; periodTo: string | null; kind: string | null },
): boolean {
  if (!batch.periodFrom || !batch.periodTo || batch.kind !== "regular") return false;
  const date = bookingDate.slice(0, 10);
  return date < batch.periodFrom.slice(0, 10) || date > batch.periodTo.slice(0, 10);
}
