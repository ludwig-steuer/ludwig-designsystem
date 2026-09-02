/**
 * Document-Inbox-Domain (REQ-001).
 *
 * Mandanten-Inbox für hochgeladene Dokumente — vorgelagert zum
 * Beleg-Einreichen-Flow. Jede Datei wird automatisch klassifiziert;
 * Items, deren ``classDocumentForm`` einen Buchungsbeleg beschreibt
 * (siehe ``qualifiesForInvoiceFlow``), tauchen anschließend in der
 * Beleg-Einreichen-Sektion auf. Direction (Eingangs-/Ausgangs-
 * rechnung) wird im Inbox-Zustand bewusst NICHT klassifiziert — sie
 * wird erst nach dem Preprocessor deterministisch über UStID-Match
 * gegen die Mandant-VAT-ID aufgelöst. ``docDirection`` bleibt im
 * Inbox-Modell als Slot für manuelle User-Overrides erhalten.
 *
 * Werte-Konventionen für ``classDocumentForm`` / ``classDocumentKind``
 * sind durch ``document-simple-classifier`` vorgegeben — keine Enum-
 * Spiegelung im Web, damit neue Werte ohne Web-Deploy durchschlagen.
 */

import { formQualifiesForInvoiceFlow } from "@/ludwig/modules/source-docs";
import type { CollectionKind } from "@/ludwig/core/documents/collection-kind";

export const INBOX_STATUS = [
  "pending_classification",
  "classified",
  "classification_failed",
  "deleted",
] as const;
export type InboxStatus = (typeof INBOX_STATUS)[number];

/**
 * F71 — Split-Plan eines Sammel-PDFs, wie ihn der Classifier nach eigener
 * Validierung (lückenlos, überlappungsfrei, exakt `1..pageCount`) in
 * `class_page_segments` ablegt. Seitennummern 1-basiert und inklusiv.
 *
 * `kind` ist die Belegform-HYPOTHESE des Teilstücks — nach dem Schnitt wird
 * jeder Teilbeleg regulär neu klassifiziert, geerbt wird nichts.
 */
export interface PageSegmentPlan {
  collectionKind: CollectionKind;
  segments: ReadonlyArray<{
    fromPage: number;
    toPage: number;
    label: string;
    kind?: string | null;
  }>;
}

export interface InboxEntry {
  id: string;
  clientId: string;
  storedFileId: string;
  status: InboxStatus;
  classDocumentForm: string | null;
  docDirection: string | null;
  classDocumentKind: string | null;
  classSummary: string | null;
  classCaseSummary: string | null;
  classCounterpartyName: string | null;
  classCounterpartyVatId: string | null;
  classCompanies: ReadonlyArray<{
    name: string;
    role?: string | null;
    taxId?: string | null;
    vatId?: string | null;
    isSelf?: boolean | null;
    isCounterparty?: boolean | null;
  }> | null;
  classConfidence: number | null;
  /** PDF-Seitenzahl aus der Classifier-Text-Extraktion (F16-Frühwarnsignal
   *  für Sammel-PDFs). NULL vor der Klassifikation. */
  pageCount: number | null;
  /** F71: validierter Split-Plan eines Sammel-PDFs — welcher Seitenbereich
   *  welches Teildokument ist. NULL = kein Auto-Split (kein Sammel-PDF, oder
   *  der Plan hat die Validierung nicht bestanden). */
  classPageSegments: PageSegmentPlan | null;
  classOverriddenAt: string | null;
  classOverriddenBy: string | null;
  classificationError: string | null;
  classifiedAt: string | null;
  uploadedBy: string | null;
  uploadedAt: string;
  /** ``client_source_docs_invoices.id`` falls der Inbox-Eintrag bereits in
   *  einen Beleg eingereicht wurde. NULL solange noch nichts registriert
   *  ist. Nur Ingest-Marke — verlinkt wird die Basis-Id (``id``). */
  ingestedInvoiceId: string | null;
  ingestedInvoiceStatus: string | null;
  /** ``client_accounting_case.id`` falls bereits ein Sachverhalt aus
   *  diesem Beleg erstellt wurde. NULL solange der Beleg keinem Case
   *  zugeordnet ist (über ein document_received-Event). */
  accountingCaseId: string | null;
  /** Originaler Dateiname aus ``ops_stored_files`` — für UI-Listung. */
  originalFileName: string | null;
  byteSize: number | null;
}

export function qualifiesForInvoiceFlow(
  entry: Pick<InboxEntry, "status" | "classDocumentForm">,
): boolean {
  if (entry.status !== "classified") return false;
  return formQualifiesForInvoiceFlow(entry.classDocumentForm);
}

