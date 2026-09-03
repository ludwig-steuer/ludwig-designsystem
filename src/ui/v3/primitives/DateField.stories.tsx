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
export const Gefuellt: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 420 }}>
      <Field label="Belegdatum">
        <DateField value="2026-08-26" onChange={() => {}} />
      </Field>
      <Field label="Belegdatum, beanstandet" error="Liegt vor dem Beginn des Wirtschaftsjahres.">
        <DateField value="2025-12-30" onChange={() => {}} invalid />
      </Field>
      <Field label="Zeitraum">
        <DateRangeField from="2026-08-01" to="2026-08-31" onChange={() => {}} />
      </Field>
    </div>
  ),
};

/** Leer ist ein Wert — die offene Frist gibt `null` heraus. */
export const Leer: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 420 }}>
      <Field label="Fällig am">
        <DateField value={null} onChange={() => {}} />
      </Field>
      <Field label="Zeitraum">
        <DateRangeField from={null} to={null} onChange={() => {}} />
      </Field>
    </div>
  ),
};

/** Rundlauf: der ISO-Wert steht darunter, nicht das Anzeigeformat. */
export const Interaktiv: Story = {
  render: function Render() {
    const [d, setD] = useState<string | null>("2026-08-26");
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: "2026-08-01",
      to: "2026-08-31",
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 420 }}>
        <Field label="Belegdatum">
          <DateField value={d} onChange={setD} />
        </Field>
        <Field label="Zeitraum">
          <DateRangeField
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
export const MitSchnellwahl: Story = {
  render: function Render() {
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: null,
      to: null,
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 560 }}>
        <Field label="Zeitraum">
          <DateRangeField
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
export const Grenzen: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Field label="Belegdatum" hint="Nur innerhalb des Wirtschaftsjahres 2026">
        <DateField value="2026-08-26" min="2026-01-01" max="2026-12-31" onChange={() => {}} />
      </Field>
    </div>
  ),
};

/** Rand: „bis" vor „von" wird getauscht, nicht abgewiesen. */
export const Rand: Story = {
  render: function Render() {
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: "2026-08-31",
      to: null,
    });
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 480 }}>
        <Field label="Zeitraum" hint="Tragen Sie im zweiten Feld den 01.08.2026 ein — die Felder tauschen.">
          <DateRangeField
            from={range.from}
            to={range.to}
            onChange={(from, to) => setRange({ from, to })}
          />
        </Field>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          von {range.from ?? "—"} bis {range.to ?? "—"}
        </div>
        <Field label="Jahreswechsel und Schaltjahr">
          <DateRangeField from="2024-02-29" to="2027-01-01" onChange={() => {}} />
        </Field>
      </div>
    );
  },
};

/** Im Einsatz: in der Filterleiste über der Liste. */
export const ImEinsatz: Story = {
  render: function Render() {
    const [range, setRange] = useState<{ from: string | null; to: string | null }>({
      from: "2026-08-01",
      to: "2026-08-31",
    });
    return (
      <div style={{ maxWidth: 720 }}>
        <FilterBar activeCount={1} onReset={() => setRange({ from: null, to: null })}>
          <Field label="Belegdatum">
            <DateRangeField
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
