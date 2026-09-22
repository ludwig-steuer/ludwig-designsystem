import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TaxKeyCell } from "./TaxKey";
import { FieldList } from "../../primitives/FieldList";

const meta: Meta<typeof TaxKeyCell> = {
  title: "v3/Entitäten/Buchungssatz/TaxKeyCell",
  component: TaxKeyCell,
};
export default meta;
type Story = StoryObj<typeof TaxKeyCell>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 520, padding: "var(--space-6)", display: "grid", gap: "var(--space-5)" }}>
    {children}
  </div>
);

const href = (taxKey: string) => `?taxKey=${taxKey}`;

/**
 * Gespeichert ist der bisherige Schlüssel, gezeigt wird der aktuelle: „9"
 * steht als **401** da, „3" als **101**. Der Tooltip nennt beides — das Wort
 * des Katalogs und, wo die beiden auseinandergehen, „gespeichert als 9".
 *
 * Ohne `taxKeyHref` bleibt der Schlüssel Text. Ein Schlüssel, der aussieht
 * wie ein Link und nirgendwohin führt, ist schlimmer als einer, der es nicht
 * tut (V14).
 */
export const Filled: Story = {
  render: () => (
    <Frame>
      <FieldList
        rows={[
          ["Vorsteuer 19 %", <TaxKeyCell key="a" taxKey="9" />],
          ["Umsatzsteuer 19 %", <TaxKeyCell key="b" taxKey="3" />],
          ["Steuerfrei", <TaxKeyCell key="c" taxKey="1" />],
        ]}
      />
    </Frame>
  ),
};

/**
 * Mit `taxKeyHref` wird der Schlüssel zum Weg ins Nachschlagewerk. Die
 * Funktion bekommt den **gespeicherten** Wert; die App baut die Adresse
 * selbst in der aktuellen Form (`?taxKey=401`).
 */
export const Linked: Story = {
  render: () => (
    <Frame>
      <FieldList
        rows={[
          ["Vorsteuer 19 %", <TaxKeyCell key="a" taxKey="9" taxKeyHref={href} />],
          ["Innergem. Erwerb 19 %", <TaxKeyCell key="b" taxKey="19" taxKeyHref={href} />],
        ]}
      />
    </Frame>
  ),
};

/**
 * § 13b ist der Fall, in dem der bisherige Schlüssel allein nicht reicht:
 * „94" hat vier aktuelle Formen, und erst der Sachverhalt L+L sagt, welche.
 * Ohne ihn bleibt der Schlüssel stehen, wie er gespeichert ist — geraten
 * stünde hier ein anderer Schlüssel als in DATEV.
 */
export const ReverseCharge: Story = {
  render: () => (
    <Frame>
      <FieldList
        rows={[
          ["ohne Sachverhalt", <TaxKeyCell key="a" taxKey="94" taxKeyHref={href} />],
          ["Sachverhalt 7", <TaxKeyCell key="b" taxKey="94" reverseChargeCase={7} taxKeyHref={href} />],
          ["Sachverhalt 1", <TaxKeyCell key="c" taxKey="94" reverseChargeCase={1} taxKeyHref={href} />],
          ["ohne Vorsteuerabzug, Sachverhalt 4", <TaxKeyCell key="d" taxKey="95" reverseChargeCase={4} taxKeyHref={href} />],
        ]}
      />
    </Frame>
  ),
};

/**
 * Zwei Schlüssel, die sich nicht ändern: „490" hat kein bisheriges
 * Gegenstück, und was der Katalog nicht kennt, reicht die Zelle unverändert
 * durch. Dann sagt der Tooltip auch kein „gespeichert als".
 */
export const Unchanged: Story = {
  render: () => (
    <Frame>
      <FieldList
        rows={[
          ["ohne Vorsteuerabzug (bewusst)", <TaxKeyCell key="a" taxKey="490" taxKeyHref={href} />],
          ["unbekannter Schlüssel", <TaxKeyCell key="b" taxKey="77" taxKeyHref={href} />],
        ]}
      />
    </Frame>
  ),
};

/**
 * Keine Zeile hat einen Schlüssel haben müssen. Leer ist der Gedankenstrich
 * von `MonoCell` — nie ein leeres Feld und nie ein Link.
 */
export const Empty: Story = {
  render: () => (
    <Frame>
      <FieldList
        rows={[
          ["null", <TaxKeyCell key="a" taxKey={null} taxKeyHref={href} />],
          ["leer", <TaxKeyCell key="b" taxKey="  " taxKeyHref={href} />],
        ]}
      />
    </Frame>
  ),
};
