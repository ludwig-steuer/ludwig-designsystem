import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ActionBar } from "../primitives/ActionBar";
import { Button } from "../primitives/Button";
import { HotkeyLegende, useHotkeys } from "./Hotkeys";

const meta: Meta<typeof HotkeyLegende> = { title: "v3/Patterns/Rahmen/HotkeyLegende", component: HotkeyLegende };
export default meta;
type Story = StoryObj<typeof HotkeyLegende>;

const GRUPPEN = [
  {
    titel: "Liste",
    tasten: [
      { key: "J", label: "Nächster Punkt" },
      { key: "K", label: "Voriger Punkt" },
      { key: "Enter", label: "Detail öffnen" },
    ],
  },
  {
    titel: "Handlung",
    tasten: [
      { key: "A", label: "Bestätigen" },
      { key: "R", label: "Zurück an den Agenten" },
    ],
  },
  {
    titel: "Navigation",
    tasten: [
      { key: "1 – 9", label: "Zum Schritt" },
      { key: "?", label: "Diese Legende" },
    ],
  },
];

/** Die Legende offen — so sieht sie aus, wenn jemand `?` drückt. */
export const Offen: Story = { render: () => <HotkeyLegende gruppen={GRUPPEN} defaultOpen /> };

/** Im Einsatz: die Taste steht am Knopf, die Legende liegt hinter `?`. Drücken Sie A. */
export const AmKnopf: Story = {
  render: function Render() {
    const [n, setN] = useState(0);
    const zaehlen = () => setN((v) => v + 1);
    useHotkeys([{ key: "a", label: "Bestätigen", handler: zaehlen }]);
    return (
      <div className="v2stack">
        <ActionBar
          primary={
            <Button variant="primary" hotkey="A" onClick={zaehlen}>
              Bestätigen
            </Button>
          }
          info={n === 0 ? "Noch nichts bestätigt — Taste A oder Klick." : `${n}× bestätigt.`}
        />
        <HotkeyLegende gruppen={GRUPPEN} />
      </div>
    );
  },
};
