import { AGENT_RUN_PHASES, type AgentRunPhase } from "./agent-run";
import type { AgentRunStepRole } from "./agent-run-role";

/**
 * F476 — die EINE Quelle je Phase eines Laufs: welche Rolle der Agent-Schritt
 * hat, welchen Trigger er trägt, auf welchem MCP-Endpunkt er fährt, welche
 * Modell-Aufgabe (`platform_agent_model_defaults.task`) sein Backend bestimmt
 * und wie oft er nach einem technischen Abbruch wiederholt wird (F477).
 * Reihenfolge der Phasen: `AGENT_RUN_PHASES`.
 *
 * `endpointRole` ist der Name der Werkzeug-Rolle (`ToolRole` im Adapter agent)
 * als Text — dieses Modul importiert agent nicht; die Deckung mit
 * `ROLE_ENDPOINTS` prüft agent/__tests__/phase-table.test.ts.
 */
export interface PhaseDef {
  role: AgentRunStepRole;
  /** `'repair'` = der Schritt trägt den Trigger repair; null = er erbt den Trigger des Laufs. */
  stepTrigger: "repair" | null;
  /** Pfad des Rollen-Endpunkts; den Origin setzt AGENT_MCP_PUBLIC_URL. */
  mcpPath: string;
  endpointRole: string;
  modelTask: "orchestrator" | "judge" | "documents" | "judge_second";
  /** Wiederholungs-Schritte je Phase nach technischem Abbruch. */
  retryLimit: number;
  /** Zustellung der Wiederholung um so viele Minuten verzögert (Queue-visibilityTimeout). */
  retryDelayMinutes: number;
}

const DOCUMENTS = { role: "documents", mcpPath: "/api/mcp/documents/mcp", endpointRole: "documents", modelTask: "documents" } as const;
const ORCHESTRATOR = { role: "orchestrator", mcpPath: "/api/mcp/booking/v2/senior/mcp", endpointRole: "senior", modelTask: "orchestrator" } as const;
const JUDGE = { role: "judge", mcpPath: "/api/mcp/booking/v2/judge/mcp", endpointRole: "judge", modelTask: "judge" } as const;
const RETRY = { retryLimit: 1, retryDelayMinutes: 10 } as const;

export const AGENT_RUN_PHASE_TABLE = {
  documents: { ...DOCUMENTS, stepTrigger: null, ...RETRY },
  booking: { ...ORCHESTRATOR, stepTrigger: null, ...RETRY },
  review: { ...JUDGE, stepTrigger: null, ...RETRY },
  repair: { ...ORCHESTRATOR, stepTrigger: "repair", ...RETRY },
  review_after_repair: { ...JUDGE, stepTrigger: "repair", ...RETRY },
  // F541: End-Gate — der zweite Judge je Kanzlei auf dem Judge-Endpunkt, mit eigenem Modell.
  final_review: { ...JUDGE, role: "second_judge", modelTask: "judge_second", stepTrigger: null, ...RETRY },
} as const satisfies Record<AgentRunPhase, PhaseDef>;

/** Endpunkt je Schritt-Rolle — aus der Tabelle; alle Phasen einer Rolle stimmen überein (Test). */
export const STEP_ROLE_ENDPOINTS = Object.fromEntries(
  AGENT_RUN_PHASES.map((p) => [AGENT_RUN_PHASE_TABLE[p].role, {
    mcpPath: AGENT_RUN_PHASE_TABLE[p].mcpPath,
    endpointRole: AGENT_RUN_PHASE_TABLE[p].endpointRole,
  }]),
) as Record<AgentRunStepRole, { mcpPath: string; endpointRole: string }>;

/**
 * Phase eines Agent-Schritts aus Rolle und Trigger — die Umkehrung der Tabelle,
 * eine Regel für Kern, Anzeige und Backfill (Spiegel in der Migration):
 * Reparatur und Nachprüfung tragen trigger 'repair', alles davor den Trigger
 * des Laufs. Hat eine Rolle nur eine Phase (documents), zählt der Trigger nicht;
 * eine unbekannte Rolle (Altbestand) zählt wie der Orchestrator.
 */
export function phaseOfStep(step: { role: string; trigger: string }): AgentRunPhase {
  const ofRole = (role: string) => AGENT_RUN_PHASES.filter((p) => AGENT_RUN_PHASE_TABLE[p].role === role);
  const phases = ofRole(step.role).length > 0 ? ofRole(step.role) : ofRole("orchestrator");
  const repair = step.trigger === "repair";
  return phases.find((p) => (AGENT_RUN_PHASE_TABLE[p].stepTrigger === "repair") === repair) ?? phases[0]!;
}

/**
 * F477 — folgt auf das technische Ende dieses Schritts eine Wiederholung?
 * Bis `retryLimit` je Phase, nie im Direktstart. EINE Regel für den
 * Fortschalt-Kern und den Stille-Reaper, der den Stapel nur abgibt, wenn keine
 * Wiederholung folgt.
 */
export function retryFollows(
  source: string,
  step: { role: string; trigger: string },
  runSteps: readonly { role: string; trigger: string; retry_of_step_id: string | null }[],
): boolean {
  if (source === "direct") return false;
  const phase = phaseOfStep(step);
  const retries = runSteps.filter((s) => s.retry_of_step_id !== null && phaseOfStep(s) === phase).length;
  return retries < AGENT_RUN_PHASE_TABLE[phase].retryLimit;
}
