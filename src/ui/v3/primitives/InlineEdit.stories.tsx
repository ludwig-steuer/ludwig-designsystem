import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Textarea } from "./Form";
import { InlineEdit } from "./InlineEdit";
import { Card, CardHead } from "./Table";

const meta: Meta<typeof InlineEdit> = {
  title: "v3/Primitives/Formular/InlineEdit",
  component: InlineEdit,
};
export default meta;
type Story = StoryObj<typeof InlineEdit>;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Anzeige mit Wert und Weg hinein; gesperrt zeigt nur den Wert. */
export const Filled: Story = {
  render: function Render() {
    const [v, setV] = useState("Bürobedarf, Sammelrechnung August");
    return (
      <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 460 }}>
        <InlineEdit label="Zusammenfassung" value={v} onSave={async (n) => setV(n)} />
        <InlineEdit label="Belegart (gesperrt)" value="Eingangsrechnung" onSave={async () => {}} disabled />
      </div>
    );
  },
};

/** Ohne Wert steht „—" — der Weg hinein heißt trotzdem „Bearbeiten". */
export const Empty: Story = {
  render: function Render() {
    const [v, setV] = useState("");
    return (
      <div style={{ maxWidth: 460 }}>
        <InlineEdit label="Zusammenfassung" value={v} onSave={async (n) => setV(n)} />
      </div>
    );
  },
};

/** Während des Speicherns gesperrt, der Knopf trägt ein Wort. */
export const Pending: Story = {
  render: function Render() {
    const [v, setV] = useState("Bürobedarf, Sammelrechnung August");
    return (
      <div style={{ maxWidth: 460 }}>
        <InlineEdit
          label="Zusammenfassung"
          value={v}
          onSave={async (n) => {
            await wait(3000);
            setV(n);
          }}
        />
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
          Bearbeiten, ändern, Enter — das Speichern dauert hier drei Sekunden.
        </p>
      </div>
    );
  },
};

/** Nach einem Fehler steht der getippte Text noch da. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <InlineEdit
        label="Zusammenfassung"
        value="Bürobedarf, Sammelrechnung August"
        onSave={async () => {
          await wait(500);
          throw new globalThis.Error("Der Sachverhalt ist gesperrt, solange der Stapel läuft.");
        }}
      />
    </div>
  ),
};

/** Rundlauf: klicken, ändern, Enter — der neue Wert steht. */
export const Interactive: Story = {
  render: function Render() {
    const [v, setV] = useState("Eingangsrechnung");
    const [saves, setSaves] = useState(0);
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 460 }}>
        <InlineEdit
          label="Belegart"
          value={v}
          onSave={async (n) => {
            await wait(300);
            setV(n);
            setSaves((s) => s + 1);
          }}
        />
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {saves === 0 ? "noch nicht gespeichert" : `${saves}× gespeichert`}
        </div>
      </div>
    );
  },
};

/** Mehrzeilig in der Karte: Strg+Enter speichert, Enter macht eine Zeile. */
export const WithTextarea: Story = {
  render: function Render() {
    const [v, setV] = useState(
      "Sammelrechnung über Schreibwaren und zwei Druckerpatronen.\nDie Lieferung kam in zwei Paketen.",
    );
    return (
      <div style={{ maxWidth: 520 }}>
        <Card>
          <CardHead title="RE-4471 · Bürobedarf Meier GmbH" />
          <div style={{ padding: "var(--space-5)" }}>
            <InlineEdit
              label="Zusammenfassung"
              value={v}
              multiline
              onSave={async (n) => {
                await wait(300);
                setV(n);
              }}
              renderValue={(text) => (
                <span style={{ whiteSpace: "pre-line" }}>{text || "—"}</span>
              )}
              renderInput={({ value, onChange, autoFocus, onKeyDown }) => (
                <Textarea
                  value={value}
                  autoFocus={autoFocus}
                  onKeyDown={onKeyDown}
                  onChange={(e) => onChange(e.target.value)}
                  rows={3}
                />
              )}
            />
          </div>
        </Card>
      </div>
    );
  },
};
