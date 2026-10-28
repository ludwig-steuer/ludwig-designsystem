/**
 * Buchungsstil eines Mandanten (`platform_clients.booking_style`, F14-T14.4):
 *
 * - `creditor` (Default): zwei Sätze je Sachverhalt (Aufwand/VSt an Kreditor ·
 *   Kreditor an Bank) — OPOS sichtbar, periodengerecht, Skonto/Teilzahlung.
 * - `direct`: ein Satz am Zahlungs-Event (Bank an Aufwand) — EÜR/Ist.
 *
 * Bis F210 standen die Werte deutsch in der Spalte; die Anzeige bleibt deutsch.
 */
export const BOOKING_STYLES = ["creditor", "direct"] as const;
export type BookingStyle = (typeof BOOKING_STYLES)[number];

/**
 * Der einzige Weg, die Spalte zu lesen. Unbekanntes wirft (fail fast) statt
 * still auf den Default zu fallen — ein stiller Default bucht falsch.
 */
export function parseBookingStyle(raw: string): BookingStyle {
  if ((BOOKING_STYLES as readonly string[]).includes(raw)) return raw as BookingStyle;
  throw new Error(`Unbekannter booking_style: ${raw}`);
}
