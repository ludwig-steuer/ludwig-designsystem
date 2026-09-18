import { rowSettled, type ChecklistRow, type ChecklistRowKey } from "./checklist";

/**
 * F219 — „Ist der Agent fertig?" liest **dieselbe** Freigabe-Checkliste wie
 * Schritt 8; keine zweite Berechnung von „offen". Agentenarbeit sind die
 * Zeilen, die in einen Prüfschritt 0–7 springen — Übergabe (9) und Nachlese
 * (10) sind es nicht.
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
 */
const REVIEWER_ROWS: ReadonlySet<ChecklistRowKey> = new Set<ChecklistRowKey>([
  "entries_accepted",
  "questions_answered",
  "conventions_decided",
]);

/** Die Zeilen, die Agentenarbeit messen — Schritt 0 zeigt sie als Checkliste. */
export function agentRows(rows: readonly ChecklistRow[]): ChecklistRow[] {
  return rows.filter(
    (r) => r.level !== "info" && r.jumpStep !== null && r.jumpStep <= 7 && !REVIEWER_ROWS.has(r.key),
  );
}

/** Erledigt aus Sicht des Agenten — oder von der Kanzlei quittiert. */
export function agentSettled(row: ChecklistRow): boolean {
  return rowSettled(row) || (row.agentDone ?? row.done) >= row.total;
}

export function unfinishedRows(rows: readonly ChecklistRow[]): ChecklistRow[] {
  return agentRows(rows).filter((r) => !agentSettled(r));
}

/** Der Schritt, an dem die Abnahme beginnt: der erste offene, sonst Schritt 1. */
export function firstOpenStep(rows: readonly ChecklistRow[]): number {
  const steps = unfinishedRows(rows).map((r) => r.jumpStep!);
  return steps.length === 0 ? 1 : Math.min(...steps);
}
