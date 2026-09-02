/**
 * # Die EINE Mapping-Quelle: Belegform → Kategorie, Subtyp, Invoice-Flow
 *
 * `doc_category` wird nie vom LLM vergeben und nie irgendwo „nachgebaut" —
 * sie fällt aus dieser Tabelle. Dasselbe gilt für den Subtyp-Diskriminator
 * `source_doc_type`: beide kommen aus derselben Zeile und können deshalb
 * nicht auseinanderlaufen (C5, siehe `docs/topics/belege.md` R5/R6).
 *
 * ## Was diese Tabelle ersetzt
 * Vier Listen, die dasselbe halb beantworteten und nachweislich gedriftet
 * sind (P8 / Landkarten-Marker B21):
 *
 * | Liste | Ort | Art |
 * |---|---|---|
 * | `INVOICE_QUALIFYING_FORMS` | `document-inbox/domain/inbox.ts` | Allowlist |
 * | `_NON_BOOKABLE_DOCUMENT_FORMS` | `workflows/invoice_ingest_workflow.py` | Denylist |
 * | `NON_INVOICE_FORMS` | `invoice-interpreter/steps/invoice_validity_check.py` | Denylist |
 * | `_NON_INVOICE_FORMS` | `workflows/interpretation_context_loader.py` | Denylist |
 *
 * Alle vier sind gelöscht (P8). Wer eine Aufzählung braucht, leitet sie hier
 * ab — `INVOICE_FLOW_FORMS` weiter unten ist das einzige Beispiel.
 *
 * Die letzte enthielt sogar Formen, die der Classifier gar nicht vergeben
 * konnte (`tax_assessment`, `tax_filing_summary`) — sie liefen deshalb als
 * Rechnung durch und bekamen eine Richtungszeile über einen Steuerbescheid.
 *
 * ## Python-Spiegel
 * `apps/shared/src/buchassi_shared/document_category.py`. Die beiden Seiten
 * werden von `__tests__/document-form-mapping.test.ts` Zeile für Zeile
 * gegeneinander gehalten — wer hier ändert und dort nicht, wird rot.
 */

/** Die vier Belegsäulen plus der „kein Beleg"-Ausgang für Eigenauswertungen. */
export const DOC_CATEGORIES = [
  "performance",
  "payment",
  "foundation",
  "internal",
  "report",
] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];

/**
 * Belegrichtung (`client_source_docs_invoices.doc_direction`) — Spiegel des
 * DB-CHECK `client_source_docs_invoices_doc_direction_check`.
 *
 * NULL ist bewusst kein Wert dieser Liste, sondern ihr Fehlen: „nicht
 * anwendbar", nie „unbekannt". `internal` steht im CHECK, hat aber heute
 * keinen Schreiber (`docs/topics/belege.md` R10) — die Liste ist der
 * Werteraum, nicht die Menge der wählbaren Optionen.
 *
 * Lag bis F87 dreimal als Literal herum (Status-Registry-Test, Glossar-Test,
 * Dev-Gallery) — dieselbe Drift-Bauart wie die vier Formen-Listen.
 */
export const DOC_DIRECTIONS = ["inbound", "outbound", "internal"] as const;
export type DocDirection = (typeof DOC_DIRECTIONS)[number];

/** Subtyp-Diskriminator. `declaration` existiert im CHECK, hat aber keinen Schreiber. */
export type SourceDocType =
  | "invoice"
  | "contract"
  | "bank_statement_pdf"
  | "credit_card_statement"
  | "travel_expense_report"
  | "other";

/**
 * Fester Erledigungs-Grund für Eigenauswertungen (O7). Wörtlich in
 * `client_source_docs.completed_reason` — die UI zeigt ihn als Tooltip.
 */
export const REPORT_COMPLETED_REASON =
  "Auswertung — kein Beleg; Inhalt liegt im DATEV-Spiegel";

export interface DocumentFormRouting {
  /** `null` = unklassifiziert: Auffang (`other`/`unknown`) oder Container. */
  category: DocCategory | null;
  sourceDocType: SourceDocType;
  /**
   * Läuft der Beleg durch OCR-Extraktion + Interpretation (Invoice-Subtyp)?
   *
   * Strikt stärker als `category === "performance"`: Lieferschein und Mahnung
   * gehören fachlich zum Leistungsvorgang, sind aber keine Rechnungs-
   * dokumente. Die Umkehrung gilt: `invoiceFlow` ⟹ `performance`.
   */
  invoiceFlow: boolean;
}

