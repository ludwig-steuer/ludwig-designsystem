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
