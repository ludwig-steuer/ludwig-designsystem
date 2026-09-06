import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardHead, Table } from "../../primitives/Table";
import {
  SourceDocumentCell,
  SourceDocumentClass,
  SourceDocumentRow,
  type SourceDocumentVM,
} from "./SourceDocument";

const meta: Meta<typeof SourceDocumentRow> = {
  title: "v3/Entitäten/Beleg/SourceDocument",
  component: SourceDocumentRow,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentRow>;

/** The one invoice everything else is compared against. */
const INVOICE: SourceDocumentVM = {
  id: "3f2b9c14-0a77-4d2e-9f01-6b8c5e2a1d40",
  fileName: "RE-4471-ACME.pdf",
  sourceDocType: "invoice",
  classDocumentForm: "commercial_invoice",
  counterparty: "ACME GmbH",
  detail: { kind: "invoice", number: "RE-4471", gross: 1249.9, currency: "EUR" },
  documentDate: "2026-08-26",
  receivedDate: "2026-08-27",
  completedAt: "2026-08-30T09:12:00Z",
  completedVia: "booking",
  completedReason: null,
  docCategory: "performance",
  docDirection: "inbound",
  classDocumentKind: "original",
  caseNumber: "SV-118",
  caseHref: "#sv-118",
  href: "#beleg-4471",
};

/**
 * A row in a card, the way every list of the family shows it.
 *
 * The `Table` around it is not decoration: since 0106 a `Row` is a `<tr>`, and
 * a `<tr>` needs a table. The track list comes from `.v2doc__row` itself —
 * `cols` here only feeds the fallback.
 */
function Rows({ title, sub, documents }: { title: string; sub?: string; documents: SourceDocumentVM[] }) {
  return (
    <Card>
      <CardHead title={title} sub={sub} />
      <Table cols="minmax(0, 1fr)">
        {documents.map((d) => (
          <SourceDocumentRow key={d.id} document={d} />
        ))}
      </Table>
    </Card>
  );
}

/**
 * An invoice row with everything it can carry: counterparty and kind, gross,
 * both dates, number, case, classification and „Gebucht".
 */
export const Filled: Story = {
  name: "Gefuellt",
  render: () => <Rows title="Belege 2026" sub="Eine Rechnung mit allem" documents={[INVOICE]} />,
};

/**
 * **The core story.** All seven values of `source_doc_type` plus NULL, in one
 * card, in the same order of data points — and the two outliers of finding B9
 * at the end.
 *
 * The two outliers show **the same thing** — the file name as identifier, an
 * empty measure — and they are right to, for opposite reasons: the invoice
 * without a subtype row has nothing to show (the row is right), and the
 * `other` **with** an invoice row had its form corrected by a person, so the
 * row is the leftover (the discriminator is right). Neither is claimed, and
 * neither costs a branch: the registry entry names its own `source_doc_type`,
 * and the comparison is one line.
 */
export const Kinds: Story = {
  name: "Ausprägungen",
  render: () => (
    <Rows
      title="Alle Belegarten"
      sub="Gleiche Reihenfolge, verschiedene Füller — und zweimal keiner"
      documents={[
        INVOICE,
        {
          id: "b1",
          fileName: "Mietvertrag-Lagerhalle-2026.pdf",
          sourceDocType: "contract",
          classDocumentForm: "contract",
          counterparty: "Immobilien Ost KG",
          detail: {
            kind: "contract",
            subject: "Miete Lagerhalle Nord, monatlich",
            amount: 2400,
            currency: "EUR",
            contractType: "rent",
          },
          documentDate: "2026-01-15",
          receivedDate: "2026-08-20",
          docCategory: "foundation",
          caseNumber: "SV-092",
          href: "#beleg-vertrag",
        },
        {
          id: "b2",
          fileName: "Kontoauszug-2026-08-Sparkasse.pdf",
          sourceDocType: "bank_statement_pdf",
          classDocumentForm: "bank_statement",
          counterparty: "Sparkasse Berlin",
          documentDate: "2026-08-31",
          receivedDate: "2026-09-01",
          docCategory: "payment",
          href: "#beleg-auszug",
        },
        {
          id: "b3",
          fileName: "Kreditkarte-August.pdf",
          sourceDocType: "credit_card_statement",
          classDocumentForm: "credit_card_statement",
          counterparty: "Kartenherausgeber Nord",
          documentDate: "2026-08-28",
          receivedDate: "2026-08-29",
          docCategory: "payment",
          collectionKind: "credit_card_statement",
          href: "#beleg-kk",
        },
        {
          id: "b4",
          fileName: "Reisekosten-Berger-KW34.pdf",
          sourceDocType: "travel_expense_report",
          classDocumentForm: "expense_report",
          counterparty: "Anna Berger",
          documentDate: "2026-08-24",
          receivedDate: "2026-08-25",
          docCategory: "internal",
          href: "#beleg-reise",
        },
        {
          id: "b5",
          fileName: "USt-Voranmeldung-Juli.pdf",
          sourceDocType: "declaration",
          classDocumentForm: "tax_filing_summary",
          documentDate: "2026-08-10",
          receivedDate: "2026-08-11",
          completedAt: "2026-08-12T08:00:00Z",
          completedVia: "no_booking_required",
          href: "#beleg-erklaerung",
        },
        {
          id: "b6",
          fileName: "Lohnabrechnung-08-2026.pdf",
          // `other` plus a document form: the label comes from the form
          // („Lohnabrechnung"), not from the generic „Sonstiger Beleg".
          sourceDocType: "other",
          classDocumentForm: "payroll_slip",
          counterparty: "Lohnbüro Süd",
          documentDate: "2026-08-31",
          receivedDate: "2026-09-02",
          docCategory: "internal",
          href: "#beleg-lohn",
        },
        {
          id: "b7",
          fileName: "scan-20260819-114233.pdf",
          // No discriminator at all: „Beleg", never „Rechnung".
          sourceDocType: null,
          documentDate: null,
          receivedDate: "2026-08-19",
          href: "#beleg-ohne-typ",
        },
        {
          id: "b8",
          fileName: "alt-2026-07-31-1188.pdf",
          // B9, case one: the discriminator says invoice, there is no invoice
          // row. No empty invoice block — the file name and an empty measure.
          sourceDocType: "invoice",
          classDocumentForm: "commercial_invoice",
          counterparty: "Bürodienst Nord",
          documentDate: "2026-07-30",
          receivedDate: "2026-07-31",
          completedAt: "2026-07-31T16:20:00Z",
          completedVia: "import",
          href: "#beleg-b9-a",
        },
        {
          id: "b9",
          fileName: "Kassenabschluss-2026-08.pdf",
          // B9, case two: a person moved the form from invoice to other, the
          // invoice row stayed behind. Neither number nor gross is shown.
          sourceDocType: "other",
          classDocumentForm: "cash_register_closing",
          counterparty: "Filiale Mitte",
          detail: { kind: "invoice", number: "RE-9902", gross: 88.4, currency: "EUR" },
          documentDate: "2026-08-31",
          receivedDate: "2026-09-01",
          docCategory: "payment",
          href: "#beleg-b9-b",
        },
      ]}
    />
  ),
};

/**
 * `SourceDocumentClass` on its own: all four axes, and then the three NULLs.
 * Each of them shows **nothing** — no category is a container or not yet
 * classified, no direction means „not applicable", and `original` is what
 * 83 % of all documents are. „Unbekannt" would be a claim none of them makes.
 */
export const Classification: Story = {
  name: "Einordnung",
  render: () => {
    const base: SourceDocumentVM = { id: "c", fileName: "x.pdf", receivedDate: "2026-08-01" };
    const cases: [string, SourceDocumentVM][] = [
      [
        "Alle vier Achsen",
        {
          ...base,
          docCategory: "performance",
          docDirection: "inbound",
          classDocumentKind: "credit_note",
          collectionKind: "expense_report",
        },
      ],
      ["Kategorie fehlt (Container, B3)", { ...base, docDirection: "outbound" }],
      ["Richtung nicht anwendbar", { ...base, docCategory: "foundation" }],
      ["Charakter = original", { ...base, docCategory: "payment", classDocumentKind: "original" }],
      ["Nichts eingeordnet", base],
    ];
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: 640 }}>
        {cases.map(([label, document]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <span className="v2sub" style={{ width: 220 }}>
              {label}
            </span>
            <SourceDocumentClass document={document} />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * The completion across all six values of `completed_via`, plus „Offen" and
 * the 61 documents that are done without a recorded reason. Every one of them
 * is a **word**, not a tick — and the freetext reason stands in the tooltip of
 * the badge, not in a column of its own.
 */
export const States: Story = {
  name: "Zustände",
  render: () => (
    <Rows
      title="Erledigung"
      sub="Sechs Gründe, dazu offen und erledigt ohne Grund"
      documents={[
        { ...INVOICE, id: "s0", completedAt: null, completedVia: null, caseNumber: null },
        {
          ...INVOICE,
          id: "s1",
          completedVia: "booking",
          completedReason: "Gebucht im Zyklus 2026-08, Stapel 41.",
        },
        {
          ...INVOICE,
          id: "s2",
          completedVia: "case_closed",
          completedReason: "Sachverhalt SV-118 geschlossen — der Beleg war Beiwerk.",
        },
        { ...INVOICE, id: "s3", completedVia: "import" },
        {
          ...INVOICE,
          id: "s4",
          completedVia: "superseded",
          completedReason: "Ersetzt durch RE-4471-korrigiert.pdf (falscher Steuersatz).",
        },
        {
          ...INVOICE,
          id: "s5",
          completedVia: "manual",
          completedReason:
            "Doppelt hochgeladen; das Original liegt am selben Sachverhalt und ist gebucht.",
        },
        {
          ...INVOICE,
          id: "s6",
          completedVia: "no_booking_required",
          completedReason: "Auswertung — kein Beleg; Inhalt liegt im DATEV-Spiegel",
        },
        { ...INVOICE, id: "s7", completedVia: null },
      ]}
    />
  ),
};

/**
 * The cell inside somebody else's markup: in a sentence and in a booking line.
 * With `href` it is a link, without it plain text — and it carries the same
 * fallback chain as the row, so a bank statement is recognizable by its file
 * name instead of standing there as an em dash.
 */
export const Cell: Story = {
  name: "Zelle",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 720 }}>
      <p>
        Die Buchung stützt sich auf <SourceDocumentCell document={INVOICE} /> und wurde am
        30.08.2026 festgeschrieben.
      </p>
      <p>
        Ohne Link, weil der Leser den Beleg nicht öffnen darf:{" "}
        <SourceDocumentCell document={{ ...INVOICE, href: null }} />
      </p>
      <p>
        Ein Kontoauszug wird über seinen Dateinamen wiedererkannt:{" "}
        <SourceDocumentCell
          document={{
            id: "z1",
            fileName: "Kontoauszug-2026-08-Sparkasse.pdf",
            sourceDocType: "bank_statement_pdf",
            classDocumentForm: "bank_statement",
            counterparty: "Sparkasse Berlin",
            receivedDate: "2026-09-01",
            completedAt: null,
            href: "#beleg-auszug",
          }}
        />
      </p>
    </div>
  ),
};

/**
 * What the cutting does. A 139-character file name is cut **in the middle**,
 * so the extension stays readable; a 56-character counterparty is cut at the
 * end. Both keep their full text in the `title`. Below them the two documents
 * that know almost nothing: no counterparty (the file name leads), no document
 * date (an em dash — it should exist), and one that has nothing but its file
 * and its arrival.
 */
export const Edges: Story = {
  name: "Rand",
  render: () => (
    <Rows
      title="Ränder"
      sub="Kürzung, fehlender Gegenpart, fehlendes Belegdatum"
      documents={[
        {
          ...INVOICE,
          id: "r1",
          // 139 and 56 characters — the maximum the comment above claims.
          fileName:
            "Rechnung-2026-08-26-ACME-GmbH-Bueromaterial-und-Bewirtung-Sammelbeleg-Standort-Berlin-Mitte-Abteilung-Verwaltung-Kostenstelle-1200-4471.pdf",
          counterparty: "Bürobedarf und Bewirtung Musterstadt Handelsgesellschaft",
          detail: { kind: "invoice", number: null, gross: 1249.9, currency: "EUR" },
        },
        {
          ...INVOICE,
          id: "r2",
          counterparty: null,
          detail: { kind: "invoice", number: "RE-4472", gross: 90, currency: "EUR" },
        },
        { ...INVOICE, id: "r3", documentDate: null },
        {
          id: "r4",
          fileName: "scan-20260819-114233.pdf",
          receivedDate: "2026-08-19",
        },
      ]}
    />
  ),
};

/**
 * Where it is used: the document tab of a case. Six documents of five kinds,
 * one after the other — the reader runs down one column of counterparties, one
 * of amounts, one of dates, and the kind never moves the order around.
 */
export const InUse: Story = {
  name: "ImEinsatz",
  render: () => (
    <Rows
      title="Sachverhalt SV-118 · Belege"
      sub="6 Belege · 4 erledigt"
      documents={[
        INVOICE,
        {
          id: "u2",
          fileName: "Lieferschein-88213.pdf",
          sourceDocType: "other",
          classDocumentForm: "delivery_note",
          counterparty: "ACME GmbH",
          documentDate: "2026-08-24",
          receivedDate: "2026-08-27",
          docCategory: "performance",
          caseNumber: "SV-118",
          caseHref: "#sv-118",
          completedAt: "2026-08-30T09:12:00Z",
          completedVia: "case_closed",
          href: "#beleg-lieferschein",
        },
        {
          id: "u3",
          fileName: "Kontoauszug-2026-08-Sparkasse.pdf",
          sourceDocType: "bank_statement_pdf",
          classDocumentForm: "bank_statement",
          counterparty: "Sparkasse Berlin",
          documentDate: "2026-08-31",
          receivedDate: "2026-09-01",
          docCategory: "payment",
          caseNumber: "SV-118",
          caseHref: "#sv-118",
          href: "#beleg-auszug",
        },
        {
          id: "u4",
          fileName: "Mietvertrag-Lagerhalle-2026.pdf",
          sourceDocType: "contract",
          classDocumentForm: "contract",
          counterparty: "Immobilien Ost KG",
          detail: {
            kind: "contract",
            subject: "Miete Lagerhalle Nord, monatlich",
            amount: 2400,
            currency: "EUR",
            contractType: "rent",
          },
          documentDate: "2026-01-15",
          receivedDate: "2026-08-20",
          docCategory: "foundation",
          caseNumber: "SV-118",
          caseHref: "#sv-118",
          completedAt: "2026-08-21T10:00:00Z",
          completedVia: "no_booking_required",
          href: "#beleg-vertrag",
        },
        {
          id: "u5",
          fileName: "Gutschrift-RE-4471.pdf",
          sourceDocType: "invoice",
          classDocumentForm: "commercial_invoice",
          counterparty: "ACME GmbH",
          detail: { kind: "invoice", number: "GS-1180", gross: -120.5, currency: "EUR" },
          documentDate: "2026-08-29",
          receivedDate: "2026-08-30",
          docCategory: "performance",
          docDirection: "inbound",
          classDocumentKind: "credit_note",
          caseNumber: "SV-118",
          caseHref: "#sv-118",
          completedAt: "2026-08-31T11:00:00Z",
          completedVia: "booking",
          href: "#beleg-gutschrift",
        },
        {
          id: "u6",
          fileName: "Reisekosten-Berger-KW34.pdf",
          sourceDocType: "travel_expense_report",
          classDocumentForm: "expense_report",
          counterparty: "Anna Berger",
          documentDate: "2026-08-24",
          receivedDate: "2026-08-25",
          docCategory: "internal",
          collectionKind: "expense_report",
          caseNumber: "SV-118",
          caseHref: "#sv-118",
          href: "#beleg-reise",
        },
      ]}
    />
  ),
};
