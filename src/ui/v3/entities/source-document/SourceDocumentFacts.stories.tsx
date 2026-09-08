import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { Card, CardHead, Table } from "../../primitives/Table";
import { SourceDocumentRow, type SourceDocumentVM } from "./SourceDocument";
import { SourceDocumentDrawer, type SourceDocumentQuickView } from "./SourceDocumentDrawer";
import { SourceDocumentFacts } from "./SourceDocumentFacts";

const meta: Meta<typeof SourceDocumentFacts> = {
  title: "v3/Entitäten/Beleg/SourceDocumentFacts",
  component: SourceDocumentFacts,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentFacts>;

const INVOICE: SourceDocumentVM = {
  id: "3f2b9c14-0a77-4d2e-9f01-6b8c5e2a1d40",
  fileName: "RE-4471-ACME.pdf",
  sourceDocType: "invoice",
  classDocumentForm: "commercial_invoice",
  counterparty: "ACME GmbH",
  detail: {
    kind: "invoice",
    number: "RE-4471",
    gross: 1249.9,
    currency: "EUR",
    net: 908.7,
    vat: 341.2,
    dueDate: "2026-09-25",
    paymentTerm: "30 Tage netto, 2 % Skonto binnen 10 Tagen",
    servicePeriod: "August 2026",
    issuerVatId: "DE123456789",
  },
  documentDate: "2026-08-26",
  receivedDate: "2026-08-27",
  completedAt: "2026-08-30T09:12:00Z",
  completedVia: "booking",
  docCategory: "performance",
  docDirection: "inbound",
  classDocumentKind: "original",
  caseNumber: "SV-118",
  // Herkunft und Ablage (0120). Die Konfidenz trägt jeder Beleg, die beiden
  // anderen nicht — deshalb stehen sie hier und fehlen in `NO_FILING` unten.
  classConfidence: 0.94,
  classOverriddenAt: "2026-08-30T11:04:00Z",
  datevRefSystem: "DUO",
  datevRefFolder: "2026/08",
  datevRefId: "DOC-4471-0088",
};

const SUMMARY =
  "Bürobedarf und eine Bewirtung auf einem Beleg — der Beleg wird gesplittet gebucht, die Bewirtung mit 70 / 30.";

/**
 * Woher die Einordnung kommt und wo der Beleg liegt (0120) — die drei Punkte
 * der Ränge 13, 14 und 16, unter den allgemeinen Zeilen.
 */
export const WithProvenance: Story = {
  render: () => (
    <div style={{ maxWidth: 640, padding: "var(--space-6)" }}>
      <SourceDocumentFacts document={INVOICE} provenance />
    </div>
  ),
};

/**
 * Jeder der drei Punkte entscheidet für sich, ob er eine Zeile bekommt. Hier
 * fehlen zwei: die Ablage (35 % der Belege liegen nicht in DATEV) und die
 * Korrektur (97 % hat niemand angefasst). Beide **fehlen** dann — ein
 * Gedankenstrich würde aus „niemand hat es angefasst" ein „wir wissen es
 * nicht" machen. Die Konfidenz steht, sie ist auf jedem Beleg gefüllt.
 */
export const ProvenanceEmpty: Story = {
  render: () => (
    <div style={{ maxWidth: 640, padding: "var(--space-6)" }}>
      <SourceDocumentFacts
        document={{
          ...INVOICE,
          classOverriddenAt: null,
          datevRefSystem: null,
          datevRefFolder: null,
          datevRefId: null,
        }}
        provenance
      />
    </div>
  ),
};

/** Everything the drawer and the card show, in the order every document keeps. */
function Framed({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHead title={title} />
      <div style={{ padding: "var(--space-5)" }}>{children}</div>
    </Card>
  );
}

/** An invoice: the eight generic rows, and under them the invoice block. */
export const Filled: Story = {
  name: "Gefuellt",
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <SourceDocumentFacts document={INVOICE} summary={SUMMARY} />
    </div>
  ),
};

/**
 * **The core story.** Invoice, contract, bank statement, other document and a
 * document without a kind, side by side: the same rows on top in the same
 * order, a different block underneath — and for the last three **no block at
 * all**, not one with a heading and „Keine Angaben." under it.
 *
 * No row says „Rechnungsnr." or „Lieferant" at a document that is not an
 * invoice, and no row shows an em dash for a field this kind of document does
 * not have. Right of them stands the case the rule was written for: a document
 * whose discriminator and subtype row contradict each other (`other` with an
 * invoice row, corrected by a person) — the invoice block is absent, and the
 * generic rows stand alone.
 */
