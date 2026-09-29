import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DataTable } from "@/ui/v3/patterns/DataTable";
import type { ProcessPicture } from "@/ui/v3/patterns/ProcessPicture";
import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";
import { SourceDocumentList } from "@/ui/v3/entities/source-document/SourceDocumentList";
import {
  BATCH_DOCUMENTS_VIEW,
  DOCUMENT_LIST_VIEW,
  INBOX_VIEW,
  UNBOOKED_VIEW,
  UNBOOKED_GROUPED_VIEW,
  sourceDocumentColumns,
  sourceDocumentMinWidth,
  type SourceDocumentColumn,
  type SourceDocumentColumnOptions,
} from "@/ui/v3/entities/source-document/source-document-columns";
import { documentFixture } from "../document/fixtures";
import { byId } from "../document-process/fixtures";
import { byNumber } from "../document-classification/fixtures";

/**
 * The document row as the standard (0212, brief F335): one catalogue, the
 * screens are views of it. Every row: the name's head with the number under
 * it, one date, the progress with „seit". The cases of F335 §8 are in the rows.
 */
const meta: Meta = { title: "Seiten/Belegzeile", parameters: { layout: "padded" } };
export default meta;
type Story = StoryObj;

type Row = { doc: SourceDocumentVM; process: string; since?: string; reason?: string; classification: string; batch?: string; entries?: number };

const ROWS: Row[] = [
  {
    doc: documentFixture({ id: "r1", counterparty: "Muster Bürobedarf GmbH", documentDate: "2026-09-12", receivedDate: "2026-09-14", uploadedAt: "2026-09-15T08:14:00Z", basketNumber: "K-2026-0012", pageCount: 1, caseNumber: "2026-0142" }),
    process: "S09",
    since: "seit 14 T",
    classification: "1",
    batch: "09-2026-Ludwig",
    entries: 1,
  },
  {
    // §8.1 — no counterparty, no number, a GUID file: the head falls to the form, then the file.
    doc: documentFixture({ id: "r2", counterparty: null, classDocumentForm: null, fileName: "3f2a9c1e-77b0-4c1a-9d1e-0b6a51f2c9a4.pdf", detail: null, documentDate: null, receivedDate: "2026-09-29", pageCount: 1, caseNumber: null }),
    process: "S04",
    since: "seit 6 T",
    reason: "Leistungszeitraum und Steuersatz fehlen",
    classification: "2",
  },
  {
    // §8.3 — a foreign currency stays in its currency.
    doc: documentFixture({ id: "r3", counterparty: "Swiss Tools AG", documentDate: "2026-09-01", detail: { kind: "invoice", number: "CH-40012345", gross: 1450, currency: "CHF", net: 1341.35, vat: 108.65 }, caseNumber: "2026-0098" }),
    process: "S12",
    classification: "1",
    batch: "09-2026-Ludwig",
    entries: 2,
  },
  {
    // §8.4 — a part of a split PDF.
    doc: documentFixture({ id: "r4", counterparty: "Aral Tankstelle", documentDate: "2026-09-20", splitPageRange: "5–7", parentName: "scan_0923.pdf", detail: { kind: "invoice", number: "8812", gross: 72.14, currency: "EUR" }, caseNumber: null }),
    process: "S07",
    since: "seit 1 T",
    classification: "1",
  },
  {
    // §8.5 — in the batch, no entry: no booking needed.
    doc: documentFixture({ id: "r5", counterparty: "Beispiel Leasing AG", classDocumentForm: "dunning", documentDate: "2026-09-15", detail: null, doneVia: "no_booking_required", doneReason: "Mahnung zu einer bereits gebuchten Rechnung — keine eigene Buchung.", caseNumber: "2026-0077" }),
    process: "S13",
    classification: "1",
    batch: "09-2026-Ludwig",
    entries: 0,
  },
];

const withSince = (picture: ProcessPicture, since?: string): ProcessPicture => (since ? { ...picture, since } : picture);

