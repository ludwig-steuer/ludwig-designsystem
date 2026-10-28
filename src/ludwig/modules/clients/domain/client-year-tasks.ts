/**
 * „Zu tun" auf der Startseite des Mandantenjahres — **eine** Liste für alles,
 * was die Kanzlei hier anstoßen muss, nach Priorität sortiert (Owner
 * 2026-09-27). Der eine Ort, an dem Aufgaben-Arten dazukommen: eine neue Art
 * bekommt eine Priorität in `TASK_PRIORITY` und einen Block hier.
 *
 * Stapel kommen fertig herein (`openBatchTask` in `datev-export`), damit
 * `clients` nicht aus `datev-export` importiert — nur Stapel, bei denen die
 * Kanzlei dran ist. Wer auf Agent, Mandant oder DATEV wartet, ist keine
 * Aufgabe; das zeigt die Stapel-Tabelle.
 */
import { DOCUMENT_LIST_PRESETS, presetQuery } from "@/ludwig/modules/invoices";

export type ClientYearTaskTone = "error" | "warning" | "info";

export interface ClientYearTask {
  key: string;
  /** Kleiner = weiter oben. Gleiche Priorität behält die Eingangsreihenfolge. */
  priority: number;
  tone: ClientYearTaskTone;
  title: string;
  description?: string;
  action: { label: string; href: string };
  /** Owner 2026-10-26: der Knopf startet einen Lauf (Korb abschließen) — die Seite rendert dann die Action, keinen Link. */
  startsRun?: boolean;
}

/** Eine Stapel-Aufgabe, wie `openBatchTask` sie liefert. `urgent` = Übertragung gescheitert. */
export interface ClientYearBatchTask {
  key: string;
  urgent: boolean;
  tone: ClientYearTaskTone;
  title: string;
  description?: string;
  action: { label: string; href: string };
}

export const TASK_PRIORITY = {
  onboarding: 10,
  batchFailed: 20,
  batch: 30,
  basket: 35,
  stuckDocuments: 40,
} as const;

export function clientYearTasks(input: {
  batches: readonly ClientYearBatchTask[];
  stuckDocuments: number;
  /** Belege im offenen Dateikorb (Owner 2026-10-26): ein Eintrag mit genau einer Aktion „Korb abschließen". */
  basketDocuments?: number;
  /** Der Mandant hat noch gar keinen Stapel — beim Bestandsmandanten legt die Kanzlei den ersten an. */
  noBatchYet?: boolean;
  /** Onboarding wartet auf Freigabe — bis dahin bucht Ludwig nicht. */
  onboardingHref: string | null;
  basePath: string;
}): ClientYearTask[] {
  const { batches, stuckDocuments, basketDocuments = 0, noBatchYet = false, onboardingHref, basePath } = input;
  const tasks: ClientYearTask[] = [];

  if (onboardingHref) {
    tasks.push({
      key: "onboarding_review",
      priority: TASK_PRIORITY.onboarding,
      tone: "warning",
      title: "Onboarding wartet auf Freigabe",
      description: "Die Angaben aus DATEV sind aufbereitet, aber noch nicht bestätigt — bis zur Freigabe bucht Ludwig nicht.",
      action: { label: "Onboarding abschließen", href: onboardingHref },
    });
  }

  for (const b of batches) {
    const { urgent, ...task } = b;
    tasks.push({ ...task, priority: urgent ? TASK_PRIORITY.batchFailed : TASK_PRIORITY.batch });
  }

  if (noBatchYet) {
    tasks.push({
      key: "first_batch",
      priority: TASK_PRIORITY.batch,
      tone: "info",
      title: "Noch kein Stapel",
      description: "Für einen Bestandsmandanten legt die Kanzlei den ersten Stapel an; danach eröffnet der Server jeden weiteren.",
      action: { label: "Stapel anlegen", href: `${basePath}/batches` },
    });
  }

  if (basketDocuments > 0) {
    tasks.push({
      key: "file_basket",
      priority: TASK_PRIORITY.basket,
      tone: "info",
      title: basketDocuments === 1 ? "1 Beleg im Korb" : `${basketDocuments} Belege im Korb`,
      description: "Ludwig bucht die Belege, Sie bekommen eine Mail.",
      // Der Weg ohne JavaScript: der Eingang, wo der Korb liegt. Die Seite rendert sonst den Start-Knopf.
      action: { label: "Korb abschließen", href: `${basePath.replace(/\/\d{4}$/, "")}/document-inbox` },
      startsRun: true,
    });
  }

  if (stuckDocuments > 0) {
    tasks.push({
      key: "stuck_documents",
      priority: TASK_PRIORITY.stuckDocuments,
      tone: "warning",
      title: stuckDocuments === 1 ? "1 Beleg wartet auf eine Prüfung" : `${stuckDocuments} Belege warten auf eine Prüfung`,
      description: "Ludwig konnte sie nicht allein einordnen.",
      action: {
        label: "Belege prüfen",
        href: `${basePath}/documents?${presetQuery(DOCUMENT_LIST_PRESETS.find((p) => p.key === "problems")!)}`,
      },
    });
  }

  // Array.prototype.sort ist stabil: gleiche Priorität behält die Reihenfolge.
  return tasks.sort((a, b) => a.priority - b.priority);
}