export const Kinds: Story = {
  name: "Ausprägungen",
  render: () => (
    <div
      style={{
        display: "grid",
        gap: "var(--space-4)",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      }}
    >
      <Framed title="Rechnung">
        <SourceDocumentFacts document={INVOICE} summary={SUMMARY} tone="bare" />
      </Framed>
      <Framed title="Vertrag">
        <SourceDocumentFacts
          document={{
            id: "f2",
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
              startDate: "2026-01-15",
              endDate: "2029-01-14",
              durationMonths: 36,
            },
            documentDate: "2026-01-15",
            receivedDate: "2026-08-20",
            docCategory: "foundation",
          }}
          tone="bare"
        />
      </Framed>
      <Framed title="Kontoauszug">
        <SourceDocumentFacts
          document={{
            id: "f3",
            fileName: "Kontoauszug-2026-08-Sparkasse.pdf",
            sourceDocType: "bank_statement_pdf",
            classDocumentForm: "bank_statement",
            counterparty: "Sparkasse Berlin",
            documentDate: "2026-08-31",
            receivedDate: "2026-09-01",
            docCategory: "payment",
          }}
          tone="bare"
        />
      </Framed>
      <Framed title="Sonstiger Beleg">
        <SourceDocumentFacts
          document={{
            id: "f4",
            fileName: "Lieferschein-88213.pdf",
            sourceDocType: "other",
            classDocumentForm: "delivery_note",
            counterparty: "ACME GmbH",
            documentDate: "2026-08-24",
            receivedDate: "2026-08-27",
            docCategory: "performance",
          }}
          tone="bare"
        />
      </Framed>
      <Framed title="Ohne Typ">
        <SourceDocumentFacts
          document={{
            id: "f5",
            fileName: "scan-20260819-114233.pdf",
            sourceDocType: null,
            documentDate: null,
            receivedDate: "2026-08-19",
          }}
          tone="bare"
        />
      </Framed>
      <Framed title="Widerspruch (B9)">
        <SourceDocumentFacts
          document={{
            id: "f6",
            fileName: "Kassenabschluss-2026-08.pdf",
            sourceDocType: "other",
            classDocumentForm: "cash_register_closing",
            counterparty: "Filiale Mitte",
            detail: { kind: "invoice", number: "RE-9902", gross: 88.4, currency: "EUR", net: 74.29, vat: 14.11 },
            documentDate: "2026-08-31",
            receivedDate: "2026-09-01",
            docCategory: "payment",
          }}
          tone="bare"
        />
      </Framed>
    </div>
  ),
};

/**
 * The registry entry no data backs: `client_source_docs_contracts` has zero
 * rows on staging, so every value here is **made up, with notice** — the entry
 * was built against the schema and `ContractDetailData` (finding B1, answered
 * by the app side; owner decision: read-only now, the editor waits for 0073).
 *
 * Three shapes of a term: with an end date, open-ended, and one where the
 * extraction read no dates at all. Underneath, the booking-relevant facts,
 * each with where it comes from — read automatically or entered by a person.
 */
export const Contract: Story = {
  name: "Vertrag",
  render: () => {
    const base: SourceDocumentVM = {
      id: "c",
      fileName: "Mietvertrag-Lagerhalle-2026.pdf",
      sourceDocType: "contract",
      classDocumentForm: "contract",
      counterparty: "Immobilien Ost KG",
      documentDate: "2026-01-15",
      receivedDate: "2026-08-20",
      docCategory: "foundation",
    };
    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-4)",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        <Framed title="Befristet">
          <SourceDocumentFacts
            document={{
              ...base,
              detail: {
                kind: "contract",
                subject: "Miete Lagerhalle Nord, monatlich",
                amount: 2400,
                currency: "EUR",
                contractType: "rent",
                startDate: "2026-01-15",
                endDate: "2029-01-14",
                durationMonths: 36,
                bookingFacts: [
                  { key: "Konto", value: "4210 Miete", source: "ai", confidence: 0.92 },
                  { key: "Turnus", value: "monatlich zum 3. Werktag", source: "ai", confidence: 0.88 },
                  { key: "Kaution", value: "7.200,00 € auf Verrechnungskonto", source: "manual", confidence: null },
                ],
              },
            }}
            tone="bare"
          />
        </Framed>
        <Framed title="Unbefristet">
          <SourceDocumentFacts
            document={{
              ...base,
              detail: {
                kind: "contract",
                subject: "Wartung Klimaanlage, jährliche Pauschale",
                amount: 1180,
                currency: "EUR",
                contractType: "service",
                startDate: "2025-04-01",
                isOpenEnded: true,
                bookingFacts: [
                  { key: "Kündigungsfrist", value: "3 Monate zum Jahresende", source: "manual", confidence: null },
                ],
              },
            }}
            tone="bare"
          />
        </Framed>
        <Framed title="Ohne Laufzeit gelesen">
          <SourceDocumentFacts
            document={{
              ...base,
              detail: {
                kind: "contract",
                subject: "Leasing Transporter",
                amount: null,
                currency: "EUR",
                contractType: "lease",
              },
            }}
            tone="bare"
          />
        </Framed>
      </div>
    );
  },
};

