import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusInfoButton } from "./StatusInfoButton";

const meta: Meta<typeof StatusInfoButton> = { title: "v3/Patterns/Prüfen/StatusInfoButton", component: StatusInfoButton };
export default meta;
type Story = StoryObj<typeof StatusInfoButton>;

/** Das (i) neben einem Chip oder in einem Spaltenkopf. */
export const Entry: Story = { args: { axis: "buchung", current: "proposed" } };
export const Document: Story = { args: { axis: "beleg", current: "processing" } };
export const WithoutCurrentValue: Story = { args: { axis: "erwartung" } };
