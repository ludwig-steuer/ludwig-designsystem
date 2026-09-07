import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { InvoiceLineList } from "./InvoiceLineList";
import { InvoiceLineFacts } from "./InvoiceLineFacts";
import { ALL, FIVE, LABELS, MINIMAL } from "./fixtures";
import { linesNetTotal } from "./invoice-line";

const meta: Meta<typeof InvoiceLineList> = {
  title: "v3/Entitäten/Rechnungsposition/InvoiceLineList",
  component: InvoiceLineList,
};
export default meta;
type Story = StoryObj<typeof InvoiceLineList>;

function Frame({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "var(--space-5)", maxWidth: 1100 }}>{children}</div>;
}

const facts = (line: Parameters<typeof InvoiceLineFacts>[0]["line"]) => (
  <InvoiceLineFacts line={line} labels={LABELS} fxCurrency="USD" />
);

/** Fünf Positionen — der Umfang einer p90-Rechnung — mit Kopfzeile und Summe. */
export const Standard: Story = {
  render: () => (
    <Frame>
      <InvoiceLineList lines={FIVE} labels={LABELS} />
    </Frame>
  ),
};

/**
 * Eine Position. Der häufigste Fall im Bestand (p50 = 1) und der, an dem eine
 * Tabelle am ehesten albern aussieht.
 */
export const Single: Story = {
  render: () => (
    <Frame>
      <InvoiceLineList lines={[MINIMAL]} labels={LABELS} renderFacts={facts} />
    </Frame>
  ),
};

/**
 * Kein Ergebnis — und das ist **kein Erfolg**. Eine Rechnung ohne Positionen
 * ist 1 % der Fälle (4 von 318) und fast immer ein Problem der Extraktion;
 * der Text sagt das, statt „alles erledigt" zu suggerieren.
 */
export const Empty: Story = {
  render: () => (
    <Frame>
      <InvoiceLineList lines={[]} labels={LABELS} renderFacts={facts} />
    </Frame>
  ),
};

/**
 * Der Rundlauf über `defaultExpanded` und `onExpandedChange`: der Umschalter
 * öffnet **alle** Zeilen zugleich (auch über `Alt+E`, die Taste steht im
 * Segment). Eine einzelne Zeile darf danach abweichen, ohne dass der
 * Umschalter zurückspringt — er sagt, was zuletzt für alle galt.
 */
export const AllExpanded: Story = {
  render: function Render() {
    const [expanded, setExpanded] = useState(true);
    return (
      <Frame>
        <p className="v2muted">
          Zuletzt für alle gesetzt: {expanded ? "Erweitert" : "Kompakt"}
        </p>
        <InvoiceLineList
          lines={FIVE}
          labels={LABELS}
          renderFacts={facts}
          defaultExpanded
          onExpandedChange={setExpanded}
        />
      </Frame>
    );
  },
};

/**
 * Die Probe schlägt an: die Summe der Positionen weicht vom Netto der
 * Rechnung ab. Das passiert echt — 40 Zeilen im Bestand sind Summenzeilen und
 * zählen mit; genau diese Abweichung ist die Information, für die es die
 * Probe gibt. Die Abweichung steht mit einem Wort da, nicht nur in Farbe.
 */
export const TotalMismatch: Story = {
  render: () => (
    <Frame>
      <InvoiceLineList
        lines={ALL}
        labels={LABELS}
        renderFacts={facts}
        invoiceNetTotal={linesNetTotal(ALL) - 612.4}
      />
    </Frame>
  ),
};

/**
 * Der Rand: 22 Positionen — das Maximum im Bestand — darunter zwei
 * deaktivierte und die Sammelposition. Die Summe läuft über die **nicht
 * deaktivierten** Zeilen, sonst zählte die kollabierte Rechnung doppelt.
 */
export const Edges: Story = {
  render: () => (
    <Frame>
      <InvoiceLineList
        lines={[...ALL].reverse()}
        labels={LABELS}
        renderFacts={facts}
        invoiceNetTotal={linesNetTotal(ALL)}
      />
    </Frame>
  ),
};
