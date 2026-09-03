import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Segmented } from "./Nav";

const meta: Meta<typeof Segmented> = { title: "v3/Primitives/Navigation/Segmented", component: Segmented };
export default meta;
type Story = StoryObj<typeof Segmented>;

const VIEWS = [
  { key: "verlauf", label: "Verlauf" },
  { key: "protokoll", label: "Protokoll" },
  { key: "technik", label: "Technik" },
];

/**
 * Für gleichrangige Sichten auf dieselben Daten — im Gegensatz zu `Tabs`,
 * die verschiedene Inhalte trennen.
 */
export const ThreeViews: Story = {
  render: function Render() {
    const [active, setActive] = useState("verlauf");
    return <Segmented options={VIEWS} active={active} ariaLabel="Log-Sicht" onPick={setActive} />;
  },
};

/** Zwei Optionen — die kleinste sinnvolle Form. */
export const TwoOptions: Story = {
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

/**
 * Mit Zähler je Sicht (0054): Der Wert steht gedämpft rechts am Label und
 * sagt vor dem Klick, was die Sicht zeigt — im Protokoll ist „Technik"
 * ein Vielfaches von „Verlauf".
 */
export const WithCounts: Story = {
  render: function Render() {
    const [active, setActive] = useState("protokoll");
    return (
      <Segmented
        options={[
          { key: "verlauf", label: "Verlauf", count: 12 },
          { key: "protokoll", label: "Protokoll", count: 48 },
          { key: "technik", label: "Technik", count: 300 },
        ]}
        active={active}
        ariaLabel="Log-Sicht"
        onPick={setActive}
      />
    );
  },
};
