import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BankTransactionExcerpt } from "./BankTransactionExcerpt";
import { SIX_CASE_SPLIT, STATEMENT_004, TWO_PAYMENTS_ONE_CASE } from "./fixtures";

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
 *
 * **Jede Zeile klappt auf** (Owner 2026-09-21): Gegenpartei mit IBAN und BIC,
 * der Zweck vollständig mit seinen Referenzen, die Zuordnung mit dem Stand je
 * Sachverhalt, und woher die Zeile kam.
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
        statementHref="#konto-1210"
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
 * Der Split: eine Überweisung ans Finanzamt, zwei Sachverhalte. Aufgeklappt
 * stehen die beiden Sachverhalte mit Teilbetrag und Stand — die Aufteilung ist
 * Teil der Details, kein eigener Aufklapper.
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

// Why a review step lists a line — worded by the step, not by the entity.
const REASON: Record<string, string> = {
  l2: "Sachverhalt 2026-0338, Vorschlag nicht freigegeben",
  l3: "Sachverhalt 2026-0451, kein Buchungsvorschlag",
  l4: "ohne Sachverhalt",
  l7: "Sachverhalt 2026-0301, Vorschlag nicht freigegeben",
};
const UNBOOKED = STATEMENT_004.filter((t) => t.id in REASON).map((t) => ({ ...t, reason: REASON[t.id]! }));

/**
 * **Eine Spalte des Ortes** (`extraColumn`, Owner 2026-09-21): im
 * Abnahmeschritt 4 die Umsätze ohne freigegebene Buchung, und warum jeder
 * dort steht. Die Spalte steht vor dem Betrag, der rechts außen bleibt. Die
 * Zeilen tragen dafür ein Feld mehr als eine Auszugszeile (`reason`) — das
 * Excerpt reicht sie unverändert an die Spalte durch.
 */
export const WithReason: Story = {
  render: () => (
    <div style={{ maxWidth: 1100 }}>
      <BankTransactionExcerpt
        title="Umsätze ohne freigegebene Buchung"
        sub="Commerzbank · 1210 · April 2026"
        transactions={UNBOOKED}
        caseHref={caseHref}
        openHref="#zuordnen"
        rowHref={(t) => `#zahlung-${t.id}`}
        statementHref="#kontoauszug"
        extraColumn={{ key: "reason", header: "Grund", width: "minmax(200px,1.4fr)", cell: (t) => t.reason }}
      />
    </div>
  ),
};

/**
 * Der Split in die **Gegenrichtung** (Owner): mehrere Zahlungen, **ein**
 * Sachverhalt — eine Rechnung über 2.480,55 € in zwei Überweisungen. Beide
 * Zeilen nennen denselben Sachverhalt mit Nummer und Namen; jede trägt ihr
 * eigenes Ereignis und ihren eigenen Stand: die erste gebucht, die zweite ein
 * Vorschlag.
 */
export const ManyPaymentsOneCase: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Zahlungen zu 2026-0451"
        sub="Sanierung Serverraum · 2.480,55 € in zwei Raten"
        transactions={TWO_PAYMENTS_ONE_CASE}
        caseHref={caseHref}
        statementHref="#konto-1210"
      />
    </div>
  ),
};

/**
 * Eine Sammelzahlung über **sechs** Sachverhalte — so viele erlaubt der Kern
 * der App. Die Zeile nennt die Zahl und fasst die Stände zusammen; aufgeklappt
 * steht jeder Sachverhalt mit Teilbetrag und Stand.
 */
export const SixCases: Story = {
  render: () => (
    <div style={{ maxWidth: 1000 }}>
      <BankTransactionExcerpt
        title="Zahlung"
        transactions={[SIX_CASE_SPLIT]}
        caseHref={caseHref}
      />
    </div>
  ),
};
