import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { buildRulePreview } from "@/ludwig/modules/recurring-rules/domain/booking-preview";
import {
  accrualAmount,
  accrualSides,
  proposalSides,
  type RecurringRule,
} from "@/ludwig/modules/recurring-rules/domain/rule";
import {
  describeRecurringRule,
  describeRuleSchedule,
} from "@/ludwig/modules/recurring-rules/domain/rule-summary";

import { Card, CardHead } from "../../primitives/Table";
import type { JournalLine } from "../journal-entry/JournalEntryCompact";
import { rule } from "./fixtures";
import { RecurringRuleFacts, type RecurringRulePreview } from "./RecurringRuleFacts";

const meta: Meta<typeof RecurringRuleFacts> = {
  title: "v3/Entitäten/Wiederkehr-Regel/RecurringRuleFacts",
  component: RecurringRuleFacts,
};
export default meta;
type Story = StoryObj<typeof RecurringRuleFacts>;

const accountHref = (n: string) => `#konto-${n}`;

/** The caller knows the account names — the rule carries only numbers. */
const NAMES: Record<string, string> = {
  "4210": "Miete",
  "4230": "Heizung",
  "4240": "Garage",
  "10001": "Musterfirma Immobilien GmbH",
  "1200": "Bank",
};

/**
 * The translation **the caller** does (L-255): `buildRulePreview()` delivers
 * finished labels ("4200 Miete", or the fallback "Bank (aus Zahlung)" without a
 * number), `JournalEntryCard` needs number and name apart. `automatic` and
 * `note` pass through unchanged.
 */
function previewOf(r: RecurringRule): RecurringRulePreview {
  const built = buildRulePreview({
    bookingMode: r.bookingMode,
    direction: r.expectedDirection,
    counterAccount: r.template.counterAccountNumber
      ? {
          accountNumber: r.template.counterAccountNumber,
          accountName: NAMES[r.template.counterAccountNumber] ?? null,
        }
      : null,
    personalAccount: r.personalAccountNumber
      ? { accountNumber: r.personalAccountNumber, accountName: NAMES[r.personalAccountNumber] ?? null }
      : null,
    bankAccount: null,
    lines: null,
    taxKey: r.template.taxKey,
    amount: accrualAmount(r),
  });
  return { lines: linesOf(r), automatic: built.automatic, note: built.note };
}

function line(number: string, side: JournalLine["side"], amount: number): JournalLine {
  return { side, accountNumber: number, accountName: NAMES[number] ?? null, amount };
}

function linesOf(r: RecurringRule): JournalLine[] {
  if (r.bookingMode === "match_only") return [];
  const total = accrualAmount(r) ?? 0;
  const counter = r.template.counterAccountNumber ?? "4210";
  if (r.bookingMode === "accrue_then_settle") {
    const { counterSide, personalSide } = accrualSides(r.expectedDirection ?? "payment_out");
    return [
      line(counter, counterSide, total),
      line(r.personalAccountNumber ?? "10001", personalSide, total),
    ];
  }
  const { counterSide, bankSide } = proposalSides(r.expectedDirection === "payment_in" ? 1 : -1);
  if (r.template.lines?.length) {
    return [
      ...r.template.lines.map((l) => line(l.accountNumber, counterSide, l.amount ?? 0)),
      line("1200", bankSide, total),
    ];
  }
  return [line(counter, counterSide, total), line("1200", bankSide, total)];
}

function facts(r: RecurringRule) {
  return {
    rule: r,
    summary: describeRecurringRule({
      bookingMode: r.bookingMode,
      direction: r.expectedDirection,
      matchCounterpartyName: r.matchCounterpartyName,
      matchCounterpartyIban: r.matchCounterpartyIban,
      matchAmount: r.matchAmount,
      matchAmountTolerance: r.matchAmountTolerance,
    }),
    schedule: describeRuleSchedule(r),
    preview: previewOf(r),
  };
}

/**
 * Die importierte Regel des Bestands: Gegenpartei, Sollstellung, aktiv,
 * 1.800,00 € ± 0,00 €, monatlich zum 1., Personenkonto 10001, Gegenkonto 4210,
 * Belegnummer 20260016 — und die Vorschau als `JournalEntryCard`, nicht als
 * eigene Tabelle. Die Belegnummer der Dauerbuchung (Rang 8) steht heute in
 * **keiner** Komponente der App; sie trägt den OPOS-Ausgleich.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleFacts {...facts(rule())} />
    </div>
  ),
};

/**
 * Die Regel ohne jedes Kriterium: der Satz kommt aus der Ableitung — „Diese
 * Regel hat noch keine Match-Kriterien und greift daher bei keiner Zahlung."
 * Die Gruppe „Auslöser" ist **abwesend**, nicht leer. „Wirkung" und
 * „Erwartung" stehen weiter: die Regel würde etwas tun, sie kommt nur nie dazu.
 */
export const WithoutCriterion: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleFacts
        {...facts(
          rule({
            matchCounterpartyName: null,
            matchCounterpartyIban: null,
            matchAmount: null,
            expectedDirection: null,
            matchesDocuments: false,
          }),
        )}
      />
    </div>
  ),
};

