/**
 * F496 (K11) — Umgang mit Klärungsfällen je Mandant
 * (`platform_clients.clarification_handling`). Meldet der Agent „Buchung
 * unklar“, führt der Server nach dieser Einstellung aus. Spiegel des DB-CHECK
 * `platform_clients_clarification_handling_check` (Migration 20261013030000).
 * Liegt in core, weil `clients` und `accounting-cases` sie lesen.
 */
export const CLARIFICATION_HANDLING_MODES = ["post_and_ask", "ask_only", "post_and_note"] as const;
export type ClarificationHandling = (typeof CLARIFICATION_HANDLING_MODES)[number];
export const CLARIFICATION_HANDLING_DEFAULT: ClarificationHandling = "ask_only";

export const CLARIFICATION_HANDLING_LABEL: Record<ClarificationHandling, string> = {
  post_and_ask: "Auf das Klärungskonto buchen und die Kanzlei fragen",
  ask_only: "Kanzlei fragen, Buchung offen lassen",
  post_and_note: "Auf das Klärungskonto buchen, Kommentar statt Frage",
};

export const CLARIFICATION_HANDLING_HINT: Record<ClarificationHandling, string> = {
  post_and_ask: "Der Betrag steht vollständig im Stapel; die Antwort der Kanzlei bucht Ludwig danach um.",
  ask_only: "Bisheriges Verhalten: die Buchung wartet auf die Antwort.",
  post_and_note: "Kein Rückfragen-Aufwand; die Kanzlei klärt das Konto beim Prüfen selbst.",
};

/** Modi, die auf das Klärungskonto buchen, brauchen eines (DB-CHECK `…_clarification_account_required_check`). */
export function requiresClarificationAccount(mode: ClarificationHandling): boolean {
  return mode !== "ask_only";
}

/** Herkunft geparkter Sätze (`client_journal_entry.origin_task`) — Marker für Judge, Gate, Bericht und Abnahme. */
export const CLARIFICATION_PARKING_TASK = "clarification_parking";

export function parseClarificationHandling(raw: string): ClarificationHandling {
  if ((CLARIFICATION_HANDLING_MODES as readonly string[]).includes(raw)) return raw as ClarificationHandling;
  throw new Error(`Unbekannte clarification_handling: ${raw}`);
}
