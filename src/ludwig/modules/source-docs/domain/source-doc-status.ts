/**
 * Belegstatus als eine State-Machine (F289, docs/topics/belege.md R14).
 *
 * `client_source_docs.status` trägt allein, wo ein Beleg steht. Die DB
 * erzwingt dieselbe Paarmenge (`ludwig_private.source_doc_status_transition_allowed`,
 * Migration `20260925100000`); ein DB-Test hält beide deckungsgleich.
 */

export const SOURCE_DOC_STATUSES = [
  "pending",
  "extracting",
  "agent_review",
  "human_review",
  "bookable",
  "done",
  "deleted",
] as const;
export type SourceDocStatus = (typeof SOURCE_DOC_STATUSES)[number];

/** Woran unsere Verfahren gescheitert sind — gesetzt genau in `agent_review`/`human_review`. */
export const SOURCE_DOC_REVIEW_REASONS = [
  "classification_error",
  "unknown_form",
  "unsplit_collection",
  "manual_extraction",
  "extraction_error",
  "open_findings",
  "job_failed",
  "processing_stuck",
  "statement_account_missing",
  "statement_check_failed",
] as const;
export type SourceDocReviewReason = (typeof SOURCE_DOC_REVIEW_REASONS)[number];

/** Ursache der Erledigung (`done_via`); `replaced`/`rejected` aus F288. */
export const SOURCE_DOC_DONE_VIA = [
  "booking",
  "no_booking_required",
  "case_closed",
  "import",
  "superseded",
  "manual",
  "replaced",
  "rejected",
] as const;
export type SourceDocDoneVia = (typeof SOURCE_DOC_DONE_VIA)[number];

export interface SourceDocStatusTransition {
  trigger: string;
  /** `null` = Anlage (kein Vorzustand). */
  from: readonly SourceDocStatus[] | null;
  to: SourceDocStatus;
  by: string;
}

const ALL_BUT_DELETED = SOURCE_DOC_STATUSES.filter((s) => s !== "deleted");

export const SOURCE_DOC_STATUS_TRANSITIONS: readonly SourceDocStatusTransition[] = [
  { trigger: "document_registered", from: null, to: "pending", by: "Upload, Agent-Ingest, Intake, Split-Kind" },
  {
    trigger: "extraction_started",
    from: ["pending", "extracting", "agent_review", "bookable"],
    to: "extracting",
    by: "Routing (Rechnung, Auto-Split), Retry, Python-Pipeline-Start",
  },
  { trigger: "routed_bookable", from: ["pending"], to: "bookable", by: "Routing" },
  { trigger: "routed_to_agent", from: ["pending"], to: "agent_review", by: "Routing, Klassifikationsfehler" },
  {
    trigger: "routed_to_accounting",
    from: ["pending"],
    to: "human_review",
    by: "benannter System-Sonderfall (statement_account_missing, statement_check_failed)",
  },
  { trigger: "extraction_completed", from: ["extracting"], to: "bookable", by: "Pipeline, Split" },
  { trigger: "extraction_needs_review", from: ["extracting"], to: "agent_review", by: "Pipeline (Befunde/Abbruch), Job-Endfehler" },
  { trigger: "processing_stuck", from: ["pending", "extracting"], to: "agent_review", by: "Korb-Freigabe" },
  {
    trigger: "review_resolved",
    from: ["agent_review", "human_review"],
    to: "bookable",
    by: "Revalidierung sauber, Korrektur, Anhängen mit Daten",
  },
  { trigger: "findings_reappeared", from: ["bookable"], to: "agent_review", by: "Revalidierung findet Befunde" },
  { trigger: "escalated_to_accounting", from: ["agent_review"], to: "human_review", by: "Agent (escalate_doc_review, Pflicht-Grund)" },
  { trigger: "returned_to_agent", from: ["human_review"], to: "agent_review", by: "Kanzlei (Pflicht-Grund)" },
  {
    trigger: "reprocess_requested",
    from: ["extracting", "agent_review", "human_review", "bookable"],
    to: "pending",
    by: "Retry ohne Rechnungszeile, Override, Neuverarbeitung",
  },
  {
    trigger: "completed",
    from: ["pending", "extracting", "agent_review", "human_review", "bookable"],
    to: "done",
    by: "Trigger (Buchung, Verzicht, Case-Close, Supersede), complete_doc, Import, Textdublette",
  },
  { trigger: "reopened", from: ["done"], to: "bookable", by: "Agent (reopen_doc), Kanzlei (R14d), Trigger (letzte Buchung weg)" },
  { trigger: "soft_deleted", from: ALL_BUT_DELETED, to: "deleted", by: "Löschen" },
];

/** Selbstübergang oder ein Paar aus den Übergängen — dieselbe Menge wie der DB-Wächter. */
export function canTransitionSourceDoc(from: SourceDocStatus, to: SourceDocStatus): boolean {
  if (from === to) return true;
  return SOURCE_DOC_STATUS_TRANSITIONS.some((t) => t.to === to && t.from !== null && t.from.includes(from));
}