/**
 * O7-Wächter: steht der Mandant als Aussteller UND als Empfänger auf dem Beleg?
 *
 * Das kann eine korrekte Extraktion nie liefern — niemand stellt sich selbst
 * eine Rechnung. Tritt es auf, ist entweder die Rollen-Zuordnung der
 * Firmen-Mentions falsch oder das Dokument ist gar kein Beleg (typisch: eine
 * Kanzlei-Auswertung, auf der der Mandant in jeder Kopfzeile steht).
 *
 * Der Befund setzt bewusst KEINE Richtung und KEINE Belegart — er ist ein
 * Konsistenz-Signal, das eine Nachprüfung durch den Agenten auslöst
 * (Owner-Entscheid O7, decision-log 2026-08-20).
 *
 * Reine Ableitung aus dem, was der Classify-Writer ohnehin persistiert
 * (`class_companies` + `class_document_kind`) — deshalb greift sie auch beim
 * Zweitlauf und bei übersprungenem classify. Das Gegenstück auf der
 * Python-Seite ist `detect_self_on_both_sides` (dort für den Invoice-Flow,
 * wo der Befund als `classification_self_on_both_sides`-Finding landet).
 */
export function detectSelfOnBothSides(
  entry: Pick<InboxEntry, "classCompanies" | "classDocumentKind">,
): string | null {
  // §14-UStG-Gutschrift: dort rechnet der Leistungsempfänger ab, die Rollen
  // sind konstruktiv invertiert — kein Widerspruch.
  if (entry.classDocumentKind === "self_billing") return null;
  const companies = entry.classCompanies ?? [];
  const selfNamesFor = (role: string) =>
    companies.filter((c) => c.isSelf && c.role === role).map((c) => c.name);
  const vendors = selfNamesFor("vendor");
  const customers = selfNamesFor("customer");
  if (vendors.length === 0 || customers.length === 0) return null;
  return (
    `Der Mandant ist auf beiden Belegseiten erkannt worden — als Aussteller ` +
    `(${vendors.join(", ")}) und als Empfänger (${customers.join(", ")}). ` +
    "Das kann kein gültiger Beleg sein: entweder sind die Firmen-Rollen falsch " +
    "zugeordnet, oder das Dokument ist gar kein Beleg (z.B. eine Auswertung). " +
    "Bitte Klassifikation prüfen und ggf. korrigieren."
  );
}

/* ------------------------------------------------------------------ */
/* Server-Action-Result-Shapes — separat von den Action-Modulen, weil  */
/* "use server"-Module nur async functions re-exportieren dürfen.      */
/* ------------------------------------------------------------------ */

export interface PreparedUpload {
  ticket: {
    fileUploadId: string;
    storageKey: string;
    uploadUrl: string;
    uploadMethod: "PUT";
    uploadHeaders: Record<string, string>;
    expiresAt: string;
  };
}

/** Ergebnis des Auto-Submits in den InvoiceIngestWorkflow nach dem Upload —
 *  gleiche Semantik wie der Agent-Pfad (F15): `started` = Extraktion läuft,
 *  `duplicate` = SHA-256-Dedupe im Workflow, `not_applicable` = Form
 *  qualifiziert nicht, `submit_failed` = Einreichen fehlgeschlagen (Beleg
 *  bleibt klassifiziert; manuell über die Inbox einreichbar). */
/**
 * Ergebnis des Web-Uploads.
 *
 * Seit F87/WP2 ist die Klassifizierung **asynchron** (durable
 * `doc_process`-Job): der Upload weiß nur noch, DASS die Verarbeitung
 * eingereiht ist, nicht mehr, was dabei herauskommt. Belegform und
 * Invoice-Ergebnis liest die UI aus der Inbox-Liste, die ohnehin pollt.
 *
 * Damit entfällt auch `classification_trigger_failed`: es gibt keinen
 * synchronen Trigger mehr, der wegen eines Caller-Timeouts verloren gehen
 * könnte. Scheitert der Job, steht der Fehler am Beleg
 * (`classification_failed`) und in `/admin/jobs`.
 */
export type FinalizeUploadOutcome =
  | {
      kind: "created";
      inboxEntryId: string;
      /** `ops_jobs.id` des eingereihten `doc_process`-Jobs. */
      processingJobId: string;
    }
  | {
      kind: "duplicate";
      existingInboxEntryId: string;
      uploadedAt: string;
      originalFileName: string | null;
    };

export type DeleteInboxOutcome =
  | { kind: "deleted" }
  | { kind: "blocked"; reason: "ingested" };

export interface SubmittedInbox {
  invoiceId: string;
  duplicate: boolean;
}
