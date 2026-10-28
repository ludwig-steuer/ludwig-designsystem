/**
 * Das Buchungsdatum eines Vorschlags: gewünscht, sonst das Ereignisdatum — und nie vor
 * `next_period_from` des Belegs (Konzept simple-batch-review §12, llcto 2026-10-26): ein in den nächsten
 * Zeitraum geschobener Beleg wird dort gebucht, sonst griffe `booking_date_outside_batch`.
 * ISO `yyyy-mm-dd`, rein.
 */
export function effectiveBookingDate(
  requested: string | null | undefined,
  eventDate: string,
  nextPeriodFrom: string | null | undefined,
): string {
  const base = requested ?? eventDate.slice(0, 10);
  const floor = nextPeriodFrom?.slice(0, 10) ?? null;
  return floor && floor > base ? floor : base;
}
