import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { buildRulePreview } from "@/ludwig/modules/recurring-rules/domain/booking-preview";
import {
  accrualAmount,
  accrualSides,
  proposalSides,
  type RuleCriteria,
} from "@/ludwig/modules/recurring-rules/domain/rule";
import {
  describeRecurringRule,
  describeRuleSchedule,
} from "@/ludwig/modules/recurring-rules/domain/rule-summary";

import { Card, CardHead } from "../../primitives/Table";
import type { AccountCandidate } from "../account/AccountField";
import type { PaymentAccountOption } from "../account/PaymentAccountField";
import type { JournalLine } from "../journal-entry/JournalEntryCompact";
import { rule } from "./fixtures";
import { RecurringRuleFacts } from "./RecurringRuleFacts";
import { RecurringRuleEditor, type RecurringRuleAccounts } from "./RecurringRuleEditor";
import type { RuleDraft } from "@/ludwig/modules/recurring-rules/domain/rule-draft";

const meta: Meta<typeof RecurringRuleEditor> = {
  title: "v3/Entitäten/Wiederkehr-Regel/RecurringRuleEditor",
  component: RecurringRuleEditor,
};
export default meta;
type Story = StoryObj<typeof RecurringRuleEditor>;

const CANDIDATES: AccountCandidate[] = [
  { number: "4210", name: "Miete", reason: "Zuletzt bei dieser Gegenpartei" },
  { number: "4230", name: "Heizung" },
  { number: "4240", name: "Garage" },
  { number: "10001", name: "Musterfirma Immobilien GmbH" },
  { number: "70001", name: "Mustermieter GmbH" },
];

const ACCOUNTS: RecurringRuleAccounts = {
  candidates: { partner: CANDIDATES.slice(0, 2), all: CANDIDATES },
  onSearch: async (q) =>
    CANDIDATES.filter((c) => `${c.number} ${c.name}`.toLowerCase().includes(q.toLowerCase())),
};

/**
 * The payment accounts as the field receives them (0145): **the distribution is
 * the argument.** A client really keeps one or two accounts, with half the SKR
 * bank block next to them — without grouping the clerk searches their bank
 * between "Geldtransit" and "Schecks".
 */
const PAYMENT_ACCOUNTS: PaymentAccountOption[] = [
  { id: "pa-1", label: "Commerzbank · DE02 1204 0000 0000 5555 00", iban: null, inUse: true },
  { id: "pa-2", label: "Qonto · DE89 1001 0100 0000 1234 56", iban: null, inUse: true },
  { id: "pa-3", label: "Geldtransit", iban: null, inUse: false },
  { id: "pa-4", label: "Kasse", iban: null, inUse: false },
  { id: "pa-5", label: "Schecks", iban: null, inUse: false },
];

/** The imported rule's draft — the "change" case. */
const FILLED: RuleDraft = draftOf(rule());

function draftOf(r: ReturnType<typeof rule>): RuleDraft {
  return {
    expectedDirection: r.expectedDirection,
    matchCounterpartyName: r.matchCounterpartyName,
    matchCounterpartyIban: r.matchCounterpartyIban,
    matchAmount: r.matchAmount,
    matchAmountTolerance: r.matchAmountTolerance,
    matchAmountTolerancePercent: r.matchAmountTolerancePercent,
    matchPurposeRegex: r.matchPurposeRegex,
    matchContractNumber: r.matchContractNumber,
    matchDocumentTextRegex: r.matchDocumentTextRegex,
    expectedInterval: r.expectedInterval,
    expectedDayOfMonth: r.expectedDayOfMonth,
    bookingMode: r.bookingMode,
    personalAccountNumber: r.personalAccountNumber,
    paymentAccountId: r.paymentAccountId,
    matchingNote: r.matchingNote,
    isActive: r.isActive,
    template: r.template,
  };
}

/** The derivation's sentence for the draft — the editor does not write it. */
function summaryOf(d: RuleDraft): string {
  return describeRecurringRule({
    bookingMode: d.bookingMode,
    direction: d.expectedDirection,
    matchCounterpartyName: d.matchCounterpartyName,
    matchCounterpartyIban: d.matchCounterpartyIban,
    matchAmount: d.matchAmount,
    matchAmountTolerance: d.matchAmountTolerance,
  });
}

const NAMES: Record<string, string> = {
  "4210": "Miete",
  "10001": "Musterfirma Immobilien GmbH",
  "1200": "Bank",
};

/**
 * The preview the caller provides: `RecurringRuleFacts` with the draft. The
 * editor knows it only as `renderPreview` — it shows no second table.
 */
