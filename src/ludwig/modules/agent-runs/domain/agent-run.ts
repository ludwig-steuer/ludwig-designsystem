/**
 * F473/F474 — Lauf (`client_agent_runs`): geschlossene Mengen, Spiegel
 * der DB-CHECKs `client_agent_runs_{state,phase,stop_reason,source}_check`
 * (Migration 20261009220000, stop_reason erweitert 20261011020000). Neue Werte nur per Migration.
 *
 * Kein `waiting`: der Fortschalt-Kern (advanceAgentRun, booking-v2) läuft
 * synchron beim Lauf-Ende und legt den nächsten Lauf sofort an.
 */
export const AGENT_RUN_STATES = ["running", "done", "stopped", "failed"] as const;
export type AgentRunState = (typeof AGENT_RUN_STATES)[number];

/** F477: „Erneut versuchen" gibt es nur an fehlgeschlagenen und angehaltenen Läufen. */
export function isRetryableAgentRunState(state: string): boolean {
  return state === "failed" || state === "stopped";
}

/** Reihenfolge = Ablauf des Laufs (Anzeige der Phasen-Chips). */
export const AGENT_RUN_PHASES = ["documents", "booking", "review", "repair", "review_after_repair", "final_review"] as const;
export type AgentRunPhase = (typeof AGENT_RUN_PHASES)[number];

export const AGENT_RUN_STOP_REASONS = [
  "no_work",
  "repair_cycle_done",
  "queue_not_configured",
  "dispatch_failed",
  "run_failed",
  "superseded",
  "stalled",
  "no_judge_model",
  "judge_not_allowed",
  // F477: technischer Abbruch, auch die Wiederholung in derselben Phase scheiterte.
  "retry_exhausted",
] as const;
export type AgentRunStopReason = (typeof AGENT_RUN_STOP_REASONS)[number];

export const AGENT_RUN_SOURCES = [
  "basket_release",
  "admin",
  "returned",
  "run_finished",
  "repair",
  "direct",
  "backfill",
  // Owner 2026-10-26: Rückgabe aus den Rückfragen der Abnahme — der Lauf sagt, warum er lief.
  "questions_answered",
] as const;
export type AgentRunSource = (typeof AGENT_RUN_SOURCES)[number];
