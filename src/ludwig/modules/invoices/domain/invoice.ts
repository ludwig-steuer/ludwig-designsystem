import { z } from "zod";
import type { RawSearchParams } from "@/ludwig/shared";
// Kategorie-Werteraum aus der EINEN Mapping-Quelle — keine zweite Liste.
import { DOC_CATEGORIES, type DocCategory } from "@/ludwig/modules/source-docs";

// Fachliche Reviewer-Achse (orthogonal zur technischen `processingStatus`).
// Seit dem btx-Refactor lebt der Wert am Sachverhalt
// (`client_accounting_case.lifecycle_status`); seit Migration
// `20260705113000` (F11-T11.5) ist der Wertebereich auf die aktive
// Menge eingeengt — identisch mit `CASE_LIFECYCLE` in
// `accounting-cases/domain/case.ts`.
export const INVOICE_LIFECYCLE = [
  "open",
  "needs_clarification",
  "waiting_for_documents",
  "closed_accepted",
  "closed_rejected",
  "closed_superseded",
] as const;
export type InvoiceLifecycle = (typeof INVOICE_LIFECYCLE)[number];

export interface InvoiceFilter {
  /** Volltextsuche über Belegnummer, Kreditoren-Name und Dateiname (ILIKE %q%). */
  searchQuery?: string;
  /** Perioden-Filter über das Eingangsdatum (`client_source_docs.received_date`). */
  receivedFrom?: string;
  receivedTo?: string;
  lifecycleStatus?: InvoiceLifecycle[];
  businessPartnerId?: string;
  /** Wenn `true`: nur Belege deren Sachverhalt (über document_received-
   *  Event) mind. eine offene Klärungsfrage trägt. Bedient den „Klärungs-
   *  fragen"-Tab auf der Belege-Liste. */
  hasOpenClarification?: boolean;
  /** Wenn `true`: nur unerledigte Belege (`completed_at is null`) — die
   *  eigentliche Todo-Liste. Erledigte sind gebucht, als nicht relevant
   *  eingestuft oder durch andere Belege ersetzt. */
  openOnly?: boolean;
  /** Belegkategorie (`client_source_docs.doc_category`, Achse
   *  `beleg_kategorie`) — was mit dem Beleg als Nächstes passiert. */
  docCategory?: DocCategory[];
}

export const INVOICE_LIST_TABS = [
  "alle",
  "klaerung",
  "verarbeitung",
  "problematisch",
] as const;
export type InvoiceListTab = (typeof INVOICE_LIST_TABS)[number];

export const INVOICE_LIST_TAB_LABEL: Record<InvoiceListTab, string> = {
  alle: "Alle Belege",
  klaerung: "Klärungsfragen",
  verarbeitung: "In Verarbeitung",
  problematisch: "Problematische Belege",
};

