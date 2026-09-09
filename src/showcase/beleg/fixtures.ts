import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";

// The family's own type, not the mirrored one: it adds `caseNumber` and
// `hasInvoiceRow`, and that is what the card and the facts actually read
// (finding L-208 — the app should lift the union, not the invoice half).

/**
 * Synthetic documents for the page stories of the document detail page (0144).
 *
 * **No real data.** Names are invented and recognisably so (Musterbau GmbH,
 * Beispiel-Energie AG, Testbank eG); no IBAN, no VAT id, no name out of
 * staging. Amounts are round, dates are in 2026.
 *
 * One builder with the normal case as its default — a clean invoice — and each
 * story overrides only what it proves. That is the point of the whole task:
 * nineteen states of one page beside each other, and the difference between
 * them readable in one line.
 */

/** The clean invoice everything else is a deviation from. */
export function belegFixture(over: Partial<SourceDocumentVM> = {}): SourceDocumentVM {
  return {
    id: "d-0042",
    fileName: "Rechnung-R-2026-0042.pdf",
    sourceDocType: "invoice",
    classDocumentForm: null,
    counterparty: "Musterbau GmbH",
    documentDate: "2026-08-14",
    receivedDate: "2026-08-15",
    completedAt: "2026-08-20",
    completedVia: "booking",
    completedReason: null,
    docCategory: "performance",
    docDirection: "inbound",
    classDocumentKind: null,
    collectionKind: null,
    processingStatus: "processed",
    inboxStatus: "classified",
    classConfidence: 0.94,
    byteSize: 184_320,
    splitPageRange: null,
    parentSourceDocId: null,
    classOverriddenAt: null,
    datevRefSystem: "DUO",
    datevRefFolder: "2026/08",
    datevRefId: "DOC-4471-0088",
    caseNumber: "2026-0413",
    hasInvoiceRow: true,
    detail: {
      kind: "invoice",
      number: "R-2026-0042",
      gross: 1800,
      currency: "EUR",
      net: 1512.61,
      vat: 287.39,
      dueDate: "2026-09-13",
    },
    ...over,
  };
}

/**
 * The placeholder original — one sheet, no network.
 *
 * A data URL rather than a file: the stories must render in a review without
 * anything outside the page, and a preview that loads from somewhere would
 * make the whole set depend on that somewhere.
 */
export const MUSTER_PDF =
  "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAzMDAgMTQwXS9SZXNvdXJjZXM8PC9Gb250PDwvRjE8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+Pj4+Pj4vQ29udGVudHMgNCAwIFI+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNzA+PgpzdHJlYW0KQlQgL0YxIDE0IFRmIDIwIDgwIFRkIChNdXN0ZXItUmVjaG51bmcgUi0yMDI2LTAwNDIpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKdHJhaWxlcgo8PC9Sb290IDEgMCBSPj4K";

/** The six tabs of the page, in the order the standard fixes. */
export const BELEG_TABS = [
  { key: "uebersicht", label: "Übersicht" },
  { key: "details", label: "Details" },
  { key: "positionen", label: "Positionen" },
  { key: "vorsteuer", label: "Vorsteuer" },
  { key: "verlauf", label: "Verlauf" },
  { key: "rohdaten", label: "Rohdaten" },
];

/** Tabs of a document that has no invoice line — positions and input tax go. */
export const BELEG_TABS_OHNE_RECHNUNG = BELEG_TABS.filter(
  (t) => t.key !== "positionen" && t.key !== "vorsteuer",
);

export const tabHref = (key: string) => `?tab=${key}`;
export const caseHref = "?sachverhalt=2026-0413";
export const listHref = "?liste=belege";

/**
 * The German word for a kind of document.
 *
 * Local to the showcase on purpose: the label of a kind lives in the app's
 * domain, not in the set, and these stories must not invent a second one that
 * later drifts. When the mapping is mirrored, this table goes.
 */
export const BELEGART: Record<string, string> = {
  invoice: "Rechnung",
  contract: "Vertrag",
  document_collection: "Sammelbeleg",
  bank_statement_pdf: "Kontoauszug",
  credit_card_statement: "Kreditkartenabrechnung",
  travel_expense_report: "Reisekostenabrechnung",
  payment_reminder: "Mahnung",
  other: "Beleg",
};
