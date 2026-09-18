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

/**
 * Die Sichten der Konventionsliste im Profil. `current` ist alles, was der
 * Agent noch sieht (nicht archiviert) — der Standard, weil Archiviertes nur
 * noch auffindbar sein soll, nicht im Weg.
 */
export const CONVENTION_VIEWS = ["current", "active", "pending_approval", "archived", "all"] as const;
export type ConventionView = (typeof CONVENTION_VIEWS)[number];

export interface ConventionFilter {
  view: ConventionView;
  scope?: ConventionScope;
  origin?: ConventionOrigin;
  topic?: string;
  /** Freitext über Thema, Regel, Warum und Partner. */
  q?: string;
}

/**
 * Eine Zeile gegen die Filter der Liste. Gefiltert wird auf der geladenen
 * Liste, nicht in SQL: die Kollision (Kanzleiregel gestochen) rechnet über
 * alle Zeilen, und die Zähler der Chips brauchen ohnehin alle.
 */
export function matchesConventionFilter(
  n: {
    scope: ConventionScope;
    status: ConventionStatus;
    origin: ConventionOrigin;
    topic: string;
    note: string;
    rationale: string | null;
    businessPartnerName: string | null;
  },
  f: ConventionFilter,
): boolean {
  if (f.view === "current" ? n.status === "archived" : f.view !== "all" && n.status !== f.view) return false;
  if (f.scope && n.scope !== f.scope) return false;
  if (f.origin && n.origin !== f.origin) return false;
  if (f.topic && n.topic !== f.topic) return false;
  if (!f.q) return true;
  const needle = f.q.toLowerCase();
  return [n.topic, n.note, n.rationale, n.businessPartnerName].some((s) => s?.toLowerCase().includes(needle));
}
