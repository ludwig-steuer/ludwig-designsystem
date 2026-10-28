/**
 * Erzeuger eines Textes oder einer Extraktion (F486, `produced_by`). Ein
 * Feldpaar überall gleich: `produced_by` aus diesem Set und
 * `produced_by_version` (Freitext: Paketversion, API-Version, Analyzer, Modell,
 * agent_run_step_id, user_id).
 *
 * Spiegel der DB-CHECKs `client_document_pages_produced_by_check` und
 * `client_source_docs_invoices_produced_by_check` (Migration 20261012040000).
 * Python-Seite: `ProducedBy` in `ludwig.shared.produced_by`.
 */
export const PRODUCED_BY = [
  "pdfplumber",
  "azure_prebuilt_read",
  "tesseract",
  "azure_content_understanding",
  "layout_template",
  "embedded_xml",
  "openai",
  "agent",
  "human",
  "none",
] as const;
export type ProducedBy = (typeof PRODUCED_BY)[number];
