import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusInfoDialog } from "./StatusInfoDialog";

const meta: Meta<typeof StatusInfoDialog> = {
  title: "v3/Patterns/Prüfen/StatusInfoDialog",
  component: StatusInfoDialog,
  args: { open: true, onClose: () => {} },
};
export default meta;
type Story = StoryObj<typeof StatusInfoDialog>;

/** Die dritte Erklärungsebene: alle Ausprägungen einer Achse, mit DB-Wert. */
export const Entry: Story = { args: { axis: "journal_entry", current: "proposed" } };
export const Case: Story = { args: { axis: "accounting_case", current: "needs_clarification" } };
export const Document: Story = { args: { axis: "document_processing", current: "processing" } };
/** Ohne aktuellen Wert — reine Nachschlage-Ansicht aus dem Spaltenkopf. */
export const LegendOnly: Story = { args: { axis: "event_booking" } };
