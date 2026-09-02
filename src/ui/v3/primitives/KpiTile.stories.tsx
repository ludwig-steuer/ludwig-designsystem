import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KpiGrid, KpiTile } from "./KpiTile";

const meta: Meta<typeof KpiTile> = { title: "v3/Primitives/Fläche/KpiTile", component: KpiTile };
export default meta;
type Story = StoryObj<typeof KpiTile>;

/**
 * Die Kennzahl-Kachel einer Detailseite: 19 px Sans, Rand statt Schatten.
 * Nicht zu verwechseln withItems `Stat` — das ist die Dashboard-Kachel in 32 px
 * Serif und bleibt dem Dashboard.
 */
export const SixColumns: Story = {
  render: () => (
    <KpiGrid columns={6}>
      <KpiTile label="Sätze" value="118" />
      <KpiTile label="Summe Soll" value="42.108,55 €" />
      <KpiTile label="Summe Haben" value="42.108,55 €" sub="stimmt überein" />
      <KpiTile label="Belege" value="94" sub="4 ohne Zuordnung" />
      <KpiTile label="Durchgänge" value="3" />
      <KpiTile label="Offene Fragen" value="2" sub="seit 6 Tagen" />
    </KpiGrid>
  ),
};

/** Weniger Spalten für schmale Flächen — die Kachel bleibt gleich. */
export const ThreeColumns: Story = {
  render: () => (
    <KpiGrid columns={3}>
      <KpiTile label="Erwartet" value="12" />
      <KpiTile label="Eingegangen" value="9" />
      <KpiTile label="Überfällig" value="3" sub="ältester seit 11 Tagen" />
    </KpiGrid>
  ),
};

/** Noch nothing gerechnet: der Strich sagt „kein Wert", nicht „null". */
export const WithoutValue: Story = {
  render: () => (
    <KpiGrid columns={3}>
      <KpiTile label="Sätze" value="—" sub="Durchgang läuft" />
      <KpiTile label="Summe Soll" value="—" />
      <KpiTile label="Belege" value="—" />
    </KpiGrid>
  ),
};
