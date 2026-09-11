import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Tabs } from "./Nav";

const meta: Meta<typeof Tabs> = { title: "v3/Primitives/Navigation/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

function Demo({ items }: { items: React.ComponentProps<typeof Tabs>["items"] }) {
  const [active, setActive] = useState(items[0]?.key ?? "");
  return <Tabs items={items} active={active} ariaLabel="Sicht" onPick={setActive} />;
}

/** Zähler stehen gedämpft am Reiter — sie sind Beiwerk, nicht Überschrift. */
export const WithCounters: Story = {
  render: () => (
    <Demo
      items={[
        { key: "alle", label: "Alle", count: 118 },
        { key: "offen", label: "Offen", count: 12 },
        { key: "in_transit", label: "Unterwegs", count: 3 },
        { key: "datev", label: "In DATEV", count: 103 },
      ]}
    />
  ),
};

/** `alarm` färbt den Zähler rot und macht ihn fett — nur bei echtem Rückstand. */
export const WithAlarm: Story = {
  render: () => (
    <Demo
      items={[
        { key: "alle", label: "Alle", count: 118 },
        { key: "offen", label: "Offen", count: 12, alarm: true },
        { key: "erledigt", label: "Erledigt", count: 106 },
      ]}
    />
  ),
};

/** Ohne Zähler — wenn die Menge nichts aussagt (Detail-Reiter). */
export const WithoutCounters: Story = {
  render: () => (
    <Demo
      items={[
        { key: "u", label: "Übersicht" },
        { key: "d", label: "Durchgänge" },
        { key: "b", label: "Buchungen" },
        { key: "a", label: "Artefakte" },
        { key: "x", label: "DATEV" },
        { key: "l", label: "Log" },
      ]}
    />
  ),
};

/** Alles leer: der Zähler zeigt die Null, statt zu verschwinden. */
export const AllEmpty: Story = {
  render: () => (
    <Demo
      items={[
        { key: "alle", label: "Alle", count: 0 },
        { key: "offen", label: "Offen", count: 0 },
      ]}
    />
  ),
};

/**
 * `dot` (0049): „da, aber nicht zählbar". Der Reiter „Saldo & Konten" hat
 * keinen Zähler — ein Saldo ist keine Menge —, soll aber sagen, dass etwas
 * drinsteht. Der letzte Reiter zeigt die Regel: steht auch `count`, gewinnt
 * die Zahl. Zweimal dasselbe zu sagen hilft niemandem.
 */
export const TabsWithDot: Story = {
  render: () => (
    <Demo
      items={[
        { key: "overview", label: "Übersicht" },
        { key: "clarifications", label: "Rückfragen", count: 2, alarm: true },
        { key: "saldo", label: "Saldo & Konten", dot: true },
        { key: "plausi", label: "Plausibilität", dot: true, alarm: true },
        { key: "historie", label: "Historie", count: 12, dot: true },
      ]}
    />
  ),
};

/**
 * `quiet` (0136): der Reiter auf der **Debug-Stufe**. Gebaut für „Rohdaten",
 * den letzten Reiter jeder Detailseite (D12) — für alle sichtbar, ohne Zähler,
 * ohne Alarm, und optisch zurückgenommen.
 *
 * Sichtbarkeit ist nicht Prominenz: ein Reiter, der aussieht wie „Positionen",
 * behauptet, er sei so wichtig wie „Positionen".
 *
 * **Gedämpft ist nur die Ruhefarbe.** Hover, Fokus und der aktive Zustand sind
 * zeichengleich mit einem normalen Reiter — die zweite Leiste unten zeigt
 * „Rohdaten" aktiv, und dort ist nichts leise. Ein leiser aktiver Reiter
 * machte die Leiste zweideutig: welcher ist offen?
 *
 * Der Farbwert ist `--color-text-subtle` und **nicht** `--color-text-muted`:
 * auf dem liegt die Ruhefarbe eines normalen Reiters bereits, die Prop wäre
 * wirkungslos gewesen. Es ist die einzige Stufe darunter, die mit 4,88:1 noch
 * über der AA-Grenze bleibt.
 *
 * `quiet` schließt `count`, `dot` und `alarm` aus — im **Typ**, nicht im Text.
 * Diese Zeile wäre ein Typfehler:
 * `{ key: "roh", label: "Rohdaten", quiet: true, count: 3 }`
 */
export const Quiet: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 28 }}>
      <Demo
        items={[
          { key: "overview", label: "Übersicht" },
          { key: "details", label: "Details" },
          { key: "lines", label: "Positionen", count: 14 },
          { key: "input_tax", label: "Vorsteuer", count: 2, alarm: true },
          { key: "timeline", label: "Verlauf" },
          { key: "roh", label: "Rohdaten", quiet: true },
        ]}
      />
      <Tabs
        ariaLabel="Beleg mit aktiven Rohdaten"
        active="roh"
        items={[
          { key: "overview", label: "Übersicht" },
          { key: "details", label: "Details" },
          { key: "lines", label: "Positionen", count: 14 },
          { key: "input_tax", label: "Vorsteuer", count: 2, alarm: true },
          { key: "timeline", label: "Verlauf" },
          { key: "roh", label: "Rohdaten", quiet: true },
        ]}
      />
    </div>
  ),
};
