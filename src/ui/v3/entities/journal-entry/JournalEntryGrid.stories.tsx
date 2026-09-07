import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { JournalEntryGrid } from "./JournalEntryGrid";
import type { JournalRow } from "./journal-entry";
import { Card, CardHead } from "../../primitives/Table";
import { CaseDetailView } from "../accounting-case/CaseDetailView";
import { EntityHeader } from "../../patterns/EntityHeader";
import { Tabs } from "../../primitives/Nav";
import { EntityIcon } from "../../Icons";

const meta: Meta<typeof JournalEntryGrid> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryGrid",
  component: JournalEntryGrid,
};
export default meta;
type Story = StoryObj<typeof JournalEntryGrid>;

const ROW = (over: Partial<JournalRow> & { id: string }): JournalRow => ({
  datum: "26.08.2026",
  umsatz: "1.000,00",
  side: "S",
  bu: "9",
  konto: "6815",
  kontoName: "Bürobedarf",
  beleg1: "RE-4471",
  text: "Bürobedarf Meier GmbH",
  ...over,
});

const ROWS: JournalRow[] = [
  ROW({ id: "r1" }),
  ROW({
    id: "r2",
    umsatz: "475,60",
    konto: "6845",
    kontoName: "EDV-Zubehör",
    text: "Toner",
    beleg2: "LS-9912",
    kost1: "K-100",
  }),
];

const CONTRA = { konto: "70044", name: "Bürobedarf Meier GmbH", tag: "Kreditor" };

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1180 }}>
      <Card>
        <CardHead title="Buchungssatz" sub={sub ?? "gebucht am 26.08.2026"} />
        <div style={{ padding: "var(--space-4)" }}>{children}</div>
      </Card>
    </div>
  );
}

/** Der Normalfall: sechs Spalten, das Gegenkonto darunter. */
export const Simple: Story = {
  render: () => (
    <Frame>
      <JournalEntryGrid
        rows={ROWS}
        status="posted"
        contraAccount={CONTRA}
        documentNumber="RE-4471"
        documentAmount={1475.6}
      />
    </Frame>
  ),
};

/**
 * `mode="voll"` — elf Spalten, und der Umschalter ist ein **Link**: der Modus
 * gehört zur Adresse, nicht zum Zustand. Ohne `modeHref` gibt es ihn nicht,
 * und damit auch keine gedruckte Taste ohne Wirkung (V14).
 */
export const Full: Story = {
  render: () => (
    <Frame sub="volle Sicht">
      <JournalEntryGrid
        rows={ROWS}
        status="posted"
        mode="voll"
        modeHref={{ einfach: "?sicht=einfach", voll: "?sicht=voll" }}
        contraAccount={CONTRA}
        documentNumber="RE-4471"
        documentAmount={1475.6}
      />
    </Frame>
  ),
};

/**
 * Die Klappe „Journal (wird gespeichert)" in der DATEV-Stapelordnung: Konto ·
 * Kontoname · Buchungstext · Soll · Haben. Sie ist ein `<details>` und
 * funktioniert ohne JavaScript; die Summe steht in der Kopfzeile, damit sie
 * auch zugeklappt sichtbar ist.
 */
export const WithJournal: Story = {
  render: () => (
    <Frame>
      <JournalEntryGrid
        rows={ROWS}
        status="posted"
        journal
        contraAccount={CONTRA}
        documentNumber="RE-4471"
        documentAmount={1475.6}
      />
    </Frame>
  ),
};

/** `onOpenLedger` je Zeile — als `ActionIcon`, nicht als Unicode-Zeichen. */
export const WithLedgerLink: Story = {
  render: () => (
    <Frame>
      <JournalEntryGrid
        rows={ROWS}
        status="accepted"
        contraAccount={CONTRA}
        documentNumber="RE-4471"
        documentAmount={1475.6}
        onOpenLedger={() => {}}
      />
    </Frame>
  ),
};

/**
 * Fehler, Warnung und Hinweis nebeneinander — **ohne** Beheben-Knopf: hier
 * gibt es nichts zu beheben. Wer die Zeile ändern will, öffnet den Editor.
 */
export const WithMessages: Story = {
  render: () => (
    <Frame sub="Vorschlag, mit Befunden">
      <JournalEntryGrid
        rows={ROWS}
        status="proposed"
        contraAccount={CONTRA}
        documentNumber="RE-4471"
        documentAmount={1600}
        messages={{
          errors: [{ code: "E-SUMME", message: "Der Rest geht nicht auf null." }],
          warnings: [{ code: "P-BELEG", message: "Belegfeld 1 ist in den Zeilen verschieden." }],
          hints: [{ code: "H-KOST", message: "Ohne Kostenstelle — für dieses Konto üblich." }],
        }}
      />
    </Frame>
  ),
};

/**
 * Ohne Zeilen. Die Spec führt das als **nicht anwendbar** — ein Satz ohne
 * Zeile ist kein Zustand des Rasters, sondern ein Fehler des Aufrufers. Genau
 * deshalb steht der Fall hier: er soll sichtbar abgefangen sein.
 */
export const Empty: Story = {
  render: () => (
    <Frame sub="ohne Zeilen">
      <JournalEntryGrid rows={[]} status="proposed" documentNumber="RE-4471" />
    </Frame>
  ),
};

/**
 * Die Ränder: ein Kontoname an der Grenze, ein negativer Betrag, sechs Zeilen
 * — und ein Satz, dessen Rest **nicht** aufgeht.
 */
export const Edges: Story = {
  render: () => (
    <Frame sub="Randfälle">
      <JournalEntryGrid
        rows={[
          ROW({
            id: "e1",
            kontoName: "Reparaturen und Instandhaltung von Betriebs- und Geschäftsausstattung",
            umsatz: "12.480,55",
          }),
          ROW({ id: "e2", umsatz: "-240,00", text: "Gutschrift Teillieferung", bu: "" }),
          ROW({ id: "e3", umsatz: "0,00", text: "Nullzeile aus dem Import", konto: "6800", kontoName: "" }),
          ...ROWS.map((r) => ({ ...r, id: `${r.id}-b` })),
        ]}
        status="proposed"
        mode="voll"
        modeHref={{ einfach: "?sicht=einfach", voll: "?sicht=voll" }}
        contraAccount={CONTRA}
        documentNumber="RE-4471"
        documentAmount={1475.6}
        journal
      />
    </Frame>
  ),
};

/** Im Einsatz: im Sachverhalt, wo das Raster gelesen und nicht bearbeitet wird. */
export const InUse: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1180 }}>
      <CaseDetailView
        header={
          <EntityHeader
            icon={<EntityIcon entity="journal-entry" size={20} />}
            overline="Sachverhalt · Musterbau GmbH"
            title="Bürobedarf Meier GmbH"
            meta="RE-4471 · 1.475,60 €"
          />
        }
        tabs={
          <Tabs
            items={[
              { key: "buchung", label: "Buchung" },
              { key: "beleg", label: "Beleg" },
            ]}
            active="buchung"
            ariaLabel="Ansichten des Sachverhalts"
          />
        }
      >
        <Card>
          <CardHead title="Buchungssatz" sub="gebucht am 26.08.2026" />
          <div style={{ padding: "var(--space-4)" }}>
            <JournalEntryGrid
              rows={ROWS}
              status="posted"
              contraAccount={CONTRA}
              documentNumber="RE-4471"
              documentAmount={1475.6}
              journal
            />
          </div>
        </Card>
      </CaseDetailView>
    </div>
  ),
};
