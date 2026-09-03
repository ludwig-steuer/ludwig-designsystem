import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";
import { Field, Input, Select } from "./Form";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof FilterBar> = {
  title: "v3/Primitives/Navigation/FilterBar",
  component: FilterBar,
};
export default meta;
type Story = StoryObj<typeof FilterBar>;

const Kreditor = () => (
  <Field label="Kreditor">
    <Select defaultValue="">
      <option value="">Alle</option>
      <option value="meier">Bürobedarf Meier GmbH</option>
      <option value="stadtwerke">Stadtwerke Musterstadt</option>
    </Select>
  </Field>
);

const Zeitraum = () => (
  <Field label="Belegdatum ab">
    <Input type="date" defaultValue="2026-08-01" />
  </Field>
);

/** Ruhezustand: drei Felder, nichts gesetzt, kein Zurücksetzen. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar>
        <Kreditor />
        <Zeitraum />
        <Field label="Suche">
          <Input type="search" placeholder="Beleg oder Text" />
        </Field>
      </FilterBar>
    </div>
  ),
};

/** Gesetzt: die Zahl steht als Wort da, daneben der Weg zurück. */
export const Active: Story = {
  render: function Render() {
    const [n, setN] = useState(3);
    return (
      <div style={{ maxWidth: 720 }}>
        <FilterBar activeCount={n} onReset={() => setN(0)}>
          <Kreditor />
          <Zeitraum />
          <Field label="Suche">
            <Input type="search" defaultValue="Bürobedarf" />
          </Field>
        </FilterBar>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {n === 0 ? "Alles sichtbar." : `${n} Filter wirken.`}
        </p>
      </div>
    );
  },
};

/** Ohne Client-Zustand: `submitLabel` schickt das Formular, `resetHref` führt zurück. */
export const ServerForm: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <form>
        <FilterBar activeCount={2} resetHref="#" submitLabel="Filtern">
          <Kreditor />
          <Zeitraum />
        </FilterBar>
      </form>
    </div>
  ),
};

/** Sieben Felder brechen um; das Zurücksetzen bleibt am Ende. */
export const ManyFields: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar activeCount={5} resetHref="#">
        <Kreditor />
        <Zeitraum />
        <Field label="Belegdatum bis">
          <Input type="date" defaultValue="2026-08-31" />
        </Field>
        <Field label="Konto">
          <Input defaultValue="6815" style={{ width: 100 }} />
        </Field>
        <Field label="Betrag ab">
          <Input defaultValue="100,00" style={{ width: 100 }} />
        </Field>
        <Field label="Status">
          <Select defaultValue="">
            <option value="">Alle</option>
            <option value="offen">Offen</option>
          </Select>
        </Field>
        <Field label="Suche">
          <Input type="search" placeholder="Beleg oder Text" />
        </Field>
      </FilterBar>
    </div>
  ),
};

/** Im Einsatz — mit dem Leerzustand, der zur Filterung gehört (V9, T6). */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar activeCount={2} resetHref="#">
        <Kreditor />
        <Zeitraum />
      </FilterBar>
      <Card>
        <CardHead title="Belege" sub="0 von 142 sichtbar" />
        <Table cols="120px 1fr 140px">
          <HeadRow>
            <th>Beleg</th>
            <th>Kreditor</th>
            <th style={{ textAlign: "right" }}>Betrag</th>
          </HeadRow>
        </Table>
        <div style={{ padding: "var(--space-5)" }}>
          <EmptyState
            title="Kein Beleg passt zu diesen zwei Filtern."
            description="142 Belege sind vorhanden. Setzen Sie die Filter zurück, um alle zu sehen."
          />
        </div>
      </Card>
      <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
        Zum Vergleich, wie eine gefüllte Liste aussähe:
      </p>
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
  ),
};
