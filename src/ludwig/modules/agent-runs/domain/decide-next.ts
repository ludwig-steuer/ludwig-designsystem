import type { AgentRunPhase, AgentRunState, AgentRunStopReason } from "./agent-run";
import { TECHNICAL_END_CAUSES } from "./agent-run-end";
import { isJudgeStepRole } from "./agent-run-role";
import { AGENT_RUN_PHASE_TABLE, phaseOfStep, retryFollows } from "./phase-table";

/**
 * F473/F474/F477 — Fortschalt-Entscheidung eines Laufs, rein: Daten rein,
 * Entscheidung raus. Ausführer ist `advanceAgentRun` (booking-v2): er sammelt
 * die Proben, legt den Schritt an oder beendet den Lauf (F476).
 *
 * Die Proben-Fakten kommen BEDARFSWEISE (`{ need }`), nicht vorab: die
 * Buchungs-Proben haben Seiteneffekte — `bookingWork` und `batchWithAgent`
 * holen prepared-Stapel mit offenen Rückfragen an den Agenten zurück
 * (returnBatchToAgent). Vorab gesammelt, gingen Stapel auch in Zweigen an den
 * Agenten, die sie nie brauchen. Der Ausführer fragt, holt den einen Fakt und
 * fragt erneut — die Reihenfolge der Proben steht damit hier.
 *
 * Reihenfolge fest (Spec-Tabelle):
 *   F477 zuerst: endete der letzte Schritt technisch (end_cause harness_exit,
 *     timeout, never_claimed, stalled, dispatch_failed), entsteht bis
 *     `retryLimit` je Phase ein Wiederholungs-Schritt derselben Phase; sonst
 *     endet der Lauf stopped/retry_exhausted. Fachliche Enden (agent) und NULL
 *     laufen durch die Tabelle.
 *   Start: Belege in agent_review → documents; sonst Buchungs-Arbeit → booking
 *   nach documents (jedes Ende): Buchungs-Arbeit → booking, sonst Ende
 *   nach booking complete/incomplete → review (Judge-Modell nötig)
 *   nach review (jedes Ende): offene Agent-Rückgaben → repair; ohne Rückgaben
 *     und mit End-Gate der Kanzlei (F541) → final_review
 *   nach repair complete/incomplete → review_after_repair, mit End-Gate final_review
 *   nach review_after_repair: offene Rückgaben → stopped/repair_cycle_done
 *   nach final_review: offene Rückgaben → stopped/repair_cycle_done (Reparatur im nächsten Lauf)
 *   Schritt failed → failed/run_failed · nie übernommen → stopped/stalled
 *   Direktstart (source 'direct') = Lauf mit einem Schritt, endet mit ihm.
 */

export interface DecideNextInput {
  run: { source: string };
  /** Jüngster Schritt des Laufs; null beim Lauf-Start. */
  last: { role: string; trigger: string; outcome: string | null; claimed: boolean; end_cause: string | null } | null;
  /** Alle Schritte des Laufs — zählt die Wiederholungen je Phase (F477). */
  steps: readonly { role: string; trigger: string; retry_of_step_id: string | null }[];
}

/** Proben-Fakten; ein fehlender Fakt wird mit `{ need }` angefragt. */
export interface NextPhaseFacts {
  /** Belege des Mandanten in agent_review. */
  agentReviewDocs?: number;
  /** Buchungs-Arbeit vorhanden (Probe gibt prepared-Stapel mit Rückfragen an den Agenten zurück). */
  bookingWork?: boolean;
  /** Offene Rückgaben (judge_returned) an den Agenten. */
  openReturns?: number;
  /** Ein Stapel liegt beim Agenten (Probe holt prepared-Stapel mit Rückgaben zurück, F471). */
  batchWithAgent?: boolean;
  /** Modell der Zweitprüfung zugeordnet und für den Mandanten zulässig. */
  judgeModel?: { ok: true } | { ok: false; reason: "no_judge_model" | "judge_not_allowed"; message: string };
  /** F541: End-Gate der Kanzlei aktiv (Zeile `judge_second` in platform_tenant_agent_models). */
  endGate?: boolean;
}

export type NextPhaseNeed =
  | { need: Exclude<keyof NextPhaseFacts, "judgeModel"> }
  | { need: "judgeModel"; phase: AgentRunPhase };

export type NextPhaseEnd = {
  end: Exclude<AgentRunState, "running">;
  reason: AgentRunStopReason | null;
  summary: string;
};

export type NextPhaseDecision = NextPhaseNeed | { phase: AgentRunPhase; retry?: true } | NextPhaseEnd;

export const RETRY_EXHAUSTED_SUMMARY = "Technischer Abbruch, auch die Wiederholung scheiterte";