function Preview({ draft }: { draft: RuleDraft }) {
  const r = rule({ ...draft, template: draft.template });
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
  const total = accrualAmount(r) ?? 0;
  let lines: JournalLine[] = [];
  if (r.bookingMode === "accrue_then_settle") {
    const { counterSide, personalSide } = accrualSides(r.expectedDirection ?? "payment_out");
    lines = [
      {
        side: counterSide,
        accountNumber: r.template.counterAccountNumber ?? "4210",
        accountName: NAMES[r.template.counterAccountNumber ?? "4210"] ?? null,
        amount: total,
      },
      {
        side: personalSide,
        accountNumber: r.personalAccountNumber ?? "10001",
        accountName: NAMES[r.personalAccountNumber ?? "10001"] ?? null,
        amount: total,
      },
    ];
  } else if (r.bookingMode === "book_on_payment") {
    const { counterSide, bankSide } = proposalSides(r.expectedDirection === "payment_in" ? 1 : -1);
    lines = [
      {
        side: counterSide,
        accountNumber: r.template.counterAccountNumber ?? "4210",
        accountName: NAMES[r.template.counterAccountNumber ?? "4210"] ?? null,
        amount: total,
      },
      { side: bankSide, accountNumber: "1200", accountName: "Bank", amount: total },
    ];
  }
  return (
    <Card>
      <CardHead title="Vorschau" sub="Passt die Regel so?" />
      <div style={{ padding: 20 }}>
        <RecurringRuleFacts
          rule={r}
          summary={summaryOf(draft)}
          schedule={describeRuleSchedule(r)}
          preview={{ lines, automatic: built.automatic, note: built.note }}
        />
      </div>
    </Card>
  );
}

const noop = async () => {};

/**
 * **Der Normalfall**: kein `defaultValue`. 75 von 104 Dauersachverhalten — 72 %
 * — tragen heute keine Regel, „noch keine Regel" ist also nicht der Rand.
 * Zwölf Felder stehen offen (sechs Auslöser, vier Wirkung, zwei Erwartung),
 * die drei Abschnitte darunter sind gefaltet. Der Satz der Ableitung steht als
 * Warnung da — und **Speichern ist trotzdem möglich**: eine Regel ohne
 * Kriterium ist wirkungslos, nicht ungültig.
 */
export const New: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleEditor
        onSubmit={noop}
        accounts={ACCOUNTS}
        summary={summaryOf({ ...FILLED, matchCounterpartyName: null, matchCounterpartyIban: null, matchAmount: null })}
        paymentAccounts={PAYMENT_ACCOUNTS}
      />
    </div>
  ),
};

/**
 * Die importierte Regel des Bestands wird geändert: Gegenpartei, 1.800,00 €,
 * Sollstellung mit Personenkonto 10001, Gegenkonto 4210, monatlich zum 1.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleEditor
        defaultValue={FILLED}
        onSubmit={noop}
        accounts={ACCOUNTS}
        summary={summaryOf(FILLED)}
        paymentAccounts={PAYMENT_ACCOUNTS}
      />
    </div>
  ),
};

/**
 * Die drei Werte von `booking_mode` nebeneinander, und sie zeigen verschiedene
 * Felder: `accrue_then_settle` **mit** Personenkonto-Feld, `book_on_payment`
 * **ohne**, `match_only` mit dem Satz statt der Vorlagenfelder. Der Modus ist
 * nicht binär — bei `match_only` entsteht gar kein Vorschlag.
 */
export const Modes: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 32 }}>
      <RecurringRuleEditor
        defaultValue={{ ...FILLED, bookingMode: "accrue_then_settle" }}
        onSubmit={noop}
        accounts={ACCOUNTS}
      />
      <RecurringRuleEditor
        defaultValue={{ ...FILLED, bookingMode: "book_on_payment" }}
        onSubmit={noop}
        accounts={ACCOUNTS}
      />
      <RecurringRuleEditor
        defaultValue={{ ...FILLED, bookingMode: "match_only" }}
        onSubmit={noop}
        accounts={ACCOUNTS}
      />
    </div>
  ),
};

/**
 * Zwei blockierende Fälle zugleich: Sollstellung **ohne** Personenkonto und
 * ein kaputter regulärer Ausdruck (`([a-z`). **Beide** Gründe stehen neben dem
 * Knopf, nicht nur der erste — und je einer am Feld, zu dem er gehört. Ein
 * Entwurf, der von außen kommt, wird sofort geprüft: seine Mängel sind
 * Tatsachen, nicht ungetippte Eingabe. Der gefaltete Abschnitt „Weitere
 * Kriterien" steht deshalb offen. Geprüft wird mit `isValidRegex()` aus dem
 * Spiegel, nicht mit einem eigenen `try`.
 */
