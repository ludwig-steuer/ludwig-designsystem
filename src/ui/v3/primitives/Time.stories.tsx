import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Fragment } from "react";
import { AmountCell } from "./Cells";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";
import { DateRange, Duration, Time } from "./Time";
import { Timeline } from "../patterns/Timeline";

const meta: Meta<typeof Time> = { title: "v3/Primitives/Werte/Time", component: Time };
export default meta;
type Story = StoryObj<typeof Time>;

const L = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{children}</div>
);

const MOMENT = "2026-08-26T09:12:00+02:00";
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const threeDaysAgo = ago(3 * DAY);

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
        <Time value={threeDaysAgo} format="relative" />
      </div>
      <div>
        <L>age — wie lange etwas schon liegt, ohne Datum davor</L>
        <Time value={threeDaysAgo} format="age" />
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
            { id: "e3", at: threeDaysAgo, title: "Rückfrage gestellt", kind: "Rückfrage", actor: "Kanzlei" },
          ]}
        />
      </div>
    </Card>
    </div>
  ),
};

/**
 * Ein Zeitraum zum Lesen (0189): der gemeinsame Teil steht einmal, wo die
 * Spanne faltet, entscheidet die Locale. Gleicher Tag mit zwei Uhrzeiten ist
 * ein Tag. Ein Ende allein ist dieses Ende; keines ist der Gedankenstrich.
 */
export const Ranges: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <div>
        <L>date — im Monat</L>
        <DateRange from="2026-03-01" to="2026-03-31" />
      </div>
      <div>
        <L>date — über den Jahreswechsel</L>
        <DateRange from="2026-12-28" to="2027-01-04" />
      </div>
      <div>
        <L>date — gleicher Tag: ein Datum, kein Strich</L>
        <DateRange from="2026-03-01" to="2026-03-01" />
      </div>
      <div>
        <L>date, long</L>
        <DateRange from="2026-03-01" to="2026-03-31" length="long" />
      </div>
      <div>
        <L>dateTime — gleicher Tag, zwei Uhrzeiten</L>
        <DateRange from={MOMENT} to="2026-08-26T17:30:00+02:00" format="dateTime" />
      </div>
      <div>
        <L>dateTime — zwei Tage</L>
        <DateRange from={MOMENT} to="2026-08-28T17:30:00+02:00" format="dateTime" />
      </div>
      <div>
        <L>dateTime, short</L>
        <DateRange from={MOMENT} to="2026-08-28T17:30:00+02:00" format="dateTime" length="short" />
      </div>
      <div>
        <L>month</L>
        <DateRange from="2026-03-01" to="2026-05-31" format="month" />
      </div>
      <div>
        <L>nur ein Ende — das Wort davor setzt der Aufrufer mit Time prefix</L>
        <DateRange from="2026-03-01" to={null} />
      </div>
      <div>
        <L>kein Ende</L>
        <DateRange from={null} to={null} />
      </div>
      <div>
        <L>verkehrt herum — getauscht, nicht gemeldet</L>
        <DateRange from="2026-03-31" to="2026-03-01" />
      </div>
      <div>
        <L>unlesbar</L>
        <DateRange from="kein Datum" to="2026-03-31" />
      </div>
      <div>
        <L>sm</L>
        <DateRange from="2026-03-01" to="2026-03-31" size="sm" />
      </div>
    </div>
  ),
};

/**
 * Wie lange her — `relative` kippt nach einer Woche aufs Datum (T7: eine
 * relative Zeit allein ist keine Antwort, wenn jemand eine Periode prüft),
 * `age` nicht: eine Klärung, die 13 Tage liegt, muss das sagen. Die absolute
 * Zeit steht bei beiden im Tooltip.
 */
export const Relative: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr", gap: "var(--space-2) var(--space-4)", alignItems: "baseline" }}>
      <L>Abstand</L>
      <L>relative</L>
      <L>age</L>
      {(
        [
          ["5 Minuten", ago(5 * MINUTE)],
          ["3 Stunden", ago(3 * HOUR)],
          ["gestern", ago(DAY)],
          ["3 Tage", threeDaysAgo],
          ["13 Tage", ago(13 * DAY)],
          ["40 Tage", ago(40 * DAY)],
          ["morgen", ago(-(DAY + HOUR))],
        ] as const
      ).map(([label, value]) => (
        <Fragment key={label}>
          <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{label}</span>
          <Time value={value} format="relative" />
          <Time value={value} format="age" />
        </Fragment>
      ))}
    </div>
  ),
};

const FORMATS = ["date", "dateTime", "time", "relative", "age", "month"] as const;
const LENGTHS = ["short", "medium", "long"] as const;
const SIZES = ["sm", "md"] as const;

/**
 * Jede Kombination `format` × `length` × `size` an einem Zeitpunkt (Owner
 * 2026-09-16). `length` wirkt nur bei `date` (long) und `dateTime`; die
 * übrigen Zeilen sind absichtlich gleich — die Achse ist dort keine.
 */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "100px repeat(3, 1fr)", gap: "var(--space-2) var(--space-4)", alignItems: "baseline" }}>
      <L>format</L>
      {LENGTHS.map((l) => (
        <L key={l}>{l}</L>
      ))}
      {FORMATS.map((f) =>
        SIZES.map((sz) => (
          <Fragment key={`${f}-${sz}`}>
            <span style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              {f} · {sz}
            </span>
            {LENGTHS.map((l) => (
              <Time key={l} value={f === "relative" || f === "age" ? threeDaysAgo : MOMENT} format={f} length={l} size={sz} />
            ))}
          </Fragment>
        )),
      )}
    </div>
  ),
};
