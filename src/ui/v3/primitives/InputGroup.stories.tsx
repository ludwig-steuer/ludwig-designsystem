import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Search } from "lucide-react";
import { Field, Input, InputGroup } from "./Form";
import { Kbd } from "./Kbd";

const meta: Meta<typeof InputGroup> = {
  title: "v3/Primitives/Formular/InputGroup",
  component: InputGroup,
};
export default meta;
type Story = StoryObj<typeof InputGroup>;

/**
 * Lupe davor, Einheit dahinter — beides gehört zum Feld, nicht daneben. Ein
 * Klick auf die Beigabe setzt den Cursor ins Feld, der Fokusring umschließt
 * die ganze Gruppe.
 */
export const Filled: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 320 }}>
      <InputGroup prefix={<Search size={14} strokeWidth={1.5} aria-hidden="true" />}>
        <Input className="v2search" placeholder="Beleg, Kreditor, Betrag" aria-label="Suche" />
      </InputGroup>
      <InputGroup suffix="%">
        <Input defaultValue="19" inputMode="decimal" aria-label="Steuersatz" />
      </InputGroup>
    </div>
  ),
};

/**
 * Im Einsatz: die Suche der Top-Bar zeigt ihre Taste am Feld (V14), das
 * Steuersatz-Feld steht in einem `Field` — ist es ungültig, färbt sich die
 * ganze Gruppe, und der Grund steht als Text darunter (V7).
 */
export const InUse: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <InputGroup
        prefix={<Search size={14} strokeWidth={1.5} aria-hidden="true" />}
        suffix={<Kbd>⌘K</Kbd>}
      >
        <Input
          className="v2search"
          placeholder="Suchen oder Befehl wählen"
          aria-label="Suche"
        />
      </InputGroup>
      <Field
        label="Steuersatz"
        error="Der Steuersatz liegt außerhalb der zulässigen Sätze. Zulässig sind 0, 7 und 19 %."
        htmlFor="ust"
      >
        <InputGroup suffix="%">
          <Input id="ust" defaultValue="23" invalid inputMode="decimal" />
        </InputGroup>
      </Field>
    </div>
  ),
};

/**
 * Der Rand: ein Suffix, der länger ist als die Eingabe, und ein gesperrtes
 * Feld — die Beigabe graut mit, statt hell stehen zu bleiben.
 */
export const Edge: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 360 }}>
      <InputGroup suffix="Tage nach Fälligkeit">
        <Input defaultValue="14" inputMode="numeric" aria-label="Zahlungsziel" />
      </InputGroup>
      <InputGroup prefix="Konto" suffix="wird aus dem Kontenplan geführt">
        <Input defaultValue="6815" disabled aria-label="Konto" />
      </InputGroup>
    </div>
  ),
};
