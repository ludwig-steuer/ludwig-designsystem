import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Banner } from "./Banner";

const meta: Meta<typeof Banner> = {
  title: "v3/Legacy/Banner",
  component: Banner,
  args: { children: "Ludwig hat 47 Belege vorkontiert." },
};
export default meta;
type Story = StoryObj<typeof Banner>;

export const Info: Story = { args: { kind: "info" } };
export const Warning: Story = {
  args: { kind: "warning", children: "Ein Beleg ist unvollständig — die Rechnungsnummer fehlt." },
};
export const Danger: Story = {
  args: { kind: "danger", children: "Der Stapel konnte nicht an DATEV übergeben werden." },
};
export const Success: Story = { args: { kind: "success", children: "Der Buchungsstapel liegt in DATEV." } };
export const MitTitel: Story = {
  args: { kind: "warning", title: "Kontenrahmen unvollständig", children: "Für 2026 fehlen 12 Sachkonten aus SKR04." },
};
