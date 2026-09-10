import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { TaxKeyField } from "./TaxKeyField";
import { Card, CardHead } from "../../primitives/Table";
import { Field, Input } from "../../primitives/Form";

const meta: Meta<typeof TaxKeyField> = {
  title: "v3/Entitäten/Buchungssatz/TaxKeyField",
  component: TaxKeyField,
};
export default meta;
type Story = StoryObj<typeof TaxKeyField>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 520, padding: "var(--space-6)", display: "grid", gap: "var(--space-5)" }}>
    {children}
  </div>
);

/**
 * Ein gewählter Schlüssel — und darunter **sein Satz**. Der steht seit jeher
 * im Spiegel („Ein Satz Klartext für die Anzeige") und wurde nirgends gezeigt:
 * wer „51" wählte, sah nicht, was er gewählt hatte.
 *
 * Der Schlüssel ist `mono`, weil er Ziffer für Ziffer gelesen wird. Daneben
 * ein gesperrtes Feld — eine festgeschriebene Zeile.
 */
export const Filled: Story = {
  render: () => (
    <Frame>
      <TaxKeyField value="9" onChange={() => {}} />
      <TaxKeyField value="9" onChange={() => {}} disabled />
    </Frame>
  ),
};

/**
 * `null` heißt „kein Schlüssel" und ist ein gültiger Wert — nicht jede Zeile
 * hat einen. Dann steht **kein** Erklärtext da und kein Gedankenstrich: es
 * gibt nichts zu erklären.
 */
export const Empty: Story = {
  render: () => (
    <Frame>
      <TaxKeyField value={null} onChange={() => {}} />
    </Frame>
  ),
};

/** Der Satz am Feld, wie bei jedem anderen Formularfeld. */
export const Invalid: Story = {
  render: () => (
    <Frame>
      <TaxKeyField
        value="9"
        onChange={() => {}}
        error="Dieser Schlüssel passt nicht zum Konto 6815 — die Historie trägt ihn dort nicht."
      />
    </Frame>
  ),
};

/**
 * **Durchreich-Schlüssel** stehen nur mit `allowPassThrough` in der Liste.
 * Ludwig reicht sie nur durch: keine Satz-Expansion, keine Steuerzeile, keine
 * Assistenz — und setzbar nur, wenn die Historie desselben Kontos sie trägt.
 * Das weiß allein der Aufrufer, deshalb eine Prop und keine Ableitung.
 *
 * Oben ohne, unten mit: dieselbe Liste, **drei** Einträge länger (gemessen
 * 12 gegen 15 Optionen, den Leerwert eingerechnet).
 */
export const PassThrough: Story = {
  render: () => (
    <Frame>
      <TaxKeyField value={null} onChange={() => {}} label="Ohne Durchreichen" />
      <TaxKeyField value={null} onChange={() => {}} label="Mit Durchreichen" allowPassThrough />
    </Frame>
  ),
};

/** Wählen und abwählen: der Wert geht hinaus und kommt zurück. */
export const Roundtrip: Story = {
  render: function Render() {
    const [key, setKey] = useState<string | null>("9");
    return (
      <Frame>
        <TaxKeyField value={key} onChange={setKey} />
        <p className="lw-body-sm">
          Gewählt: <strong>{key === null ? "null (kein Schlüssel)" : key}</strong>
        </p>
      </Frame>
    );
  },
};

/**
 * Im Einsatz: in der Buchungszeile neben Konto und Betrag. Der Erklärtext
 * steht unter dem Feld, wo er beim Wählen gebraucht wird — nicht als Tooltip,
 * den man erst suchen muss.
 */
export const InUse: Story = {
  render: function Render() {
    const [key, setKey] = useState<string | null>("9");
    return (
      <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
        <Card>
          <CardHead title="Buchungssatz" sub="Wartung Klimaanlage · 1.249,90 €" />
          <div
            style={{
              padding: "var(--space-5)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-5)",
            }}
          >
            <Field label="Konto" htmlFor="ie-konto">
              <Input id="ie-konto" className="v2mono" defaultValue="6815" />
            </Field>
            <TaxKeyField value={key} onChange={setKey} />
          </div>
        </Card>
      </div>
    );
  },
};