export const Invalid: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleEditor
        defaultValue={{
          ...FILLED,
          personalAccountNumber: null,
          matchPurposeRegex: "([a-z",
        }}
        onSubmit={noop}
        accounts={ACCOUNTS}
        summary={summaryOf(FILLED)}
      />
    </div>
  ),
};

/** `pending`: jede Eingabe ist gesperrt, der Knopf lädt, nichts springt. */
export const Pending: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleEditor
        defaultValue={FILLED}
        onSubmit={noop}
        onCancel={() => {}}
        accounts={ACCOUNTS}
        pending
      />
    </div>
  ),
};

/** Der Fehler vom Server steht über der Aktionszeile; die Eingaben bleiben stehen. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleEditor
        defaultValue={FILLED}
        onSubmit={noop}
        onCancel={() => {}}
        accounts={ACCOUNTS}
        error="Die Regel konnte nicht gespeichert werden: das Personenkonto 10001 gibt es im Wirtschaftsjahr 2026 nicht."
      />
    </div>
  ),
};

/**
 * The round trip: typing in the name field reports via `onCriteriaChange`, the
 * story computes a hit count, and `matchCount` returns to the form. The editor
 * does **not** compute it — whether a payment matches is a question for the bank
 * lines. `Ctrl`/`Cmd` + `Enter` saves, `Esc` cancels; both keys are shown.
 */
function Roundtrip() {
  const [count, setCount] = useState<{ matched: number; scanned: number } | null>(null);
  const [saved, setSaved] = useState<RuleDraft | null>(null);
  return (
    <div style={{ maxWidth: 720, display: "grid", gap: 16 }}>
      <RecurringRuleEditor
        onSubmit={async (draft) => setSaved(draft)}
        onCancel={() => setSaved(null)}
        onCriteriaChange={(c: RuleCriteria) => {
          // A number derived from the criteria — the caller does the real count
          // against the bank lines; the story only pretends.
          const set = [c.matchCounterpartyName, c.matchCounterpartyIban, c.matchAmount].filter(
            (v) => v !== null && v !== "",
          ).length;
          setCount({ matched: set === 0 ? 0 : 12 - set * 3, scanned: 251 });
        }}
        matchCount={count}
        accounts={ACCOUNTS}
        paymentAccounts={PAYMENT_ACCOUNTS}
      />
      {saved ? (
        <pre style={{ fontSize: 12, overflow: "auto" }}>{JSON.stringify(saved, null, 2)}</pre>
      ) : null}
    </div>
  );
}

export const Interactive: Story = { render: () => <Roundtrip /> };

/**
 * In use: in a case's "Wiederkehrende Buchung" tab — form left,
 * `RecurringRuleFacts` as preview right via `renderPreview`, cancel next to it.
 */
function InSitu() {
  return (
    <div style={{ maxWidth: 1280 }}>
      <Card>
        <CardHead title="Wiederkehrende Buchung" sub="2026-0413 · Miete Musterstraße 12" />
        <div style={{ padding: 20 }}>
          <RecurringRuleEditor
            defaultValue={FILLED}
            onSubmit={noop}
            onCancel={() => {}}
            accounts={ACCOUNTS}
            summary={summaryOf(FILLED)}
            paymentAccounts={PAYMENT_ACCOUNTS}
            matchCount={{ matched: 8, scanned: 251 }}
            renderPreview={(draft) => <Preview draft={draft} />}
          />
        </div>
      </Card>
    </div>
  );
}

export const InUse: Story = { render: () => <InSitu /> };

/**
 * Der Rand: eine Split-Vorlage mit drei Zeilen — **nur lesend**, und beim
 * Speichern unverändert —, ein Buchungstext mit 60 Zeichen, eine Notiz über
 * 400 Zeichen, kein Zahlungskonto (dann gilt das Konto der jeweiligen
 * Zahlung), und eine gesetzte Belegseite: der gefaltete Abschnitt steht
 * deshalb **offen**. Eine Klappe darf nichts verstecken, was jemand
 * eingetragen hat.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <RecurringRuleEditor
        defaultValue={{
          ...FILLED,
          matchContractNumber: "V-2019-4471",
          matchDocumentTextRegex: "Musterfirma.*Miete",
          matchPurposeRegex: "Miete\\s+\\d{2}/\\d{4}",
          matchAmountTolerancePercent: 5,
          paymentAccountId: null,
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
        }}
        onSubmit={noop}
        accounts={ACCOUNTS}
        summary={summaryOf(FILLED)}
      />
    </div>
  ),
};
