import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DataTable } from "../../patterns/DataTable";
import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";
import { PaymentAccountRow } from "./PaymentAccountRow";
import {
  MOVEMENT_COLUMNS,
  SETTINGS_COLUMNS,
  paymentAccountColumns,
  paymentAccountTracks,
  type PaymentAccountColumn,
} from "./payment-account-columns";
import type { PaymentAccountRowData } from "./payment-account";

const meta: Meta<typeof PaymentAccountRow> = {
  title: "v3/Entitäten/Zahlungskonto/PaymentAccountRow",
  component: PaymentAccountRow,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountRow>;

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
  expectsStatementsManual: false,
  integrationStatus: null,
  validUntil: null,
  currency: "EUR",
  ...over,
});

const ACCOUNTS: PaymentAccountRowData[] = [
  account({ id: "pa-1" }),
  account({
    id: "pa-2",
    displayName: "Kasse",
    kind: "cash",
    iban: null,
    ledgerAccountNumber: "1000",
    ledgerAccountName: "Kasse",
    expectsStatements: false,
    expectsStatementsManual: true,
    autoAssignPaymentMethod: "Barzahlung",
    txCount: 27,
    inflow: 1420,
    outflow: 3980.4,
    net: -2560.4,
    firstMovement: "2026-02-11",
    lastMovement: "2026-07-30",
  }),
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
    integrationStatus: "active",
    txCount: 76,
    inflow: 0,
    outflow: 12890.3,
    net: -12890.3,
    firstMovement: "2026-01-15",
    lastMovement: "2026-08-27",
  }),
];

const statementHref = (id: string) => `#bank=${id}`;
const accountHref = (number: string) => `#account=${number}`;

function ShortList({
  rows,
  columns,
  title,
  sub,
}: {
  rows: readonly PaymentAccountRowData[];
  columns: readonly PaymentAccountColumn[];
  title: string;
  sub?: string;
}) {
  const cols = paymentAccountColumns({ columns });
  return (
    <Card>
      <CardHead title={title} {...(sub ? { sub } : {})} />
      <Table cols={paymentAccountTracks(columns)} minWidth={1240}>
        <HeadRow>
          {cols.map((c) => (
            <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
              {c.header}
              {c.headerAside}
            </span>
          ))}
        </HeadRow>
        {rows.map((row) => (
          <PaymentAccountRow
            key={row.id}
            account={row}
            columns={columns}
            statementHref={statementHref}
            accountHref={accountHref}
          />
        ))}
      </Table>
    </Card>
  );
}

/** The year's set of columns: what moves on this account, and how much. */
export const Filled: Story = {
  render: () => (
    <ShortList title="Konten mit Bewegung" sub="Wirtschaftsjahr 2026" rows={ACCOUNTS} columns={MOVEMENT_COLUMNS} />
  ),
};

/** The configuration's set: what is set — auto-assignment, statements, connection, channel. */
export const Settings: Story = {
  render: () => (
    <ShortList title="Bankkonten & Kasse" sub="Konfiguration" rows={ACCOUNTS} columns={SETTINGS_COLUMNS} />
  ),
};

/** The six kinds, with the word from the mirror — and one sign for all of them. */
export const Kinds: Story = {
  render: () => (
    <ShortList
      title="Arten"
      rows={[
        account({ id: "k1", kind: "bank" }),
        account({ id: "k2", kind: "cash", displayName: "Nebenkasse", iban: null }),
        account({ id: "k3", kind: "credit_card", displayName: "Firmenkreditkarte", iban: null }),
        account({ id: "k4", kind: "paypal", displayName: "PayPal", iban: null }),
        account({ id: "k5", kind: "employee_clearing", displayName: "Auslagen Müller", iban: null }),
        account({ id: "k6", kind: "other", displayName: "Sonstiges Zahlungskonto", iban: null }),
      ]}
      columns={["account", "kind", "identifier", "ledgerAccount", "statementExpectation"]}
    />
  ),
};

/**
 * The edges: an account without IBAN and without movement, one that is
 * switched off, and a name at the 40-character mark.
 */
export const Edges: Story = {
  render: () => (
    <ShortList
      title="Ränder"
      rows={[
        account({
          id: "e1",
          displayName: "Verrechnungskonto Geldtransit Filiale 2",
          kind: "other",
          iban: null,
          externalAccountId: null,
          expectsStatements: false,
          expectsStatementsManual: true,
          txCount: 0,
          inflow: null,
          outflow: null,
          net: null,
          firstMovement: null,
          lastMovement: null,
        }),
        account({ id: "e2", displayName: "Altes Geschäftskonto", validUntil: "2026-03-31", txCount: 4 }),
      ]}
      columns={["account", "kind", "identifier", "statementExpectation", "txCount", "net", "period", "channelState"]}
    />
  ),
};

/** The same cells in `DataTable`, with sorting over the URL. */
export const Columns: Story = {
  render: () => (
    <DataTable
      columns={paymentAccountColumns({ columns: MOVEMENT_COLUMNS, statementHref, accountHref })}
      rows={ACCOUNTS}
      rowKey={(a) => a.id}
      sort={{ key: "net", dir: "desc" }}
      href={() => "#list"}
      head={{ title: "Konten mit Bewegung", sub: "Wirtschaftsjahr 2026", meta: "3 Konten" }}
      empty={{ title: "Kein Konto hat in diesem Jahr Bewegung." }}
      minWidth={1240}
    />
  ),
};

/** In use: three accounts in a card, each with the way to its statement. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1240 }}>
      <ShortList
        title="Konten des Mandanten"
        sub="mit Weg zum Auszug"
        rows={ACCOUNTS}
        columns={["account", "kind", "ledgerAccount", "statementExpectation", "txCount", "net"]}
      />
    </div>
  ),
};
