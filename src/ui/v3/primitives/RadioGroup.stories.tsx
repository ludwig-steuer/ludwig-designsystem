import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "./Button";
import { Field, Input } from "./Form";
import { RadioGroup } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "v3/Primitives/Formular/RadioGroup",
  component: RadioGroup,
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

const SCOPE = [
  { value: "all", label: "Alle Sätze des Stapels", hint: "142 Sätze, auch die bereits geprüften" },
  { value: "open", label: "Nur ungeprüfte", hint: "38 Sätze" },
  { value: "flagged", label: "Nur mit Befund", hint: "3 Sätze, zwei über 1.000,00 €" },
];

/** Drei benannte Wege, alle sichtbar — dafür ist die Gruppe da. */
export const Filled: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>("open");
    return (
      <div style={{ maxWidth: 420 }}>
        <RadioGroup name="scope" label="Umfang des Exports" options={SCOPE} value={v} onChange={setV} />
      </div>
    );
  },
};

/** Senkrecht ist der Regelfall; waagerecht nur für kurze Wörter. */
export const Orientations: Story = {
  render: function Render() {
    const [a, setA] = useState<string | null>("net");
    const [b, setB] = useState<string | null>("all");
    return (
      <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 420 }}>
        <RadioGroup
          name="basis"
          label="Betragsbasis"
          orientation="horizontal"
          options={[
            { value: "net", label: "Netto" },
            { value: "gross", label: "Brutto" },
          ]}
          value={a}
          onChange={setA}
        />
        <RadioGroup
          name="scope2"
          label="Umfang, gesperrt"
          options={SCOPE}
          value={b}
          onChange={setB}
          disabled
        />
      </div>
    );
  },
};

/** Pflichtfeld ohne Wahl: der Fehler steht als Satz, nicht als roter Rahmen. */
export const Invalid: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <RadioGroup
        name="scope3"
        label="Umfang des Exports"
        required
        options={SCOPE}
        value={null}
        onChange={() => {}}
        error="Bitte wählen Sie einen Umfang, bevor der Export startet."
      />
    </div>
  ),
};

/** Rundlauf: Pfeiltasten wandern, die Auswahl steht darunter. */
export const Interactive: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-4)" }}>
        <RadioGroup name="scope4" label="Umfang des Exports" options={SCOPE} value={v} onChange={setV} />
        <div style={{ fontSize: "var(--fs-ui)", color: "var(--color-text-muted)" }}>
          Gewählt: {v ?? "noch nichts"}
        </div>
      </div>
    );
  },
};

/** Im Formular: gleicher Rhythmus wie `Field` und `Input` darüber und darunter. */
export const InForm: Story = {
  render: function Render() {
    const [v, setV] = useState<string | null>("open");
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-4)" }}>
        <Field label="Bezeichnung des Exports" htmlFor="bezeichnung-des-exports">
          <Input id="bezeichnung-des-exports" defaultValue="August 2026 — Bürobedarf" />
        </Field>
        <RadioGroup name="scope5" label="Umfang" options={SCOPE} value={v} onChange={setV} />
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="primary" size="sm">
            Export starten
          </Button>
          <Button size="sm">Abbrechen</Button>
        </div>
      </div>
    );
  },
};

/** `rows`: every option a framed row, the whole row the target — the proposed answers of rule S13 (0214); one marked „empfohlen". */
export const Rows: Story = {
  render: () => {
    const [v, setV] = useState<string | null>("b");
    return (
      <div style={{ maxWidth: 560 }}>
        <RadioGroup
          name="answer"
          label="Antwortoptionen"
          variant="rows"
          options={[
            { value: "a", label: "Bewirtung (4650)" },
            { value: "b", label: "Reisekosten (4670)", recommended: true },
            { value: "c", label: "Aufteilen: Speisen 4650, Übernachtung 4670" },
          ]}
          value={v}
          onChange={setV}
        />
      </div>
    );
  },
};

/** An option with options (owner 2026-10-27): one row with a chevron; chosen, its options unfold under it. The arrow keys run on through them — they are radios of the same name. */
export const Grouped: Story = {
  render: () => {
    const [v, setV] = useState<string | null>("next");
    return (
      <div style={{ maxWidth: 560 }}>
        <RadioGroup
          name="decision"
          label="Entscheidung"
          options={[
            { value: "next", label: "In den nächsten Zeitraum" },
            {
              value: "file",
              label: "Ablegen ohne Buchung",
              options: [
                { value: "annual", label: "Jahresabschluss", hint: "Für den Jahresabschluss abgelegt." },
                { value: "permanent", label: "Dauerakte", hint: "Bleibt dauerhaft abgelegt, z. B. Vertrag oder Kontoauszug.", recommended: true },
                { value: "irrelevant", label: "Irrelevant", hint: "Nicht aufzubewahren, z. B. Werbung." },
              ],
            },
            { value: "client", label: "Beim Mandanten klären" },
          ]}
          value={v}
          onChange={setV}
        />
        <p className="lw-ui-hint">Gewählt: {v ?? "—"}</p>
      </div>
    );
  },
};
