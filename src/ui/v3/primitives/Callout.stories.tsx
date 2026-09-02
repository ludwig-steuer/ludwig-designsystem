import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Callout } from "./Callout";

const meta: Meta<typeof Callout> = { title: "v3/Primitives/Fläche/Callout", component: Callout };
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