export function parseInvoiceListTab(
  value: string | string[] | undefined,
): InvoiceListTab {
  const v = Array.isArray(value) ? value[0] : value;
  return (INVOICE_LIST_TABS as readonly string[]).includes(v ?? "")
    ? (v as InvoiceListTab)
    : "alle";
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const InvoiceFilterRawSchema = z.object({
  q: z.string().min(1).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  lifecycle: z.string().optional(),
  open: z.string().optional(),
  cat: z.string().optional(),
});

/**
 * Serialisiert die Listen-Kontext-Parameter, die die Beleg-Detailseite
 * für die Prev/Next-Navigation braucht. Eigene ``list*``-Prefixes, damit
 * sie nicht mit Detail-Tabs (``tab``) oder anderen Detail-Params
 * kollidieren.
 */
export function listContextToParams(filter: InvoiceFilter): URLSearchParams {
  const p = new URLSearchParams();
  if (filter.searchQuery) p.set("listQ", filter.searchQuery);
  if (filter.receivedFrom) p.set("listFrom", filter.receivedFrom);
  if (filter.receivedTo) p.set("listTo", filter.receivedTo);
  if (filter.lifecycleStatus && filter.lifecycleStatus.length > 0) {
    p.set("listLc", filter.lifecycleStatus.join(","));
  }
  if (filter.businessPartnerId) p.set("listCr", filter.businessPartnerId);
  if (filter.openOnly) p.set("listOpen", "1");
  if (filter.docCategory && filter.docCategory.length > 0) {
    p.set("listCat", filter.docCategory.join(","));
  }
  return p;
}

/**
 * Gegenstück zu ``listContextToParams``: rekonstruiert auf der Detail-
 * seite den Filter, mit dem der Aufrufer die Liste angezeigt hat.
 * Liefert ``null``, wenn kein Listen-Kontext mitgegeben wurde — dann
 * wird keine Prev/Next-Navigation angeboten.
 */
export function parseListContext(raw: RawSearchParams): InvoiceFilter | null {
  const filter: InvoiceFilter = {};
  let touched = false;
  if (typeof raw.listQ === "string" && raw.listQ.length > 0) {
    filter.searchQuery = raw.listQ;
    touched = true;
  }
  if (typeof raw.listFrom === "string" && raw.listFrom.length > 0) {
    filter.receivedFrom = raw.listFrom;
    touched = true;
  }
  if (typeof raw.listTo === "string" && raw.listTo.length > 0) {
    filter.receivedTo = raw.listTo;
    touched = true;
  }
  if (typeof raw.listLc === "string" && raw.listLc.length > 0) {
    const parts = raw.listLc
      .split(",")
      .map((s) => s.trim())
      .filter((s): s is InvoiceLifecycle =>
        (INVOICE_LIFECYCLE as readonly string[]).includes(s),
      ) as InvoiceLifecycle[];
    if (parts.length > 0) {
      filter.lifecycleStatus = parts;
      touched = true;
    }
  }
  if (typeof raw.listCr === "string" && raw.listCr.length > 0) {
    filter.businessPartnerId = raw.listCr;
    touched = true;
  }
  if (raw.listOpen === "1") {
    filter.openOnly = true;
    touched = true;
  }
  if (typeof raw.listCat === "string" && raw.listCat.length > 0) {
    const cats = parseDocCategories(raw.listCat);
    if (cats) {
      filter.docCategory = cats;
      touched = true;
    }
  }
  return touched ? filter : null;
}

export function parseInvoiceFilter(raw: RawSearchParams): InvoiceFilter {
  const parsed = InvoiceFilterRawSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
    lifecycle: typeof raw.lifecycle === "string" ? raw.lifecycle : undefined,
    open: typeof raw.open === "string" ? raw.open : undefined,
    // Checkbox-Gruppe: mehrere `cat`-Werte kommen als Array an.
    cat: Array.isArray(raw.cat) ? raw.cat.join(",") : typeof raw.cat === "string" ? raw.cat : undefined,
  });
  if (!parsed.success) return {};
  const lifecycleStatus = parsed.data.lifecycle
    ? (parsed.data.lifecycle
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is InvoiceLifecycle =>
          (INVOICE_LIFECYCLE as readonly string[]).includes(s),
        ) as InvoiceLifecycle[])
    : undefined;
  return {
    searchQuery: parsed.data.q,
    receivedFrom: parsed.data.from,
    receivedTo: parsed.data.to,
    openOnly: parsed.data.open === "1" ? true : undefined,
    lifecycleStatus: lifecycleStatus && lifecycleStatus.length > 0 ? lifecycleStatus : undefined,
    docCategory: parsed.data.cat ? (parseDocCategories(parsed.data.cat) ?? undefined) : undefined,
  };
}

/** Kommaliste → bekannte Kategorien; unbekannte Werte fallen still weg
 *  (URL-Parameter sind Nutzereingabe). `null` = nichts Gültiges dabei. */
function parseDocCategories(raw: string): DocCategory[] | null {
  const values = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is DocCategory => (DOC_CATEGORIES as readonly string[]).includes(s));
  return values.length > 0 ? values : null;
}

