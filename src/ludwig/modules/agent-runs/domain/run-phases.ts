import { AGENT_RUN_PHASES, type AgentRunPhase } from "./agent-run";
import { phaseOfStep } from "./phase-table";

/**
 * F473/F474 — Phasen-Chips eines Laufs (`client_agent_runs`): je Phase der
 * jüngste Agent-Schritt des Laufs (Phase aus Rolle + Trigger, `phaseOfStep`).
 * Zustand und Grund des Laufs stehen an seiner Zeile — hier wird nichts aus
 * Audits abgeleitet. Eine Phase ohne Schritt ist entweder „nicht nötig" (sie
 * liegt vor dem ERSTEN Schritt des Laufs, z. B. Belege, wenn der Lauf direkt
 * beim Buchen startet) oder „nicht erreicht" (danach; die erste davon trägt
 * den Grund, mit dem der Lauf endete).
 */

export interface RunStep {
  stepId: string;
  role: string;
  trigger: string;
  /** Reihenfolge im Lauf — `created_at::text`, gleiche Zeitzone, lexikografisch sortierbar. */
  createdAt: string;
  claimedAt: string | null;
  finishedAt: string | null;
  /** Registry-Achse `agent_run_step_outcome`; NULL = offen. */
  outcome: string | null;
  /** F477: Registry-Achse `agent_run_step_end_cause`; NULL = offen oder ohne Ursache. */
  endCause: string | null;
  summary: string | null;
}

export type RunPhaseView =
  | { phase: AgentRunPhase; kind: "step"; stepId: string; open: boolean; outcome: string | null; reason: string | null }
  | { phase: AgentRunPhase; kind: "not_needed" | "not_reached"; stepId: null; reason: string | null };

const DOCUMENTS_NOT_NEEDED = "Nicht nötig: zum Start lag kein Beleg im Reparatur-Korb.";
const NOT_NEEDED = "Nicht nötig: der Lauf begann mit einer späteren Phase.";

export function runPhases(
  run: { state: string; summary: string | null },
  steps: readonly RunStep[],
): RunPhaseView[] {
  const ordered = [...steps].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const phaseIndex = (s: RunStep) => AGENT_RUN_PHASES.indexOf(phaseOfStep(s));
  const first = ordered[0];
  const firstIndex = first ? phaseIndex(first) : AGENT_RUN_PHASES.length;
  const lastIndex = ordered.reduce((max, s) => Math.max(max, phaseIndex(s)), -1);
  // F541: das End-Gate ist je Kanzlei zuschaltbar — ohne seinen Schritt kein Chip; mit ihm entfällt die Nachprüfung.
  const endGate = ordered.some((s) => phaseOfStep(s) === "final_review");
  const skipped: AgentRunPhase = endGate ? "review_after_repair" : "final_review";

  return AGENT_RUN_PHASES.map((phase, i): RunPhaseView | null => {
    if (phase === skipped && !ordered.some((s) => phaseOfStep(s) === phase)) return null;
    const step = ordered.filter((s) => phaseOfStep(s) === phase).at(-1);
    if (step) {
      return { phase, kind: "step", stepId: step.stepId, open: !step.finishedAt, outcome: step.outcome, reason: step.summary };
    }
    if (first && i < firstIndex) {
      return { phase, kind: "not_needed", stepId: null, reason: phase === "documents" ? DOCUMENTS_NOT_NEEDED : NOT_NEEDED };
    }
    // Die erste nie erreichte Phase eines beendeten Laufs erklärt, warum er endete.
    const reason = run.state !== "running" && i === lastIndex + 1 ? run.summary : null;
    return { phase, kind: "not_reached", stepId: null, reason };
  }).filter((v): v is RunPhaseView => v !== null);
}
