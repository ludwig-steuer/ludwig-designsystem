import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";
import { LABELS, LABELS_WITH_GAPS, caseLink } from "./fixtures";
import {
  RECURRING_RULE_COLUMN_LABEL,
  recurringRuleColumnOrder,
  recurringRuleTracks,
  type RecurringRuleColumn,
} from "./recurring-rule-columns";
import { RecurringRuleRow, type RecurringRuleRowProps } from "./RecurringRuleRow";

const meta: Meta<typeof RecurringRuleRow> = {
  title: "v3/Entitäten/Wiederkehr-Regel/RecurringRuleRow",
  component: RecurringRuleRow,
};
export default meta;
type Story = StoryObj<typeof RecurringRuleRow>;

const caseHref = (id: string) => `#fall-${id}`;

const BASE: RecurringRuleRowProps = {
  counterpartyName: "Musterfirma Immobilien GmbH",
  counterpartyIban: null,
  bookingMode: "accrue_then_settle",
  isActive: true,
  amount: 1800,
  interval: "monthly",
  direction: "payment_out",
  labels: LABELS,
};

/** Die Standardspalten der Zeile — Ränge 1–5 und 7. */
const DEFAULT_COLUMNS: RecurringRuleColumn[] = [
  "counterparty",
  "bookingMode",
  "validity",
  "amount",
  "interval",
  "direction",
];

/** Der Spaltensatz der Fälligkeitsliste: Sachverhalt vorn, letzte Zahlung hinten. */
const LIST_COLUMNS: RecurringRuleColumn[] = [
  "case",
  "counterparty",
  "bookingMode",
  "amount",
  "interval",
  "direction",
  "periods",
  "lastPayment",
];

/**
 * Kopf und Spurmaße kommen aus **demselben** Satz wie die Zellen: `columns`
 * geht an `recurringRuleTracks` und an jede Zeile, sonst schiebt sich der Kopf
 * gegen die Zeile, sobald eine Breite sich ändert.
 */
function Frame({
  children,
  columns = DEFAULT_COLUMNS,
  title = "Wiederkehr-Regeln",
  sub,
}: {
  children: ReactNode;
  columns?: RecurringRuleColumn[];
  title?: string;
  sub?: string;
}) {
  return (
    <div style={{ maxWidth: 1400 }}>
      <Card>
        <CardHead title={title} {...(sub ? { sub } : {})} />
        <Table cols={recurringRuleTracks(columns)} minWidth={columns.length > 6 ? 1280 : 900}>
          <HeadRow>
            {recurringRuleColumnOrder(columns).map((c) => (
              <span key={c} className={c === "amount" ? "v2num" : undefined}>
                {RECURRING_RULE_COLUMN_LABEL[c]}
              </span>
            ))}
          </HeadRow>
          {children}
        </Table>
      </Card>
    </div>
  );
}

/**
 * Der Normalfall des Bestands: die importierte Mietregel — Gegenpartei,
 * Sollstellung, aktiv, 1.800,00 €, monatlich, Zahlungsausgang.
 */
export const Filled: Story = {
  render: () => (
    <Frame sub="Ränge 1–5 und 7">
      <RecurringRuleRow {...BASE} />
    </Frame>
  ),
};

/**
 * Die aus einer Zahlung gelernte Regel: **kein Name**, dafür die IBAN. Rang 1
 * ist abgeleitet — `prefillFromTransaction()` setzt bei vorhandener IBAN
 * ausdrücklich keinen Namen, und eine Zeile, die nur den Namen zeigte, wäre
 * für jede Agenten-Regel leer. Die führende Zelle bleibt gefüllt.
 */
export const LearnedFromPayment: Story = {
  render: () => (
    <Frame sub="Name oder IBAN — dieselbe Zelle">
      <RecurringRuleRow {...BASE} />
      <RecurringRuleRow
        {...BASE}
        counterpartyName={null}
        counterpartyIban="DE02 1203 0000 0000 2020 51"
        amount={null}
      />
    </Frame>
  ),
};

/**
 * Weder Name noch IBAN: dort steht **„ohne Kriterium"**, kein Gedankenstrich.
 * Die Regel ist nicht leer, sondern wirkungslos — sie trifft nichts. Den
 * ganzen Satz dazu schreibt die Ableitung und zeigt `RecurringRuleFacts`.
 */
export const WithoutCriterion: Story = {
  render: () => (
    <Frame sub="Eine Regel ohne Kriterium greift bei keiner Zahlung">
      <RecurringRuleRow {...BASE} counterpartyName={null} counterpartyIban={null} amount={null} />
    </Frame>
  ),
};

/**
 * Die drei Werte von `booking_mode` nebeneinander, `match_only` eingeschlossen
 * — im Bestand 0 von 30, und trotzdem gebaut: Code, der den Modus als binär
 * behandelt, ist der stille Bug, vor dem der Registry-Kommentar warnt. Dazu
 * eine inaktive Regel: die Gültigkeit ist ein **Wort ohne Farbe**, solange
 * `is_active` keine Achse hat (L-241).
 */
