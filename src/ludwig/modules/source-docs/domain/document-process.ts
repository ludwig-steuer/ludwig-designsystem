/**
 * F306 — das Prozessbild eines Belegs: eine reine Ableitung aus dem, was Liste
 * und Seite ohnehin laden (belege.md R39, Brief F305). Ein View-Model für drei
 * Größen — Zelle der Belegliste, Box im Kopf der Belegseite, Dialog
 * (`ProcessCell`/`ProcessBox`/`ProcessDialog`, DS 0204).
 *
 * Abgeleitet, nie gespeichert (O5). Der Weg kommt aus der Belegform (O6), das
 * Bild endet bei „In DATEV" (O2). Wörter kommen aus der Status-Registry; die
 * Ableitung liest keine Uhr (`now` vom Aufrufer) und fragt nichts nach.
 *
 * Wege, Phasen und Schritte sind wörtlich aus der DS-Vorlage
 * `packages/designsystem/src/showcase/document-process/fixtures.ts` (`PATHS`).
 */
import {
  formatTime,
  type BatonMeta,
  type LogEntry,
  type ProcessDialogDetail,
  type ProcessLevel,
  type ProcessPhase,
  type ProcessPhaseStatus,
  type ProcessPicture,
  type ProcessStep,
} from "@ludwig/designsystem";
import type { ReactNode } from "react";

import type { EntryDatevStage } from "@/ludwig/modules/entries";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { DOC_STUCK_MINUTES, type DocProcessing } from "./doc-processing";
import { DOCUMENT_FORM_ROUTING } from "./document-form-mapping";
import {
  SOURCE_DOC_STATUSES,
  type SourceDocDoneVia,
  type SourceDocReviewReason,
  type SourceDocStatus,
} from "./source-doc-status";

/**
 * Die Träger — Wörter wie die DS-Vorlage (Stand 04f952c, Owner 2026-09-27
 * „Ludwig ist die KI"): `processing` ist die automatische Verarbeitung
 * (Einordnen, Auslesen, Zerlegen, Import), `agent` der Buchungsagent, der in
 * der Oberfläche „Ludwig" heißt (Guideline T1). Die Wörter stehen nur hier.
 */
