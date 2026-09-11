import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { FieldList, FieldProse } from "./FieldList";

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

/** Standardton — Label/Wert-Paare in einer Karte mit Abschnittskopf. */
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

/**
 * `split` — zwei Spalten Paare, sobald die **Liste** breit genug ist.
 *
 * Die Bedingung hängt an ihr, nicht am Fenster: unten steht dieselbe Liste in
 * 360 px und bleibt einspaltig, obwohl das Fenster breit ist. Ohne `split`
 * liegen bei 1100 px Etikett und Wert 900 px auseinander — der Blick muss
 * die Zeile queren, um ein Paar zu lesen.
 */
export const Split: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      <FieldList title="Zweispaltig ab 640 px" rows={[...LUDWIG, ...LUDWIG]} split />
      <FieldList title="Ohne split — dieselben Zeilen" rows={[...LUDWIG, ...LUDWIG]} />
      <div style={{ maxWidth: 360 }}>
        <FieldList title="Zu schmal — bleibt einspaltig" rows={LUDWIG} split />
      </div>
    </div>
  ),
};

const DERIVATION: [string, string][] = [
  ["Herkunft", "Vom Agenten vorgeschlagen, 31.07.2026"],
  ["Regel", "Konto nach der Präzedenz dieses Lieferanten."],
  [
    "Begründung",
    "Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni; das Kontoblatt zeigt für Juli keine Bewegung, die Rechnung war also noch nicht erfasst.",
  ],
];

/**
 * `values="prose"`: the same rows as data and as prose, side by side. As data
 * the sentences hang on the right edge in bold; as prose they read left, in
 * normal weight, and start on one line because one label column serves all
 * rows.
 */
export const Prose: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <FieldList title="Als Daten" rows={DERIVATION} />
      <FieldList title="Als Prosa" rows={DERIVATION} values="prose" />
    </div>
  ),
};

/**
 * `FieldProse`: one sentence among ordinary values. Only its row changes — the
 * sentence reads left and takes the rest of the row, the neighbours stay
 * right-aligned. Below, the same list at 360 px: the sentence wraps.
 */
export const ProseRow: Story = {
  render: () => {
    const rows: [string, ReactNode][] = [
      ["DATEV-Historie", "abgeglichen"],
      ["Sachverhalt", <FieldProse key="n">Diese Zahlung ist noch keinem Sachverhalt zugeordnet.</FieldProse>],
      ["Betrag", "1.249,90 €"],
    ];
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <FieldList title="Zuordnung" rows={rows} />
        <div style={{ maxWidth: 360 }}>
          <FieldList title="Zuordnung, 360 px" rows={rows} />
        </div>
      </div>
    );
  },
};
