/**
 * F284 — wie ein Agent-Lauf endete (`client_agent_run_steps.outcome`, Spiegel des
 * DB-CHECK `client_agent_run_steps_outcome_check`). NULL = offen oder Altbestand.
 *
 * `failed` (F426): Schreiber sind der Claim ohne bereiten Stapel
 * (`claimAgentRun`, T426.4) und der Token-Ablauf-Reaper für nie übernommene
 * Läufe (`closeStalledAgentRuns`, T426.5). F477: dazu die Runner-Meldung
 * (Exit ≠ 0, Zeitlimit) und der gescheiterte Versand.
 */
export const AGENT_RUN_ENDS = ["complete", "incomplete", "taken_over", "superseded", "failed"] as const;
export type AgentRunEnd = (typeof AGENT_RUN_ENDS)[number];

/**
 * F477 — Ursache des Schritt-Endes (`client_agent_run_steps.end_cause`, Spiegel
 * des DB-CHECK `client_agent_run_steps_end_cause_check`). NULL = Altbestand oder
 * ein Ende ohne eigene Ursache (Claim ohne Stapel, Ablösung, Übernahme).
 */
export const AGENT_RUN_STEP_END_CAUSES = [
  "agent",
  "harness_exit",
  "timeout",
  "never_claimed",
  "stalled",
  "dispatch_failed",
] as const;
export type AgentRunStepEndCause = (typeof AGENT_RUN_STEP_END_CAUSES)[number];

/** Technische Enden — sie lösen einmal je Phase eine Wiederholung aus; `agent` ist fachlich. */
export const TECHNICAL_END_CAUSES: ReadonlySet<string> = new Set<AgentRunStepEndCause>([
  "harness_exit",
  "timeout",
  "never_claimed",
  "stalled",
  "dispatch_failed",
]);