/** DIE Tabelle. Total über alle `DocumentForm`-Werte des Classifiers. */
export const DOCUMENT_FORM_ROUTING: Record<string, DocumentFormRouting> = {
  // — Säule 1: Leistungsbelege —
  commercial_invoice: { category: "performance", sourceDocType: "invoice", invoiceFlow: true },
  // O6/Variante C: fremde Bons bleiben Leistungsbeleg mit vollem VSt-/
  // Kleinbetragspfad (§ 33 UStDV). Das Sofort-bezahlt-Kennzeichen wird
  // abgeleitet (IMMEDIATE_PAYMENT_*), nicht gespeichert.
  fuel_receipt: { category: "performance", sourceDocType: "invoice", invoiceFlow: true },
  hospitality_receipt: { category: "performance", sourceDocType: "invoice", invoiceFlow: true },
  cash_receipt: { category: "performance", sourceDocType: "invoice", invoiceFlow: true },
  delivery_note: { category: "performance", sourceDocType: "other", invoiceFlow: false },
  payment_reminder: { category: "performance", sourceDocType: "other", invoiceFlow: false },

  // — Säule 2: Zahlungsbelege —
  bank_statement: { category: "payment", sourceDocType: "bank_statement_pdf", invoiceFlow: false },
  credit_card_statement: {
    category: "payment",
    sourceDocType: "credit_card_statement",
    invoiceFlow: false,
  },
  // O6: der EIGENE Kassenabschluss (Z-Bon/TSE) — Gegenstück zum fremden Bon.
  cash_register_closing: { category: "payment", sourceDocType: "other", invoiceFlow: false },

  // — Säule 3: Nachweisbelege —
  // Der Contract-Extract hängt an der FORM `contract`, nicht an der Kategorie:
  // ein Steuerbescheid darf nicht durch die Vertrags-Extraktion laufen.
  contract: { category: "foundation", sourceDocType: "contract", invoiceFlow: false },
  tax_assessment: { category: "foundation", sourceDocType: "other", invoiceFlow: false },
  tax_filing_summary: { category: "foundation", sourceDocType: "other", invoiceFlow: false },

  // — Säule 4: Interne Belege —
  payroll_slip: { category: "internal", sourceDocType: "other", invoiceFlow: false },
  expense_report: {
    category: "internal",
    sourceDocType: "travel_expense_report",
    invoiceFlow: false,
  },

  // — Kein Beleg (O7) —
  accounting_report: { category: "report", sourceDocType: "other", invoiceFlow: false },

  // — Ohne Kategorie —
  // C3: Container. Die Kategorie entsteht erst je Teilbeleg nach dem Split.
  document_collection: { category: null, sourceDocType: "other", invoiceFlow: false },
  other: { category: null, sourceDocType: "other", invoiceFlow: false },
  unknown: { category: null, sourceDocType: "other", invoiceFlow: false },
};

/**
 * Auffang für Formen, die (noch) nicht in der Tabelle stehen. Erreichbar nur
 * über Altdaten — die Deckungsgleichheits-Tests halten Enum und Tabelle
 * synchron. Verhalten wie `unknown`: keine Kategorie, kein Subtyp,
 * Agent-Bucket. Bewusst kein Throw: ein unbekannter Alt-String darf einen
 * Ingest nicht killen, er darf nur nicht still zur Rechnung werden.
 */
const UNMAPPED: DocumentFormRouting = {
  category: null,
  sourceDocType: "other",
  invoiceFlow: false,
};

export function routeDocumentForm(form: string | null | undefined): DocumentFormRouting {
  if (!form) return UNMAPPED;
  return DOCUMENT_FORM_ROUTING[form] ?? UNMAPPED;
}

export function docCategoryForForm(form: string | null | undefined): DocCategory | null {
  return routeDocumentForm(form).category;
}

/** Ersatz für `qualifiesForInvoiceFlow(entry)` auf der Formen-Achse. */
export function formQualifiesForInvoiceFlow(form: string | null | undefined): boolean {
  return routeDocumentForm(form).invoiceFlow;
}

/**
 * Alle Belegformen als Tupel — für `z.enum()`, das ein nicht-leeres
 * String-Tupel verlangt. Reihenfolge = Kategorie-Reihenfolge der Tabelle,
 * damit Verwandtes in Tool-Contracts und Auswahllisten beieinandersteht.
 */
export const DOCUMENT_FORM_VALUES = Object.keys(DOCUMENT_FORM_ROUTING) as [string, ...string[]];

/**
 * Die qualifizierenden Formen als Aufzählung — nur zum Anzeigen („Erlaubte
 * Formen: …"). Bewusst hier abgeleitet und nicht anderswo gepflegt: als
 * eigene Liste war genau das eine der vier Listen, die auseinanderliefen.
 */
export const INVOICE_FLOW_FORMS: readonly string[] = Object.entries(DOCUMENT_FORM_ROUTING)
  .filter(([, routing]) => routing.invoiceFlow)
  .map(([form]) => form);