export const Modes: Story = {
  render: () => (
    <Frame sub="Buchungsweise aus der Achse `regel_modus`, Gültigkeit als Wort">
      <RecurringRuleRow {...BASE} bookingMode="accrue_then_settle" />
      <RecurringRuleRow {...BASE} bookingMode="book_on_payment" />
      <RecurringRuleRow {...BASE} bookingMode="match_only" />
      <RecurringRuleRow {...BASE} isActive={false} />
    </Frame>
  ),
};

/**
 * Rhythmus und Richtung als Wörter. Auf dem Bildschirm steht nie `monthly` —
 * das ist die Ablösung von **L-243 a**, wo `Schritt5.tsx:100` den Rohwert
 * ausgibt. Die letzte Zeile trägt eine Richtung, für die `labels` kein Wort
 * hat: sie steht **roh** da, statt still zu verschwinden (L-256).
 */
export const Words: Story = {
  render: () => (
    <Frame sub="Rhythmus aus `RULE_INTERVAL_LABEL`, Richtung aus `labels`">
      <RecurringRuleRow {...BASE} interval="monthly" direction="payment_in" />
      <RecurringRuleRow {...BASE} interval="quarterly" direction="payment_out" />
      <RecurringRuleRow {...BASE} interval="yearly" direction={null} />
      <RecurringRuleRow {...BASE} interval={null} direction="payment_in" />
      <RecurringRuleRow {...BASE} labels={LABELS_WITH_GAPS} direction="payment_out" />
    </Frame>
  ),
};

/**
 * Im Einsatz: vier Zeilen im Spaltensatz der Fälligkeitsliste — der
 * Sachverhalt vorn, der Perioden-Zähler und die letzte Zahlung hinten. So
 * stellt 0133 sie. `columns` bestimmt Zellenzahl **und** Reihenfolge, und
 * `recurringRuleTracks(columns)` liefert dem Kopf dieselbe Spur.
 */
export const InUse: Story = {
  render: () => (
    <Frame columns={LIST_COLUMNS} title="Erwartete Zahlungen ohne Eingang" sub="August 2026">
      <RecurringRuleRow
        {...BASE}
        columns={LIST_COLUMNS}
        case={caseLink()}
        caseHref={caseHref}
        periodCount={3}
        lastPayment={{ date: "2026-07-01", amount: 1800 }}
      />
      <RecurringRuleRow
        {...BASE}
        columns={LIST_COLUMNS}
        counterpartyName="Stadtwerke Musterstadt"
        amount={89.9}
        bookingMode="book_on_payment"
        case={caseLink({ caseId: "c-4501", caseNumber: "2026-0501", title: "Strom Musterstraße 12" })}
        caseHref={caseHref}
        periodCount={1}
        lastPayment={{ date: "2026-06-28", amount: 89.9 }}
      />
      <RecurringRuleRow
        {...BASE}
        columns={LIST_COLUMNS}
        counterpartyName="Musterversicherung AG"
        amount={412.5}
        interval="quarterly"
        direction="payment_out"
        case={caseLink({ caseId: "c-4520", caseNumber: "2026-0520", title: "Betriebshaftpflicht" })}
        caseHref={caseHref}
        periodCount={0}
        lastPayment={null}
      />
      <RecurringRuleRow
        {...BASE}
        columns={LIST_COLUMNS}
        counterpartyName="Mustermieter GmbH"
        amount={2400}
        direction="payment_in"
        case={caseLink({ caseId: "c-4530", caseNumber: "2026-0530", title: "Untermiete Büro" })}
        caseHref={caseHref}
        periodCount={6}
        lastPayment={{ date: "2026-07-02", amount: 2400 }}
      />
    </Frame>
  ),
};

/**
 * Der Rand: eine Gegenpartei mit **46** Zeichen (das Maximum im Bestand), ein
 * Betrag `null`, ein Rhythmus `null`, `lastPayment: null` („noch keine") — und
 * zwei Regeln desselben Sachverhalts untereinander. Mehrere Regeln je Fall
 * sind erlaubt; die Oberfläche der App zeigt heute nur eine (L-245).
 */
export const Edges: Story = {
  render: () => (
    <Frame columns={LIST_COLUMNS} title="Rand" sub="46 Zeichen, keine Zahl, zwei Regeln an einem Fall">
      <RecurringRuleRow
        {...BASE}
        columns={LIST_COLUMNS}
        counterpartyName="Musterfirma Immobilienverwaltung Nord GmbH KG"
        amount={null}
        interval={null}
        case={caseLink()}
        caseHref={caseHref}
        periodCount={0}
        lastPayment={null}
      />
      <RecurringRuleRow
        {...BASE}
        columns={LIST_COLUMNS}
        counterpartyName={null}
        counterpartyIban="DE02120300000000202051"
        amount={120}
        bookingMode="match_only"
        isActive={false}
        case={caseLink()}
        caseHref={caseHref}
        periodCount={1}
        lastPayment={{ date: "2026-05-04", amount: 120 }}
      />
    </Frame>
  ),
};
