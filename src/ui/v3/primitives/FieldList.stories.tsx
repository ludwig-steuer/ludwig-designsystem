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

/** Standardton — Label/Wert-Paare in einer Karte mit Versalien-Header. */
export const Filled: Story = {
  render: () => <FieldList title="Ludwig-Seite" rows={LUDWIG} />,
};

/**
 * `tone="soft"` tönt die Fläche. Das Design trennt damit die DATEV-Seite von
 * der Ludwig-Seite, ohne eine zweite Überschrift zu brauchen.
 */
export const SideBySideToned: Story = {
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
export const Empty: Story = {
  render: () => (
    <FieldList
      title="DATEV-Seite"
      tone="soft"
      rows={[]}
      empty="Noch nicht übertragen — die DATEV-Seite füllt sich nach Schritt 9."
    />
  ),
};

/**
 * `bare` stellt dieselben Zeilen frei: keine Fläche, kein Rahmen, kein
 * Innenabstand — für Drawer und Detail, wo die Karte schon außen herum steht.
 */
export const Bare: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
      <FieldList
        title="Stammdaten (surface)"
        rows={[
          ["Kreditor", "Bürobedarf Meier GmbH"],
          ["Personenkonto", "70021"],
          ["Zahlungsziel", "14 Tage netto"],
        ]}
      />
      <FieldList
        title="Stammdaten (bare)"
        tone="bare"
        rows={[
          ["Kreditor", "Bürobedarf Meier GmbH"],
          ["Personenkonto", "70021"],
          ["Zahlungsziel", "14 Tage netto"],
        ]}
      />
    </div>
  ),
};

/** Ohne `title` entfällt die Kopfzeile — und der Platz, wo sie stünde. */
export const BareWithoutTitle: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <FieldList
        tone="bare"
        rows={[
          ["Belegdatum", "26.08.2026"],
          ["Belegnummer", "RE-4471"],
          ["Bruttobetrag", "1.249,90 €"],
          ["Steuerschlüssel", "9 — 19 % Vorsteuer"],
        ]}
      />
    </div>
  ),
};

/**
 * `layout="row"` (0049): die Faktenzeile eines Detailkopfs. Vier kurze
 * Antworten nebeneinander, Label über Wert — untereinander würden sie den
 * Kopf doppelt so hoch machen. Das zweite Beispiel ist auf 340 px verengt und
 * zeigt den Umbruch: die Zeile bricht, sie scrollt nicht.
 */
export const FactsRow: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      <FieldList
        tone="bare"
        layout="row"
        rows={[
          ["Eröffnet", "26.08.2026"],
          ["Status", "laufend"],
          ["Personenkonto", "70044 · Bürobedarf Meier GmbH"],
          ["Geschäftspartner", "DomainFactory GmbH"],
        ]}
      />
      <div style={{ maxWidth: 340, border: "1px dashed var(--color-border)", padding: 12 }}>
        <FieldList
          tone="bare"
          layout="row"
          rows={[
            ["Eröffnet", "26.08.2026"],
            ["Status", "laufend"],
            ["Personenkonto", "70044"],
            ["Geschäftspartner", "DomainFactory GmbH"],
          ]}
        />
      </div>
    </div>
  ),
};
