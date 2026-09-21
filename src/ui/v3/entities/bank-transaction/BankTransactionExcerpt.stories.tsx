import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BankTransactionExcerpt } from "./BankTransactionExcerpt";
import { STATEMENT_004 } from "./fixtures";

const meta: Meta<typeof BankTransactionExcerpt> = {
  title: "v3/Entitäten/Kontoauszugsposition/BankTransactionExcerpt",
  component: BankTransactionExcerpt,
};
export default meta;
type Story = StoryObj<typeof BankTransactionExcerpt>;

const caseHref = (id: string) => `#fall-${id}`;

/**
 * Die sieben Zeilen aus Auszug 004 (0193). Die Spalte **Buchung** beantwortet
 * die Frage „ist diese Zahlung fertig?" in einem Blick: ein Haken mit
 * „gebucht", wo sie fertig ist — sonst der Zustand der Ereignisse, die sie
 * aufhalten („Vorschlag", „Buchung fehlt", „Geplant"). Was noch nicht
 * zugeordnet ist, sagt die Spalte Sachverhalt („offen", „Rest … offen").
 * Der interne Übertrag trägt den Haken auch; warum, steht im Tooltip: keine
 * Buchung nötig.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Commerzbank · 1210"
        sub="Auszug 004 · April 2026"
        transactions={STATEMENT_004}
        caseHref={caseHref}
        openHref="#zuordnen"
      />
    </div>
  ),
};

/** Nur fertige Zeilen — jede trägt denselben Haken, der Split eingeschlossen. */
export const Settled: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Gebuchte Zahlungen"
        sub="April 2026"
        transactions={STATEMENT_004.filter((t) => t.settled)}
        caseHref={caseHref}
      />
    </div>
  ),
};

/**
 * Der Split: eine Überweisung ans Finanzamt, zwei Sachverhalte. Im Ausschnitt
 * stehen die Teilbeträge gleich darunter — bei einer Handvoll Zeilen ist das
 * Auskunft, kein Rauschen.
 */
export const Split: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Zahlung"
        transactions={STATEMENT_004.filter((t) => t.id === "l5")}
        caseHref={caseHref}
      />
    </div>
  ),
};

/**
 * Ohne `settled` weiß der Aufrufer noch nicht, ob eine Zeile fertig ist (die
 * Regel liegt in der Domäne der App, L-340). Dann steht **kein** Haken da —
 * das Set rechnet ihn nicht selbst —, sondern der Zustand jedes Ereignisses,
 * wie bisher.
 */
export const WithoutSettled: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Commerzbank · 1210"
        sub="ohne Auskunft über „gebucht“"
        transactions={STATEMENT_004.map(({ settled: _settled, ...t }) => t)}
        caseHref={caseHref}
      />
    </div>
  ),
};

/** Leer ist ein Satz mit Grund. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Umsätze ohne freigegebene Buchung"
        transactions={[]}
        caseHref={caseHref}
        empty={{ title: "Alle Umsätze sind gebucht.", hint: "Jede Zahlung des Zeitraums hat eine freigegebene Buchung." }}
      />
    </div>
  ),
};

/**
 * Im Einsatz: die Zahlung in einem Abnahmeschritt — eine Zeile in einer
 * schmalen Spalte, wie sie heute als Handbau in Schritt 3 steht.
 */
export const InStep: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <BankTransactionExcerpt
        title="Zahlung"
        sub="zu diesem Beleg"
        transactions={STATEMENT_004.filter((t) => t.id === "l3")}
        caseHref={caseHref}
        rowHref={(t) => `#zahlung-${t.id}`}
      />
    </div>
  ),
};
