import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { InvoiceLineFacts } from "./InvoiceLineFacts";
import { InvoiceLineRow, invoiceLineTracksExpandable } from "./InvoiceLineRow";
import { Card, HeadRow, Table } from "../../primitives/Table";
import { DEVIATIONS, FOREIGN, LABELS, LONG, MINIMAL, SIMPLE, line } from "./fixtures";

const meta: Meta<typeof InvoiceLineFacts> = {
  title: "v3/Entitäten/Rechnungsposition/InvoiceLineFacts",
  component: InvoiceLineFacts,
};
export default meta;
type Story = StoryObj<typeof InvoiceLineFacts>;

/** Die Form steht immer frei — den Rahmen setzt, wer sie einsetzt. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 760 }}>
      <Card>
        <div style={{ padding: "var(--space-4)" }}>{children}</div>
      </Card>
    </div>
  );
}

const NOTES = [
  "Belegstelle: Seite 2, Position 1 der Rechnung.",
  "Der Steuersatz stammt aus der Kopfzeile, nicht aus der Zeile.",
];

/** Der Normalfall: Klassifikation, Umsatzsteuer, Steuerschlüssel, Beleg, Hinweise. */
export const Standard: Story = {
  render: () => (
    <Frame>
      <InvoiceLineFacts line={SIMPLE} labels={LABELS} notes={NOTES} />
    </Frame>
  ),
};

/**
 * Die synthetisierte Position, zu der Ludwig nichts vermerkt hat: statt einer
 * leeren Fläche steht ein Satz. Kein „—", keine leere Zeile — genau die
 * Regel, an der die Rabatt-Spalte der App scheitert (L-201).
 */
export const Sparse: Story = {
  render: () => (
    <Frame>
      <InvoiceLineFacts line={line({ position: 21, lineTotalNetValue: 156.4 })} labels={LABELS} />
    </Frame>
  ),
};

/**
 * Steuerschlüssel-Kandidaten **ohne** USt-Sonderfall: der Block erscheint
 * trotzdem. In der App hängt er am Sonderfall, weshalb 423 der 440 gefüllten
 * Kandidatenlisten unsichtbar bleiben (L-202 c).
 */
export const TaxKeysWithoutSpecialCase: Story = {
  render: () => (
    <Frame>
      <InvoiceLineFacts line={MINIMAL} labels={LABELS} />
      <div style={{ height: "var(--space-4)" }} />
      <InvoiceLineFacts
        line={line({ ...MINIMAL, position: 2, taxCandidateKeys: ["9", "8", "3"] })}
        labels={LABELS}
      />
    </Frame>
  ),
};

/**
 * Die Sammelposition mit dem Kollaps-Kasten. Er erscheint, weil `collapse`
 * gesetzt ist — die Form prüft nicht selbst auf die Herkunft.
 */
export const Aggregate: Story = {
  render: () => (
    <Frame>
      <InvoiceLineFacts
        line={DEVIATIONS}
        labels={LABELS}
        collapse={[
          ["Kollabierte Positionen", "1, 2, 4"],
          ["Grund", "Gleicher Buchungsgegenstand, gleicher Steuersatz"],
          ["Entschieden am", "01.09.2026"],
        ]}
      />
    </Frame>
  ),
};

/**
 * Der Fremdwährungs-Block — 20 von 726 Zeilen tragen ihn. Ohne `fxCurrency`
 * bliebe er weg: eine nackte Zahl ohne Währung wäre eine Behauptung.
 */
export const ForeignCurrency: Story = {
  render: () => (
    <Frame>
      <InvoiceLineFacts line={FOREIGN} labels={LABELS} fxCurrency="USD" />
    </Frame>
  ),
};

/**
 * Die Ränder: Buchungsgegenstand mit 392 Zeichen, Begründung mit 295 — beide
 * gekürzt. Dazu ein extrahierter USt-Satz, der **abweicht**, damit die Zeile
 * einmal zu sehen ist; im Bestand weicht er in null von 559 Zeilen ab.
 */
export const Edges: Story = {
  render: () => (
    <Frame>
      <InvoiceLineFacts
        line={line({ ...LONG, vatExtractedRatePercent: 7 })}
        labels={LABELS}
        notes={NOTES}
      />
    </Frame>
  ),
};

/** Im Einsatz: im Aufklapper einer Zeile, so wie die Liste sie steckt. */
export const InUse: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1100 }}>
      <Table cols={invoiceLineTracksExpandable} density="wide">
        <HeadRow>
          <span />
          <span>Pos.</span>
          <span>Bezeichnung</span>
          <span className="v2num">Menge</span>
          <span className="v2num">Einzelpreis</span>
          <span className="v2num">USt-Satz</span>
          <span className="v2num">Netto-Summe</span>
        </HeadRow>
        <InvoiceLineRow line={SIMPLE} labels={LABELS} open>
          <InvoiceLineFacts line={SIMPLE} labels={LABELS} notes={NOTES} />
        </InvoiceLineRow>
      </Table>
    </div>
  ),
};
