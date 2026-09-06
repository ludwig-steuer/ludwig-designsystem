import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { DateField, DateRangeField } from "./DateField";
import { FilterBar } from "./FilterBar";
import { Field } from "./Form";
import { Card, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof DateField> = {
  title: "v3/Primitives/Formular/DateField",
  component: DateField,
};
export default meta;
type Story = StoryObj<typeof DateField>;

const PRESETS = [
  { key: "monat", label: "Vormonat", from: "2026-07-01", to: "2026-07-31" },
  { key: "quartal", label: "Laufendes Quartal", from: "2026-07-01", to: "2026-09-30" },
  { key: "wj", label: "Laufendes Wirtschaftsjahr", from: "2026-01-01", to: "2026-12-31" },
];

/** Angezeigt wird 26.08.2026, herausgegeben `2026-08-26`. */
export const Filled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 420 }}>
      <Field label="Belegdatum" htmlFor="belegdatum">
        <DateField id="belegdatum" value="2026-08-26" onChange={() => {}} />
      </Field>
      <Field label="Belegdatum, beanstandet" error="Liegt vor dem Beginn des Wirtschaftsjahres." htmlFor="belegdatum-beanstandet">
        <DateField id="belegdatum-beanstandet" value="2025-12-30" onChange={() => {}} invalid />
      </Field>
      <Field label="Zeitraum" htmlFor="zeitraum">
        <DateRangeField id="zeitraum" from="2026-08-01" to="2026-08-31" onChange={() => {}} />
      </Field>
    </div>
  ),
};

/** Leer ist ein Wert — die offene Frist gibt `null` heraus. */
export const Empty: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 420 }}>
      <Field label="Fällig am" htmlFor="fallig-am">
        <DateField id="fallig-am" value={null} onChange={() => {}} />
      </Field>
      <Field label="Zeitraum" htmlFor="zeitraum-2">
        <DateRangeField id="zeitraum-2" from={null} to={null} onChange={() => {}} />
      </Field>
    </div>
  ),
};

/** Rundlauf: der ISO-Wert steht darunter, nicht das Anzeigeformat. */
export const Interactive: Story = {
  render: function Render() {
    const [d, setD] = useState<string | null>("2026-08-26");
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: "2026-08-01",
      to: "2026-08-31",
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 420 }}>
        <Field label="Belegdatum" htmlFor="belegdatum-2">
          <DateField id="belegdatum-2" value={d} onChange={setD} />
        </Field>
        <Field label="Zeitraum" htmlFor="zeitraum-3">
          <DateRangeField id="zeitraum-3"
            from={range.from}
            to={range.to}
            onChange={(from, to) => setRange({ from, to })}
          />
        </Field>
        <pre style={{ fontSize: 12.5, margin: 0, fontFamily: "var(--font-mono)" }}>
          {JSON.stringify({ datum: d, ...range }, null, 2)}
        </pre>
      </div>
    );
  },
};

/** Die Schnellwahl setzt beide Werte in einem `onChange`. */
export const WithPresets: Story = {
  render: function Render() {
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: null,
      to: null,
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 560 }}>
        <Field label="Zeitraum" htmlFor="zeitraum-4">
          <DateRangeField id="zeitraum-4"
            from={range.from}
            to={range.to}
            presets={PRESETS}
            onChange={(from, to) => setRange({ from, to })}
          />
        </Field>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {range.from ? `${range.from} bis ${range.to}` : "kein Zeitraum gewählt"}
        </div>
      </div>
    );
  },
};

/** `min`/`max` sperren, was außerhalb des Wirtschaftsjahres liegt. */
export const Bounds: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Field label="Belegdatum" hint="Nur innerhalb des Wirtschaftsjahres 2026" htmlFor="belegdatum-3">
        <DateField id="belegdatum-3" value="2026-08-26" min="2026-01-01" max="2026-12-31" onChange={() => {}} />
      </Field>
    </div>
  ),
};

/** Rand: „bis" vor „von" wird getauscht, nicht abgewiesen. */
export const Edges: Story = {
  render: function Render() {
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: "2026-08-31",
      to: null,
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 480 }}>
        <Field label="Zeitraum" hint="Tragen Sie im zweiten Feld den 01.08.2026 ein — die Felder tauschen." htmlFor="zeitraum-5">
          <DateRangeField id="zeitraum-5"
            from={range.from}
            to={range.to}
            onChange={(from, to) => setRange({ from, to })}
          />
        </Field>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          von {range.from ?? "—"} bis {range.to ?? "—"}
        </div>
        <Field label="Jahreswechsel und Schaltjahr" htmlFor="jahreswechsel-und-schaltjahr">
          <DateRangeField id="jahreswechsel-und-schaltjahr" from="2024-02-29" to="2027-01-01" onChange={() => {}} />
        </Field>
      </div>
    );
  },
};

/** Im Einsatz: in der Filterleiste über der Liste. */
export const InUse: Story = {
  render: function Render() {
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: "2026-08-01",
      to: "2026-08-31",
    });
    return (
      <div style={{ maxWidth: 720 }}>
        <FilterBar activeCount={1} onReset={() => setRange({ from: null, to: null })}>
          <Field label="Belegdatum" htmlFor="belegdatum-4">
            <DateRangeField id="belegdatum-4"
              from={range.from}
              to={range.to}
              presets={PRESETS}
              onChange={(from, to) => setRange({ from, to })}
            />
          </Field>
        </FilterBar>
        <Card>
          <Table cols="120px 1fr 140px">
            <HeadRow>
              <th>Beleg</th>
              <th>Kreditor</th>
              <th style={{ textAlign: "right" }}>Betrag</th>
            </HeadRow>
            <Row>
              <td>RE-4471</td>
              <td>Bürobedarf Meier GmbH</td>
              <AmountCell value={1249.9} />
            </Row>
          </Table>
        </Card>
      </div>
    );
  },
};
