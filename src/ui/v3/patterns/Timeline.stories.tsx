import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "../primitives/Cells";
import { FieldList } from "../primitives/FieldList";
import { Card, CardHead } from "../primitives/Table";
import { Timeline, type TimelineItem } from "./Timeline";

const meta: Meta<typeof Timeline> = { title: "v3/Patterns/Prozess/Timeline", component: Timeline };
export default meta;
type Story = StoryObj<typeof Timeline>;

/** Bewusst unsortiert übergeben — die Komponente sortiert. */
const CASE: TimelineItem[] = [
  {
    id: "e3",
    at: "2026-08-30T09:12:00Z",
    kind: "Buchungsvorschlag",
    actor: "Agent",
    title: "6815 an 70021 · 1.249,90 € vorgeschlagen",
    state: "edited",
    right: <AmountCell value={1249.9} />,
    detail:
      "Der Kreditor wurde in sechs Monaten 14-mal auf 6815 gebucht; die Rechnung nennt Schreibwaren.",
  },
  {
    id: "e1",
    at: "2026-08-26T07:40:00Z",
    kind: "Beleg",
    actor: "Mandant",
    title: "RE-4471 im Posteingang angekommen",
    state: "done",
  },
  {
    id: "e4",
    at: "2026-08-31T14:02:00Z",
    kind: "Rückfrage",
    actor: "Kanzlei",
    title: "Ist das Bewirtung oder Bürobedarf?",
    state: "question",
  },
  {
    id: "e2",
    at: "2026-08-29T11:05:00Z",
    kind: "Zahlung",
    actor: "System",
    title: "Zahlung 1.249,90 € dem Beleg zugeordnet",
    state: "done",
    right: <AmountCell value={1249.9} />,
  },
];

/** Ein Sachverhalt über eine Woche, alle Ereignisarten. */
export const Gefuellt: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline entries={CASE} />
    </div>
  ),
};

/**
 * `kind` kommt als Schlüssel aus den Daten; das deutsche Wort dazu gibt der
 * Aufrufer. Solange `src/ludwig/` keinen Ereignistyp führt, erfindet die
 * Komponente keine Vokabeln (Befund in der Spec).
 */
export const MitLabels: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline
        entries={CASE.map((e) => ({
          ...e,
          kind: e.kind
            ? ({
                Beleg: "document_received",
                Zahlung: "payment_in",
                Rückfrage: "clarification",
                Buchungsvorschlag: "booking_proposed",
              }[e.kind] ?? e.kind)
            : undefined,
        }))}
        kindLabels={{
          document_received: "Beleg",
          payment_in: "Zahlung",
          clarification: "Rückfrage",
          booking_proposed: "Buchungsvorschlag",
        }}
      />
    </div>
  ),
};

/** Nichts geschehen ist eine Aussage, kein leerer Kasten. */
export const Leer: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline entries={[]} />
    </div>
  ),
};

/** Lädt: der Platz bleibt, nichts springt. */
export const Laedt: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline entries={[]} loading />
    </div>
  ),
};

/** Am Sachverhalt zählt das Letzte, im Audit der Anfang. */
export const Reihenfolge: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>newest (Default)</div>
        <Timeline entries={CASE} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>oldest</div>
        <Timeline entries={CASE} order="oldest" />
      </div>
    </div>
  ),
};

/** Tag, Monat oder gar nicht — ohne Gruppe trägt jede Zeile ihr Datum. */
export const Gruppierung: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)", maxWidth: 620 }}>
      <Timeline entries={CASE} groupBy="month" />
      <Timeline entries={CASE} groupBy="none" />
    </div>
  ),
};

/** Ohne `onOpen` ist der Verlauf Text; mit ihm wird jeder Eintrag ein Weg. */
export const Interaktiv: Story = {
  render: function Render() {
    const [open, setOpen] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 620, display: "grid", gap: "var(--space-4)" }}>
        <Timeline entries={CASE} onOpen={setOpen} />
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          Geöffnet: {open ?? "nichts"}
        </div>
      </div>
    );
  },
};

/** Die Lücke ist der Grund für den Strang: 21 Tage ohne Ereignis. */
export const MitLuecke: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline
        entries={[
          ...CASE,
          {
            id: "e0",
            at: "2026-08-05T08:00:00Z",
            kind: "Sachverhalt",
            actor: "System",
            title: "Sachverhalt aus dem OPOS-Vortrag gegründet",
            state: "info",
          },
        ]}
      />
    </div>
  ),
};

/** Im Einsatz: unter den Stammdaten im Sachverhalts-Detail. */
export const ImEinsatz: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Card>
        <CardHead title="Sachverhalt 2026-0142" sub="Bürobedarf Meier GmbH" />
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-5)" }}>
          <FieldList
            tone="bare"
            rows={[
              ["Beleg", "RE-4471"],
              ["Betrag", "1.249,90 €"],
              ["Personenkonto", "70021"],
            ]}
          />
          <Timeline entries={CASE} />
        </div>
      </Card>
    </div>
  ),
};

/**
 * Der Eintrag, der rechts im Detail offen steht (0040): `selectedId` markiert
 * genau einen — Fläche **und** `aria-current`, denn Farbe steht nie allein.
 */
export const Selected: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline entries={CASE} selectedId={CASE[1]!.id} onOpen={() => {}} />
    </div>
  ),
};

/**
 * Kalendertag statt Zeitstempel: `event_date` und `due_date` sind
 * `date`-Spalten — „26.08.2026 00:00" wäre eine Lüge. Ein `at` der Form
 * `YYYY-MM-DD` zeigt keine Uhrzeit, `dateTime` trägt den Tag (0040).
 */
export const DayOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline
        groupBy="none"
        entries={[
          { id: "d1", at: "2026-08-28", title: "Rechnung RE-4471 · Bürobedarf Meier GmbH", kind: "Beleg" },
          { id: "d2", at: "2026-08-26T14:12:00Z", title: "Buchungsvorschlag angelegt", kind: "Vorschlag", actor: "Agent" },
        ]}
      />
    </div>
  ),
};

/**
 * Ohne `kind` und ohne `actor` bleibt der Eintrag **einzeilig** — die zweite
 * Zeile würde sonst das Icon in Worten wiederholen (0040).
 */
export const WithoutKind: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <Timeline
        entries={[
          { id: "n1", at: "2026-08-28", title: "Beleg fehlt: Bürobedarf Meier GmbH" },
          { id: "n2", at: "2026-08-27", title: "Zahlung an Stadtwerke Musterstadt" },
        ]}
      />
    </div>
  ),
};
