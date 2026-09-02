import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Tabs } from "./Nav";

const meta: Meta<typeof Tabs> = { title: "v3/Primitives/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

function Demo({ items }: { items: React.ComponentProps<typeof Tabs>["items"] }) {
  const [active, setActive] = useState(items[0]?.key ?? "");
  return <Tabs items={items} active={active} ariaLabel="Sicht" onPick={setActive} />;
}

/** Zähler stehen gedämpft am Reiter — sie sind Beiwerk, nicht Überschrift. */
export const MitZaehlern: Story = {
  render: () => (
    <Demo
      items={[
        { key: "alle", label: "Alle", count: 118 },
        { key: "offen", label: "Offen", count: 12 },
        { key: "unterwegs", label: "Unterwegs", count: 3 },
        { key: "datev", label: "In DATEV", count: 103 },
      ]}
    />
  ),
};

/** `alarm` färbt den Zähler rot und macht ihn fett — nur bei echtem Rückstand. */
export const MitAlarm: Story = {
  render: () => (
    <Demo
      items={[
        { key: "alle", label: "Alle", count: 118 },
        { key: "offen", label: "Offen", count: 12, alarm: true },
        { key: "erledigt", label: "Erledigt", count: 106 },
      ]}
    />
  ),
};

/** Ohne Zähler — wenn die Menge nichts aussagt (Detail-Reiter). */
export const OhneZaehler: Story = {
  render: () => (
    <Demo
      items={[
        { key: "u", label: "Übersicht" },
        { key: "d", label: "Durchgänge" },
        { key: "b", label: "Buchungen" },
        { key: "a", label: "Artefakte" },
        { key: "x", label: "DATEV" },
        { key: "l", label: "Log" },
      ]}
    />
  ),
};

/** Alles leer: der Zähler zeigt die Null, statt zu verschwinden. */
export const AllesLeer: Story = {
  render: () => (
    <Demo
      items={[
        { key: "alle", label: "Alle", count: 0 },
        { key: "offen", label: "Offen", count: 0 },
      ]}
    />
  ),
};
