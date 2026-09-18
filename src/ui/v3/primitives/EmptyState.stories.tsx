import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileText, Filter, Inbox } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Table";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "v3/Primitives/Fläche/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing created yet — the way in stands next to it as an action. */
export const NothingYet: Story = {
  args: {
    icon: <Inbox size={18} strokeWidth={1.5} />,
    title: "Noch keine Belege im Eingang",
    description:
      "Sobald ein Mandant Belege einreicht oder Sie welche hochladen, erscheinen sie hier.",
    action: <Button variant="primary">Belege hochladen</Button>,
  },
};

/** Everything done — nothing to act on, so no action either. */
export const AllDone: Story = {
  args: {
    icon: <FileText size={18} strokeWidth={1.5} />,
    title: "Keine offenen Sachverhalte",
    description: "Alle Sachverhalte dieses Wirtschaftsjahres sind gebucht.",
  },
};

/** Nothing matches the filter — the way out is resetting, not creating. */
export const EmptyAfterFilter: Story = {
  args: {
    icon: <Filter size={18} strokeWidth={1.5} />,
    title: "Kein Beleg passt zu diesen Filtern",
    description: "Setzen Sie einzelne Filter zurück, um mehr Belege zu sehen.",
    action: <Button>Filter zurücksetzen</Button>,
  },
};

/** Directly in a Card without a table (L2): it takes the card's inset, not its own frame. */
export const InCard: Story = {
  args: { title: "Keine Zahlungen zugeordnet" },
  render: () => (
    <Card>
      <EmptyState
        inline
        title="Keine Zahlungen zugeordnet"
        description="Zu diesem Beleg wurde noch keine Zahlung gefunden."
      />
    </Card>
  ),
};

/** Without an icon — the text carries it alone. */
export const TextOnly: Story = {
  args: {
    title: "Keine Einträge",
    description: "Für die gewählte Periode liegen keine Buchungen vor.",
  },
};
