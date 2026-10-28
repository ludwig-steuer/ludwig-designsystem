import { rowSettled, type ChecklistRow, type ChecklistRowKey } from "./checklist";
import type { ReviewStepKey } from "./steps";

/**
 * F219 — „Ist der Agent fertig?" liest **dieselbe** Freigabe-Checkliste wie
 * das Prüfprotokoll; keine zweite Berechnung von „offen". Agentenarbeit sind
 * die Zeilen, die in einen Prüfschritt vor dem Prüfprotokoll springen —
 * Übergabe, Nachlese und die Buchungen des Mandanten sind es nicht.
 *
 * Fertig heißt: jeder Posten ist **gebucht oder hat eine Rückfrage**
 * (Owner 2026-09-18). Deshalb rechnet eine Zeile hier mit `agentDone`, wo die
 * Freigabe strenger ist.
 */

/**
 * Zeilen, die die Kanzlei abarbeitet, nicht der Agent: freigeben, Rückfragen
 * beantworten, Konventionen entscheiden. Offen heißen sie „Sie sind dran" —
 * vor der Abnahme sind sie es immer, und „der Agent ist nicht fertig" wäre
 * dann nie wahr gewesen.
 *
 * `statements_complete` gehört dazu: einen fehlenden Auszug kann der Agent
 * nicht beschaffen — die Lücke ist Vollständigkeit (Prüfschritt / Freigabe),
 * keine Agentenarbeit (Owner 2026-09-21).
 */
const REVIEWER_ROWS: ReadonlySet<ChecklistRowKey> = new Set<ChecklistRowKey>([
  "statements_complete",
  "entries_accepted",
  "questions_answered",
  "conventions_decided",
]);

const AGENT_WORK_STEPS: ReadonlySet<ReviewStepKey> = new Set<ReviewStepKey>([
  "result",
  "completeness",
  "clarifications",
  "proposals",
  "account-clearing",
  "open-items",
  "plausibility",
  "conventions",
]);

/** Die Zeilen, die Agentenarbeit messen — das Ergebnis des Stapels zeigt sie als Checkliste. */
export function agentRows(rows: readonly ChecklistRow[]): ChecklistRow[] {
  return rows.filter(
    (r) =>
      r.level !== "info" &&
      r.jumpStep !== null &&
      AGENT_WORK_STEPS.has(r.jumpStep) &&
      !REVIEWER_ROWS.has(r.key),
  );
}

/** Erledigt aus Sicht des Agenten — oder von der Kanzlei quittiert. */
export function agentSettled(row: ChecklistRow): boolean {
  return rowSettled(row) || (row.agentDone ?? row.done) >= row.total;
}

export function unfinishedRows(rows: readonly ChecklistRow[]): ChecklistRow[] {
  return agentRows(rows).filter((r) => !agentSettled(r));
}
