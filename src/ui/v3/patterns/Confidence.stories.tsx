import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// Nur die Story greift nach oben in `entities/`: Spec 0078 verlangt für
// `InUse` den Kopf der KI-Buchungshinweise. Der Baustein selbst kennt keine
// Entität — Patterns importieren nicht aufwärts.
import { AiBookingNotes } from "../entities/journal-entry/AiBookingNotes";
import { AmountCell } from "../primitives/Cells";
import { FieldList } from "../primitives/FieldList";
import { Card, CardHead, HeadRow, Row, Table } from "../primitives/Table";
import { Confidence, type ConfidenceLevel } from "./Confidence";
import { StatusHeader } from "./StatusHeader";

const meta: Meta<typeof Confidence> = {
  title: "v3/Patterns/Prüfen/Confidence",
  component: Confidence,
};
export default meta;
type Story = StoryObj<typeof Confidence>;

const LEVELS: ConfidenceLevel[] = ["green", "yellow", "orange", "red"];

/**
 * Die vier Stufen der Achse `konfidenz` untereinander. Wort und Farbe kommen
 * aus der Registry — in dieser Datei steht keine Map, und in der Story auch
 * nicht: die Liste sind die vier Werte, mehr nicht.
 */
export const Levels: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      {LEVELS.map((level) => (
        <Confidence key={level} level={level} />
      ))}
    </div>
  ),
};

/**
 * Mit Rohwert: die ganze Prozentzahl hinter dem Wort, Ziffern tabellarisch —
 * untereinander stehen die Zahlen auf gleicher Breite. Wer `value` gibt, gibt
 * auch `level`: der Baustein bandet nicht.
 */
export const WithValue: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <Confidence level="green" value={0.94} />
      <Confidence level="yellow" value={0.62} />
      <Confidence level="orange" value={0.51} />
      <Confidence level="red" value={0.08} />
    </div>
  ),
};

/**
 * `compact` in einer Tabellenzeile: nur der Punkt neben dem Betrag, das Wort
 * im `title` und im `aria-label` — die Spalte bleibt schmal, die Aussage
 * bleibt lesbar (V7: Farbe ist nie allein das Signal).
 */
export const DotOnly: Story = {
  render: () => (
    <Card>
      <CardHead title="Buchungsvorschläge" sub="4 Sätze · Konfidenz je Zeile" />
      <Table cols="1fr 130px 90px">
        <HeadRow>
          <span>Gegenpartei</span>
          <span className="v2num">Betrag</span>
          <StatusHeader axis="konfidenz" label="Sicher" />
        </HeadRow>
        {[
          ["Musterfirma GmbH", 1800, "green", 0.94],
          ["Werbeagentur Nord", 420, "yellow", 0.62],
          ["Bürobedarf GmbH", 64.9, "orange", 0.51],
          ["Unbekannter Zahlungseingang", 249, "red", 0.08],
        ].map(([partner, amount, level, value]) => (
          <Row key={partner as string}>
            <span className="v2main">{partner as string}</span>
            <AmountCell value={amount as number} />
            <Confidence level={level as ConfidenceLevel} value={value as number} compact />
          </Row>
        ))}
      </Table>
    </Card>
  ),
};

/**
 * Kein Signal: `level={null}` rendert den Gedankenstrich mit dem Titel „keine
 * Angabe" — ein Import-Satz ohne Konfidenz sieht anders aus als einer mit
 * schlechter, und beides sieht anders aus als eine leere Zelle.
 */
export const NoSignal: Story = {
  render: () => (
    <FieldList
      title="Zwei Sätze"
      rows={[
        ["Vorschlag des Agenten", <Confidence key="a" level="yellow" value={0.62} />],
        ["Import aus DATEV", <Confidence key="b" level={null} />],
      ]}
    />
  ),
};

/**
 * Beide Orte, an denen die Konfidenz heute steht: als Zeile in einer
 * `FieldList` und im Kopf der KI-Buchungshinweise. Dieselbe Form, dasselbe
 * Wort — die lokale Map `KONFIDENZ_TEXT` in `AiBookingNotes` ist damit weg.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 640 }}>
      <FieldList
        title="Buchungssatz BS-2026-0412"
        rows={[
          ["Konto", "6815 Bürobedarf"],
          ["Steuerschlüssel", "9 · 19 % Vorsteuer"],
          ["Konfidenz", <Confidence key="c" level="yellow" value={0.62} />],
        ]}
      />
      <AiBookingNotes
        verdict="adjust"
        confidence="yellow"
        rationale="Der Lieferant hat in den letzten zwölf Monaten dreimal auf 6815 gebucht; die Rechnung nennt Büromaterial."
        judgeReasoning="Konto plausibel, Steuerschlüssel geprüft. Der Betrag liegt über dem bisherigen Schnitt."
        sources={[
          { key: "s1", art: "beleg", label: "Rechnung 2026-0412" },
          { key: "s2", art: "regel", label: "Historie Bürobedarf GmbH" },
        ]}
      />
    </div>
  ),
};
