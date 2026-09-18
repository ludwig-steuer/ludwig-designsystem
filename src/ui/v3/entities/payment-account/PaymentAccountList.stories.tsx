import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PaymentAccountList } from "./PaymentAccountList";
import type { PaymentAccountRowData } from "./payment-account";

const meta: Meta<typeof PaymentAccountList> = {
  title: "v3/Entitäten/Zahlungskonto/PaymentAccountList",
  component: PaymentAccountList,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountList>;

const account = (over: Partial<PaymentAccountRowData> & { id: string }): PaymentAccountRowData => ({
  displayName: "Stadtbank · Geschäftskonto",
  iban: "DE89 3704 0044 0532 0130 00",
  expectsStatements: true,
  autoAssignPaymentMethod: null,
  txCount: 145,
  kind: "bank",
  ledgerAccountNumber: "1200",
  ledgerAccountName: "Bank",
  inflow: 128450.2,
  outflow: 119880.75,
  net: 8569.45,
  firstMovement: "2026-01-03",
  lastMovement: "2026-08-29",
  unassignedCount: 3,
  currency: "EUR",
  ...over,
});

const ACCOUNTS: PaymentAccountRowData[] = [
  account({ id: "pa-1" }),
  account({
    id: "pa-3",
    displayName: "Firmenkreditkarte",
    kind: "credit_card",
    iban: null,
    externalAccountId: "•••• 4711",
    ledgerAccountNumber: "1360",
    ledgerAccountName: "Geldtransit",
    expectsStatements: false,
    autoAssignPaymentMethod: "Kredit-/EC-Karte",
    txCount: 76,
    inflow: 0,
    outflow: 12890.3,
    net: -12890.3,
    firstMovement: "2026-01-15",
    lastMovement: "2026-08-27",
    unassignedCount: 0,
  }),
  account({
    id: "pa-2",
    displayName: "Kasse",
    kind: "cash",
    iban: null,
    ledgerAccountNumber: "1000",
    ledgerAccountName: "Kasse",
    expectsStatements: false,
    statementExpectationManual: "none",
    autoAssignPaymentMethod: "Barzahlung",
    txCount: 27,
    inflow: 1420,
    outflow: 3980.4,
    net: -2560.4,
    firstMovement: "2026-02-11",
    lastMovement: "2026-07-30",
    unassignedCount: 1,
  }),
];

const statementHref = (id: string) => `#bank=${id}`;
const accountHref = (number: string) => `#account=${number}`;
const unassignedHref = (id: string) => `#unassigned=${id}`;

/** Three accounts, movement first — and what of it carries no case yet. */
export const Filled: Story = {
  render: () => (
    <PaymentAccountList
      accounts={ACCOUNTS}
      head={{ title: "Konten mit Bewegung", sub: "Wirtschaftsjahr 2026", meta: "3 Konten" }}
      statementHref={statementHref}
      accountHref={accountHref}
      unassignedHref={unassignedHref}
    />
  ),
};

/** Sorting travels through the URL; the table only shows the state. */
export const Sorted: Story = {
  render: () => (
    <PaymentAccountList
      accounts={ACCOUNTS}
      head={{ title: "Konten mit Bewegung", sub: "nach Saldo" }}
      sort={{ key: "net", dir: "desc" }}
      href={() => "#list"}
      statementHref={statementHref}
      unassignedHref={unassignedHref}
    />
  ),
};

/** Nothing moved: the sentence says what to do, not that the table is empty. */
export const Empty: Story = {
  render: () => (
    <PaymentAccountList accounts={[]} head={{ title: "Konten mit Bewegung", sub: "Wirtschaftsjahr 2026" }} />
  ),
};

/** Loading keeps head and column head in place; the error names its message (I7). */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <PaymentAccountList accounts={[]} head={{ title: "Konten mit Bewegung", sub: "lädt" }} loading />
      <PaymentAccountList
        accounts={[]}
        head={{ title: "Konten mit Bewegung", sub: "Wirtschaftsjahr 2026" }}
        error={{ message: "Die Konten konnten nicht geladen werden." }}
      />
    </div>
  ),
};
