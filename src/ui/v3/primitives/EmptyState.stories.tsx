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

/** Noch nothing angelegt — der Weg hinein steht als Handlung daneben. */
export const NothingYet: Story = {
  args: {
    icon: <Inbox size={18} strokeWidth={1.5} />,
    title: "Noch keine Belege im Eingang",
    description:
      "Sobald ein Mandant Belege einreicht oder Sie welche hochladen, erscheinen sie hier.",
    action: <Button variant="primary">Belege hochladen</Button>,
  },
};

/** Alles erledigt — kein Handlungsbedarf, also auch keine Handlung. */
export const AllDone: Story = {
  args: {
    icon: <FileText size={18} strokeWidth={1.5} />,
    title: "Keine offenen Sachverhalte",
    description: "Alle Sachverhalte dieses Wirtschaftsjahres sind gebucht.",
  },
};

/** Nichts trifft den Filter — der Ausweg ist das Zurücksetzen, nicht das Anlegen. */
export const EmptyAfterFilter: Story = {
  args: {
    icon: <Filter size={18} strokeWidth={1.5} />,
    title: "Kein Beleg passt zu diesen Filtern",
    description: "Setzen Sie einzelne Filter zurück, um mehr Belege zu sehen.",
    action: <Button>Filter zurücksetzen</Button>,
  },
};

/** Ohne Frame und Innenabstand, wenn schon eine Karte darum liegt (L2). */
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

/** Ohne Icon — der Text trägt allein. */
export const TextOnly: Story = {
  args: {
    title: "Keine Einträge",
    description: "Für die gewählte Periode liegen keine Buchungen vor.",
  },
};
