import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountInput, parseAmount } from "./AmountInput";

const meta: Meta<typeof AmountInput> = {
  title: "v3/Primitives/Formular/AmountInput",
  component: AmountInput,
};
export default meta;
type Story = StoryObj<typeof AmountInput>;

/** Ziffern rechts, tabellarisch, zwei Nachkommastellen — wie in der Zelle. */
export const Filled: Story = {
  render: function Render() {
    const [a, setA] = useState<number | null>(1249.9);
    const [b, setB] = useState<number | null>(84.5);
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 260 }}>
        <AmountInput label="Bruttobetrag" value={a} onChange={setA} />
        <AmountInput label="Skonto" value={b} onChange={setB} size="sm" />
      </div>
    );
  },
};

/** Leer heißt leer. Kein „0,00 €" als Platzhalter — das wäre eine Aussage. */
export const Empty: Story = {
  render: function Render() {
    const [v, setV] = useState<number | null>(null);
    return (
      <div style={{ maxWidth: 260 }}>
        <AmountInput label="Bruttobetrag" value={v} onChange={setV} />
      </div>
    );
  },
};

/**
 * Unlesbares bleibt stehen und wird benannt — es wird nie still auf 0 gesetzt.
 * Tippen Sie „12,3,4" und verlassen Sie das Feld.
 */
export const Invalid: Story = {
  render: function Render() {
    const [v, setV] = useState<number | null>(null);
    return (
      <div style={{ maxWidth: 320, display: "grid", gap: "var(--space-4)" }}>
        <AmountInput label="Bruttobetrag" value={v} onChange={setV} required />
        <AmountInput
          label="Bruttobetrag, Fehler von außen"
          value={null}
          onChange={() => {}}
          error="Der Betrag weicht um mehr als 1,00 € vom Beleg ab."
        />
      </div>
    );
  },
};

/** Minus ist ein Zeichen, kein Alarm — Vorzeichen bekommen keine Farbe (V6). */
export const Signs: Story = {
  render: function Render() {
    const [v, setV] = useState<number | null>(-312.4);
    return (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 260 }}>
        <AmountInput label="Korrekturbetrag" value={v} onChange={setV} allowNegative />
        <AmountInput label="Nur positiv — versuchen Sie −5" value={null} onChange={() => {}} />
        <AmountInput label="Gesperrt" value={1800} onChange={() => {}} disabled />
      </div>
    );
  },
};

/**
 * Rundlauf und zugleich die Leseprobe: dieselbe Zahl in vier Schreibweisen.
 * Was `parseAmount` daraus macht, steht daneben — bricht die Regel, bricht
 * diese Tabelle.
 */
export const Interactive: Story = {
  render: function Render() {
    const [v, setV] = useState<number | null>(null);
    const cases = ["1.234,56", "1234,56", "1234.56", "1 234,56", "1.234", "12,3,4", ""];
    return (
      <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 420 }}>
        <AmountInput label="Bruttobetrag" value={v} onChange={setV} />
        <div style={{ fontSize: 13 }}>
          Gespeicherter Wert: <strong>{v === null ? "null (leer)" : v}</strong>
        </div>
        <table style={{ fontSize: 12.5, borderCollapse: "collapse" }}>
          <tbody>
            {cases.map((c) => {
              const r = parseAmount(c);
              return (
                <tr key={c || "leer"}>
                  <td style={{ padding: "2px 12px 2px 0", fontFamily: "var(--font-mono)" }}>
                    {c === "" ? "(leer)" : c}
                  </td>
                  <td style={{ padding: "2px 0", color: "var(--color-text-muted)" }}>
                    {r === "invalid" ? "nicht lesbar" : r === null ? "null" : r}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },
};

/** Im Editor: zwei Felder nebeneinander, die Ziffern fluchten. */
export const InEditor: Story = {
  render: function Render() {
    const [debit, setDebit] = useState<number | null>(1249.9);
    const [credit, setCredit] = useState<number | null>(1249.9);
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4)",
          maxWidth: 420,
          padding: "var(--space-4)",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          background: "var(--color-surface)",
        }}
      >
        <AmountInput label="Soll" value={debit} onChange={setDebit} size="sm" />
        <AmountInput label="Haben" value={credit} onChange={setCredit} size="sm" />
      </div>
    );
  },
};
