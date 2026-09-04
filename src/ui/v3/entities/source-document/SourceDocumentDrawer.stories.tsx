import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { MonoCell } from "../../primitives/Cells";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { SourceDocumentDrawer, type SourceDocumentQuickView } from "./SourceDocumentDrawer";

const meta: Meta<typeof SourceDocumentDrawer> = {
  title: "v3/Entitäten/Beleg/SourceDocumentDrawer",
  component: SourceDocumentDrawer,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentDrawer>;

/** A one-page invoice as a data URI — no network, and the preview is real. */
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

const RECORD: SourceDocumentQuickView = {
  // Since 0076 the drawer is handed the **document** (0074) and derives title,
  // identifier and state from it — so it cannot name the document differently
  // than the list it stands next to.
  document: {
    id: "3f2b9c14-0a77-4d2e-9f01-6b8c5e2a1d40",
    fileName: "RE-4471.pdf",
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
      servicePeriod: "August 2026",
    },
    documentDate: "2026-08-26",
    receivedDate: "2026-08-27",
    completedAt: "2026-08-30T09:12:00Z",
    completedVia: "booking",
    docCategory: "performance",
    docDirection: "inbound",
    classDocumentKind: "original",
  },
  previewUrl: PREVIEW,
  summary:
    "Bürobedarf und eine Bewirtung auf einem Beleg — der Beleg wird gesplittet gebucht.",
};

/**
 * The five zones with real data: head with identifier and state, the original
 * first and large, the core facts from the same component the full view uses,
 * the sentence about what the glance leaves open, and one way out.
 */
export const Geoeffnet: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const [opened, setOpened] = useState<string | null>(null);
    return (
      <div style={{ minHeight: 420 }}>
        <Button onClick={() => setOpen(true)}>Beleg ansehen</Button>
        {opened ? <p className="v2sub">{opened}</p> : null}
        <SourceDocumentDrawer
          open={open}
          onClose={() => setOpen(false)}
          reference="RE-4471"
          record={RECORD}
          onOpenFull={() => setOpened("onOpenFull — die Seite würde jetzt zur Belegansicht wechseln.")}
        />
      </div>
    );
  },
};

/**
 * Zone 2 is the one zone a document can lose: a fax, a photo the converter
 * refused, a file still on its way. It says **why** there is nothing to see —
 * and gets no grey placeholder box in place of the document.
 */
export const OhneVorschau: Story = {
  render: () => (
    <SourceDocumentDrawer
      open
      onClose={() => {}}
      reference="RE-4468"
      record={{
        document: {
          id: "9c22",
          fileName: "scan-4468.tiff",
          sourceDocType: "invoice",
          classDocumentForm: "commercial_invoice",
          counterparty: "Bürodienst Nord",
          detail: { kind: "invoice", number: "RE-4468", gross: 318, currency: "EUR" },
          documentDate: "2026-08-24",
          receivedDate: "2026-08-25",
          docCategory: "performance",
          docDirection: "inbound",
        },
        previewUrl: null,
        previewUnavailableReason:
          "Das Format TIFF lässt sich nicht im Browser anzeigen. Die Datei liegt unverändert in der Ablage.",
      }}
      onOpenFull={() => {}}
    />
  ),
};

/** `loading` beats `record`: the head stands, the body is a quiet surface. */
export const Laedt: Story = {
  render: () => (
    <SourceDocumentDrawer
      open
      onClose={() => {}}
      reference="RE-4471"
      record={RECORD}
      loading
      onOpenFull={() => {}}
    />
  ),
};

/** The reason carries the identifier — „Fehler beim Laden" would not say which document. */
export const Fehler: Story = {
  render: () => (
    <SourceDocumentDrawer
      open
      onClose={() => {}}
      reference="RE-4471"
      record={null}
      error="Die Ablage antwortet nicht (Zeitüberschreitung nach 30 Sekunden)."
      onOpenFull={() => {}}
    />
  ),
};

/** `record={null}` is „not found", not „loading" — and the sentence says which key was looked up. */
export const NichtGefunden: Story = {
  render: () => (
    <SourceDocumentDrawer
      open
      onClose={() => {}}
      reference="RE-9999"
      record={null}
      onOpenFull={() => {}}
    />
  ),
};

const CASES = [
  { id: "c1", ref: "RE-4471", vendor: "ACME GmbH", at: "2026-08-26", gross: "1.249,90 €" },
  { id: "c2", ref: "RE-4468", vendor: "Bürodienst Nord", at: "2026-08-24", gross: "318,00 €" },
  { id: "c3", ref: "RE-4470", vendor: "Stadtwerke", at: "2026-08-25", gross: "742,15 €" },
];

/**
 * The whole point: the list behind stays visible and keeps its place. Whoever
 * closes the drawer stands where they were.
 */
export const ImKontext: Story = {
  render: function Render() {
    const [reference, setReference] = useState<string | null>(null);
    return (
      <div style={{ minHeight: 480 }}>
        <Card>
          <CardHead title="Sachverhalt 118 · Belege" sub="Drei Belege am Vorgang" />
          <Table cols="140px 1fr 130px 120px 150px">
            <HeadRow>
              <span>Belegnr.</span>
              <span>Lieferant</span>
              <span>Datum</span>
              <span className="v2num">Brutto</span>
              <span />
            </HeadRow>
            {CASES.map((c) => (
              <Row key={c.id}>
                <MonoCell value={c.ref} />
                <span>{c.vendor}</span>
                <Time value={c.at} format="date" />
                <span className="v2num">{c.gross}</span>
                <Button size="sm" onClick={() => setReference(c.ref)}>
                  Ansehen
                </Button>
              </Row>
            ))}
          </Table>
        </Card>
        <SourceDocumentDrawer
          open={reference !== null}
          onClose={() => setReference(null)}
          reference={reference ?? ""}
          record={reference === "RE-4471" ? RECORD : null}
          onOpenFull={() => {}}
        />
      </div>
    );
  },
};
