import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProseCard } from "./ProseCard";

const meta: Meta<typeof ProseCard> = { title: "v3/Primitives/Fläche/ProseCard", component: ProseCard };
export default meta;
type Story = StoryObj<typeof ProseCard>;

/** Fließtext-Karte für längere Erklärungen — Versalien-Header, 13,5 px Text. */
export const Report: Story = {
  render: () => (
    <ProseCard title="Letzter Bericht">
      Der Durchgang vom 26.08. hat 118 Sätze vorbereitet. Zwölf Punkte bleiben offen,
      davon zwei Fragen an den Mandanten und drei Konten, die in diesem Zeitraum erstmals
      bebucht wurden.
    </ProseCard>
  ),
};

/** Ein Absatz genügt — die Karte wächst nicht künstlich. */
export const Short: Story = {
  render: () => (
    <ProseCard title="Hinweis der Kanzlei">
      Bewirtungsbelege bitte immer mit Teilnehmerliste einreichen.
    </ProseCard>
  ),
};
