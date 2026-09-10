import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AmountCell, MonoCell } from "../primitives/Cells";
import { Card, CardHead, HeadRow, Row, Table } from "../primitives/Table";
import { DataTable, type ColumnDef, type ListPatch } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import { StatusHeader } from "./StatusHeader";

const meta: Meta<typeof StatusHeader> = {
  title: "v3/Patterns/Prüfen/StatusHeader",
  component: StatusHeader,
};
export default meta;
type Story = StoryObj<typeof StatusHeader>;

/* ── Data: three documents of a booking run ──────────────────────────────── */

const DOCUMENTS = [
  { id: "BEL-2026-0412", partner: "Musterfirma GmbH", amount: 1800, doc: "in_progress", match: "matched_ludwig" },
  { id: "BEL-2026-0413", partner: "Werbeagentur Nord", amount: 420, doc: "review_needed", match: "unreconciled" },
  { id: "BEL-2026-0414", partner: "Bürobedarf GmbH", amount: 64.9, doc: "processed", match: "matched_ludwig" },
];

/**
 * Der Spaltenkopf einer Status-Spalte in einer gewöhnlichen Kopfzeile: das
 * spezifische Wort „Abgleich" neben zwei Köpfen ohne Achse. Der Klick auf das
 * (i) öffnet den Dialog mit allen Werten der Achse — Tab erreicht es, Enter
 * öffnet, Esc schließt.
 */
export const Filled: Story = {
  render: () => (
    <Card>
      <CardHead title="Belege im Lauf" sub="3 Belege · Stand 04.09.2026" />
      <Table cols="120px 1fr 190px">
        <HeadRow>
          <span>Beleg</span>
          <span>Gegenpartei</span>
          <StatusHeader axis="mirror_match" label="Abgleich" />
        </HeadRow>
        {DOCUMENTS.map((d) => (
          <Row key={d.id}>
            <MonoCell value={d.id} />
            <span className="v2main">{d.partner}</span>
            <StatusBadge axis="mirror_match" status={d.match} info={false} />
          </Row>
        ))}
      </Table>
    </Card>
  ),
};

/**
 * Vier Achsen nebeneinander: jedes Wort ist spezifisch, keines heißt „Status"
 * (Z4). Ohne `label` kompiliert der Aufruf nicht — es gibt keinen Default.
 */
export const Axes: Story = {
  render: () => (
    <Card>
      <CardHead title="Vier Achsen, vier Wörter" />
      <Table cols="1fr 1fr 1fr 1fr">
        <HeadRow>
          <StatusHeader axis="mirror_match" label="Abgleich" />
          <StatusHeader axis="beleg" label="Verarbeitung" />
          <StatusHeader axis="klaerung" label="Rückfrage" />
          <StatusHeader axis="lauf" label="Lauf" />
        </HeadRow>
        <Row>
          <StatusBadge axis="mirror_match" status="matched_ludwig" info={false} />
          <StatusBadge axis="beleg" status="in_progress" info={false} />
          <StatusBadge axis="klaerung" status="required" info={false} />
          <StatusBadge axis="lauf" status="running" info={false} />
        </Row>
      </Table>
    </Card>
  ),
};

/* ── InDataTable: dieselben Belege als sortierbare Liste ────────────────── */

type Doc = (typeof DOCUMENTS)[number];

const href = (patch: ListPatch) =>
  `#${new URLSearchParams(
    Object.entries(patch).map(([k, v]) => [k, String(v)]),
  ).toString()}`;

const COLUMNS: ColumnDef<Doc>[] = [
  { key: "id", header: "Beleg", width: "140px", sortable: true, cell: (d) => <MonoCell value={d.id} /> },
  { key: "partner", header: "Gegenpartei", cell: (d) => <span className="v2main">{d.partner}</span> },
  { key: "amount", header: "Betrag", width: "130px", align: "end", sortable: true, cell: (d) => <AmountCell value={d.amount} /> },
  {
    key: "match",
    header: <StatusHeader axis="mirror_match" label="Abgleich" />,
    width: "200px",
    sortable: true,
    cell: (d) => <StatusBadge axis="mirror_match" status={d.match} info={false} />,
  },
];

/**
 * Als `header` eines sortierbaren `ColumnDef`: der Pfeil sortiert, der Klick
 * auf das (i) öffnet nur den Dialog — `StatusInfoButton` stoppt die
 * Propagation, damit der Kopf nicht mitsortiert.
 */
export const InDataTable: Story = {
  render: () => (
    <DataTable<Doc>
      rows={DOCUMENTS}
      columns={COLUMNS}
      rowKey={(d) => d.id}
      head={{ title: "Belege im Lauf", sub: "3 Belege · sortierbar" }}
      sort={{ key: "id", dir: "asc" }}
      href={href}
    />
  ),
};

/**
 * Regel Z4 einmal komplett: jeder Kopf einer Status-Spalte ist ein
 * `StatusHeader`, jede Zelle darunter ein `StatusBadge` — die Erklärung steht
 * einmal oben, nicht an jeder Zeile.
 */
export const InUse: Story = {
  render: () => (
    <Card>
      <CardHead title="Belege 2026" sub="3 von 412 · zwei Achsen je Zeile" />
      <Table cols="140px 1fr 130px 190px 200px">
        <HeadRow>
          <span>Beleg</span>
          <span>Gegenpartei</span>
          <span className="v2num">Betrag</span>
          <StatusHeader axis="beleg" label="Verarbeitung" />
          <StatusHeader axis="mirror_match" label="Abgleich" />
        </HeadRow>
        {DOCUMENTS.map((d) => (
          <Row key={d.id} href="#beleg">
            <MonoCell value={d.id} />
            <span className="v2main">{d.partner}</span>
            <AmountCell value={d.amount} />
            <StatusBadge axis="beleg" status={d.doc} info={false} />
            <StatusBadge axis="mirror_match" status={d.match} info={false} />
          </Row>
        ))}
      </Table>
    </Card>
  ),
};
