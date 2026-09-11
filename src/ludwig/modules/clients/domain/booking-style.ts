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

// ponytail: Übergangslesen F210-T210.3 für Code, der vor der Migration läuft; Ausbau ab 2026-10-12.
const LEGACY_BOOKING_STYLES: Record<string, BookingStyle> = { kreditorisch: "creditor", direkt: "direct" }; // Altwerte, nur für parseBookingStyle

/**
 * Der einzige Weg, die Spalte zu lesen. Unbekanntes wirft (fail fast) statt
 * still auf den Default zu fallen — ein stiller Default bucht falsch.
 */
export function parseBookingStyle(raw: string): BookingStyle {
  if ((BOOKING_STYLES as readonly string[]).includes(raw)) return raw as BookingStyle;
  const legacy = LEGACY_BOOKING_STYLES[raw];
  if (legacy) return legacy;
  throw new Error(`Unbekannter booking_style: ${raw}`);
}
