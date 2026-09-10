import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Card, CardHead } from "../primitives/Table";
import { NoteFeed, type Note } from "./NoteFeed";

const meta: Meta<typeof NoteFeed> = {
  title: "v3/Patterns/Arbeitsfläche/NoteFeed",
  component: NoteFeed,
};
export default meta;
type Story = StoryObj<typeof NoteFeed>;

/** Relative to now, so „vor 3 Tagen" stays true whenever the story is opened. */
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const NOTES: Note[] = [
  { id: "n1", at: ago(60 * 3), author: "Kanzlei", text: "Rechnung liegt vor, die Zahlung ist für Freitag angekündigt." },
  { id: "n2", at: ago(60 * 24 * 3), author: "Mandant", text: "Die Ersatzteile gehören zum Firmenwagen, nicht zum Werkstattbestand." },
  { id: "n3", at: ago(60 * 24 * 9), author: "Agent", text: "Beleg ohne Sachverhalt eingegangen, Fall eröffnet und Vorschlag gebucht." },
];

/**
 * Drei Notizen, **ohne** `onAdd` — kein Knopf, kein Feld. Die Zeit steht
 * relativ da; das genaue Datum zeigt der Tooltip der Zeitangabe.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <NoteFeed notes={NOTES} />
    </div>
  ),
};

/** Noch nichts festgehalten — der Leertext, darunter der Weg. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <NoteFeed notes={[]} onAdd={() => {}} />
    </div>
  ),
};

/**
 * Rundlauf: aufklappen, schreiben, speichern — die Notiz steht oben. Solange
 * nur Leerraum im Feld steht, bleibt „Speichern" gesperrt.
 */
export const Interactive: Story = {
  render: function Render() {
    const [notes, setNotes] = useState<Note[]>(NOTES);
    return (
      <div style={{ maxWidth: 420 }}>
        <NoteFeed
          notes={notes}
          onAdd={(text) =>
            setNotes((current) => [
              { id: `n${current.length + 1}`, at: new Date().toISOString(), author: "Kanzlei", text },
              ...current,
            ])
          }
          placeholder="Was soll am Fall festgehalten werden?"
        />
      </div>
    );
  },
};

/**
 * Das Speichern scheitert: eine Sekunde lädt der Knopf, dann bleibt der Text
 * im Feld, und darunter steht, was passiert ist. Nichts Getipptes geht
 * verloren.
 */
export const SaveFails: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <NoteFeed
        notes={NOTES.slice(0, 1)}
        onAdd={() =>
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("offline")), 1000))
        }
      />
    </div>
  ),
};

/** In der Randspalte des Sachverhalts: in einer Karte, 370 px breit, mit eigenem Knopftext. */
export const InUse: Story = {
  render: () => (
    <div style={{ width: 370 }}>
      <Card>
        <CardHead title="Notizen" sub="zuletzt oben" />
        <div className="v3boxbody">
          <NoteFeed notes={NOTES} onAdd={() => {}} addLabel="Notiz an den Fall" />
        </div>
      </Card>
    </div>
  ),
};

const LONG =
  "Rückruf beim Mandanten: Die Gutschrift vom Juni bezieht sich auf die zurückgeschickten " +
  "Bremsbeläge, nicht auf die Rechnung vom Juli. Der Lieferant hat zugesagt, eine korrigierte " +
  "Gutschrift mit Bezug auf die ursprüngliche Rechnungsnummer zu schicken; bis dahin bleibt " +
  "der Sachverhalt offen. Referenz des Lieferanten: RE-2026-000834-MUSTERBAU-GUTSCHRIFT-KORREKTUR. " +
  "Falls bis Monatsende nichts kommt, bitte die Gutschrift gegen die Julirechnung verrechnen " +
  "und den Mandanten informieren — er ist damit einverstanden, möchte aber vorher Bescheid.";

/**
 * Rand: ein Text mit rund 600 Zeichen und einer Referenz ohne Leerzeichen,
 * zwölf Notizen, in 370 px. Die Zeit ist relativ innerhalb einer Woche („in
 * dieser Minute" bis „vorgestern"), danach steht das Datum.
 */
export const Edge: Story = {
  render: () => {
    const minutes = [0.2, 5, 90, 60 * 20, 60 * 24 * 2, 60 * 24 * 10, 60 * 24 * 40, 60 * 24 * 100, 60 * 24 * 200, 60 * 24 * 400, 60 * 24 * 600, 60 * 24 * 730];
    const notes: Note[] = minutes.map((m, i) => ({
      id: `e${i}`,
      at: ago(m),
      author: i % 3 === 0 ? "Kanzlei" : i % 3 === 1 ? "Mandant" : null,
      text: i === 0 ? LONG : `Notiz ${i + 1} am Fall.`,
    }));
    return (
      <div style={{ width: 370 }}>
        <NoteFeed notes={notes} onAdd={() => {}} />
      </div>
    );
  },
};
