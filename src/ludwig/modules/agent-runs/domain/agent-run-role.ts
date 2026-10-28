/**
 * F426 — Rolle und Harness eines Agent-Laufs (`client_agent_run_steps.role` /
 * `.harness`, Spiegel der DB-CHECKs `client_agent_run_steps_role_check` /
 * `client_agent_run_steps_harness_check`).
 *
 * `role` ist bewusst einwertig: nur `orchestrator` existiert heute real;
 * weitere Rollen (judge, junior, senior) kommen mit dem Rollenschnitt aus dem
 * separaten Multi-Agent-Prozess (F426-Nicht-Scope).
 *
 * `harness`: `manual` = interaktive lokale Claude-Code-Session gegen einen
 * vorab angelegten Lauf (Brücken-Modus, Stufe 0), `claude_code` = headless im
 * Runner-Container (F427). NULL = Altbestand / selbst gestarteter Lauf.
 */
export const AGENT_RUN_STEP_ROLES = ["orchestrator", "judge", "documents", "second_judge"] as const;
export type AgentRunStepRole = (typeof AGENT_RUN_STEP_ROLES)[number];

/** F541: Judge-Schritte — der reguläre Judge und das End-Gate (zweiter Judge) fahren auf demselben Endpunkt. */
export function isJudgeStepRole(role: string): boolean {
  return role === "judge" || role === "second_judge";
}

export const AGENT_RUN_HARNESSES = ["manual", "claude_code"] as const;
export type AgentRunHarness = (typeof AGENT_RUN_HARNESSES)[number];
