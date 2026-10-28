/**
 * Buchungsmodul-Version eines Mandanten (`platform_clients.booking_module_version`,
 * F400): mit welcher Version des Buchungslaufs der Mandant gebucht wird. Ein Lauf
 * übernimmt sie beim Start (`client_agent_run_steps.booking_module_version`). Die
 * Endpunkte unter /api/mcp/booking/v2 verlangen `v2`. `v1` bleibt für Läufe vor
 * F423e zulässig (Stand im Tag `booking-v1-final`).
 */
export const BOOKING_MODULE_VERSIONS = ["v1", "v2"] as const;
/** Alle Mandanten seit F423e (DB-CHECK `platform_clients_booking_module_version_check`). */
export const CLIENT_BOOKING_MODULE_VERSION = "v2" as const;
export type BookingModuleVersion = (typeof BOOKING_MODULE_VERSIONS)[number];

/** Der einzige Weg, die Spalte zu lesen. Unbekanntes wirft (fail fast). */
export function parseBookingModuleVersion(raw: string): BookingModuleVersion {
  if ((BOOKING_MODULE_VERSIONS as readonly string[]).includes(raw)) return raw as BookingModuleVersion;
  throw new Error(`Unbekannte booking_module_version: ${raw}`);
}
