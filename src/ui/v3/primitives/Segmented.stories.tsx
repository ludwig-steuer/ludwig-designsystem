import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Segmented } from "./Nav";

const meta: Meta<typeof Segmented> = { title: "v3/Primitives/Navigation/Segmented", component: Segmented };
export default meta;
type Story = StoryObj<typeof Segmented>;

const SICHTEN = [
  { key: "verlauf", label: "Verlauf" },
  { key: "protokoll", label: "Protokoll" },
  { key: "technik", label: "Technik" },
];

/**
 * Für gleichrangige Sichten auf dieselben Daten — im Gegensatz zu `Tabs`,
 * die verschiedene Inhalte trennen.
 */
export const DreiSichten: Story = {
  render: function Render() {
    const [active, setActive] = useState("verlauf");
    return <Segmented options={SICHTEN} active={active} ariaLabel="Log-Sicht" onPick={setActive} />;
  },
};

/** Zwei Optionen — die kleinste sinnvolle Form. */
export const ZweiOptionen: Story = {
  render: function Render() {
    const [active, setActive] = useState("betrag");
    return (
      <Segmented
        options={[
          { key: "betrag", label: "Beträge" },
          { key: "anzahl", label: "Stückzahlen" },
        ]}
        active={active}
        ariaLabel="Maßeinheit"
        onPick={setActive}
      />
    );
  },
};
