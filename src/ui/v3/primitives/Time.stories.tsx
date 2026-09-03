import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AmountCell } from "./Cells";
import { Card, HeadRow, Row, Table } from "./Table";
import { Duration, Time } from "./Time";

const meta: Meta<typeof Time> = { title: "v3/Primitives/Werte/Time", component: Time };
export default meta;
type Story = StoryObj<typeof Time>;

const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{children}</div>
);

const MOMENT = "2026-08-26T09:12:00+02:00";
const vorDreiTagen = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

/** Vier Arten zu sagen, wann — die absolute Zeit steht immer im `title`. */
export const Formats: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <div>
        <L>date</L>
        <Time value={MOMENT} format="date" />
      </div>
      <div>
        <L>dateTime (Default)</L>
        <Time value={MOMENT} />
      </div>
      <div>
        <L>relative — zeigen Sie darauf, die absolute Zeit steht im Tooltip</L>
        <Time value={vorDreiTagen} format="relative" />
      </div>
      <div>
        <L>month — für Achsen und Gruppenköpfe</L>
        <Time value={MOMENT} format="month" />
      </div>
    </div>
  ),
};

/** Drei Längen desselben Zeitpunkts: Zelle, Zeile, Protokoll. */
export const Lengths: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <div>
        <L>short</L>
        <Time value={MOMENT} length="short" />
      </div>
      <div>
        <L>medium (Default)</L>
        <Time value={MOMENT} length="medium" />
      </div>
      <div>
        <L>long</L>
        <Time value={MOMENT} length="long" />
      </div>
    </div>
  ),
};

/** Unter einer Minute mit Nachkommastelle — dort zeigt sich der Unterschied
 *  zwischen einem schnellen und einem langsamen Lauf. */
export const Durations: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-2)", maxWidth: 220 }}>
      {[0, 4.2, 42, 59.9, 60, 840, 3600, 7505, null].map((s, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "var(--color-text-muted)" }}>
            {s === null ? "null" : `${s} s`}
          </span>
          <Duration seconds={s} />
        </div>
      ))}
    </div>
  ),
};

/** Zwei Größen, in einer Zeile fluchtend. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-2)", width: 200 }}>
      <Time value={MOMENT} size="sm" />
      <Time value={MOMENT} size="md" />
      <Duration seconds={7505} size="sm" />
      <Duration seconds={7505} size="md" />
    </div>
  ),
};

/** `null` ist der Gedankenstrich — nicht „01.01.1970". */
export const Empty: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      <Time value={null} />
      <Duration seconds={null} />
    </div>
  ),
};

/**
 * Der Rand, um den es in P24 geht: ein **kalendarisches** Datum darf nicht
 * verrutschen. `2026-08-26` ist ein Tag, kein Zeitpunkt — es zeigt den 26.,
 * egal wo der Rechner steht. Dazu Jahreswechsel und Sommerzeit-Umstellung.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <div>
        <L>reines Datum „2026-08-26" — muss der 26. sein</L>
        <Time value="2026-08-26" format="date" />
      </div>
      <div>
        <L>Jahreswechsel „2026-01-01"</L>
        <Time value="2026-01-01" format="date" />
      </div>
      <div>
        <L>Sommerzeit-Beginn, 02:30 UTC → 04:30 Berlin</L>
        <Time value="2026-03-29T02:30:00Z" />
      </div>
      <div>
        <L>Winterzeit, 02:30 UTC → 03:30 Berlin</L>
        <Time value="2026-10-25T02:30:00Z" />
      </div>
      <div>
        <L>unlesbar</L>
        <Time value="kein Datum" />
      </div>
    </div>
  ),
};

/** Im Einsatz: in der Tabellenzeile und als Laufzeit daneben. */
export const InUse: Story = {
  render: () => (
    <Card>
      <Table cols="120px 1fr 140px 150px 110px">
        <HeadRow>
          <th>Beleg</th>
          <th>Kreditor</th>
          <th style={{ textAlign: "right" }}>Betrag</th>
          <th>Eingang</th>
          <th>Verarbeitung</th>
        </HeadRow>
        <Row>
          <td>RE-4471</td>
          <td>Bürobedarf Meier GmbH</td>
          <AmountCell value={1249.9} />
          <td>
            <Time value={MOMENT} length="short" size="sm" />
          </td>
          <td>
            <Duration seconds={4.2} size="sm" />
          </td>
        </Row>
        <Row>
          <td>RE-4472</td>
          <td>Stadtwerke Musterstadt</td>
          <AmountCell value={412} />
          <td>
            <Time value="2026-08-29T14:05:00+02:00" length="short" size="sm" />
          </td>
          <td>
            <Duration seconds={840} size="sm" />
          </td>
        </Row>
      </Table>
    </Card>
  ),
};