export interface InvoiceListItem {
  /** Subtyp-Id (`client_source_docs_invoices.id`). NULL, wenn der Beleg
   *  keine Rechnung ist — die Liste trägt seit „Alle Belege = alle
   *  Belegarten" jeden `source_doc_type` (Kontoauszug, Sammel-PDF,
   *  Kreditkartenabrechnung …), und nur Rechnungen haben eine Subtyp-Zeile. */
  invoiceId: string | null;
  /** Basis-Id (`client_source_docs.id`) — Ziel der Detail-URL. */
  sourceDocId: string | null;
  clientId: string;
  /** Belegart am Supertyp: `invoice` | `contract` | `bank_statement_pdf` |
   *  `credit_card_statement` | … NULL = noch nicht klassifiziert. */
  sourceDocType: string | null;
  invoiceNumber: string | null;
  /** Dateiname der Quelldatei — Fallback-Kennung, wenn keine Belegnummer
   *  extrahiert wurde. */
  fileName: string | null;
  vendorName: string | null;
  /** Rechnungsempfänger laut Extraktion — bei Ausgangsrechnungen der
   *  Geschäftspartner (Debitor). */
  customerName: string | null;
  businessPartnerId: string | null;
  /** Belegdatum laut Beleg. NULL = nicht bekannt (kein Ersatzwert). */
  invoiceDate: string | null;
  /** Eingangsdatum — Perioden-Achse von Liste und Dashboard. */
  receivedDate: string | null;
  dueDate: string | null;
  totalValue: number | null;
  currency: string | null;
  lifecycleStatus: InvoiceLifecycle | null;
  processingStage: string | null;
  processingStatus: string | null;
  docDirection: string | null;
  /**
   * Belegkategorie am Supertyp (F87): `performance` | `payment` |
   * `foundation` | `internal` | `report`. NULL = unklassifiziert. Sagt,
   * welcher Folgeprozess gilt — Darstellung über die Status-Registry-Achse
   * `beleg_kategorie`.
   */
  docCategory: string | null;
  documentForm: string | null;
  documentKind: string | null;
  documentSummary: string | null;
  /** Beleg-Review-Loop: wer korrigiert — NULL/'agent' = Agent still am
   *  Zug, 'accounting' = vom Agenten an die Kanzlei eskaliert. */
  reviewDisposition: string | null;
  createdAt: string;

  // ── Fachlicher Abschluss (client_source_docs, Migration 20260720130000) ──
  /** Zeitpunkt der fachlichen Erledigung. NULL = Beleg steht noch offen. */
  completedAt: string | null;
  /** Kurze Begründung der Erledigung — Tooltip am Status-Badge. */
  completedReason: string | null;

  // ── Sachverhalt (client_accounting_case via document_received event) ──
  /** ID des Sachverhalts, dem dieser Beleg angehängt ist (NULL, wenn der
   *  Beleg noch nicht ingestiert / keinem Case zugeordnet ist). */
  caseId: string | null;
  /** Fachliche Sachverhalts-Nummer (``case_number``) — Anzeige-Label.
   *  NULL bei Cases aus der Zeit vor der Nummernvergabe. */
  caseNumber: string | null;
  /** Fiscal Year des Sachverhalts — gebraucht, um die Case-Detail-URL
   *  (`/clients/[slug]/[year]/cases/[caseId]`) zu bauen. */
  caseFiscalYear: number | null;
}

export interface InvoiceLineItem {
  position: number;
  itemName: string | null;
  productDescription: string | null;
  productCode: string | null;
  serviceDate: string | null;
  quantity: number | null;
  unit: string | null;
  unitPriceValue: number | null;
  lineDiscountValue: number | null;
  taxRatePercent: number | null;
  taxValue: number | null;
  lineTotalNetValue: number | null;

