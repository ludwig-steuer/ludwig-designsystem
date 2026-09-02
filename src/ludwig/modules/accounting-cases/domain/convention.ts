/**
 * Konvention — Wissen, das über den Einzelfall hinaus gilt und nicht aus den
 * Daten ableitbar ist (F106). Wertebereich der drei Achsen von
 * `client_agent_notes`; die DB-CHECKs sind die Wahrheit, die Registry die
 * Darstellung, hier steht das TS-Abbild.
 */

/** Geltungsbereich. Mandantenregel sticht Kanzleiregel. */
export const CONVENTION_SCOPES = ["client", "tenant"] as const;
export type ConventionScope = (typeof CONVENTION_SCOPES)[number];

/** Lebenszyklus. `archived` ersetzt den Grabstein: auffindbar, aber nicht gelesen. */
export const CONVENTION_STATUSES = ["pending_approval", "active", "archived"] as const;
export type ConventionStatus = (typeof CONVENTION_STATUSES)[number];

/** Woher die Regel kommt — und damit, wie belastbar sie ist. */
export const CONVENTION_ORIGINS = [
  "onboarding",
  "tenant_confirmed",
  "derived_from_bookings",
  "agent_observed",
] as const;
export type ConventionOrigin = (typeof CONVENTION_ORIGINS)[number];

/**
 * Bestätigt = ein Mensch hat geantwortet oder eine Menge steht dahinter.
 * Bewusst abgeleitet statt als zweite Spalte: wer bestätigt, setzt die
 * Herkunft auf `tenant_confirmed` — zwei Felder liefen sonst auseinander.
 */
export function isConfirmed(origin: ConventionOrigin): boolean {
  return origin !== "agent_observed";
}