export const HOLDER = {
  processing: { key: "processing", label: "Verarbeitung", color: "var(--color-text-muted)" },
  agent: { key: "agent", label: "Ludwig", color: "var(--color-accent-700)" },
  firm: { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" },
  client: { key: "mandant", label: "Mandant", color: "var(--color-text-muted)" },
  datev: { key: "datev", label: "DATEV", color: "var(--color-text-muted)" },
  nobody: { key: "niemand", label: "niemand", color: "var(--color-text-subtle)" },
} satisfies Record<string, BatonMeta>;

export type DocumentPathKey =
  | "invoice"
  | "internal"
  | "attachment"
  | "foundation"
  | "statement"
  | "report"
  | "collection"
  | "unknown"
  | "delivery";

type PhaseDef = { key: string; label: string; holder: BatonMeta };

const INTAKE: PhaseDef = { key: "intake", label: "Eingang", holder: HOLDER.client };
const EXTRACT: PhaseDef = { key: "extraction", label: "Auslesen", holder: HOLDER.processing };

const INVOICE_PHASES: PhaseDef[] = [
  INTAKE,
  EXTRACT,
  { key: "booking", label: "Buchen", holder: HOLDER.agent },
  { key: "review", label: "Prüfen", holder: HOLDER.firm },
  { key: "handover", label: "DATEV", holder: HOLDER.datev },
];
const INVOICE_STEPS: [string, string][] = [
  ["intake", "Datei angekommen"],
  ["intake", "Dateikorb freigegeben"],
  ["extraction", "Einordnen"],
  ["extraction", "Auslesen"],
  ["extraction", "Werte prüfen"],
  ["booking", "Sachverhalt zuordnen"],
  ["booking", "Buchung vorschlagen"],
  ["review", "Buchung prüfen"],
  ["handover", "An DATEV übergeben"],
  ["handover", "In DATEV bestätigt"],
];
const ASSIGN_STEPS: [string, string][] = [
  ["intake", "Datei angekommen"],
  ["intake", "Dateikorb freigegeben"],
  ["extraction", "Einordnen"],
  ["extraction", "Auslesen"],
  ["assign", "Sachverhalt zuordnen"],
  ["assign", "Erledigen"],
];
const ASSIGN_PHASES: PhaseDef[] = [INTAKE, EXTRACT, { key: "assign", label: "Zuordnen", holder: HOLDER.agent }];

/** Der Weg je Belegart (F305 §3.2): welche Phasen es gibt, und ihre Schritte. */
export const DOCUMENT_PATHS: Record<DocumentPathKey, { label: string; phases: PhaseDef[]; steps: [string, string][] }> = {
  invoice: { label: "Weg einer Rechnung", phases: INVOICE_PHASES, steps: INVOICE_STEPS },
  internal: { label: "Weg einer Abrechnung", phases: INVOICE_PHASES, steps: INVOICE_STEPS },
  attachment: { label: "Weg eines Lieferscheins", phases: ASSIGN_PHASES, steps: ASSIGN_STEPS },
  foundation: { label: "Weg eines Vertrags", phases: ASSIGN_PHASES, steps: ASSIGN_STEPS },
  statement: {
    label: "Weg eines Kontoauszugs",
    phases: [INTAKE, { key: "import", label: "Import", holder: HOLDER.processing }],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["import", "Einordnen"],
      ["import", "Umsätze einlesen"],
      ["import", "Salden prüfen"],
    ],
  },
  report: {
    label: "Weg einer Auswertung",
    phases: [INTAKE, EXTRACT, { key: "acknowledge", label: "Quittieren", holder: HOLDER.agent }],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
      ["acknowledge", "Quittieren"],
    ],
  },
  collection: {
    label: "Weg eines Sammel-PDFs",
    phases: [
      INTAKE,
      { key: "split", label: "Zerlegen", holder: HOLDER.processing },
      { key: "children", label: "Teilbelege", holder: HOLDER.agent },
    ],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["split", "Einordnen"],
      ["split", "Zerlegen"],
      ["children", "Teilbelege erledigen"],
    ],
  },
  unknown: {
    label: "Weg eines unbekannten Belegs",
    phases: [INTAKE, EXTRACT],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Dateikorb freigegeben"],
      ["extraction", "Einordnen"],
      ["extraction", "Auslesen"],
    ],
  },
  delivery: {
    label: "Weg einer DATEV-Lieferung",
    phases: [INTAKE],
    steps: [
      ["intake", "Datei angekommen"],
      ["intake", "Über Import erledigt"],
    ],
  },
};

/** Die Lesestufen einer Rechnung — Unterschritte von „Auslesen". */
const INVOICE_STAGES = ["Eingeordnet", "Ausgelesen", "Aufbereitet", "Gedeutet"];
const STAGE_REACHED: Record<string, number> = { classified: 1, extracted: 2, preprocessed: 2, interpreted: 4 };

export interface DocumentProcessFacts {
  status: SourceDocStatus;
  reviewReason: SourceDocReviewReason | null;
  reviewNote: string | null;
  doneVia: SourceDocDoneVia | null;
  doneReason: string | null;
  /** ISO. */
  doneAt: string | null;
  uploadedAt: string | null;
  classifiedAt: string | null;
  classDocumentForm: string | null;
  /** Subtyp-Diskriminator, für EXTF-Lieferungen. */
  sourceDocType: string | null;
  /** Teilbeleg eines Sammel-PDFs. */
  hasParent: boolean;
  /** Nur Sammel-PDF. */
  children: { total: number; done: number } | null;
  /** Aus `docProcessing()` (R35). */
  processing: DocProcessing | null;
  /** Rechnungszeile. */
  processingStage: string | null;
  case: { id: string; number: string | null; fiscalYear: number | null } | null;
  /** Schwächster lebender Satz; `null` = keine Buchung. */
  entryStage: EntryDatevStage | null;
  batch: { batchId: string; year: number; description: string | null } | null;
  /** Audit `document.completion_reverted`. */
  reopenedCount: number;
  /** ISO, vom Aufrufer — die Ableitung liest keine Uhr. */
  now: string;
}

