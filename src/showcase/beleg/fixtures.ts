import {
  docDefects,
  type DocDefect,
  type DocDefectFacts,
} from "@/ludwig/modules/source-docs/domain/doc-defects";
import type { ClarificationVM } from "@/ui/v3/entities/clarification/Clarification";
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
 * every state of one page beside each other, and the difference between
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

/* ── Was die Übersicht neben den Fakten zeigt (0150) ──────────────────────── */

/**
 * Die Mängel eines Belegs — **aus der Domäne**, nicht von Hand gestellt:
 * `docDefects()` entscheidet, was ein Mangel ist, und diese Fixtures liefern
 * ihm nur die Rohangaben. Sonst zeigte die Story eine Auswahl, die es so nie
 * gibt.
 */
export function belegMaengel(over: Partial<DocDefectFacts> = {}): DocDefect[] {
  return docDefects({
    documentDate: "2026-08-14",
    inboxStatus: "classified",
    openFindings: [],
    partnerMatchOutcome: "matched",
    recipientMatch: "match",
    recipientMatchReason: null,
    completedAt: null,
    ...over,
  });
}

/** Die USt einer gemischten Rechnung — zwei Sätze, das ist der Fall für die Box. */
export const UST_GEMISCHT = {
  net: 1512.61,
  vat: 287.39,
  gross: 1800,
  currency: "EUR" as const,
  rates: [
    { rate: 19, net: 1310.92, vat: 249.08 },
    { rate: 7, net: 201.69, vat: 38.31 },
  ],
  deductible: { value: true as const },
};

/**
 * Der Verlauf eines Belegs in Kurzform. Die Wörter sind die der App
 * (`platform_audit_events`), die Zeiten laufen rückwärts vom Eingang.
 */
export const VERLAUF = [
  { id: "e-5", at: "2026-08-20T09:12:00Z", title: "Gebucht im Stapel 08/2026", kind: "Buchung", actor: "Kanzlei" },
  { id: "e-4", at: "2026-08-16T07:40:00Z", title: "Dem Sachverhalt 2026-0413 zugeordnet", kind: "Zuordnung", actor: "Agent" },
  { id: "e-3", at: "2026-08-15T18:22:00Z", title: "Werte extrahiert", kind: "Extraktion", actor: "System" },
  { id: "e-2", at: "2026-08-15T18:20:00Z", title: "Als Eingangsrechnung eingeordnet", kind: "Einordnung", actor: "System" },
  { id: "e-1", at: "2026-08-15T18:19:00Z", title: "Eingegangen aus dem Postfach", kind: "Eingang", actor: "System" },
];

export const vorsteuerHref = tabHref("vorsteuer");
export const verlaufHref = tabHref("verlauf");
export const partnerHref = "?geschaeftspartner=bp-880";
export const stapelHref = "?stapel=2026-08";

/**
 * Eine offene Rückfrage an diesem Beleg — im Sichtmodell der Klärungs-Familie,
 * nicht im Spiegel-VM: die Liste zeigt Zustand und Dringlichkeit, und die
 * beiden gibt es nur hier.
 *
 * `type: "question"` und nicht `"comment"`: eine Frage wartet auf eine
 * Antwort, ein Kommentar ist Zusammenhang. Dass sie an **diesem Beleg** hängt,
 * sagt der Ort — die Box steht in seiner Übersicht.
 */
export const KLAERUNG: ClarificationVM = {
  id: "cl-9001",
  title: "Für die Bewirtung fehlen die Teilnehmer",
  state: "open",
  severity: "required",
  type: "question",
  audience: "client",
  raisedAt: "2026-08-16T09:20:00Z",
};
