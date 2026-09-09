import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardHead } from "../../primitives/Table";
import { caseLink } from "./fixtures";
import { RecurringRuleList } from "./RecurringRuleList";
import type { RecurringRuleListRow } from "./recurring-rule-columns";

const meta: Meta<typeof RecurringRuleList> = {
  title: "v3/Entitäten/Wiederkehr-Regel/RecurringRuleList",
  component: RecurringRuleList,
};
export default meta;
type Story = StoryObj<typeof RecurringRuleList>;

const caseHref = (id: string) => `#fall-${id}`;

function item(over: Partial<RecurringRuleListRow> & { id: string }): RecurringRuleListRow {
  return {
    counterpartyName: "Musterfirma Immobilien GmbH",
    counterpartyIban: null,
    bookingMode: "accrue_then_settle",
    isActive: true,
    amount: 1800,
    interval: "monthly",
    direction: "payment_out",
    case: caseLink(),
    lastPayment: { date: "2026-07-01", amount: 1800 },
    ...over,
  };
}

const THREE: RecurringRuleListRow[] = [
  item({ id: "r-1" }),
  item({
    id: "r-2",
    counterpartyName: "Stadtwerke Musterstadt",
    amount: 89.9,
    bookingMode: "book_on_payment",
    case: caseLink({ caseId: "c-4501", caseNumber: "2026-0501", title: "Strom Musterstraße 12" }),
    lastPayment: { date: "2026-06-28", amount: 89.9 },
  }),
  item({
    id: "r-3",
    counterpartyName: "Musterversicherung AG",
    amount: 412.5,
    interval: "quarterly",
    case: caseLink({ caseId: "c-4520", caseNumber: "2026-0520", title: "Betriebshaftpflicht" }),
    lastPayment: null,
  }),
];

/**
 * Drei ausbleibende Zahlungen, Kopf mit Zeitraum und Zähler „3 von 27 Regeln".
 * Der Sachverhalt steht **vorn** — die Liste verlässt ihren Fall und zählt
 * über alle Sachverhalte eines Mandanten; die Nachfrage passiert am Fall. Die
 * Buchungsweise steht in jeder Zeile: heute fehlt sie in der App, und ohne sie
 * sieht man nicht, ob die fehlende Zahlung überhaupt etwas gebucht hätte.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1400 }}>
      <RecurringRuleList
        rules={THREE}
        caseHref={caseHref}
        period="August 2026"
        total={27}
      />
    </div>
  ),
};

/**
 * Der Kern dieser Aufgabe: bei null Treffern bleibt die **Karte stehen** und
 * sagt den Erfolg. Heute blendet Schritt 5 die ganze Liste aus — wer nichts
 * sieht, weiß nicht, ob geprüft wurde oder ob nichts zu prüfen war.
 */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 1400 }}>
      <RecurringRuleList rules={[]} caseHref={caseHref} period="August 2026" total={27} />
    </div>
  ),
};

/**
 * Im Einsatz: im Schritt der Stapelabnahme, unter einer zweiten Karte. Die
 * Liste sitzt in der Seite, ohne die Freigabe zu blockieren — Auskunft, keine
 * Aufgabe. Hier **ohne** `total`: dann steht im Kopf nur die Trefferzahl.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1400, display: "grid", gap: 24 }}>
      <Card>
        <CardHead
          title="Schritt 5 · Abnahme"
          sub="Prüfen Sie, was im Zeitraum offen geblieben ist, bevor Sie den Stapel freigeben."
        />
      </Card>
      <RecurringRuleList
        rules={THREE}
        caseHref={caseHref}
        period="August 2026"
        title="Offene Dauerbuchungen dieses Stapels"
      />
    </div>
  ),
};

/**
 * Der obere Rand: **29** Zeilen — mehr aktive Regeln hat der größte Mandant im
 * Bestand nicht. Darin eine Gegenpartei mit 46 Zeichen, ein Betrag `null`,
 * eine Regel ohne Rhythmus, eine mit `lastPayment: null` („noch keine") und
 * ein Sachverhalt ohne Titel.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 1400 }}>
      <RecurringRuleList
        rules={[
          item({
            id: "e-0",
            counterpartyName: "Musterfirma Immobilienverwaltung Nord GmbH KG",
            amount: null,
            interval: null,
            lastPayment: null,
          }),
          item({
            id: "e-1",
            counterpartyName: null,
            counterpartyIban: "DE02120300000000202051",
            case: caseLink({ caseId: "c-9000", caseNumber: "2026-0900", title: null }),
          }),
          ...Array.from({ length: 27 }, (_, i) =>
            item({
              id: `e-${i + 2}`,
              counterpartyName: `Musterfirma ${i + 2} GmbH`,
              amount: 100 + i * 37.5,
              case: caseLink({
                caseId: `c-${5000 + i}`,
                caseNumber: `2026-${String(600 + i).padStart(4, "0")}`,
                title: `Dauersachverhalt ${i + 2}`,
              }),
              lastPayment: { date: "2026-07-01", amount: 100 + i * 37.5 },
            }),
          ),
        ]}
        caseHref={caseHref}
        period="August 2026"
        total={29}
      />
    </div>
  ),
};