/**
 * A document nothing is known about but its file and its arrival — it exists
 * in the data (the one document with `classification_failed`). What stands
 * there: the kind („Beleg", never „Rechnung"), the file name as identifier,
 * the arrival, „Offen". What deliberately does not: no amount, no block, no
 * „unbekannt" anywhere.
 */
export const Empty: Story = {
  name: "Leer",
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <SourceDocumentFacts
        document={{
          id: "e1",
          fileName: "scan-20260819-114233.pdf",
          sourceDocType: null,
          documentDate: null,
          receivedDate: "2026-08-19",
        }}
      />
    </div>
  ),
};

/**
 * The block that hangs on the **relation**, four cases: a collection original
 * without a clamp type (the normal case in the data — 8 of 12 carry
 * `not_connected`, 4 carry nothing, and the block still has to look complete),
 * one with a clamp type, a partial document, and an **invoice** that is a
 * partial document — the case a renderer per kind of document would have
 * missed, since 54 of the 77 partial documents are invoices.
 */
export const Group: Story = {
  name: "Gruppe",
  render: () => (
    <div
      style={{
        display: "grid",
        gap: "var(--space-4)",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      }}
    >
      <Framed title="Sammel-Original ohne Klammer-Typ">
        <SourceDocumentFacts
          document={{
            id: "g1",
            fileName: "Sammel-PDF-2026-08-12.pdf",
            sourceDocType: "other",
            classDocumentForm: "document_collection",
            documentDate: "2026-08-12",
            receivedDate: "2026-08-12",
          }}
          group={{ childCount: 9, completedChildCount: 4 }}
          tone="bare"
        />
      </Framed>
      <Framed title="Sammel-Original mit Klammer-Typ">
        <SourceDocumentFacts
          document={{
            id: "g2",
            fileName: "Kreditkarte-August.pdf",
            sourceDocType: "credit_card_statement",
            classDocumentForm: "credit_card_statement",
            counterparty: "Kartenherausgeber Nord",
            collectionKind: "credit_card_statement",
            documentDate: "2026-08-28",
            receivedDate: "2026-08-29",
            docCategory: "payment",
          }}
          group={{ childCount: 14, completedChildCount: 14 }}
          tone="bare"
        />
      </Framed>
      <Framed title="Teilbeleg">
        <SourceDocumentFacts
          document={{
            id: "g3",
            fileName: "Sammel-PDF-2026-08-12-teil-3.pdf",
            sourceDocType: "other",
            classDocumentForm: "other",
            documentDate: "2026-08-09",
            receivedDate: "2026-08-12",
          }}
          group={{
            pages: "5–7",
            parentTitle: "Sammel-PDF vom 12.08.2026",
            parentHref: "#sammel-original",
          }}
          tone="bare"
        />
      </Framed>
      <Framed title="Rechnung, die Teilbeleg ist">
        <SourceDocumentFacts
          document={{ ...INVOICE, id: "g4", caseNumber: null }}
          group={{
            pages: "12–13",
            parentTitle: "Sammel-PDF vom 12.08.2026",
            parentHref: "#sammel-original",
          }}
          tone="bare"
        />
      </Framed>
    </div>
  ),
};

/** `bare` inside the drawer, `surface` inside a card — the same rows, one frame less. */
export const Tones: Story = {
  name: "Toene",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", gridTemplateColumns: "1fr 1fr" }}>
      <div>
        <div className="v2doc__h">bare — im Drawer</div>
        <SourceDocumentFacts document={INVOICE} summary={SUMMARY} tone="bare" />
      </div>
      <SourceDocumentFacts document={INVOICE} summary={SUMMARY} tone="surface" />
    </div>
  ),
};

/**
 * All three cuts at once: a 401-character summary, a 139-character file name
 * (cut in the middle, extension readable) and an 871-character completion
 * reason in the tooltip of the badge. Every full text is in the `title`.
 * The three numbers are measured, not claimed (acceptance of 0076).
 */
