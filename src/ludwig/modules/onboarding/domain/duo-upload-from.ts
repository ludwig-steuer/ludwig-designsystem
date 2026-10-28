/**
 * F547 — Vorschlag für den Stichtag „Nach DUO hochladen ab" im Onboarding-Review.
 * Rein, ohne DB. Ab diesem Eingangsdatum vergibt Ludwig BEDI-GUIDs beim ersten
 * Buchungssatz eines Belegs (`docs/topics/datev.md` R39).
 */

/** Erste passende Regel gewinnt: bestätigt · Tag nach „DATEV gebucht bis" · heute minus ein Monat. */
export function proposeDuoUploadFrom(input: {
  /** `platform_clients.duo_upload_from` — Re-Onboarding behält den bestätigten Wert. */
  confirmed: string | null;
  /** „DATEV gebucht bis" (Ende des letzten importierten DATEV-Stapels). */
  bookingClosedUntilProposal: string | null;
  /** yyyy-mm-dd, Europe/Berlin. */
  today: string;
}): string {
  if (input.confirmed) return input.confirmed;
  if (input.bookingClosedUntilProposal) return shiftDate(input.bookingClosedUntilProposal, 0, 1);
  return shiftDate(input.today, -1, 0);
}

/** Monate und Tage über UTC-Datumsteile; ein fehlender Tag im Zielmonat wird dessen Monatsletzter. */
function shiftDate(isoDate: string, months: number, days: number): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number) as [number, number, number];
  const lastOfTarget = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  const shifted = new Date(Date.UTC(y, m - 1 + months, Math.min(d, lastOfTarget) + days));
  return shifted.toISOString().slice(0, 10);
}