function options(): SourceDocumentColumnOptions {
  const by = new Map(ROWS.map((r) => [r.doc.id, r]));
  return {
    href: (d) => `#document=${d.id}`,
    caseHref: (n) => `#case=${n}`,
    processPicture: (d) => {
      const r = by.get(d.id);
      if (!r) return null;
      const s = byId(r.process);
      const picture = withSince(s.picture, r.since);
      return { picture: r.reason ? { ...picture, reason: r.reason } : picture, detail: s.detail };
    },
    classificationPicture: (d) => {
      const r = by.get(d.id);
      if (!r) return null;
      const c = byNumber(r.classification);
      return { picture: c.picture, detail: c.detail };
    },
    batch: (d) => {
      const b = by.get(d.id)?.batch;
      return b ? { label: b, href: `#batch=${b}` } : null;
    },
    bookings: (d) => {
      const n = by.get(d.id)?.entries ?? 0;
      return {
        entryHref: (id) => `#entry=${id}`,
        entries: Array.from({ length: n }, (_, i) => ({
          id: `${d.id}-e${i}`,
          currency: "EUR" as const,
          lines: [
            { side: "debit" as const, accountNumber: "4930", amount: 238 },
            { side: "credit" as const, accountNumber: "70010", amount: 238 },
          ],
        })),
      };
    },
  };
}

function View({
  title,
  columns,
  rows = ROWS,
  width,
  dateSort,
}: {
  title: string;
  columns: SourceDocumentColumn[];
  rows?: Row[];
  width?: number;
  dateSort?: SourceDocumentColumnOptions["dateSort"];
}) {
  const cols = sourceDocumentColumns({ ...options(), columns, ...(dateSort ? { dateSort } : {}) });
  return (
    <div style={width ? { width } : undefined}>
      <DataTable
        columns={cols}
        rows={rows.map((r) => r.doc)}
        rowKey={(d) => d.id}
        head={{ title, meta: `${rows.length} Belege` }}
        minWidth={sourceDocumentMinWidth(cols)}
        empty={{ title: "Keine Belege." }}
      />
    </div>
  );
}

/**
 * V2 · Belege — Beleg · Einordnung · Betrag · Belegdatum · Fortschritt ·
 * Sachverhalt · Stapel. The date column chooses the sort axis (G1); the rows
 * keep showing the document date.
 */
export const DocumentList: Story = {
  render: () => (
    <View title="Belege 2026" columns={DOCUMENT_LIST_VIEW} dateSort={{ current: "received", href: (axis) => `#sort=${axis}` }} />
  ),
};

/** V3 · Stapel → Belege — no grouping; the progress says what became of each, the booking where it went (E7). */
export const BatchDocuments: Story = {
  render: () => <View title="Belege des Stapels 09-2026-Ludwig" columns={BATCH_DOCUMENTS_VIEW} rows={ROWS.filter((r) => r.batch)} />,
};

/** V1 · Eingang — pages and certainty beside the classification; the date may still be missing. */
export const Inbox: Story = { render: () => <View title="Dateikorb K-2026-0012" columns={INBOX_VIEW} /> };

/** V5 · Abnahme „ohne Buchung" — the reason is a column, because it is what gets judged. */
export const Unbooked: Story = { render: () => <View title="Belege ohne Buchung" columns={UNBOOKED_VIEW} rows={ROWS.filter((r) => r.entries === 0)} /> };

/** K · the compact row at a case — no head, one line each, progress without holder. */
export const Compact: Story = {
  render: () => {
    const o = options();
    return (
      <div style={{ width: 720 }}>
        <SourceDocumentList
          documents={ROWS.slice(0, 3).map((r) => r.doc)}
          href={o.href!}
          processPicture={o.processPicture!}
          classificationPicture={o.classificationPicture!}
        />
      </div>
    );
  },
};

/** At 600 px (a drawer): V2 scrolls inside its card from its floor; K fits. */
export const Narrow: Story = { render: () => <View title="Belege 2026" columns={DOCUMENT_LIST_VIEW} width={600} /> };

/** V5 grouped by collection PDF: the part carries its page range in the original (G8); a missing reason is named (G7). */
export const UnbookedGrouped: Story = {
  render: () => (
    <View
      title="Belege ohne Buchung · scan_0923.pdf"
      columns={UNBOOKED_GROUPED_VIEW}
      rows={[ROWS[3]!, { ...ROWS[4]!, doc: { ...ROWS[4]!.doc, doneReason: null, splitPageRange: "8–9" } }]}
    />
  ),
};
