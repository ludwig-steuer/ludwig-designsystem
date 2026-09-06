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

/** Sechs Monate mit Soll und Haben — dieselbe Reihe für die drei Formen unten. */
const LEDGER = [
  { label: "Mär", value: 8420.5, secondary: 6180.0 },
  { label: "Apr", value: 7120.0, secondary: 9340.25 },
  { label: "Mai", value: 10260.3, secondary: 5980.4 },
  { label: "Jun", value: 6840.75, secondary: 8210.0 },
  { label: "Jul", value: 9180.0, secondary: 7460.6 },
  { label: "Aug", value: 8020.4, secondary: 8900.15 },
];

/**
 * `secondary` gestapelt: der zweite Wert sitzt **auf** dem ersten, weil beide
 * Anteile einer Summe sind. Beide Wörter stehen im `title` jedes Balkens und
 * als Spalte in der Tabelle darunter.
 */
export const TwoSeries: Story = {
  render: () => (
    <Card>
      <CardHead title="Aufwand je Monat" sub="Bewirtete Kosten als Anteil" />
      <div style={{ padding: "var(--space-5)" }}>
        <BarChart
          bars={LEDGER}
          format={euro}
          highlight="Aug"
          primaryLabel="Aufwand"
          secondaryLabel="davon bewirtet"
          ariaLabel="Aufwand je Monat, mit Anteil"
        />
      </div>
    </Card>
  ),
};

/**
 * `layout="grouped"`: zwei Balken nebeneinander. Soll und Haben sind keine
 * Anteile voneinander — gestapelt wäre die Summe eine Zahl ohne Bedeutung.
 */
export const Grouped: Story = {
  render: () => (
    <Card>
      <CardHead title="Konto 4400 · Bürobedarf" sub="Soll und Haben je Monat" />
      <div style={{ padding: "var(--space-5)" }}>
        <BarChart
          bars={LEDGER}
          format={euro}
          layout="grouped"
          highlight="Aug"
          primaryLabel="Soll"
          secondaryLabel="Haben"
          ariaLabel="Soll und Haben je Monat"
        />
      </div>
    </Card>
  ),
};

/**
 * `line`: der laufende Saldo auf **derselben** Achse. Keine zweite Y-Achse —
 * zwei Skalen in einem Bild vergleichen sich nicht ehrlich.
 */
export const WithLine: Story = {
  render: () => (
    <Card>
      <CardHead title="Konto 4400 · Bürobedarf" sub="Soll, Haben und laufender Saldo" />
      <div style={{ padding: "var(--space-5)" }}>
        <BarChart
          bars={LEDGER}
          format={euro}
          layout="grouped"
          line={[2240.5, 20.25, 4300.15, 2930.9, 4650.3, 3770.55]}
          highlight="Aug"
          primaryLabel="Soll"
          secondaryLabel="Haben"
          lineLabel="Saldo"
          ariaLabel="Soll, Haben und laufender Saldo je Monat"
        />
      </div>
    </Card>
  ),
};
