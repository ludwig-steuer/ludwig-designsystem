import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ComparisonTable, type ComparisonRow } from "./ComparisonTable";

const meta: Meta<typeof ComparisonTable> = {
  title: "v3/Patterns/Prüfen/ComparisonTable",
  component: ComparisonTable,
};
export default meta;
type Story = StoryObj<typeof ComparisonTable>;

const MONTHS: [string, string, string, string] = ["Mai", "Jun", "Jul", "Aug"];

const ROWS: ComparisonRow[] = [
  {
    key: "miete", label: "Miete", unit: "amount",
    m3: 1700, m2: 1700, m1: 1700, avg: 1700, current: 1800, deviationPct: 5.9, tone: "warning",
    explanation: "1.800,00 € gegen Ø 1.700,00 € aus 3 Vormonaten = +6 %", flagged: true, tooYoung: false,
  },
  {
    key: "bewirtung", label: "Bewirtung", unit: "amount",
    m3: 120, m2: 0, m1: 260, avg: 126.67, current: 610, deviationPct: 381, tone: "warning-strong",
    explanation: "610,00 € gegen Ø 126,67 € = +381 %", flagged: true, tooYoung: false,
  },
  {
    key: "porto", label: "Porto", unit: "amount",
    m3: 42.5, m2: 38, m1: 51.2, avg: 43.9, current: 148, deviationPct: 237, tone: "danger",
    explanation: "148,00 € gegen Ø 43,90 € = +237 % — am 28.08. quittiert: Jahresversand", flagged: true, tooYoung: false,
    acknowledged: true,
  },
  {
    key: "belege", label: "Belege", unit: "count",
    m3: 88, m2: 91, m1: 94, avg: 91, current: 94, deviationPct: 3.3, tone: "neutral",
    explanation: "94 gegen Ø 91 = +3 %", flagged: false, tooYoung: false,
  },
  {
    key: "werbung", label: "Werbekosten", unit: "amount",
    m3: null, m2: null, m1: 420, avg: null, current: 380, deviationPct: null, tone: "muted",
    explanation: "Erst ein Vormonat — zu jung für einen Vergleich.", flagged: false, tooYoung: true,
  },
];

/** Auffällige Zeilen sind klickbar und tragen ihr Icon; quittierte werden grau. */
export const Filled: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>("miete");
    return (
      <ComparisonTable title="Konten gegen Vormonate" monatsLabels={MONTHS} rows={ROWS} selectedKey={sel} onSelect={setSel} />
    );
  },
};

/** Ohne `onSelect` ist die Tabelle eine Auskunft — keine Zeile ist klickbar. */
export const ReadOnly: Story = {
  render: () => <ComparisonTable title="Konten gegen Vormonate" monatsLabels={MONTHS} rows={ROWS} />,
};

/** Nichts auffällig: der Untertitel sagt es, die Zeilen bleiben ruhig. */
export const NothingFlagged: Story = {
  render: () => (
    <ComparisonTable
      title="Konten gegen Vormonate"
      monatsLabels={MONTHS}
      rows={ROWS.map((z) => ({ ...z, flagged: false, acknowledged: false, tone: z.tooYoung ? "muted" : "neutral" }))}
    />
  ),
};

/** Leer: kein Vormonat, keine Zeile — und ein Satz, der das sagt. */
export const Empty: Story = {
  render: () => (
    <ComparisonTable title="Konten gegen Vormonate" monatsLabels={MONTHS} rows={[]} empty="Noch kein Vormonat zum Vergleichen." />
  ),
};
