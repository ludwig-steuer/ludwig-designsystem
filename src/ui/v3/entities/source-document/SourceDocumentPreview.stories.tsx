import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { Drawer } from "../../primitives/Drawer";
import { MonoCell } from "../../primitives/Cells";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { SourceDocumentPreview } from "./SourceDocumentPreview";

const meta: Meta<typeof SourceDocumentPreview> = {
  title: "v3/Entitäten/Beleg/SourceDocumentPreview",
  component: SourceDocumentPreview,
};
export default meta;
type Story = StoryObj<typeof SourceDocumentPreview>;

/** A three-page document as a data URI — no network, and the preview is real. */
function page(n: number, of: number, heading: string) {
  return `
<section>
  <div class="head">
    <strong>${heading}</strong>
    <span class="muted">Seite ${n} von ${of}</span>
  </div>
  <p>Musterstraße 14 · 10115 Berlin · USt-IdNr. DE123456789</p>
  <table>
    <tr><th>Position</th><th class="num">Menge</th><th class="num">Netto</th></tr>
    <tr><td>Bürobedarf, Sortiment</td><td class="num">1</td><td class="num">812,50 €</td></tr>
    <tr><td>Bewirtung Mittag</td><td class="num">1</td><td class="num">96,20 €</td></tr>
  </table>
</section>`;
}

function document(heading: string, pages: number) {
  return `data:text/html;charset=utf-8,${encodeURIComponent(`
<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0; padding: 24px; font: 13px/1.6 -apple-system, system-ui, sans-serif; color: #1b2733; background: #eef2f6; }
  section { background: #fff; padding: 32px 40px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(15,23,42,.12); }
  .head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; font-size: 16px; }
  .muted { color: #64748b; font-size: 12px; }
  p { margin: 0 0 24px; color: #64748b; font-size: 12.5px; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  th { text-align: left; border-bottom: 1px solid #cbd5e1; padding: 6px 0; }
  td { padding: 6px 0; border-bottom: 1px solid #eef2f6; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
</style>
${Array.from({ length: pages }, (_, i) => page(i + 1, pages, heading)).join("")}
`)}`;
}

const INVOICE_PDF = document("Rechnung RE-4471 · ACME GmbH", 3);

/** Title, page count, the original — the whole component in its normal case. */
export const Filled: Story = {
  name: "Gefuellt",
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <SourceDocumentPreview
        url={INVOICE_PDF}
        title="Rechnung"
        fileName="RE-4471-ACME.pdf"
        pageCount={3}
      />
    </div>
  ),
};

/**
 * Both empty cases side by side: with a reason and without one. Neither shows
 * a grey box in the shape of a document — that would be a claim about
 * something that is not there. Without a reason the standard sentence stands,
 * never nothing.
 */
export const WithoutPreview: Story = {
  name: "OhneVorschau",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 720 }}>
      <SourceDocumentPreview
        url={null}
        title="Beleg"
        fileName="scan-4468.tiff"
        unavailableReason="Das Format TIFF lässt sich nicht im Browser anzeigen. Die Datei liegt unverändert in der Ablage."
      />
      <SourceDocumentPreview url={null} title="Beleg" fileName="RE-4469.pdf" />
    </div>
  ),
};

/**
 * Every fifth document is cut out of a collection PDF. Above: which pages of
 * which original, one click away. Below: the same document without `excerpt` —
 * and then there is **no** line at all, not „ganzes Dokument".
 */
export const Excerpt: Story = {
  name: "Teilbeleg",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 720 }}>
      <SourceDocumentPreview
        url={INVOICE_PDF}
        title="Rechnung"
        fileName="RE-4471-ACME.pdf"
        pageCount={3}
        excerpt={{
          pages: "5–7",
          parentTitle: "Sammel-PDF vom 12.08.2026",
          parentHref: "#sammel-original",
        }}
      />
      <SourceDocumentPreview
        url={INVOICE_PDF}
        title="Rechnung"
        fileName="RE-4471-ACME.pdf"
        pageCount={3}
      />
    </div>
  ),
};

/**
 * The heading is the **kind of document** and comes from the caller
 * (`sourceDocTypeLabel()`); the preview itself stays exactly the same. That is
 * the whole difference between a contract and a bank statement in here.
 */
export const Kinds: Story = {
  name: "Ausprägungen",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 720 }}>
      {[
        ["Beleg", "scan-20260819-114233.pdf"],
        ["Rechnung", "RE-4471-ACME.pdf"],
        ["Vertrag", "Mietvertrag-Lagerhalle-2026.pdf"],
        ["Kontoauszug", "Kontoauszug-2026-08-Sparkasse.pdf"],
      ].map(([title, fileName]) => (
        <SourceDocumentPreview
          key={title}
          url={INVOICE_PDF}
          title={title}
          fileName={fileName}
          pageCount={3}
        />
      ))}
    </div>
  ),
};

/**
 * `md` beside the work (drawer), `lg` where the preview carries the page (view
 * and card). Both heights are `clamp()` values from `v3.css`, not pixels in
 * the component.
 */
export const Sizes: Story = {
  name: "Groessen",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", gridTemplateColumns: "1fr 1fr" }}>
      <SourceDocumentPreview url={INVOICE_PDF} title="Beleg · md" fileName="RE-4471.pdf" pageCount={3} />
      <SourceDocumentPreview
        url={INVOICE_PDF}
        title="Beleg · lg"
        fileName="RE-4471.pdf"
        pageCount={3}
        height="lg"
      />
    </div>
  ),
};

const ROWS = [
  { id: "c1", ref: "RE-4471", vendor: "ACME GmbH", at: "2026-08-26", gross: "1.249,90 €" },
  { id: "c2", ref: "RE-4468", vendor: "Bürodienst Nord", at: "2026-08-24", gross: "318,00 €" },
  { id: "c3", ref: "RE-4470", vendor: "Stadtwerke", at: "2026-08-25", gross: "742,15 €" },
];

/**
 * Where 0076 puts it: in the drawer beside a list, at `height="md"`, with the
 * list behind it keeping its place.
 */
export const InUse: Story = {
  name: "ImEinsatz",
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: 480 }}>
        <Card>
          <CardHead title="Sachverhalt SV-118 · Belege" sub="Drei Belege am Vorgang" />
          <Table cols="140px 1fr 130px 120px 150px">
            <HeadRow>
              <span>Belegnr.</span>
              <span>Gegenpart</span>
              <span>Belegdatum</span>
              <span className="v2num">Brutto</span>
              <span />
            </HeadRow>
            {ROWS.map((r) => (
              <Row key={r.id}>
                <MonoCell value={r.ref} />
                <span>{r.vendor}</span>
                <Time value={r.at} format="date" />
                <span className="v2num">{r.gross}</span>
                <Button size="sm" onClick={() => setOpen(true)}>
                  Ansehen
                </Button>
              </Row>
            ))}
          </Table>
        </Card>
        <Drawer open={open} onClose={() => setOpen(false)} title="Beleg · ACME GmbH" size="lg">
          <SourceDocumentPreview
            url={INVOICE_PDF}
            title="Rechnung"
            fileName="RE-4471-ACME.pdf"
            pageCount={3}
            excerpt={{ pages: "5–7", parentTitle: "Sammel-PDF vom 12.08.2026", parentHref: "#sammel" }}
          />
        </Drawer>
      </div>
    );
  },
};
