/**
 * Deutsche Labels für `DocumentForm`-Werte aus dem
 * document-simple-classifier (Python-Enum:
 * `apps/document-simple-classifier/.../public_models.py::DocumentForm`).
 *
 * Einzige Quelle der Wahrheit für UI-Anzeigen — bitte keine lokalen
 * Kopien an einzelnen Pages/Komponenten anlegen.
 */
export const DOCUMENT_FORM_LABEL: Record<string, string> = {
  commercial_invoice: "Rechnung",
  fuel_receipt: "Tankquittung",
  hospitality_receipt: "Bewirtungsbeleg",
  cash_receipt: "Kassenbon",
  bank_statement: "Kontoauszug",
  credit_card_statement: "Kreditkartenabrechnung",
  cash_register_closing: "Kassenabschluss",
  payment_reminder: "Mahnung",
  payroll_slip: "Lohnabrechnung",
  expense_report: "Reisekosten",
  delivery_note: "Lieferschein",
  contract: "Vertrag",
  tax_assessment: "Steuerbescheid",
  tax_filing_summary: "Steuererklärung",
  accounting_report: "Auswertung",
  document_collection: "Sammel-PDF",
  other: "Sonstiges",
  unknown: "Unbekannt",
};

export function formatDocumentForm(form: string | null | undefined): string {
  if (!form) return "—";
  return DOCUMENT_FORM_LABEL[form] ?? form.replace(/_/g, " ");
}

/**
 * Deutsche Labels für die Belegrichtung (`doc_direction` am Invoice-Subtyp,
 * ex `accounting_role` — umbenannt mit F87/O8, weil `accounting_role` an
 * `client_ledger_accounts` etwas völlig anderes bedeutet). Lag bis 2026-07-20
 * als Kopie in `GlanceCard` und der Belege-Liste.
 *
 * `internal` steht im DB-CHECK, hat heute aber bewusst keinen Schreiber —
 * siehe `docs/topics/belege.md` R10.
 */
export const DOC_DIRECTION_LABEL: Record<string, string> = {
  inbound: "Eingangsrechnung",
  outbound: "Ausgangsrechnung",
  internal: "Interner Vorgang",
};

/**
 * Der Charakter eines Belegs. Gleiche Quelle wie das Python-Enum; seit
 * 2026-09-07 auch Registry-Achse `beleg_charakter` (L-37).
 */
export const DOCUMENT_KINDS = [
  "original",
  "credit_note",
  "self_billing",
  "refund",
  "unknown",
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/** Deutsche Labels für `DocumentKind` (gleiche Python-Enum-Quelle). */
export const DOCUMENT_KIND_LABEL: Record<string, string> = {
  original: "Normal-Beleg",
  credit_note: "Stornogutschrift",
  self_billing: "§14-UStG-Gutschrift",
  refund: "Erstattung",
  unknown: "Unbekannt",
};

export function formatDocumentKind(kind: string | null | undefined): string {
  if (!kind) return "—";
  return DOCUMENT_KIND_LABEL[kind] ?? kind.replace(/_/g, " ");
}

/**
 * Woran ein Beleg erledigt wurde — `client_source_docs.completed_via`.
 * DB-CHECK `client_source_docs_completed_via_check` (`20260829140000`, um
 * `no_booking_required` erweitert in `20260903120000`).
 *
 * Hatte bis 2026-09-07 keinen TS-Typ (L-47). Die Achse `beleg_erledigung`
 * führt zusätzlich zwei Werte, die keine Spaltenwerte sind (`open`,
 * `completed`) — die stehen dort und nicht hier.
 */
export const SOURCE_DOC_COMPLETION_VIA = [
  "booking",
  "case_closed",
  "import",
  "superseded",
  "manual",
  "no_booking_required",
] as const;
export type SourceDocCompletionVia = (typeof SOURCE_DOC_COMPLETION_VIA)[number];