  // FX-Mirrors — gefüllt nur bei Fremdwährungs-Belegen (sonst NULL).
  fxUnitPriceValue: number | null;
  fxLineDiscountValue: number | null;
  fxTaxValue: number | null;
  fxLineTotalNetValue: number | null;

  // Per-Line-Interpretation — konzept-basierte Spalten.
  lineSpecialType: string | null;
  fundUsageNature: string | null;
  accountingSubject: string | null;
  fundUsageConfidence: number | null;
  fundUsageReasoning: string | null;
  vatSpecialCase: string | null;
  vatLegalReference: string | null;
  vatExtractedRatePercent: number | null;
  taxCandidateKeys: string[] | null;
  vatEvidence: unknown;
  vatNotes: unknown;
  historyCandidates: unknown;
  lineNotes: string[];
  // Herkunft der Position (siehe GLOSSARY „Invoice line item source"):
  // 'extracted' = direkt aus dem PDF gelesen,
  // 'virtual_fallback' = Workflow-Synthesen aus den Totals (z.B. Tankquittung),
  // 'virtual_aggregate' = aggregiertes Sammel-Item nach Beleg-Kollaps.
  source: string;
  // Wenn ``true``: die Position wurde vom Beleg-Kollaps deaktiviert und
  // wird von Booking-Picker + Output-Validation übersprungen. Die Zeile
  // bleibt für den Audit-Trail in der DB; die UI zeigt sie ausgegraut.
  disabled: boolean;
  // Audit-Trail des Beleg-Kollaps. Nur auf der ``virtual_aggregate``-
  // Line gesetzt. Schema siehe Python ``CollapseDecision`` in
  // ``apps/invoice-interpreter/.../public_models.py``.
  collapseDecisionJson: unknown;
}

export interface BookingProposalLine {
  entryId: string;
  bookingDate: string;
  amount: number;
  currency: string;
  vatKey: string | null;
  vatRatePercent: number | null;
  buchungstext: string | null;
  belegfeld1: string | null;
  status: string;
  isLocked: boolean;
  proposalConfidence: number | null;
  /** Rationale-JSON aus dem Booking-Modul; UI rendert es als
   *  Schlüssel-Wert-Liste, ohne in die Struktur einzugreifen. */
  proposalRationale: unknown;
  debitAccountNumber: string | null;
  debitAccountName: string | null;
  creditAccountNumber: string | null;
  creditAccountName: string | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  // ── Identitäten (technisch — nur im Pipeline-Tab anzeigen) ─────────────
  /** Die Detailansicht hängt immer an einer echten Rechnungszeile. */
  invoiceId: string;
  /** FK auf den Supertyp `client_source_docs` — dort leben Eingangsdatum,
   *  DATEV-Referenz und der Erledigt-Marker. */
  sourceDocId: string | null;
  extractionId: string | null;
  sourceFileId: string | null;
  fiscalYearId: string | null;
  /** Legal name des verlinkten Geschäftspartners (F76: EINE Identität für
   *  beide Richtungen; kann vom extrahierten ``vendorName``/``customerName``
   *  abweichen, wenn der Partner onboarding-bereinigt hinterlegt ist). */
  partnerLegalName: string | null;
  /** DATEV-Kontonummer des Kreditor-Personenkontos des Partners (sofern
   *  vorhanden) — für Eingangsrechnungen. */
  creditorDatevAccountNumber: string | null;
  /** DATEV-Kontonummer des Debitor-Personenkontos des Partners (sofern
   *  vorhanden) — für Ausgangsrechnungen. */
  debtorDatevAccountNumber: string | null;
  documentHashSha256: string | null;
  /** Externe DATEV-Ablage-Referenz (BEDI/DDMS) vom Supertyp client_source_docs.
   *  Nur beim Export relevant; null wenn keine gesetzt. */
  datevRefSystem: string | null;
  datevRefFolder: string | null;
  datevRefId: string | null;

  /** Begründung des Buchungs-Agenten für die Eskalation an die Kanzlei
   *  (``review_disposition_reason``). NULL solange keine Eskalation. */
  reviewDispositionReason: string | null;

