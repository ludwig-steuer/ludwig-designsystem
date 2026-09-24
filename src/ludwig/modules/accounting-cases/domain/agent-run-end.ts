/**
 * F284 — wie ein Agent-Lauf endete (`client_agent_runs.outcome`, Spiegel des
 * DB-CHECK `client_agent_runs_outcome_check`). NULL = offen oder Altbestand.
 */
export const AGENT_RUN_ENDS = ["complete", "incomplete", "taken_over", "superseded"] as const;
export type AgentRunEnd = (typeof AGENT_RUN_ENDS)[number];
