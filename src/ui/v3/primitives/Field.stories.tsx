import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox, Field, Input, Select, Textarea } from "./Form";

const meta: Meta<typeof Field> = { title: "v3/Primitives/Formular/Field", component: Field };
export default meta;
type Story = StoryObj<typeof Field>;

/** Label über der Eingabe, Hinweis darunter — nie als Platzhaltertext. */
export const Filled: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <Field label="Beleg 1" hint="Die Belegnummer, wie sie in DATEV erscheint." htmlFor="b1">
        <Input id="b1" defaultValue="RE-3120" />
      </Field>
      <Field label="Buchungstext" htmlFor="t">
        <Input id="t" defaultValue="Bürobedarf 08/2026" />
      </Field>
      <Field label="Steuerschlüssel" htmlFor="bu">
        <Select id="bu" defaultValue="9">
          <option value="">ohne</option>
          <option value="9">9 · 19 % Vorsteuer</option>
          <option value="8">8 · 7 % Vorsteuer</option>
        </Select>
      </Field>
      <Field label="Notiz" hint="Optional. Steht am Sachverhalt, nicht im Buchungstext." htmlFor="n">
        <Textarea id="n" placeholder="Was bei der nächsten Periode zu beachten ist …" />
      </Field>
      <Checkbox label="Ich habe die Abweichung geprüft" defaultChecked />
    </div>
  ),
};

/** Fehler ersetzt den Hinweis und benennt die Bedingung, nicht nur „ungültig". */
export const WithError: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <Field label="Umsatz" error="Der Betrag muss größer als 0,00 € sein." htmlFor="u">
        <Input id="u" invalid defaultValue="0,00" />
      </Field>
      <Field label="Konto" error="4980 gibt es im SKR04 dieses Mandanten nicht." htmlFor="k">
        <Input id="k" invalid defaultValue="4980" />
      </Field>
    </div>
  ),
};

/** Leer und gesperrt — der Grund steht im Hinweis, nicht im Nichts. */
export const Disabled: Story = {
  render: () => (
    <div className="v2stack" style={{ maxWidth: 420 }}>
      <Field label="Buchungstext" hint="Gesperrt, solange der Stapel in DATEV liegt." htmlFor="g">
        <Input id="g" disabled defaultValue="Bürobedarf 08/2026" />
      </Field>
    </div>
  ),
};