  // ── Kopfdaten / Extraktion ─────────────────────────────────────────────
  vendorTaxId: string | null;
  vendorUstId: string | null;
  customerId: string | null;
  customerTaxId: string | null;
  servicePeriod: string | null;
  subtotalValue: number | null;
  taxTotalValue: number | null;
  paymentTerm: string | null;
  reverseCharge: string | null;
  markdown: string | null;

  // ── FX (Original-Währung; alle leer bei EUR-Belegen) ───────────────────
  fxCurrency: string | null;
  fxSubtotalValue: number | null;
  fxTaxTotalValue: number | null;
  fxInvoiceTotalValue: number | null;
  fxRate: number | null;
  fxRateDate: string | null;
  fxRateSource: string | null;


  // ── Klassifikation (vom document-simple-classifier) ───────────────────
  docDirection: string | null;
  docDirectionConfidence: number | null;
  documentForm: string | null;
  documentFormConfidence: number | null;
  documentKind: string | null;
  documentKindConfidence: number | null;
  documentSummary: string | null;
  mentionedCompanies: unknown;

  // ── Interpretation (vom invoice-interpreter) ──────────────────────────
  /**
   * F96: Provenienz des Beleg→Partner-Links, richtungsneutral. Ersetzt die
   * getrennten `creditorMatchOutcome`/`debtorMatchOutcome` — seit F76 gibt es
   * einen Partnerbegriff und eine Link-Spalte, also auch ein Ergebnis.
   * `outcome`: confirmed | ambiguous | not_found | skipped.
   */
  partnerMatchOutcome: string | null;
  partnerMatchStage: string | null;
  partnerMatchConfidence: number | null;
  /** Bei `ambiguous`: die Kandidaten, die die Klärfrage anbietet. */
  partnerMatchCandidates: unknown;
  paymentStatus: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  paymentStatusConfidence: number | null;
  paymentStatusReasoning: string | null;
  paymentStatusEvidence: unknown;
  vatProfile: string | null;
  vatProfileSource: string | null;
  vatContainsReverseCharge: boolean | null;
  vatContainsTaxExempt: boolean | null;
  vatSpecialCases: string[] | null;

  // ── Pipeline ───────────────────────────────────────────────────────────
  /** Start des aktuellen Pipeline-Runs — abgeleitet aus
   *  ``MIN(ops_extraction_logs.logged_at)`` für ``workflow_run_id =
   *  invoice.extraction_id``. ``null`` bevor irgendein Modul geloggt hat. */
  processingStartedAt: string | null;
  /** Letzter Log-Eintrag im aktuellen Run — Heartbeat-Indikator: wenn
   *  dieser Wert lange nicht mehr aktualisiert wird, hängt die Pipeline. */
  processingLastActivityAt: string | null;
  processingErrors: ProcessingErrorEntry[];

  // ── Beziehungen ────────────────────────────────────────────────────────
  lineItems: InvoiceLineItem[];
  bookingProposal: BookingProposalLine[];
  /** Diskrete Sonderregel-/Finding-Einträge aus ``client_invoice_traces`` (``step_kind='finding'``, F49 WP10). */
  logEntries: InvoiceLogEntry[];
  /** Klärungsfragen aus ``client_accounting_case_clarification`` (Join über
   *  ``client_accounting_event`` mit ``kind='document_received'``). */
  clarifications: InvoiceClarification[];
}

export interface InvoiceLogEntry {
  id: string;
  ruleCode: string;
  description: string;
  sourceModule: string;
  createdAt: string;
}

