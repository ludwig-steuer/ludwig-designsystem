import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";
import { DateField, DateRangeField } from "./DateField";
import { Field, Input, Select } from "./Form";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof FilterBar> = {
  title: "v3/Primitives/Navigation/FilterBar",
  component: FilterBar,
};
export default meta;
type Story = StoryObj<typeof FilterBar>;

const CreditorFilter = () => (
  <Field label="Kreditor" htmlFor="kreditor">
    <Select id="kreditor" defaultValue="">
      <option value="">Alle</option>
      <option value="meier">Bürobedarf Meier GmbH</option>
      <option value="stadtwerke">Stadtwerke Musterstadt</option>
    </Select>
  </Field>
);

/**
 * The span runs through `DateRangeField` (0024), not through two raw
 * `<input type="date">` — that is the replacement the task promised, and the
 * bar is where it is used.
 */
const PeriodFilter = () => {
  const [from, setFrom] = useState<string | null>("2026-08-01");
  const [to, setTo] = useState<string | null>("2026-08-31");
  return (
    <Field label="Belegdatum" htmlFor="belegdatum">
      <DateRangeField id="belegdatum"
        from={from}
        to={to}
        onChange={(f, t) => {
          setFrom(f);
          setTo(t);
        }}
      />
    </Field>
  );
};

/** Ruhezustand: drei Felder, nichts gesetzt, kein Zurücksetzen. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar>
        <CreditorFilter />
        <PeriodFilter />
        <Field label="Suche" htmlFor="suche">
          <Input id="suche" type="search" placeholder="Beleg oder Text" />
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
          <CreditorFilter />
          <PeriodFilter />
          <Field label="Suche" htmlFor="suche-2">
            <Input id="suche-2" type="search" defaultValue="Bürobedarf" />
          </Field>
        </FilterBar>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {n === 0 ? "Alles sichtbar." : `${n} Filter wirken.`}
        </p>
      </div>
    );
  },
};

/**
 * **Ohne eine Zeile Client-Code.** `method="get"` schreibt die Felder in die
 * Query, `submitLabel` rendert einen gewöhnlichen `type="submit"`, `resetHref`
 * ist die Link-Fassung von `onReset` — und weder `FilterBar` noch `Field`,
 * `Input` oder `Select` sind Client-Komponenten.
 *
 * Die Story stand hier schon, sagte aber nur `<form>`; damit war der Fall
 * nicht als das erkennbar, was er ist. Eine Seite, die stattdessen ihr eigenes
 * `inputStyle` baut, vermisst keinen Baustein (Befund der DATEV-Seite,
 * 2026-09-08).
 */
export const ServerForm: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <form method="get">
        <FilterBar activeCount={2} resetHref="#" submitLabel="Filtern">
          <CreditorFilter />
          <PeriodFilter />
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
        <CreditorFilter />
        <PeriodFilter />
        <Field label="Fälligkeit" htmlFor="falligkeit">
          <DateField id="falligkeit" value="2026-09-15" onChange={() => {}} />
        </Field>
        <Field label="Konto" htmlFor="konto">
          <Input id="konto" defaultValue="6815" style={{ width: 100 }} />
        </Field>
        <Field label="Betrag ab" htmlFor="betrag-ab">
          <Input id="betrag-ab" defaultValue="100,00" style={{ width: 100 }} />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" defaultValue="">
            <option value="">Alle</option>
            <option value="offen">Offen</option>
          </Select>
        </Field>
        <Field label="Suche" htmlFor="suche-3">
          <Input id="suche-3" type="search" placeholder="Beleg oder Text" />
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
        <CreditorFilter />
        <PeriodFilter />
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
