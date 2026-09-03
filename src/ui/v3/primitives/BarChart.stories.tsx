import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BarChart } from "./BarChart";
import { Card, CardHead } from "./Table";
import { KpiTile, KpiGrid } from "./KpiTile";
import { formatAmount } from "../format";

const meta: Meta<typeof BarChart> = { title: "v3/Primitives/Daten/BarChart", component: BarChart };
export default meta;
type Story = StoryObj<typeof BarChart>;

const euro = (value: number) => formatAmount(value, "EUR");

const MONTHS = [
  { label: "Sep", value: 12840.5 },
  { label: "Okt", value: 15120.0 },
  { label: "Nov", value: 11960.4 },
  { label: "Dez", value: 21480.9 },
  { label: "Jan", value: 9840.2 },
  { label: "Feb", value: 10420.75 },
  { label: "Mär", value: 13980.0 },
  { label: "Apr", value: 12010.6 },
  { label: "Mai", value: 14260.3 },
  { label: "Jun", value: 13120.45 },
  { label: "Jul", value: 16040.8 },
  { label: "Aug", value: 14208.4 },
];

/** Zwölf Monate Aufwand — die Werte kommen formatiert vom Formatter (T7). */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <BarChart bars={MONTHS} format={euro} ariaLabel="Aufwand je Monat" />
    </div>
  ),
};

/** Kein Raster ohne Werte: ein Satz, der sagt, warum nichts zu sehen ist. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <BarChart bars={[]} format={euro} />
    </div>
  ),
};

/**
 * Der laufende Monat trägt die Marke — und, weil Farbe nie allein steht (V7),
 * ein kräftigeres Label unter dem Balken.
 */
export const Highlight: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <BarChart bars={MONTHS} format={euro} highlight="Aug" ariaLabel="Aufwand je Monat" />
    </div>
  ),
};

/** Im Einsatz: neben den Kennzahlen, in derselben Karte. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead title="Aufwand" sub="Musterbau GmbH · Wirtschaftsjahr 2026" />
        <div style={{ padding: "var(--space-5)", display: "grid", gap: "var(--space-5)" }}>
          <KpiGrid columns={2}>
            <KpiTile label="August 2026" value="14.208,40 €" sub="16 Buchungen" />
            <KpiTile label="Mittel der 12 Monate" value="13.773,78 €" sub="Sep 2025 – Aug 2026" />
          </KpiGrid>
          <BarChart bars={MONTHS} format={euro} highlight="Aug" ariaLabel="Aufwand je Monat" />
        </div>
      </Card>
    </div>
  ),
};

/**
 * Der Rand: negative Werte hängen unter der Grundlinie und tragen dieselbe
 * Farbe (das Vorzeichen färbt nicht, A7); ein Ausreißer staucht den Rest;
 * ab 24 Balken steht jedes zweite Label, der Rest bleibt im `title`.
 */
export const Edge: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 560 }}>
      <BarChart
        bars={[
          { label: "Sep", value: 4200 },
          { label: "Okt", value: -1840.5 },
          { label: "Nov", value: 2100 },
          { label: "Dez", value: -3260.75 },
          { label: "Jan", value: 28400 },
          { label: "Feb", value: 1900 },
        ]}
        format={euro}
        highlight="Jan"
        ariaLabel="Saldo je Monat"
      />
      <BarChart
        bars={Array.from({ length: 24 }, (_, i) => ({
          label: `${String((i % 12) + 1).padStart(2, "0")}`,
          value: 6000 + ((i * 1370) % 9000),
        }))}
        format={euro}
        max={20000}
        ariaLabel="Buchungen je Monat, zwei Jahre"
      />
    </div>
  ),
};
