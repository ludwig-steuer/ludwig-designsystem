import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ActionBar } from "../primitives/ActionBar";
import { Button } from "../primitives/Button";
import { HotkeyLegend, useHotkeys } from "./Hotkeys";

const meta: Meta<typeof HotkeyLegend> = { title: "v3/Patterns/Frame/HotkeyLegend", component: HotkeyLegend };
export default meta;
type Story = StoryObj<typeof HotkeyLegend>;

const GROUPS = [
  {
    title: "Liste",
    keys: [
      { key: "J", label: "Nächster Punkt" },
      { key: "K", label: "Voriger Punkt" },
      { key: "Enter", label: "Detail öffnen" },
    ],
  },
  {
    title: "Handlung",
    keys: [
      { key: "A", label: "Bestätigen" },
      { key: "R", label: "Zurück an den Agenten" },
    ],
  },
  {
    title: "Navigation",
    keys: [
      { key: "1 – 9", label: "Zum Schritt" },
      { key: "?", label: "Diese Legende" },
    ],
  },
];

/** Die Legende offen — so sieht sie aus, wenn jemand `?` drückt. */
export const Open: Story = { render: () => <HotkeyLegend groups={GROUPS} defaultOpen /> };

/** Im Einsatz: die Taste steht am Knopf, die Legende liegt hinter `?`. Drücken Sie A. */
export const OnButton: Story = {
  render: function Render() {
    const [n, setN] = useState(0);
    const count = () => setN((v) => v + 1);
    useHotkeys([{ key: "a", label: "Bestätigen", handler: count }]);
    return (
      <div className="v2stack">
        <ActionBar
          primary={
            <Button variant="primary" hotkey="A" onClick={count}>
              Bestätigen
            </Button>
          }
          info={n === 0 ? "Noch nichts bestätigt — Taste A oder Klick." : `${n}× bestätigt.`}
        />
        <HotkeyLegend groups={GROUPS} />
      </div>
    );
  },
};
