/**
 * Die Art eines Buchungszyklus (F163) — **eine Aufzählung, kein Vorgang.**
 *
 * Sie stand bis 2026-09-09 in `application/booking-cycle-core.ts`, einer
 * `server-only`-Datei mit DB-Zugriff. Drei Dateien der Stapelabnahme holen den
 * Typ (`checklist.ts`, `gating.ts`, `steps.ts`) — reine Ableitungen, alle
 * gespiegelt. Der Spiegel sortiert die server-only-Datei richtig aus, und die
 * drei fielen mit ihr heraus: ein Wort entschied über drei Dateien, die mit
 * Infrastruktur nichts zu tun haben (Befund L-274).
 *
 * Deshalb hier, wo jede spiegelbare Datei sie erreicht. Wer den Zyklus
 * **öffnet, stempelt oder schließt**, bleibt in `application/` — das ist der
 * Vorgang, nicht sein Name.
 */

/** `regular` = Ludwigs Zeitraum · `client_batch` = der gelieferte Mandantenstapel. */
export const BOOKING_CYCLE_KINDS = ["regular", "client_batch"] as const;

export type BookingCycleKind = (typeof BOOKING_CYCLE_KINDS)[number];