export function decideNextPhase(input: DecideNextInput, facts: NextPhaseFacts): NextPhaseDecision {
  const { run, last } = input;
  if (last && run.source !== "direct" && last.end_cause && TECHNICAL_END_CAUSES.has(last.end_cause)) {
    if (!retryFollows(run.source, last, input.steps)) {
      return { end: "stopped", reason: "retry_exhausted", summary: RETRY_EXHAUSTED_SUMMARY };
    }
    return { phase: phaseOfStep(last), retry: true };
  }
  const next = decideByTable(input, facts);
  if ("phase" in next && isJudgeStepRole(AGENT_RUN_PHASE_TABLE[next.phase].role)) {
    if (!facts.judgeModel) return { need: "judgeModel", phase: next.phase };
    if (!facts.judgeModel.ok) return { end: "stopped", reason: facts.judgeModel.reason, summary: facts.judgeModel.message };
  }
  return next;
}

function decideByTable({ run, last }: DecideNextInput, facts: NextPhaseFacts): NextPhaseDecision {
  if (run.source === "direct") {
    // Lauf mit einem Schritt (run_start, Entwickler-Skripte): endet mit ihm.
    return last ? endByOutcome(last) : { end: "stopped", reason: "no_work", summary: "Direktstart ohne Schritt." };
  }
  if (!last) {
    if (facts.agentReviewDocs === undefined) return { need: "agentReviewDocs" };
    if (facts.agentReviewDocs > 0) return { phase: "documents" };
    if (facts.bookingWork === undefined) return { need: "bookingWork" };
    if (facts.bookingWork) return { phase: "booking" };
    return {
      end: "stopped",
      reason: "no_work",
      summary: "Kein Schritt gestartet: keine offene Arbeit (kein Reparatur-Korb, kein Stapel mit Aufgaben).",
    };
  }
  if (last.outcome === "failed" && !last.claimed) {
    return {
      end: "stopped",
      reason: "stalled",
      summary: "Schritt nie übernommen (Token abgelaufen) — der Runner hat ihn nicht gestartet.",
    };
  }
  if (last.outcome === "superseded" || last.outcome === "taken_over") {
    return { end: "stopped", reason: "superseded", summary: "Schritt abgelöst — der Lauf endet mit ihm." };
  }
  const failed = last.outcome === "failed";
  const runFailed: NextPhaseEnd = { end: "failed", reason: "run_failed", summary: "Ein Schritt des Laufs ist gescheitert." };
  switch (phaseOfStep(last)) {
    case "documents":
      // Ein kaputter Beleg-Schritt darf das Buchen nicht blockieren.
      if (facts.bookingWork === undefined) return { need: "bookingWork" };
      if (facts.bookingWork) return { phase: "booking" };
      return failed ? runFailed : { end: "done", reason: null, summary: "Belege bearbeitet, keine Buchungs-Arbeit." };
    case "booking":
      return failed ? runFailed : { phase: "review" };
    case "review": {
      if (facts.openReturns === undefined) return { need: "openReturns" };
      if (facts.openReturns > 0) {
        if (facts.batchWithAgent === undefined) return { need: "batchWithAgent" };
        if (facts.batchWithAgent) return { phase: "repair" };
        // F117: ein Stapel auf review gehört der Kanzlei — die Reparatur wartet auf ihr „Zurück an Ludwig".
        return {
          end: "stopped",
          reason: "no_work",
          summary: `${facts.openReturns} Rückgabe(n) offen, aber kein Stapel beim Agenten (die Kanzlei prüft) — die Reparatur wartet auf „Zurück an Ludwig".`,
        };
      }
      if (failed) return runFailed;
      if (facts.endGate === undefined) return { need: "endGate" };
      return facts.endGate ? { phase: "final_review" } : { end: "done", reason: null, summary: "Zweitprüfung ohne Rückgaben beendet." };
    }
    case "repair":
      if (failed) return runFailed;
      if (facts.endGate === undefined) return { need: "endGate" };
      return { phase: facts.endGate ? "final_review" : "review_after_repair" };
    case "review_after_repair":
      if (facts.openReturns === undefined) return { need: "openReturns" };
      if (facts.openReturns > 0) {
        return {
          end: "stopped",
          reason: "repair_cycle_done",
          summary: "Reparatur-Zyklus bereits gelaufen — offene Rückgaben warten auf den nächsten Anstoß.",
        };
      }
      return failed ? runFailed : { end: "done", reason: null, summary: "Nachprüfung ohne Rückgaben beendet." };
    case "final_review":
      if (facts.openReturns === undefined) return { need: "openReturns" };
      if (facts.openReturns > 0) {
        return {
          end: "stopped",
          reason: "repair_cycle_done",
          summary: `End-Gate: ${facts.openReturns} Rückgabe(n) — die Reparatur folgt im nächsten Lauf.`,
        };
      }
      return failed ? runFailed : { end: "done", reason: null, summary: "End-Gate ohne Rückgaben beendet." };
  }
}

function endByOutcome(last: { outcome: string | null }): NextPhaseEnd {
  if (last.outcome === "complete") return { end: "done", reason: null, summary: "Schritt abgeschlossen." };
  if (last.outcome === "failed") return { end: "failed", reason: "run_failed", summary: "Schritt gescheitert." };
  if (last.outcome === "superseded" || last.outcome === "taken_over") {
    return { end: "stopped", reason: "superseded", summary: "Schritt abgelöst." };
  }
  return { end: "stopped", reason: null, summary: "Schritt unvollständig beendet." };
}