/** Rang aus `entryStageRankSql` (1–4) → Stufe; `null` = kein lebender Satz. */
export function entryStageFromRank(rank: number | null): EntryDatevStage | null {
  switch (rank) {
    case 1:
      return "proposed";
    case 2:
      return "accepted";
    case 3:
      return "exported";
    case 4:
      return "in_datev";
    default:
      return null;
  }
}

/** Weg aus der Belegform (O6); die erste zutreffende Regel gewinnt. */
export function documentPath(form: string | null, sourceDocType: string | null): DocumentPathKey {
  if (sourceDocType === "extf_booking_batch" || sourceDocType === "extf_account_list") return "delivery";
  if (form === "document_collection") return "collection";
  if (form == null || form === "other" || form === "unknown") return "unknown";
  const routing = DOCUMENT_FORM_ROUTING[form];
  if (!routing) return "unknown";
  if (routing.invoiceFlow) return "invoice";
  switch (routing.category) {
    case "internal":
      return "internal";
    case "performance":
      return "attachment";
    case "foundation":
      return "foundation";
    case "payment":
      return "statement";
    case "report":
      return "report";
    default:
      return "unknown";
  }
}

/** Satz A — was nach dem Auslesen kommt. */
const NEXT_AFTER_READING: Record<DocumentPathKey, string> = {
  invoice: "Ludwig ordnet den Beleg einem Sachverhalt zu und schlägt die Buchung vor.",
  internal: "Ludwig ordnet den Beleg einem Sachverhalt zu und schlägt die Buchung vor.",
  attachment: "Ludwig hängt den Beleg an seinen Sachverhalt.",
  foundation: "Ludwig hängt den Beleg an seinen Sachverhalt.",
  statement: "Die Umsätze erscheinen am Zahlungskonto.",
  report: "Ludwig quittiert die Auswertung.",
  collection: "Die Teilbelege gehen jeden ihren eigenen Weg.",
  unknown: "Ludwig ordnet den Beleg ein oder erledigt ihn mit Grund.",
  delivery: "Ludwig ordnet den Beleg ein oder erledigt ihn mit Grund.",
};
/** Satz C — wie A, nur Rechnung/Abrechnung: die Prüfung in der Abnahme. */
const NEXT_WHEN_BOOKABLE: Record<DocumentPathKey, string> = {
  ...NEXT_AFTER_READING,
  invoice: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.",
  internal: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.",
};
/** Satz B — aus der Prüfung, je Träger. */
const NEXT_AFTER_REVIEW = {
  agent: "Nach der Korrektur geht der Beleg weiter.",
  kanzlei: "Nach Ihrer Entscheidung geht der Beleg weiter.",
};