/**
 * Die drei Werte von `booking_mode` nebeneinander. `accrue_then_settle` zeigt
 * die Vorschau und die Hinweiszeile „Zahlung später: …", `book_on_payment` den
 * Satz gegen die Bank, **`match_only`** den Satz statt der Vorschau — und
 * **keine** leere Karte. Der Wert kommt im Bestand nicht vor (0 von 30).
 * Rechts dazu der Hinweis „Modus prüfen?", den der Aufrufer als `hints` gibt.
 */
export const Modes: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 32 }}>
      <RecurringRuleFacts {...facts(rule({ bookingMode: "accrue_then_settle" }))} />
      <RecurringRuleFacts
        {...facts(rule({ bookingMode: "book_on_payment", personalAccountNumber: null }))}
        hints={["Modus prüfen? Die Regel bucht bei Zahlung, trägt aber ein Personenkonto."]}
      />
      <RecurringRuleFacts {...facts(rule({ bookingMode: "match_only" }))} />
    </div>
  ),
};

/**
 * Dieselbe Regel mit `all`: Herkunft des Profils, Zahlungskonto,
 * Belegnummern-Strategie und Idempotenz-Anker. Die Strategie ist hier `fixed`
 * — „fest vergeben", seit dem Spiegellauf vom 2026-09-09 ein Wort aus der
 * Domäne statt eines von außen gereichten. Genau eine Regel im Bestand trägt
 * `fixed`, und die bricht ab der zweiten Periode den OPOS-Ausgleich.
 */
export const All: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleFacts
        {...facts(rule({ documentNumberStrategy: "fixed", profileSource: "derived" }))}
        all
      />
    </div>
  ),
};

/**
 * `explain` mit `all` (0160): jede Einstellung mit ihrem Satz — woran die
 * Regel eine Zahlung erkennt, was sie bucht, wann sie sie erwartet. Die
 * Buchungsweise erklärt sich mit dem Wort ihrer Achse; was nur der Import
 * setzt, sagt „setzt der Import". Rhythmus und Zahltag sind ausdrücklich
 * **kein** Kriterium.
 */
export const Explained: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleFacts {...facts(rule())} all explain accountHref={accountHref} />
    </div>
  ),
};

/**
 * Im Einsatz: im Reiter „Wiederkehrende Buchung" eines Sachverhalts, in einer
 * Karte und mit `accountHref` — so stellt der `CaseDetailView` sie. Die Form
 * bringt selbst **keinen** Rahmen und keinen Innenabstand mit.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <Card>
        <CardHead title="Wiederkehrende Buchung" sub="2026-0413 · Miete Musterstraße 12" />
        <div style={{ padding: 20 }}>
          <RecurringRuleFacts {...facts(rule())} accountHref={accountHref} />
        </div>
      </Card>
    </div>
  ),
};

/**
 * Der Rand: eine Split-Vorlage mit drei Zeilen (die Vorschau zeigt vier
 * Sätze), ein Buchungstext mit 60 Zeichen (das Maximum im Bestand), eine
 * Zuordnungs-Notiz über 400 Zeichen, `schedule: null` — dann **entfällt** die
 * Gruppe „Erwartung" —, und eine gesetzte Belegseite (Vertragsnummer +
 * Belegtext-Muster), die im Bestand zu 0 % gefüllt ist und in keiner
 * Oberfläche steht.
 *
 * Dazu `currency="CHF"`: die Regel selbst führt **keine** Währungsspalte, jeder
 * Betrag an ihr ist Euro. Eine andere Währung kann darum nur vom Aufrufer
 * kommen — und wenn die Prop das können soll, muss eine Story es zeigen.
 */
export const Edges: Story = {
  render: () => {
    const r = rule({
      bookingMode: "book_on_payment",
      personalAccountNumber: null,
      expectedInterval: null,
      expectedDayOfMonth: null,
      validFrom: null,
      validUntil: null,
      matchContractNumber: "V-2019-4471",
      matchDocumentTextRegex: "Musterfirma.*Miete",
      matchPurposeRegex: "Miete\\s+\\d{2}/\\d{4}",
      matchCounterpartyIban: "DE02120300000000202051",
      matchAmountTolerancePercent: 5,
      matchingNote:
        "Der Vermieter zieht die Miete seit Januar 2026 zusammen mit der Garage ein, " +
        "die Nebenkosten kommen dagegen einmal jährlich als eigene Abrechnung. Die Regel " +
        "trifft deshalb nur den monatlichen Betrag; die Jahresabrechnung wird von Hand " +
        "zugeordnet und liegt als eigener Sachverhalt daneben. Wenn der Betrag zum " +
        "Jahreswechsel steigt, bitte die Toleranz prüfen, statt eine zweite Regel anzulegen.",
      template: {
        counterAccountNumber: null,
        taxKey: "9",
        taxRatePercent: 19,
        description: "Miete Musterstraße 12 samt Garage und Heizung, Monat",
        lines: [
          { accountNumber: "4210", amount: 1200, percent: null, taxKey: null, taxRatePercent: null, description: "Miete" },
          { accountNumber: "4230", amount: 400, percent: null, taxKey: null, taxRatePercent: null, description: "Heizung" },
          { accountNumber: "4240", amount: 200, percent: null, taxKey: null, taxRatePercent: null, description: "Garage" },
        ],
        amount: null,
      },
    });
    return (
      <div style={{ maxWidth: 720 }}>
        <RecurringRuleFacts {...facts(r)} all currency="CHF" />
      </div>
    );
  },
};
