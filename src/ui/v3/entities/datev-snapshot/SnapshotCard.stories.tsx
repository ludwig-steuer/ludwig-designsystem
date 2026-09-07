import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { SnapshotCard } from "./SnapshotCard";
import type { DatevSnapshot } from "./datev-snapshot";
import { Callout } from "../../primitives/Callout";
import { Card, CardHead } from "../../primitives/Table";
import { TextButton } from "../../primitives/TextButton";

const meta: Meta<typeof SnapshotCard> = {
  title: "v3/Entitäten/DATEV-Snapshot/SnapshotCard",
  component: SnapshotCard,
};
export default meta;
type Story = StoryObj<typeof SnapshotCard>;

const SNAP: DatevSnapshot = {
  asOf: "2026-08-31",
  fiscalYear: 2026,
  importedAt: "2026-09-01T06:12:00+02:00",
  baselineLevel: "journal_opos",
  contents: ["Buchungsstapel", "Offene Posten", "Sachkonten"],
  counts: { mirror_entries: 4812, open_items: 137 },
  reconcile: {
    matchedLudwig: 4520,
    matchedSplit: 88,
    matchedCorrected: 204,
    newUnprocessed: 0,
    unclear: 0,
  },
  createdBy: "import-lauf",
};

/** Stichtag, Wirtschaftsjahr, Umfang, Stückzahlen — und ein sauberer Abgleich. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <SnapshotCard snapshot={SNAP} />
    </div>
  ),
};

/**
 * Abweichungen: 41 Fremdbuchungen und 7 unklare. Der Callout nennt die Zahl,
 * die fünf Zähler darunter sagen, **welcher** Zustand wie oft vorkommt.
 */
export const WithDeviations: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <SnapshotCard
        snapshot={{
          ...SNAP,
          reconcile: {
            matchedLudwig: 4310,
            matchedSplit: 88,
            matchedCorrected: 366,
            // 1.204 offene: der Hauptsatz zählt mit `formatCount`, und ohne
            // eine vierstellige Zahl zeigte das keine Story (Wiederabnahme
            // 0027, Punkt 2).
            newUnprocessed: 1_150,
            unclear: 54,
          },
        }}
      />
    </div>
  ),
};

/**
 * Die drei Tiefen nebeneinander. Der Wert steht **roh und mono**, bis das
 * GLOSSARY Wörter dafür hat (Befund L-72) — eine Map hier wäre genau die
 * lokale Map, die R1 verbietet.
 *
 * Ein `opos`-Lauf hat keinen Abgleich: der läuft nur bei Journal-Läufen. Das
 * ist die dritte Aussage, und sie steht sichtbar da.
 */
export const Levels: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-5)",
        padding: "var(--space-6)",
      }}
    >
      <SnapshotCard
        title="Nur offene Posten"
        snapshot={{
          ...SNAP,
          baselineLevel: "opos",
          contents: ["Offene Posten"],
          counts: { open_items: 137 },
          reconcile: null,
        }}
      />
      <SnapshotCard title="Journal und OPOS" snapshot={SNAP} />
      <SnapshotCard
        title="Nur Journal"
        snapshot={{
          ...SNAP,
          baselineLevel: "journal",
          contents: ["Buchungsstapel"],
          counts: { mirror_entries: 4812 },
        }}
      />
    </div>
  ),
};

/** Kein Stand vorhanden — mit dem Ausweg, nicht als leere Fläche. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <SnapshotCard snapshot={null} onImport={() => {}} />
    </div>
  ),
};

/** Laden fehlgeschlagen: der Satz gehört dem Aufrufer, die Karte lädt nicht. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 520, padding: "var(--space-6)" }}>
      <Card>
        <CardHead title="DATEV-Stand" />
        <div style={{ padding: "var(--space-5)" }}>
          <Callout tone="danger">
            <strong>Der DATEV-Stand konnte nicht geladen werden.</strong> Die
            Spiegel-Abfrage lief in eine Zeitüberschreitung.{" "}
            <TextButton href="#erneut">Erneut versuchen</TextButton>
          </Callout>
        </div>
      </Card>
    </div>
  ),
};

/** `onOpen` und `onImport`: der Rundlauf, den die Seite verdrahtet. */
export const Interactive: Story = {
  render: function Render() {
    const [log, setLog] = useState<string[]>([]);
    const [snap, setSnap] = useState<DatevSnapshot | null>(null);
    return (
      <div style={{ maxWidth: 520, display: "grid", gap: "var(--space-4)", padding: "var(--space-6)" }}>
        <SnapshotCard
          snapshot={snap}
          onOpen={() => setLog((l) => [...l, "Spiegel geöffnet"])}
          onImport={() => {
            setSnap(SNAP);
            setLog((l) => [...l, "Import angestoßen"]);
          }}
        />
        <p className="v2sub">{log.length ? log.join(" · ") : "Noch nichts geschehen."}</p>
      </div>
    );
  },
};

/** Im Einsatz: zwei Stände nebeneinander auf der DATEV-Seite. */
export const InGrid: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "var(--space-5)",
        maxWidth: 1080,
        padding: "var(--space-6)",
      }}
    >
      <SnapshotCard title="Letzter Abzug" snapshot={SNAP} onOpen={() => {}} />
      <SnapshotCard
        title="Abzug davor"
        snapshot={{
          ...SNAP,
          asOf: "2026-07-31",
          importedAt: "2026-08-01T06:09:00+02:00",
          counts: { mirror_entries: 4390, open_items: 152 },
          reconcile: {
            matchedLudwig: 4102,
            matchedSplit: 74,
            matchedCorrected: 190,
            // Genau **eine** offene Buchung: der Satz darüber muss dann
            // „1 Buchung ist ungeklärt." heißen, nicht „1 Buchungen sind"
            // (Abnahme 0027, M2).
            newUnprocessed: 1,
            unclear: 0,
          },
        }}
        onOpen={() => {}}
      />
    </div>
  ),
};
