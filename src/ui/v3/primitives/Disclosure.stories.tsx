import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Disclosure } from "./Disclosure";
import { FieldList } from "./FieldList";
import { Card, CardHead } from "./Table";

const meta: Meta<typeof Disclosure> = {
  title: "v3/Primitives/Fläche/Disclosure",
  component: Disclosure,
};
export default meta;
type Story = StoryObj<typeof Disclosure>;

/** Die Zusammenfassung sagt, was drinsteht — nie „Details". */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Disclosure summary="Wie Ludwig auf dieses Konto gekommen ist">
        Der Kreditor „Bürobedarf Meier GmbH" wurde in den letzten sechs Monaten 14-mal auf 6815
        gebucht. Die Rechnung nennt Schreibwaren; die Wiederkehr-Regel greift nicht, weil der Betrag
        über 500,00 € liegt.
      </Disclosure>
    </div>
  ),
};

/** Die Zahl steht neben der Zusammenfassung, nicht in ihr. */
export const WithCount: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Disclosure summary="Weitere Buchungen dieses Kreditors" count={14}>
        <FieldList
          title="Letzte drei"
          rows={[
            ["26.08.2026 · RE-4471", "1.249,90 €"],
            ["12.08.2026 · RE-4402", "312,40 €"],
            ["29.07.2026 · RE-4380", "88,10 €"],
          ]}
        />
      </Disclosure>
    </div>
  ),
};

/** Offen beim ersten Rendern — für den Abschnitt, der meistens gebraucht wird. */
export const DefaultOpen: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Disclosure summary="Prüfbefunde dieses Stapels" count={3} defaultOpen>
        Drei Sätze ohne Belegverweis, zwei davon über 1.000,00 €.
      </Disclosure>
    </div>
  ),
};

/** `quiet` für technische Beigaben — sie sollen da sein, nicht rufen. */
export const Variants: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Disclosure summary="Wie Ludwig auf dieses Konto gekommen ist">
        Regel „Bürobedarf" trifft auf den Kreditor zu.
      </Disclosure>
      <Disclosure summary="Rohdaten der Extraktion" tone="quiet">
        <pre style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)" }}>
          {`{ "belegnummer": "RE-4471", "brutto": 1249.90, "ust": 19 }`}
        </pre>
      </Disclosure>
    </div>
  ),
};

/** Zwei Aufklapper in einer Karte: der fachliche zuerst, das Technische leise. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Card>
        <CardHead title="RE-4471 · Bürobedarf Meier GmbH" sub="Vorschlag vom 30.08.2026" />
        <div style={{ padding: "var(--space-5)" }}>
          <div style={{ fontSize: 13.5, marginBottom: "var(--space-4)" }}>
            6815 an 70000 · 1.249,90 € · BU 9
          </div>
          <Disclosure summary="Warum dieses Konto" count={2}>
            14 gleichartige Buchungen in sechs Monaten; die Rechnung nennt Schreibwaren.
          </Disclosure>
          <Disclosure summary="Rohzeile aus dem DATEV-Spiegel" tone="quiet">
            <pre style={{ margin: 0, fontSize: 12, fontFamily: "var(--font-mono)" }}>
              {`1249,90;S;6815;70000;9;2608;"RE-4471";"Bürobedarf"`}
            </pre>
          </Disclosure>
        </div>
      </Card>
    </div>
  ),
};

/**
 * Ein `group` je Satz von Abschnitten: der offene schließt, sobald ein anderer
 * aufgeht. Das kann das native `<details name>` — keine Zeile Zustand.
 */
export const Accordion: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Disclosure summary="Wie Ludwig auf 6815 gekommen ist" group="begruendung">
        14 gleichartige Buchungen des Kreditors in sechs Monaten; die Rechnung nennt Schreibwaren.
      </Disclosure>
      <Disclosure summary="Warum nicht 6820" group="begruendung" defaultOpen>
        Fachliteratur trägt eine eigene Position; auf der Rechnung steht keine.
      </Disclosure>
      <Disclosure summary="Warum Steuerschlüssel 9" group="begruendung">
        Der ausgewiesene Satz ist 19 %; der Kreditor rechnet ohne Reverse-Charge ab.
      </Disclosure>
    </div>
  ),
};
