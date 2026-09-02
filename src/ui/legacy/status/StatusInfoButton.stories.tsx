import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusInfoButton } from "./StatusInfoButton";

const meta: Meta<typeof StatusInfoButton> = { title: "v3/Legacy/Status/StatusInfoButton", component: StatusInfoButton };
export default meta;
type Story = StoryObj<typeof StatusInfoButton>;

/** Das (i) neben einem Chip oder in einem Spaltenkopf. */
export const Buchung: Story = { args: { axis: "buchung", current: "proposed" } };
export const Beleg: Story = { args: { axis: "beleg", current: "processing" } };
export const OhneAktuellenWert: Story = { args: { axis: "erwartung" } };
