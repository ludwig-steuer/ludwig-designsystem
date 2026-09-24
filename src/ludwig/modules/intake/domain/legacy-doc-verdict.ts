/**
 * Der Verarbeitungsstand, wie ihn die Intake-API v3 nach außen meldet
 * (`docs/reference/intake-api_v3.md` §5.5, `check.processing`).
 *
 * Diese Abbildung hält den externen Vertrag fest: Am Intake hängt das
 * DUO-Sync-Werkzeug (F216), und es prüft auf `verdict`/`docStatus`. Seit F289
 * trägt der Belegstatus die Wahrheit (belege.md R14) — die alten Werte
 * entstehen nur noch hier, nirgends sonst im Code.
 */

export type LegacyDocVerdict =
  | "classifying"
  | "extracting"
  | "processed"
  | "review_needed"
  | "no_invoice_flow"
  | "not_split"
  | "failed"
  | "classification_failed"
  | "not_found";

export type LegacyDocStatus =
  | "pending_classification"
  | "classification_failed"
  | "awaiting_input"
  | "deleted"
  | "classified";

export interface LegacyDocFacts {
  /** Belegstatus; `null` = unbekannte ID. */
  status: string | null;
  reviewReason: string | null;
  /** Gibt es eine Rechnungszeile? */
  hasInvoice: boolean;
}

/** Erste passende Zeile gewinnt. */
export function legacyDocVerdict(f: LegacyDocFacts): LegacyDocVerdict {
  if (f.status === null || f.status === "deleted") return "not_found";
  if (f.status === "pending") return "classifying";
  if (f.status === "extracting") return "extracting";
  if (f.status === "bookable" || f.status === "done") return f.hasInvoice ? "processed" : "no_invoice_flow";
  switch (f.reviewReason) {
    case "open_findings":
      return "review_needed";
    case "unsplit_collection":
      return "not_split";
    case "classification_error":
      return "classification_failed";
    case "extraction_error":
    case "job_failed":
    case "processing_stuck":
      return "failed";
    default:
      // unknown_form, manual_extraction, statement_* — Kanzlei- oder Agent-Sache.
      return "no_invoice_flow";
  }
}

export function legacyDocStatus(f: Pick<LegacyDocFacts, "status" | "reviewReason">): LegacyDocStatus {
  if (f.status === "pending") return "pending_classification";
  if (f.status === "deleted") return "deleted";
  if (f.reviewReason === "classification_error") return "classification_failed";
  if (
    f.status === "human_review" &&
    (f.reviewReason === "statement_account_missing" || f.reviewReason === "statement_check_failed")
  ) {
    return "awaiting_input";
  }
  return "classified";
}
