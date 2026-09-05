import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ExternalLink, Undo2 } from "lucide-react";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { Card, HeadRow, Row, Table } from "./Table";
import { TextButton } from "./TextButton";

const meta: Meta<typeof TextButton> = {
  title: "v3/Primitives/Aktion/TextButton",
  component: TextButton,
};
export default meta;
type Story = StoryObj<typeof TextButton>;

/** Eine Handlung mitten im Satz — kein Kasten, keine eigene Zeilenhöhe. Beim
 *  Hover unterstreicht er, er färbt keine Fläche (§2). */
export const Filled: Story = {
  render: () => (
    <p style={{ maxWidth: 460, fontSize: 13, lineHeight: 1.7 }}>
      Der Stapel enthält 14 Buchungen ohne Beleg. Sie können sie{" "}
      <TextButton>zurückstellen</TextButton> oder das{" "}
      <TextButton>Kontenblatt öffnen</TextButton> und einzeln nachtragen.
    </p>
  ),
};

/** Zwei Lautstärken, gleiche Größe: `default` in Akzentfarbe und halbfett,
 *  `quiet` gedämpft und normal — ohne Farbe am Schriftschnitt zu erkennen (V7).
 *  Gesperrt heißt gesperrt: kein Hover, der Grund steht daneben. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <TextButton>Buchung prüfen</TextButton>
      <TextButton tone="quiet">Zurückstellen</TextButton>
      <TextButton disabled>Buchung prüfen</TextButton>
      <TextButton tone="quiet" disabled>
        Zurückstellen
      </TextButton>
      <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
        Gesperrt, bis der Stapel abgeschlossen ist.
      </span>
    </div>
  ),
};

/** Icon links, nie allein — das Wort trägt die Bedeutung (T8). */
export const WithIcon: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <TextButton icon={<Undo2 size={14} strokeWidth={1.5} />}>Storno vorbereiten</TextButton>
      <TextButton tone="quiet" icon={<ExternalLink size={14} strokeWidth={1.5} />}>
        In DATEV ansehen
      </TextButton>
    </div>
  ),
};

/** Mit `href` entsteht ein `<a>`, ohne ein `<button>` — gleiche Optik, anderes
 *  Markup. Nie ein `<a>` ohne Ziel, nie ein `<div>` mit `onClick`. */
export const AsLink: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <TextButton href="#">Zum Kontenblatt</TextButton>
      <TextButton tone="quiet" href="#" icon={<ExternalLink size={14} strokeWidth={1.5} />}>
        Protokoll herunterladen
      </TextButton>
    </div>
  ),
};

/** Rundlauf: der Aufrufer hält den Zustand, der Knopf löst nur aus. */
export const Interactive: Story = {
  render: function Render() {
    const [zurueckgestellt, setZurueckgestellt] = useState(false);
    return (
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ fontSize: 13 }}>
          RE-4471 · {zurueckgestellt ? "zurückgestellt" : "offen"}
        </span>
        <TextButton
          tone={zurueckgestellt ? "quiet" : "default"}
          onClick={() => setZurueckgestellt((v) => !v)}
        >
          {zurueckgestellt ? "Wieder aufnehmen" : "Zurückstellen"}
        </TextButton>
      </div>
    );
  },
};

/**
 * Der Rand-Fall: in der Tabellenzelle neben dem Betrag. Die Zeile mit Knopf ist
 * so hoch wie die ohne — das trennt ihn von `Button`, der die Zeile aufdrückt
 * (V1).
 */
export const InRow: Story = {
  render: () => (
    <Card>
      <Table cols="120px 1fr 140px 200px">
        <HeadRow>
          <span>Beleg</span>
          <span>Kreditor</span>
          <span className="v2num">Betrag</span>
          <span>Aktion</span>
        </HeadRow>
        <Row>
          <span>RE-4471</span>
          <span>Bürobedarf Meier GmbH</span>
          <AmountCell value={1249.9} />
          <span>
            <span style={{ display: "flex", gap: 14 }}>
              <TextButton>Prüfen</TextButton>
              <TextButton tone="quiet">Zurückstellen</TextButton>
            </span>
          </span>
        </Row>
        <Row>
          <span>RE-4472</span>
          <span>Ohne Knopf — die Referenzhöhe</span>
          <AmountCell value={84.5} />
          <span />
        </Row>
        <Row>
          <span>RE-4473</span>
          <span>Stadtwerke Musterstadt</span>
          <AmountCell value={412} />
          <span>
            <TextButton>Prüfen</TextButton>
          </span>
        </Row>
      </Table>
    </Card>
  ),
};
