import { LOG_VIEWS, LOG_VIEW_DEPTH, type LogView } from "@/ludwig/shared/log-views";

/**
 * Die drei Sichten des Stapel-Logs (F114 §4, F118 T118.2).
 *
 * Es gibt **einen** Ereignisstrom, nicht drei Logs. Was sich unterscheidet,
 * ist die Tiefe:
 *
 *  - **Verlauf** — die Geschichte des Stapels: eröffnet, bereitgestellt,
 *    übernommen, zurückgegeben, freigegeben, in DATEV angekommen. Das, was ein
 *    Mensch erzählen würde, wenn er gefragt wird „was ist mit dem Stapel
 *    passiert?".
 *  - **Protokoll** — dazu die fachlichen Entscheidungen: Klärungen, Buchungen,
 *    Konventionen, Belege. Das, was in einer Prüfung nachvollziehbar sein muss.
 *  - **Technik** — dazu die Innereien des Agenten: jede Schritt-Kante, jedes
 *    `*_by_agent`-Ereignis, die rohen Action-Codes.
 *
 * Die Tiefe ist eine reine Ableitung aus dem Action-Code. Ein neues Ereignis
 * landet ohne Zutun im Protokoll (Tiefe 2) — das ist die richtige Vorgabe:
 * sichtbar, aber nicht in der Kurzfassung.
 */

// Die drei Sichten gelten für jedes Protokoll und stehen deshalb in
// `audit-log/domain/log-views.ts` (L-17). Hier bleibt, was den Stapel
// betrifft: welche Aktion in welche Tiefe fällt.
export type BatchLogView = LogView;
export const BATCH_LOG_VIEWS = LOG_VIEWS;

const VIEW_DEPTH = LOG_VIEW_DEPTH;

/**
 * Tiefe 1 — die Geschichte. Bewusst eine kurze, explizite Liste: alles, was
 * hier steht, hat jemand als „das gehört in die Kurzfassung" entschieden.
 */
const STORY_ACTIONS: ReadonlySet<string> = new Set([
  "export_batch.opened",
  "export_batch.prepared",
  "export_batch.review_started",
  "export_batch.returned_to_agent",
  "export_batch.reopened",
  "export_batch.reset",
  "export_batch.mirrored",
  "export_batch.closed",
  "agent_run.completed",
  "agent_run.resumed",
  "datev_export.created",
  "datev_export.ready",
  "datev_export.retry",
  "case.clarification_answered",
  "document.uploaded",
]);

/**
 * Tiefe eines Ereignisses.
 *
 * Fehlgeschlagenes steigt immer in den Verlauf auf: ein gescheiterter Export
 * ist Teil der Geschichte, egal wie technisch der Code heißt.
 */
export function batchLogDepth(action: string, outcome: string): 1 | 2 | 3 {
  if (outcome === "failure") return 1;
  if (STORY_ACTIONS.has(action)) return 1;
  // Der Agent bucht, verknüpft und benennt im Dutzend — das ist Technik,
  // solange kein Mensch es entschieden hat.
  if (action.endsWith("_by_agent") || action.startsWith("agent_step.")) return 3;
  return 2;
}

export function visibleInBatchLog(action: string, outcome: string, view: BatchLogView): boolean {
  return batchLogDepth(action, outcome) <= VIEW_DEPTH[view];
}

export function parseBatchLogView(raw: string | string[] | undefined): BatchLogView {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "protokoll" || value === "technik" ? value : "verlauf";
}
