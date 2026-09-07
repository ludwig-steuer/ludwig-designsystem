import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { InvoiceLineRow, invoiceLineTracks, invoiceLineTracksExpandable } from "./InvoiceLineRow";
import { InvoiceLineFacts } from "./InvoiceLineFacts";
import { HeadRow, Table } from "../../primitives/Table";
import { DEVIATIONS, FIVE, LABELS, LONG, MINIMAL, NAMELESS, P90, SIMPLE } from "./fixtures";

const meta: Meta<typeof InvoiceLineRow> = {
  title: "v3/Entitäten/Rechnungsposition/InvoiceLineRow",
  component: InvoiceLineRow,
};
export default meta;
type Story = StoryObj<typeof InvoiceLineRow>;

function Frame({ children, expandable = false }: { children: React.ReactNode; expandable?: boolean }) {
  return (
    <div style={{ padding: "var(--space-5)", maxWidth: 1100 }}>
      <Table cols={expandable ? invoiceLineTracksExpandable : invoiceLineTracks} density="wide">
        <HeadRow>
          {expandable ? <span /> : null}
          <span>Pos.</span>
          <span>Bezeichnung</span>
          <span className="v2num">Menge</span>
          <span className="v2num">Einzelpreis</span>
          <span className="v2num">USt-Satz</span>
          <span className="v2num">Netto-Summe</span>
        </HeadRow>
        {children}
      </Table>
    </div>
  );
}

/**
 * Der Normalfall: sechs Spalten, darunter der Streifen mit Verwendungsart und
 * Konfidenz. Ohne `children` hat die Zeile **keinen** Aufklapp-Knopf — und
 * damit auch keine Spur dafür.
 */
export const Standard: Story = {
  render: () => (
    <Frame>
      <InvoiceLineRow line={SIMPLE} labels={LABELS} />
    </Frame>
  ),
};

/**
 * Der häufigste Fall im Bestand: **die Hälfte aller Rechnungen hat genau eine
 * Position**. Ohne Menge, ohne Einheit (nur 19 % haben eine), ohne
 * Beschreibung — die Zeile darf davon nicht auseinanderfallen.
 */
export const Minimal: Story = {
  render: () => (
    <Frame>
      <InvoiceLineRow line={MINIMAL} labels={LABELS} />
    </Frame>
  ),
};

/**
 * Alle vier Wertebereiche zugleich: virtuelle Herkunft, deaktiviert,
 * USt-Sonderfall, Sonderart. Jede Plakette trägt ihr Wort, keine trägt eine
 * Farbe als Kategorie. Die deaktivierte Zeile ist gedämpft — über das Wort,
 * nicht daneben.
 */
export const Deviations: Story = {
  render: () => (
    <Frame>
      <InvoiceLineRow line={SIMPLE} labels={LABELS} />
      <InvoiceLineRow line={DEVIATIONS} labels={LABELS} />
    </Frame>
  ),
};

/**
 * Der Rundlauf über `open` und `onOpenChange`: die Liste steuert, die Zeile
 * meldet. Im Aufklapper stehen die Fakten (0114).
 */
export const Expanded: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <Frame expandable>
        <InvoiceLineRow line={SIMPLE} labels={LABELS} open={open} onOpenChange={setOpen}>
          <InvoiceLineFacts line={SIMPLE} labels={LABELS} />
        </InvoiceLineRow>
      </Frame>
    );
  },
};

/**
 * Die Ränder: die p90-Bezeichnung mit 92 Zeichen — bis hierhin muss die Zelle
 * dreizeilig bleiben —, danach eine mit 251 Zeichen (das Maximum im Bestand), zwei
 * Einheiten in verschiedener Schreibweise (`Stck` neben `STK` — im Bestand
 * sind es 23), ein Wertebereich **ohne** Wort in `labels`, und eine Position
 * ganz ohne `itemName`.
 */
export const Edges: Story = {
  render: () => (
    <Frame>
      <InvoiceLineRow line={P90} labels={LABELS} />
      <InvoiceLineRow line={LONG} labels={{ ...LABELS, vatSpecialCase: {} }} />
      <InvoiceLineRow line={NAMELESS} labels={LABELS} />
    </Frame>
  ),
};

/** Fünf Zeilen unter einer Kopfzeile — der Umfang einer p90-Rechnung. */
export const InUse: Story = {
  render: () => (
    <Frame>
      {FIVE.map((line) => (
        <InvoiceLineRow key={line.position} line={line} labels={LABELS} />
      ))}
    </Frame>
  ),
};
