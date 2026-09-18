import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PaymentAccountSettingsList } from "./PaymentAccountSettingsList";
import type { PaymentAccountRowData } from "./payment-account";

const meta: Meta<typeof PaymentAccountSettingsList> = {
  title: "v3/Entitäten/Zahlungskonto/PaymentAccountSettingsList",
  component: PaymentAccountSettingsList,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountSettingsList>;

const account = (over: Partial<PaymentAccountRowData> & { id: string }): PaymentAccountRowData => ({
  displayName: "Stadtbank · Geschäftskonto",
  iban: "DE89 3704 0044 0532 0130 00",
  expectsStatements: true,
  autoAssignPaymentMethod: null,
  txCount: 145,
  kind: "bank",
  ledgerAccountNumber: "1200",
  ledgerAccountName: "Bank",
  currency: "EUR",
  ...over,
});

const IN_USE: PaymentAccountRowData[] = [
  account({ id: "pa-1", integrationStatus: "active" }),
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
  }),
];

const OTHERS: PaymentAccountRowData[] = [
  account({
    id: "pa-9",
    displayName: "Geldtransit",
    kind: "other",
    iban: null,
    ledgerAccountNumber: "1360",
    ledgerAccountName: "Geldtransit",
    expectsStatements: false,
    txCount: 0,
  }),
  account({
    id: "pa-10",
    displayName: "Nebenkasse 2",
    kind: "cash",
    iban: null,
    ledgerAccountNumber: "1010",
    ledgerAccountName: "Nebenkasse",
    expectsStatements: false,
    txCount: 0,
    validUntil: "2026-03-31",
  }),
];

const statementHref = (id: string) => `#bank=${id}`;
const accountHref = (number: string) => `#account=${number}`;
const rowActions = (a: PaymentAccountRowData) => [
  { label: "Bearbeiten", href: `#edit=${a.id}` },
];

/** The two sections with their counts; the accounts in use stand above. */
export const Filled: Story = {
  render: () => (
    <PaymentAccountSettingsList
      inUse={IN_USE}
      others={OTHERS}
      head={{ title: "Bankkonten & Kasse", sub: "Konfiguration", meta: "4 Konten" }}
      rowActions={rowActions}
      statementHref={statementHref}
      accountHref={accountHref}
    />
  ),
};

/** With the bulk action the rows get boxes — switching off is confirmed, not done in passing. */
export const Retire: Story = {
  render: () => (
    <PaymentAccountSettingsList
      inUse={IN_USE}
      others={OTHERS}
      head={{ title: "Bankkonten & Kasse", sub: "zwei Konten ohne Bewegung seit 2025" }}
      retireAction={{
        label: "Abschaltung bestätigen",
        action: async () => {},
        confirm: {
          title: "Zahlungswege abschalten?",
          body: "Für abgeschaltete Konten fordert der Buchungslauf keine Auszüge mehr. Die Buchungen bleiben.",
          confirmLabel: "Abschalten",
        },
      }}
      rowActions={rowActions}
      statementHref={statementHref}
    />
  ),
};

/** No account in use: that section says it in a sentence, „weitere" stands as usual. */
export const NoneInUse: Story = {
  render: () => (
    <PaymentAccountSettingsList
      inUse={[]}
      others={OTHERS}
      head={{ title: "Bankkonten & Kasse", sub: "frisch übernommener Mandant" }}
      statementHref={statementHref}
    />
  ),
};

/** No accounts at all — they come with the DATEV reconciliation. */
export const Empty: Story = {
  render: () => (
    <PaymentAccountSettingsList inUse={[]} others={[]} head={{ title: "Bankkonten & Kasse", sub: "Konfiguration" }} />
  ),
};

/** Loading and error keep the frame (I7). */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <PaymentAccountSettingsList inUse={[]} others={[]} head={{ title: "Bankkonten & Kasse", sub: "lädt" }} loading />
      <PaymentAccountSettingsList
        inUse={[]}
        others={[]}
        head={{ title: "Bankkonten & Kasse", sub: "Konfiguration" }}
        error={{ message: "Die Zahlungskonten konnten nicht geladen werden." }}
      />
    </div>
  ),
};