export const Edges: Story = {
  name: "Rand",
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <SourceDocumentFacts
        document={{
          ...INVOICE,
          fileName:
            "Rechnung-2026-08-26-ACME-GmbH-Bueromaterial-und-Bewirtung-Sammelbeleg-Standort-Berlin-Mitte-Abteilung-Verwaltung-Kostenstelle-1200-4471.pdf",
          detail: { kind: "invoice", number: null, gross: 1249.9, currency: "EUR", net: 908.7, vat: 341.2 },
          completedVia: "manual",
          completedReason:
            "Der Beleg wurde doppelt hochgeladen. Das Original liegt am selben Sachverhalt und ist im Zyklus 2026-08 gebucht; dieser hier ist der zweite Scan aus dem Posteingang vom 27.08., den die Kanzlei nach Rücksprache mit dem Mandanten nicht noch einmal verarbeitet hat. Die Extraktion war zu diesem Zeitpunkt bereits durchgelaufen, weshalb Nummer und Brutto identisch sind; ein Storno war nicht nötig, weil keine Buchung entstanden ist. Sollte sich später herausstellen, dass die beiden Belege doch verschiedene Vorgänge betreffen, ist der zweite Scan über die Historie wiederzufinden und kann neu angestoßen werden. Bis dahin gilt er als erledigt, ohne dass ihm eine Buchung, ein Sachverhalt oder eine DATEV-Ablage zugeordnet ist, und er erscheint in keiner der offenen Listen mehr. Der Vorgang ist im Import-Protokoll vom 27.08. mit der Kennung des zweiten Scans festgehalten.",
        }}
        summary={
          "Sammelbeleg über Bürobedarf, Bewirtung und eine Reinigungspauschale. Die Bewirtung ist mit 70 / 30 zu splitten, der Bürobedarf geht vollständig auf 6815, die Reinigungspauschale gehört in den Folgemonat, weil die Leistung erst im September erbracht wird. Der Beleg trägt zusätzlich eine Skontovereinbarung, die beim Zahlungsabgleich zu berücksichtigen ist. Der Lieferschein liegt als zweite Seite bei."
        }
      />
    </div>
  ),
};

const PREVIEW = `data:text/html;charset=utf-8,${encodeURIComponent(`
<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0; padding: 48px 56px; font: 14px/1.6 -apple-system, system-ui, sans-serif; color: #1b2733; background: #fff; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .muted { color: #64748b; font-size: 12.5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 32px; font-size: 13px; }
  th { text-align: left; border-bottom: 1px solid #cbd5e1; padding: 6px 0; font-weight: 600; }
  td { padding: 6px 0; border-bottom: 1px solid #eef2f6; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .total { margin-top: 24px; text-align: right; font-size: 16px; font-weight: 600; }
</style>
<h1>ACME GmbH</h1>
<div class="muted">Musterstraße 14 · 10115 Berlin · USt-IdNr. DE123456789</div>
<div style="margin-top:32px"><strong>Rechnung RE-4471</strong><br>
<span class="muted">Rechnungsdatum 26.08.2026 · Leistungszeitraum August 2026</span></div>
<table>
  <tr><th>Position</th><th class="num">Menge</th><th class="num">Netto</th></tr>
  <tr><td>Bürobedarf, Sortiment</td><td class="num">1</td><td class="num">812,50 €</td></tr>
  <tr><td>Bewirtung Mittag</td><td class="num">1</td><td class="num">96,20 €</td></tr>
</table>
<div class="total">Brutto 1.249,90 €</div>
`)}`;

const QUICK: SourceDocumentQuickView = {
  document: INVOICE,
  summary: SUMMARY,
  previewUrl: PREVIEW,
};

/**
 * The whole rebuild in one picture: the drawer of 0052, with its five zones
 * and four states untouched — head, original, facts, limit, one way out — but
 * now with the preview of 0075, the facts of the registry, and the
 * **completion** in the head instead of the invoice pipeline.
 */
export const InUse: Story = {
  name: "ImEinsatz",
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: 520 }}>
        <Card>
          <CardHead title="Sachverhalt SV-118 · Belege" sub="Zwei Belege am Vorgang" />
          {/* Die Zeile ist seit 0106 ein `<tr>` und braucht ihre Tabelle; das
              Spaltenmaß bringt `.v2doc__row` selbst mit. */}
          <Table cols="minmax(0, 1fr)">
          <SourceDocumentRow document={{ ...INVOICE, href: "#beleg" }} />
          <SourceDocumentRow
            document={{
              id: "u2",
              fileName: "Kontoauszug-2026-08-Sparkasse.pdf",
              sourceDocType: "bank_statement_pdf",
              classDocumentForm: "bank_statement",
              counterparty: "Sparkasse Berlin",
              documentDate: "2026-08-31",
              receivedDate: "2026-09-01",
              docCategory: "payment",
              href: "#beleg-auszug",
            }}
          />
          </Table>
        </Card>
        <div style={{ padding: "var(--space-4) 0" }}>
          <Button onClick={() => setOpen(true)}>Beleg ansehen</Button>
        </div>
        <SourceDocumentDrawer
          open={open}
          onClose={() => setOpen(false)}
          reference="RE-4471"
          record={QUICK}
          onOpenFull={() => {}}
        />
      </div>
    );
  },
};
