import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AmountCell } from "./Cells";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";
import { Duration, Time } from "./Time";
import { Timeline } from "../patterns/Timeline";

const meta: Meta<typeof Time> = { title: "v3/Primitives/Werte/Time", component: Time };
export default meta;
type Story = StoryObj<typeof Time>;

const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{children}</div>
);

const MOMENT = "2026-08-26T09:12:00+02:00";
const vorDreiTagen = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

/** Fünf Arten zu sagen, wann — die absolute Zeit steht immer im `title`. */
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
        <L>age — wie lange etwas schon liegt, ohne Datum davor</L>
        <Time value={vorDreiTagen} format="age" />
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

/**
 * Im Einsatz an beiden Orten, die die Spec nennt: in der Tabellenzeile (Zeit
 * kurz, Laufzeit daneben) und im Verlauf, wo derselbe Baustein die Zeitpunkte
 * der Einträge setzt. Die Spalte „Fällig" zeigt `prefix` — das Wort steht vor
 * der Zeit und wandert nicht in den Wert.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
    <Card>
      <Table cols="120px 1fr 140px 150px 110px 150px">
        <HeadRow>
          <span>Beleg</span>
          <span>Kreditor</span>
          <span className="v2num">Betrag</span>
          <span>Eingang</span>
          <span>Verarbeitung</span>
          <span>Fällig</span>
        </HeadRow>
        <Row>
          <span>RE-4471</span>
          <span>Bürobedarf Meier GmbH</span>
          <AmountCell value={1249.9} />
          <span>
            <Time value={MOMENT} length="short" size="sm" />
          </span>
          <span>
            <Duration seconds={4.2} size="sm" />
          </span>
          <span>
            <Time value="2026-09-14" format="date" length="short" size="sm" prefix="am" />
          </span>
        </Row>
        <Row>
          <span>RE-4472</span>
          <span>Stadtwerke Musterstadt</span>
          <AmountCell value={412} />
          <span>
            <Time value="2026-08-29T14:05:00+02:00" length="short" size="sm" />
          </span>
          <span>
            <Duration seconds={840} size="sm" />
          </span>
          <span>
            <Time value="2026-09-02" format="date" length="short" size="sm" prefix="seit" />
          </span>
        </Row>
      </Table>
    </Card>

    <Card>
      <CardHead title="Verlauf" sub="Derselbe Baustein setzt die Zeitpunkte der Einträge" />
      <div style={{ padding: "var(--space-5)" }}>
        <Timeline
          entries={[
            { id: "e1", at: "2026-08-26", title: "Beleg eingegangen", kind: "Beleg", actor: "Mandant" },
            { id: "e2", at: MOMENT, title: "Buchung vorgeschlagen", kind: "Buchung", actor: "Agent" },
            { id: "e3", at: vorDreiTagen, title: "Rückfrage gestellt", kind: "Rückfrage", actor: "Kanzlei" },
          ]}
        />
      </div>
    </Card>
    </div>
  ),
};
