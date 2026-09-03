import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "./Combobox";
import { Card, CardHead } from "./Table";

const meta: Meta<typeof Combobox> = {
  title: "v3/Primitives/Formular/Combobox",
  component: Combobox,
};
export default meta;
type Story = StoryObj<typeof Combobox>;

const ACCOUNTS: ComboboxOption[] = [
  { value: "6815", label: "6815 · Bürobedarf", hint: "14× in sechs Monaten", group: "Zuletzt gebucht" },
  { value: "6805", label: "6805 · Telefon", hint: "6× in sechs Monaten", group: "Zuletzt gebucht" },
  { value: "6320", label: "6320 · Miete Geschäftsräume", group: "Vorschlag des Agenten" },
  { value: "4980", label: "4980 · Sonstiger Betriebsbedarf", group: "Vorschlag des Agenten" },
  { value: "1200", label: "1200 · Bank", group: "Alle Konten" },
  { value: "1600", label: "1600 · Verbindlichkeiten", group: "Alle Konten" },
  { value: "1371", label: "1371 · Klärungskonto", group: "Alle Konten" },
];

/** Gefüllt: gewählter Wert im Feld, Gruppen in der Liste. */
export const Filled: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>("6815");
    return (
      <div style={{ maxWidth: 420 }}>
        <Combobox
          label="Gegenkonto"
          name="konto"
          value={v}
          onChange={setV}
          options={ACCOUNTS}
          placeholder="Nummer oder Name"
          hint="Rücktaste im leeren Feld leert die Auswahl."
        />
      </div>
    );
  },
};

/** Leer: noch nichts gewählt, alle Optionen stehen bereit. */
export const Empty: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 420 }}>
        <Combobox label="Gegenkonto" name="konto2" value={v} onChange={setV} options={ACCOUNTS} />
      </div>
    );
  },
};

/** Kein Treffer ist kein Fehler — der Text sagt, was hilft. */
export const NoMatch: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 420 }}>
        <Combobox
          label="Gegenkonto"
          name="konto3"
          value={v}
          onChange={setV}
          options={[]}
          emptyText="Kein Treffer — Suchbegriff kürzen."
        />
      </div>
    );
  },
};

/** Serverseitige Suche: `onSearch` statt lokalem Filtern, mit Ladezustand. */
export const ServerSearch: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [opts, setOpts] = useState<ComboboxOption[]>(ACCOUNTS);
    return (
      <div style={{ maxWidth: 420 }}>
        <Combobox
          label="Kreditor"
          name="kreditor"
          value={v}
          onChange={setV}
          options={opts}
          loading={loading}
          onSearch={(q) => {
            setLoading(true);
            setTimeout(() => {
              setOpts(ACCOUNTS.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())));
              setLoading(false);
            }, 400);
          }}
        />
      </div>
    );
  },
};

/** Lädt: die Liste sagt es, statt leer zu wirken. */
export const Loading: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 420 }}>
        <Combobox
          label="Gegenkonto"
          name="konto4"
          value={v}
          onChange={setV}
          options={[]}
          loading
          onSearch={() => {}}
        />
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
          Ins Feld klicken — die Liste zeigt „Suche läuft …".
        </p>
      </div>
    );
  },
};

/** Fehler steht als Text am Feld, nicht nur als roter Rahmen. */
export const Invalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 420 }}>
      <Combobox
        label="Gegenkonto"
        name="konto5"
        value={null}
        onChange={() => {}}
        options={ACCOUNTS}
        error="Ohne Gegenkonto lässt sich der Satz nicht buchen."
      />
      <Combobox
        label="Gegenkonto, gesperrt"
        name="konto6"
        value="6815"
        onChange={() => {}}
        options={ACCOUNTS}
        disabled
      />
    </div>
  ),
};

/** Rundlauf: tippen, Pfeiltaste, Enter — die Auswahl steht darunter. */
export const Interactive: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-4)" }}>
        <Combobox label="Gegenkonto" name="konto7" value={v} onChange={setV} options={ACCOUNTS} />
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          Gewählt: {v ?? "nichts"}
        </div>
      </div>
    );
  },
};

/** Im Einsatz: zwei Felder in einer Karte, wie im Buchungseditor. */
export const InUse: Story = {
  render: function Render() {
    const [soll, setSoll] = useState<string | null>("6815");
    const [haben, setHaben] = useState<string | null>("70021");
    return (
      <div style={{ maxWidth: 520 }}>
        <Card>
          <CardHead title="RE-4471 · Bürobedarf Meier GmbH" sub="1.249,90 €" />
          <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-4)" }}>
            <Combobox label="Sollkonto" name="soll" value={soll} onChange={setSoll} options={ACCOUNTS} />
            <Combobox
              label="Habenkonto"
              name="haben"
              value={haben}
              onChange={setHaben}
              options={[
                { value: "70021", label: "70021 · Bürobedarf Meier GmbH", group: "Personenkonten" },
                { value: "70044", label: "70044 · Stadtwerke Musterstadt", group: "Personenkonten" },
              ]}
            />
          </div>
        </Card>
      </div>
    );
  },
};
