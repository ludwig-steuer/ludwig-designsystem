import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FieldList } from "./FieldList";

const meta: Meta<typeof FieldList> = { title: "v3/Primitives/Fläche/FieldList", component: FieldList };
export default meta;
type Story = StoryObj<typeof FieldList>;

const LUDWIG: [string, string][] = [
  ["Periode", "08/2026"],
  ["Sätze", "118"],
  ["Summe Soll", "42.108,55 €"],
  ["Summe Haben", "42.108,55 €"],
  ["Beraternummer", "10160"],
  ["Weg", "DATEVconnect"],
];

/** Standardton — Label/Wert-Paare in einer Karte mit Versalien-Kopf. */
export const Gefuellt: Story = {
  render: () => <FieldList title="Ludwig-Seite" rows={LUDWIG} />,
};

/**
 * `tone="soft"` tönt die Fläche. Das Design trennt damit die DATEV-Seite von
 * der Ludwig-Seite, ohne eine zweite Überschrift zu brauchen.
 */
export const NebeneinanderMitTon: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <FieldList title="Ludwig-Seite" rows={LUDWIG} />
      <FieldList
        title="DATEV-Seite"
        tone="soft"
        rows={[
          ["Stapel", "2026-08-001"],
          ["Sätze", "118"],
          ["Übernommen", "26.08., 09:40"],
        ]}
      />
    </div>
  ),
};

/** Leer heißt: gesagt bekommen, warum. Nicht eine Karte ohne Inhalt. */
export const Leer: Story = {
  render: () => (
    <FieldList
      title="DATEV-Seite"
      tone="soft"
      rows={[]}
      empty="Noch nicht übertragen — die DATEV-Seite füllt sich nach Schritt 9."
    />
  ),
};
