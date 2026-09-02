import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Callout, ProseCard } from "./Surface";

const meta: Meta<typeof Callout> = { title: "v3/Primitives/Callout", component: Callout };
export default meta;
type Story = StoryObj<typeof Callout>;

/** Vier Töne. Rot nur, wo etwas blockiert — sonst stumpft die Farbe ab. */
export const AlleToene: Story = {
  render: () => (
    <div className="v2stack">
      <Callout>Der Vorschlag stammt aus einer bestätigten Konvention vom 12.08.2026.</Callout>
      <Callout tone="soft">Diese Periode wurde bereits einmal abgenommen.</Callout>
      <Callout tone="warning">
        Zwei Belege liegen außerhalb des Zeitraums — bitte vor der Freigabe prüfen.
      </Callout>
      <Callout tone="danger">
        Soll und Haben gehen um 12,40 € auseinander. Die Freigabe ist gesperrt.
      </Callout>
    </div>
  ),
};

/** Fließtext-Karte für längere Erklärungen — Versalien-Kopf, 13.5 px Text. */
export const AlsFliesstext: Story = {
  render: () => (
    <ProseCard title="Letzter Bericht">
      Der Durchgang vom 26.08. hat 118 Sätze vorbereitet. Zwölf Punkte bleiben offen,
      davon zwei Fragen an den Mandanten und drei Konten, die in diesem Zeitraum erstmals
      bebucht wurden.
    </ProseCard>
  ),
};
