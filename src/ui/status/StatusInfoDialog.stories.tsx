import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusInfoDialog } from "./StatusInfoDialog";

const meta: Meta<typeof StatusInfoDialog> = {
  title: "v3/Bausteine/Status/StatusInfoDialog",
  component: StatusInfoDialog,
  args: { open: true, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof StatusInfoDialog>;

/** Die dritte Erklärungsebene: alle Ausprägungen einer Achse, mit DB-Wert. */
export const Buchung: Story = { args: { axis: "buchung", current: "proposed" } };
export const Sachverhalt: Story = { args: { axis: "sachverhalt", current: "needs_clarification" } };
export const Beleg: Story = { args: { axis: "beleg", current: "processing" } };
/** Ohne aktuellen Wert — reine Nachschlage-Ansicht aus dem Spaltenkopf. */
export const NurLegende: Story = { args: { axis: "ereignis" } };
