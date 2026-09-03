import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Banner } from "./Banner";

const meta: Meta<typeof Banner> = {
  title: "v3/Primitives/Fläche/Banner",
  component: Banner,
  args: { children: "Ludwig hat 47 Belege vorkontiert." },
};
export default meta;
type Story = StoryObj<typeof Banner>;

export const Info: Story = { args: { tone: "info" } };
export const Warning: Story = {
  args: { tone: "warning", children: "Ein Beleg ist unvollständig — die Rechnungsnummer fehlt." },
};
export const Danger: Story = {
  args: { tone: "danger", children: "Der Stapel konnte nicht an DATEV übergeben werden." },
};
export const Success: Story = { args: { tone: "success", children: "Der Buchungsstapel liegt in DATEV." } };
export const WithTitle: Story = {
  args: { tone: "warning", title: "Kontenrahmen unvollständig", children: "Für 2026 fehlen 12 Sachkonten aus SKR04." },
};
