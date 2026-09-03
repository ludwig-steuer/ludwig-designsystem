import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { Kbd } from "./Kbd";
import { ActionBar } from "./ActionBar";
import { HotkeyLegend } from "../patterns/Hotkeys";

const meta: Meta<typeof Kbd> = { title: "v3/Primitives/Aktion/Kbd", component: Kbd };
export default meta;
type Story = StoryObj<typeof Kbd>;

/** Die Taste, wie sie gedrückt wird — ein `<kbd>`, kein Wort in einem `<span>`. */
export const Filled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
      <Kbd>A</Kbd>
      <Kbd>J</Kbd>
      <Kbd>K</Kbd>
      <Kbd>?</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>⌘K</Kbd>
    </div>
  ),
};

/**
 * Im Einsatz steht die Taste an ihrer Handlung: am Knopf (dort trägt sie
 * dessen Farbe) und in der Legende, die nur die Zweitquelle ist.
 */
export const InUse: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 560 }}>
      <ActionBar
        primary={
          <Button variant="primary" hotkey="A">
            Stapel abnehmen
          </Button>
        }
        secondary={<Button hotkey="R">Zurück an den Agenten</Button>}
        tertiary={
          <Button variant="tertiary" hotkey="?">
            Tasten zeigen
          </Button>
        }
      />
      <HotkeyLegend
        defaultOpen
        groups={[
          {
            title: "Liste",
            keys: [
              { key: "J", label: "Nächster Sachverhalt" },
              { key: "K", label: "Voriger Sachverhalt" },
              { key: "Enter", label: "Detail öffnen" },
            ],
          },
          {
            title: "Handlung",
            keys: [
              { key: "A", label: "Stapel abnehmen" },
              { key: "R", label: "Zurück an den Agenten" },
            ],
          },
        ]}
      />
    </div>
  ),
};

/**
 * Der Rand: Kombinationen und ganze Wörter. Sie bleiben in einer Zeile und
 * drücken den Knopf nicht auf.
 */
export const Edge: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 480 }}>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        <Kbd>Ctrl K</Kbd>
        <Kbd>Shift ↵</Kbd>
        <Kbd>Leertaste</Kbd>
      </div>
      <ActionBar
        primary={
          <Button variant="primary" size="sm" hotkey="Leertaste">
            Sachverhalt bestätigen
          </Button>
        }
        secondary={
          <Button size="sm" hotkey="Shift ↵">
            Bestätigen und weiter
          </Button>
        }
      />
    </div>
  ),
};