/** „40 s", „3 Min.", „2 Std." — deutsch, ohne Sekundenzähler (die Seite refresht). */
export function formatDurationShort(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} Min.`;
  return `${Math.floor(m / 60)} Std.`;
}

/** Die Lage des Belegs im Weg — daraus bauen Bild und Dialog. */
interface Position {
  path: DocumentPathKey;
  /** Index der Phase, auf der der Beleg steht; `phases.length` = alle erledigt. */
  at: number;
  status: ProcessPhaseStatus;
  /** Nur die ersten n Phasen (verkürzter Weg, F305 §3.2). */
  keep?: number;
  note?: string;
  headline: string;
  level: ProcessLevel;
  holder: BatonMeta;
  running: ProcessPicture["running"];
  next: string | null;
  /** Aktueller Schritt (Label); `null` = alle Schritte erledigt. */
  step: string | null;
  deleted?: boolean;
}

function running(facts: DocumentProcessFacts): ProcessPicture["running"] {
  const p = facts.processing;
  if (!p) return null;
  if (p.waiting) return { since: "eingeplant", live: true };
  const started = p.startedAt ? Date.parse(p.startedAt) : NaN;
  return { since: Number.isNaN(started) ? "läuft" : `seit ${formatDurationShort(Date.parse(facts.now) - started)}`, live: true };
}

function isStuck(facts: DocumentProcessFacts): boolean {
  const p = facts.processing;
  if (!p || (facts.status !== "pending" && facts.status !== "extracting")) return false;
  const beat = p.lastActivityAt ?? p.startedAt;
  if (!beat) return false;
  return Date.parse(facts.now) - Date.parse(beat) > DOC_STUCK_MINUTES * 60_000;
}

/** Der Schritt, an dem ein Beleg in der Prüfung steht. */
function reviewStep(path: DocumentPathKey, reason: SourceDocReviewReason | null): string {
  if (path === "statement") return reason === "statement_check_failed" ? "Salden prüfen" : "Umsätze einlesen";
  if (path === "collection") return "Zerlegen";
  if (reason === "classification_error" || reason === "unknown_form") return "Einordnen";
  if (reason === "extraction_error" || reason === "job_failed" || reason === "processing_stuck") return "Auslesen";
  return path === "invoice" || path === "internal" ? "Werte prüfen" : "Auslesen";
}

function position(facts: DocumentProcessFacts): Position {
  if (!(SOURCE_DOC_STATUSES as readonly string[]).includes(facts.status)) {
    throw new Error(`document-process: unknown status ${facts.status}`);
  }
  const path = documentPath(facts.classDocumentForm, facts.sourceDocType);
  const phases = DOCUMENT_PATHS[path].phases;
  const status = facts.status;
  const base = { path, running: null, level: "none" as ProcessLevel };

  if (status === "deleted") {
    return { ...base, at: 0, status: "pending", headline: resolveStatus("document_status", "deleted").label, holder: HOLDER.nobody, next: null, step: null, deleted: true };
  }
  if (path === "delivery") {
    return {
      ...base,
      at: phases.length,
      status: "done",
      headline: resolveStatus("document_done_via", facts.doneVia ?? "import").label,
      holder: HOLDER.nobody,
      next: null,
      step: null,
    };
  }
  const readingNext = NEXT_AFTER_READING[path];
  if (isStuck(facts)) {
    return {
      ...base,
      at: 1,
      status: "held",
      note: "ohne Lebenszeichen",
      headline: "Verarbeitung hängt",
      level: "warning",
      holder: HOLDER.processing,
      running: running(facts),
      next: readingNext,
      step: status === "pending" ? "Einordnen" : readingStep(path),
    };
  }
  if (status === "pending") {
    return {
      ...base,
      at: 1,
      status: "active",
      headline: resolveStatus("document_status", "pending").label,
      level: "info",
      holder: HOLDER.processing,
      running: running(facts),
      next: readingNext,
      step: "Einordnen",
    };
  }
  if (status === "extracting") {
    const invoiceStage = (path === "invoice" || path === "internal") && facts.processingStage;
    return {
      ...base,
      at: 1,
      status: "active",
      headline: invoiceStage ? resolveStatus("document_stage", facts.processingStage).label : resolveStatus("document_status", "extracting").label,
      level: "info",
      holder: HOLDER.processing,
      running: running(facts),
      next: readingNext,
      step: readingStep(path),
    };
  }
  if (status === "agent_review" || status === "human_review") {
    const reason = resolveStatus("document_review_reason", facts.reviewReason);
    const failed = reason.kind === "danger";
    const holder = status === "human_review" ? HOLDER.firm : HOLDER.agent;
    return {
      ...base,
      at: 1,
      status: failed ? "failed" : "held",
      note: reason.label,
      headline: reason.label,
      level: failed ? "error" : "warning",
      holder,
      next: status === "human_review" ? NEXT_AFTER_REVIEW.kanzlei : NEXT_AFTER_REVIEW.agent,
      step: reviewStep(path, facts.reviewReason),
    };
  }
  if (path === "collection" && (status === "bookable" || status === "done") && facts.children) {
    const all = facts.children.done === facts.children.total;
    return {
      ...base,
      at: all ? phases.length : 2,
      status: all ? "done" : "active",
      headline: `${facts.children.done} von ${facts.children.total} erledigt`,
      holder: all ? HOLDER.nobody : HOLDER.agent,
      next: all ? null : "Sind alle Teilbelege erledigt, ist es auch das Sammel-PDF.",
      step: all ? null : "Teilbelege erledigen",
    };
  }
  if (status === "bookable") return bookable(facts, path);

  // status === "done"
  if (facts.doneVia === "booking" && phases.length >= 5) {
    switch (facts.entryStage) {
      case "proposed":
        return { ...base, at: 3, status: "active", headline: "Vorgeschlagen", holder: HOLDER.firm, next: "Die Kanzlei prüft die Buchung in der Abnahme des Stapels.", step: "Buchung prüfen" };
      case "accepted":
        return { ...base, at: 4, status: "active", headline: "Angenommen", holder: HOLDER.datev, next: "Der Stapel wird an DATEV übergeben.", step: "An DATEV übergeben" };
      case "exported":
        return { ...base, at: 4, status: "active", headline: "Übergeben", holder: HOLDER.datev, next: "DATEV bestätigt den Stapel; danach erscheint der Satz im Spiegel.", step: "In DATEV bestätigt" };
      case "in_datev":
        return { ...base, at: phases.length, status: "done", headline: "In DATEV", holder: HOLDER.nobody, next: null, step: null };
      default:
        // Kein lebender Satz (Trigger räumt sonst, Altbestand): wieder buchbar.
        return bookable(facts, path);
    }
  }
  const keep = Math.min(phases.length, path === "statement" ? 2 : 3);
  return {
    ...base,
    at: keep,
    keep,
    status: "done",
    headline: resolveStatus("document_done_via", facts.doneVia).label,
    holder: HOLDER.nobody,
    next: null,
    step: null,
  };
}

function readingStep(path: DocumentPathKey): string {
  if (path === "statement") return "Umsätze einlesen";
  if (path === "collection") return "Zerlegen";
  return "Auslesen";
}

function bookable(facts: DocumentProcessFacts, path: DocumentPathKey): Position {
  const base = { path, running: null, level: "none" as ProcessLevel };
  if (path === "statement" || path === "unknown") {
    return { ...base, at: 1, status: "active", headline: resolveStatus("document_status", "bookable").label, holder: HOLDER.agent, next: NEXT_WHEN_BOOKABLE[path], step: path === "statement" ? "Salden prüfen" : "Auslesen" };
  }
  const assign = path === "attachment" || path === "foundation";
  const headline = assign ? "Bereit zur Zuordnung" : path === "report" ? "Wartet auf Quittung" : resolveStatus("document_status", "bookable").label;
  const step =
    path === "report" ? "Quittieren" : facts.case ? (assign ? "Erledigen" : "Buchung vorschlagen") : "Sachverhalt zuordnen";
  return { ...base, at: 2, status: "active", headline, holder: HOLDER.agent, next: NEXT_WHEN_BOOKABLE[path], step };
}

function phaseList(pos: Position): ProcessPhase[] {
  const defs = DOCUMENT_PATHS[pos.path].phases.slice(0, pos.keep ?? undefined);
  return defs.map((d, i) => ({
    key: d.key,
    label: d.label,
    sub: d.holder.label,
    states: [],
    status: i < pos.at ? "done" : i === pos.at ? pos.status : "pending",
    ...(i === pos.at && (pos.status === "held" || pos.status === "failed") && pos.note ? { note: pos.note } : {}),
  }));
}

export function documentProcessPicture(facts: DocumentProcessFacts): ProcessPicture {
  const pos = position(facts);
  return {
    phases: pos.deleted ? [] : phaseList(pos),
    headline: pos.headline,
    level: pos.level,
    holder: pos.holder,
    running: pos.running,
    next: pos.next,
  };
}

export interface DocumentProcessContext {
  title: string;
  links: { label: string; href: string }[];
  history: LogEntry[] | "error";
  historyHref: string;
  axis?: ReactNode;
}

const day = (iso: string | null) => (iso ? formatTime(iso, "date") : undefined);

function explanationOf(facts: DocumentProcessFacts): string {
  if (facts.status === "done" && facts.doneVia === "booking") {
    switch (facts.entryStage) {
      case "proposed":
      case "accepted":
        return resolveStatus("journal_entry", facts.entryStage).description ?? "";
      case "exported":
        return "Der Stapel ist an DATEV übergeben und noch nicht bestätigt.";
      case "in_datev":
        return "Der Satz steht im DATEV-Spiegel.";
      default:
        break;
    }
  }
  if (facts.status === "done") return resolveStatus("document_done_via", facts.doneVia).description ?? "";
  return resolveStatus("document_status", facts.status).description ?? "";
}

export function documentProcessDetail(facts: DocumentProcessFacts, ctx: DocumentProcessContext): ProcessDialogDetail {
  const pos = position(facts);
  const path = DOCUMENT_PATHS[pos.path];
  const phaseKeys = new Set(path.phases.slice(0, pos.keep ?? undefined).map((p) => p.key));
  const pathSteps = path.steps.filter(([phase]) => phaseKeys.has(phase));
  const currentIndex = pos.step === null || pos.deleted ? pathSteps.length : Math.max(0, pathSteps.findIndex(([, label]) => label === pos.step));
  const inReview = facts.status === "agent_review" || facts.status === "human_review";

  const steps: ProcessStep[] = pathSteps.map(([phase, label], i) => {
    const status: ProcessPhaseStatus = i < currentIndex ? "done" : i === currentIndex ? pos.status : "pending";
    const step: ProcessStep = { phase, label, status };
    if (status === "done" && i === 0 && facts.uploadedAt) {
      step.at = day(facts.uploadedAt);
      step.actor = HOLDER.client.label;
    }
    if (status === "done" && label === "Einordnen" && facts.classifiedAt) {
      step.at = day(facts.classifiedAt);
      step.actor = HOLDER.processing.label;
    }
    if ((pos.path === "invoice" || pos.path === "internal") && label === "Auslesen" && facts.processingStage) {
      const reached = STAGE_REACHED[facts.processingStage] ?? 0;
      step.sub = INVOICE_STAGES.map((l, j) => ({
        label: l,
        status: status === "done" || j < reached ? "done" : j === reached ? (status === "pending" ? "pending" : "active") : "pending",
      }));
    }
    return step;
  });

  const phaseSince: Record<string, string> = {};
  const sinceOf: Record<string, string | null> = {
    intake: facts.uploadedAt,
    extraction: facts.classifiedAt,
    split: facts.classifiedAt,
    import: facts.classifiedAt,
    booking: facts.status === "done" ? facts.doneAt : null,
    assign: facts.status === "done" ? facts.doneAt : null,
    acknowledge: facts.status === "done" ? facts.doneAt : null,
  };
  for (const key of phaseKeys) {
    const v = day(sinceOf[key] ?? null);
    if (v) phaseSince[key] = v;
  }

  const job = facts.processing?.jobType ? `${facts.processing.jobType} · ${facts.processing.waiting ? "queued" : "running"}` : "—";
  return {
    title: ctx.title,
    pathLabel: path.label,
    explanation: explanationOf(facts),
    ...(inReview && facts.reviewReason ? { reason: resolveStatus("document_review_reason", facts.reviewReason).label } : {}),
    ...(inReview && facts.reviewNote ? { note: facts.reviewNote } : {}),
    ...(facts.status === "done" && facts.doneReason ? { note: facts.doneReason } : {}),
    ...(facts.status === "done" && facts.doneVia && facts.doneVia !== "booking" ? { end: resolveStatus("document_done_via", facts.doneVia).label } : {}),
    phaseSince,
    steps,
    ...(facts.reopenedCount > 0 ? { loops: { reopened: facts.reopenedCount } } : {}),
    history: ctx.history,
    historyHref: ctx.historyHref,
    technical: [
      ["status", facts.status],
      ["review_reason", facts.reviewReason ?? "—"],
      ["processing_stage", facts.processingStage ?? "—"],
      ["job", job],
      ["done_via", facts.doneVia ?? "—"],
      ["entry_stage", facts.entryStage ?? "—"],
      ["path", pos.path],
    ],
    ...(ctx.axis ? { axis: ctx.axis } : {}),
    ...(ctx.links.length ? { links: ctx.links } : {}),
  };
}
