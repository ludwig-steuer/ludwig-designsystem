import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { KpiGrid, KpiTile } from "./KpiTile";

const meta: Meta<typeof KpiTile> = { title: "v3/Primitives/Fläche/KpiTile", component: KpiTile };
export default meta;
type Story = StoryObj<typeof KpiTile>;

/**
 * Die Kennzahl-Kachel einer Detailseite: 19 px Sans, Rand statt Schatten.
 * Nicht zu verwechseln mit `Stat` — das ist die Dashboard-Kachel in 32 px
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

/**
 * **Mit `href` führt die ganze Kachel** — dieselbe Regel wie bei der Zeile
 * (I11): eine Zahl, die „wie viel" beantwortet und nicht „und jetzt?", ist
 * eine Sackgasse mit Ziffern.
 *
 * Der Link umschließt die Kachel, statt im Untertitel zu sitzen: **ein**
 * Fokus-Stopp für **ein** Ziel, mit eigenem Text und ohne `aria-label`. Die
 * App hatte ihn mangels dieser Prop in den Untertitel gelegt, und damit war
 * eine Ecke der Kachel ein zweiter Stopp.
 *
 * Nicht jede Zahl bekommt einen: „Summe Haben" führt nirgendwohin, und eine
 * Kachel ohne Ziel bleibt ein Block.
 */
export const Linked: Story = {
  render: () => (
    <KpiGrid columns={3}>
      <KpiTile label="Sätze" value="118" href="#buchungen" sub="im Spiegel dieses Jahres" />
      <KpiTile label="Ohne Zuordnung" value="4" href="#offen" sub="warten auf einen Sachverhalt" />
      <KpiTile label="Summe Haben" value="42.108,55 €" sub="stimmt überein" />
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

/** Noch nichts gerechnet: der Strich sagt „kein Wert", nicht „null". */
export const WithoutValue: Story = {
  render: () => (
    <KpiGrid columns={3}>
      <KpiTile label="Sätze" value="—" sub="Durchgang läuft" />
      <KpiTile label="Summe Soll" value="—" />
      <KpiTile label="Belege" value="—" />
    </KpiGrid>
  ),
};