export type ClarificationSeverity = "required" | "optional";
/**
 * Antwortform einer Rückfrage — `client_accounting_case_clarification.answer_kind`.
 * DB-CHECK mit fünf Werten.
 *
 * `document_upload` ist ein **Altwert und wird nicht mehr geschrieben**: seit
 * F125 ist ein fehlender Beleg keine Rückfrage, sondern eine Erwartung. Acht
 * Zeilen im Bestand tragen ihn noch, deshalb steht er hier — wer alte Fälle
 * liest, muss sie typkorrekt lesen können. Wer eine neue Rückfrage stellt,
 * nimmt ihn nicht.
 *
 * Bis 2026-09-07 kannte die Union nur vier Werte; der `ClarificationEditor`
 * weitete sie lokal und begründete es dort (L-12).
 */
export const CLARIFICATION_ANSWER_KINDS = [
  "yes_no",
  "single_choice",
  "multi_choice",
  "free_text",
  "document_upload",
] as const;
export type ClarificationAnswerKind = (typeof CLARIFICATION_ANSWER_KINDS)[number];

export interface InvoiceClarification {
  id: string;
  questionType: string;
  severity: ClarificationSeverity;
  professionalText: string;
  clientText: string;
  answerKind: ClarificationAnswerKind;
  answerOptions: string[];
  allowFreeText: boolean;
  sourceModule: string;
  createdAt: string;
  answerPayload: unknown;
  answeredAt: string | null;
}

export interface ProcessingErrorEntry {
  loggedAt: string;
  module: string;
  step: string;
  message: string;
}

/**
 * Eine Zeile aus ``ludwig.client_invoice_traces`` — die fachliche
 * Audit-Spur eines Pipeline-Schritts auf einem Beleg. Quelle der Wahrheit
 * für Begründungen, die der Reviewer im Belegmodul lesen will.
 *
 * Im Gegensatz zur technischen ``ProcessingErrorEntry`` hat dieser
 * Eintrag eine deutsche Summary, optionale Confidence und kann sich auf
 * eine konkrete Buchungszeile beziehen.
 */
export type InvoiceTraceLevel =
  | "debug"
  | "verbose"
  | "info"
  | "warning"
  | "error";

export interface InvoiceTraceEntry {
  id: string;
  loggedAt: string;
  module: string;
  stepKind: string;
  summary: string;
  confidence: number | null;
  journalEntryId: string | null;
  bookingLineIndex: number | null;
  vatBlockIndex: number | null;
  extractionId: string | null;
  actor: string | null;
  comment: string | null;
  payload: unknown;
  /** Verbosity/Severity. Bestands-Zeilen ohne Wert lesen als `"info"`. */
  level: InvoiceTraceLevel;
}

/**
 * Trace-Zeile → kanonische Protokollzeile des Design-Systems.
 *
 * `stepKind` wird zum **Code** (stabiler Filterschlüssel), `module` zur
 * **Quelle**, `summary` zur Meldung. Die Konfidenz landet in der Zusatzzelle,
 * weil sie nur an manchen Schritten hängt und keine eigene Spalte verdient.
 *
 * Die Tiefe (Z6) leitet sich aus dem Level ab: was der Prüfer lesen soll, ist
 * `info` und darüber (Tiefe 2); `verbose` und `debug` sind Technik (Tiefe 3).
 * Damit sortiert der `LogBrowser` dieselben Zeilen, die vorher ein eigener
 * Schalter ein- und ausblendete (L-33).
 */
export function invoiceTraceToLogEntry(t: InvoiceTraceEntry): {
  id: string;
  at: string;
  message: string;
  level: InvoiceTraceLevel;
  source: string;
  code: string;
  depth: 1 | 2 | 3;
  detail?: string;
  payload?: unknown;
  actor?: { kind: string; label?: string };
} {
  return {
    id: t.id,
    at: t.loggedAt,
    message: t.summary,
    level: t.level,
    source: t.module,
    code: t.stepKind,
    depth: t.level === "verbose" || t.level === "debug" ? 3 : 2,
    detail: t.comment ?? undefined,
    payload: t.payload ?? undefined,
    // `module='review'` heißt: ein Mensch hat gehandelt.
    actor: t.actor ? { kind: t.module === "review" ? "user" : "system", label: t.actor } : undefined,
  };
}
