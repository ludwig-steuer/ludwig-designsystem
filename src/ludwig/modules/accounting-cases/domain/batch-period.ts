/**
 * F297 — liegt ein Buchungsdatum außerhalb des Stapelzeitraums? Die reine
 * Vergleichslogik von Guard B5 (F189), damit Submit, Annahme und Freigabe
 * dieselbe Kante ziehen.
 *
 * „Außerhalb“ heißt: nach dem Stapelende oder vor dem 1.1. des Stapeljahres.
 * Vormonate desselben Jahres trägt der Stapel — der Push zieht `date_from` nach
 * vorn (`sequenceDateRange`), Kalenderjahr = Wirtschaftsjahr wie in
 * `carryOverRange` und im Push-Header (F347, Owner 2026-09-29, #190).
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
  const fiscalYearStart = `${batch.periodFrom.slice(0, 4)}-01-01`;
  return date < fiscalYearStart || date > batch.periodTo.slice(0, 10);
}

/** `date`-Spalten kommen ohne Zeitzone — direkt umstellen, nicht durch `Date`. */
export function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/** Zeitraum kurz: gleicher Monat → „01.–31.08.2026", sonst beide Daten voll. */
export function periodLabel(from: string, to: string): string {
  const a = /^(\d{4})-(\d{2})-(\d{2})/.exec(from);
  const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(to);
  if (a && b && a[1] === b[1] && a[2] === b[2]) return `${a[3]}.–${b[3]}.${b[2]}.${b[1]}`;
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}
