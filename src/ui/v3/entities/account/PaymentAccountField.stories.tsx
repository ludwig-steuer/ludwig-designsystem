import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { Field } from "../../primitives/Form";
import { Card, CardHead } from "../../primitives/Table";
import { PaymentAccountField, type PaymentAccountOption } from "./PaymentAccountField";

const meta: Meta<typeof PaymentAccountField> = {
  title: "v3/Entitäten/Konto/PaymentAccountField",
  component: PaymentAccountField,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountField>;

/**
 * Die Verteilung ist das Argument für den ganzen Baustein, deshalb steht sie
 * hier so, wie sie im Bestand aussieht: **ein** geführtes Konto mit 145
 * Buchungen, acht weitere mit null.
 */
const GEFUEHRT: PaymentAccountOption = {
  id: "a-1",
  label: "Testbank eG 100200300 · DE00 0000 0000 0000 0000 00",
  inUse: true,
};

const WEITERE: PaymentAccountOption[] = [
  { id: "a-2", label: "Geldtransit", inUse: false },
  { id: "a-3", label: "EC-Cash", inUse: false },
  { id: "a-4", label: "Kasse", inUse: false },
  { id: "a-5", label: "Nebenkasse 1", inUse: false },
  { id: "a-6", label: "Schecks", inUse: false },
  { id: "a-7", label: "Bank (Zweitkonto 3)", inUse: false },
  { id: "a-8", label: "Musterbank Autofinanzierung", inUse: false },
  { id: "a-9", label: "Paypal", inUse: false },
];

const ALLE = [GEFUEHRT, ...WEITERE];

function Frame({ children, sub }: { children: React.ReactNode; sub: string }) {
  return (
    <div style={{ maxWidth: 520 }}>
      <Card>
        <CardHead title="Zahlungskonto" sub={sub} />
        <div style={{ padding: 16 }}>{children}</div>
      </Card>
    </div>
  );
}

/**
 * Neun Konten, eines davon geführt — zwei Gruppen, die geführten zuerst. Genau
 * das ist der Fall, für den es den Baustein gibt: die Sachbearbeiterin sucht
 * ihre Bank sonst zwischen „Geldtransit", „Nebenkasse 1" und „Schecks".
 *
 * Die weiteren Konten bleiben **wählbar**. Eine falsch abgeleitete Erwartung
 * darf niemanden aussperren.
 */
export const Gefuellt: Story = {
  render: () => (
    <Frame sub="1 geführt · 8 aus dem Kontenrahmen">
      <PaymentAccountField id="pa-1" value={null} onChange={() => {}} accounts={ALLE} />
    </Frame>
  ),
};

/**
 * Zwei Gegenproben: **alle** geführt und **keines** geführt. Beide Male steht
 * die Liste flach, ohne Überschriften — eine Überschrift, die nichts trennt,
 * behauptet eine Unterscheidung, die es nicht gibt.
 *
 * Kein Randfall: ein frisch angelegter Mandant hat null geführte Konten, ein
 * kleiner genau eines von einem.
 */
export const NurGefuehrte: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      <Frame sub="alle geführt — keine Gruppen">
        <PaymentAccountField
          id="pa-2"
          value={null}
          onChange={() => {}}
          accounts={[GEFUEHRT, { id: "a-10", label: "Testbank eG 4711", inUse: true }]}
        />
      </Frame>
      <Frame sub="keines geführt — ebenso keine Gruppen">
        <PaymentAccountField id="pa-3" value={null} onChange={() => {}} accounts={WEITERE} />
      </Frame>
    </div>
  ),
};

/**
 * Leere Liste: nur der Platzhalter, und das Feld sperrt sich **selbst**. Das
 * dem Aufrufer zu überlassen hieße, dass jeder es sich merken muss — und einer
 * vergisst es.
 */
export const Leer: Story = {
  render: () => (
    <Frame sub="kein Zahlungskonto im Mandanten">
      <PaymentAccountField id="pa-4" value={null} onChange={() => {}} accounts={[]} />
    </Frame>
  ),
};

/**
 * `value` zeigt auf ein stillgelegtes Konto, das nicht mehr in der Liste steht.
 * Es steht trotzdem da — als erste Option mit „(nicht in der Liste)".
 *
 * Der Fall ist konkret: eine Wiederkehr-Regel mit `paymentAccountId` auf einem
 * Konto mit gesetztem `valid_until`. Heute lädt die Seite alle Konten des
 * Mandanten und es fällt nicht auf; sobald jemand serverseitig auf die
 * geführten kürzt, verschwände genau diese Zuordnung lautlos.
 */
export const UnbekannterWert: Story = {
  render: () => (
    <Frame sub="stillgelegtes Konto, nicht mehr in der Auswahl">
      <PaymentAccountField id="pa-5" value="a-99" onChange={() => {}} accounts={ALLE} />
    </Frame>
  ),
};

/**
 * Der Rundlauf: wählen, abwählen, und der unbekannte Wert bleibt stehen, bis
 * etwas anderes gewählt wird.
 */
export const Interaktiv: Story = {
  render: function Rundlauf() {
    const [value, setValue] = useState<string | null>("a-99");
    return (
      <Frame sub="wählen und abwählen">
        <PaymentAccountField id="pa-6" value={value} onChange={setValue} accounts={ALLE} />
        <div className="v2muted" style={{ marginTop: 16 }}>
          Gewählt: <code>{value ?? "null"}</code>
        </div>
      </Frame>
    );
  },
};

/**
 * Im Einsatz: in `Field` innerhalb einer Zeile mit Aktionsknopf, so wie der
 * Beleg-Eingang die Kontoauswahl stellt.
 */
export const ImEinsatz: Story = {
  render: function Einsatz() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 620 }}>
        <Card>
          <CardHead
            title="Kontoauszug erkannt"
            sub="Auf welches Bankkonto gehört dieser Auszug?"
          />
          <div style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field label="Zahlungskonto" htmlFor="pa-7">
                <PaymentAccountField
                  id="pa-7"
                  value={value}
                  onChange={setValue}
                  accounts={ALLE}
                  invalid={value === null}
                />
              </Field>
            </div>
            <Button variant="primary" disabled={value === null}>
              Zuordnen
            </Button>
          </div>
        </Card>
      </div>
    );
  },
};
