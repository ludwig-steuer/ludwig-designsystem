import { PAYMENT_ACCOUNT_KIND_LABEL } from "@/ludwig/core/accounting/payment-account-kind";
import type { Currency } from "@/ludwig/shared/money";

import { formatCount } from "../../format";
import { Link } from "../../primitives/Link";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";
import { AccountCell } from "../account/Account";
import { PaymentAccountCell } from "./PaymentAccount";
import { statementExpectationOf, type PaymentAccountRowData } from "./payment-account";

/**
 * The points of a payment account as cells — **once**, for the year's list and
 * for the configuration (0180).
 *
 * A row component and a column set are two ways of arranging the same cells,
 * not two components (0101). The two pages differ in **which** columns they
 * take, not in what a column says: the year reads movement, the configuration
 * reads what is set.
 */

export type PaymentAccountColumn =
  | "account"
  | "kind"
  | "identifier"
  | "ledgerAccount"
  | "statementExpectation"
  | "txCount"
  | "inflow"
  | "outflow"
  | "net"
  | "period"
  | "autoAssign"
  | "integration"
  | "channelState"
  | "unassigned";

export interface PaymentAccountColumnOptions {
  columns?: readonly PaymentAccountColumn[];
  /** The way to the account's statement (`banks/[accountId]`). */
  statementHref?: (accountId: string) => string;
  /** The way to the ledger account drawer (0155). */
  accountHref?: (accountNumber: string) => string;
  /** The way to the payments of this account that carry no case yet. */
  unassignedHref?: (accountId: string) => string;
}

/** What the year's page reads: does this account move, and how much. */
export const MOVEMENT_COLUMNS: readonly PaymentAccountColumn[] = [
  "account",
  "kind",
  "identifier",
  "ledgerAccount",
  "statementExpectation",
  "txCount",
  "inflow",
  "outflow",
  "net",
  "period",
  "unassigned",
];

/** What the configuration reads: what is set on this account. */
export const SETTINGS_COLUMNS: readonly PaymentAccountColumn[] = [
  "account",
  "kind",
  "identifier",
  "ledgerAccount",
  "autoAssign",
  "statementExpectation",
  "integration",
  "channelState",
];

const money = (account: PaymentAccountRowData): Currency => account.currency ?? "EUR";

/**
 * @when    Payment accounts in a `DataTable` — the year's list, the
 *          configuration, the accounts of a batch.
 * @instead A handful of accounts in a card → PaymentAccountRow. One account
 *          named in a foreign row → PaymentAccountCell.
 */
export function paymentAccountColumns(
  options: PaymentAccountColumnOptions = {},
): ColumnDef<PaymentAccountRowData>[] {
  const { columns = MOVEMENT_COLUMNS, statementHref, accountHref, unassignedHref } = options;
  const all: Record<PaymentAccountColumn, ColumnDef<PaymentAccountRowData>> = {
    account: {
      key: "account",
      header: "Konto",
      width: "minmax(0, 1.4fr)",
      sortable: true,
      cell: (a) => (
        <PaymentAccountCell
          account={{ id: a.id, label: a.displayName, iban: a.iban }}
          {...(statementHref ? { href: statementHref(a.id) } : {})}
        />
      ),
    },
    kind: {
      key: "kind",
      header: "Art",
      width: "120px",
      cell: (a) =>
        a.kind ? (
          <span>{PAYMENT_ACCOUNT_KIND_LABEL[a.kind]}</span>
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    identifier: {
      key: "identifier",
      header: "Kennung",
      width: "minmax(0, 1fr)",
      // The IBAN where there is one, else the card identifier — an account
      // without either is a ledger account that never sees a statement.
      cell: (a) => <MonoCell value={a.iban ?? a.externalAccountId ?? null} />,
    },
    ledgerAccount: {
      key: "ledgerAccount",
      header: "Sachkonto",
      width: "minmax(0, 1fr)",
      cell: (a) =>
        a.ledgerAccountNumber === null || a.ledgerAccountNumber === undefined ? (
          <span className="v2muted">—</span>
        ) : (
          // The name is clipped, not wrapped: the row of a table keeps its
          // height, and the whole value stays in the `title` of the cell.
          <span className="v2trunc">
            <AccountCell
              number={a.ledgerAccountNumber}
              name={a.ledgerAccountName ?? null}
              {...(accountHref ? { href: accountHref(a.ledgerAccountNumber) } : {})}
            />
          </span>
        ),
    },
    statementExpectation: {
      key: "statementExpectation",
      header: "Kontoauszug",
      headerAside: <StatusInfoButton axis="statement_expectation" />,
      width: "150px",
      cell: (a) => (
        <StatusBadge axis="statement_expectation" status={statementExpectationOf(a)} info={false} />
      ),
    },
    txCount: {
      key: "txCount",
      header: "Zeilen",
      width: "88px",
      align: "end",
      sortable: true,
      // A count, not an amount: `formatCount` puts the separators and no
      // decimals — „145,00 Zeilen" was what the first browser pass caught.
      cell: (a) => <span>{formatCount(a.txCount)}</span>,
    },
    inflow: {
      key: "inflow",
      header: "Eingänge",
      width: "128px",
      align: "end",
      cell: (a) => <AmountCell value={a.inflow ?? null} currency={money(a)} />,
    },
    outflow: {
      key: "outflow",
      header: "Ausgänge",
      width: "128px",
      align: "end",
      cell: (a) => <AmountCell value={a.outflow ?? null} currency={money(a)} />,
    },
    net: {
      key: "net",
      header: "Saldo",
      width: "128px",
      align: "end",
      sortable: true,
      cell: (a) => <AmountCell value={a.net ?? null} currency={money(a)} />,
    },
    period: {
      key: "period",
      header: "Zeitraum",
      width: "minmax(0, 1fr)",
      cell: (a) =>
        a.firstMovement && a.lastMovement ? (
          <span>
            <Time value={a.firstMovement} format="date" length="short" size="sm" /> –{" "}
            <Time value={a.lastMovement} format="date" length="short" size="sm" />
          </span>
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    autoAssign: {
      key: "autoAssign",
      header: "Auto-Zuordnung",
      width: "160px",
      // The word of the payment method is the caller's: the kit has no list
      // for it, and the app keeps four of them (L-313).
      cell: (a) =>
        a.autoAssignPaymentMethod ? (
          <span>{a.autoAssignPaymentMethod}</span>
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    integration: {
      key: "integration",
      header: "Anbindung",
      headerAside: <StatusInfoButton axis="integration" />,
      width: "140px",
      cell: (a) =>
        a.integrationStatus ? (
          <StatusBadge axis="integration" status={a.integrationStatus} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    unassigned: {
      key: "unassigned",
      header: "Offene Zahlungen",
      width: "150px",
      align: "end",
      cell: (a) => {
        const open = a.unassignedCount ?? null;
        // Zero is the goal here, not an empty cell: a number that says „none
        // left" is a result and gets a word (L6).
        if (open === null) return <span className="v2muted">—</span>;
        if (open === 0) return <span className="v2sub">alles zugeordnet</span>;
        const text = `${formatCount(open)} offen`;
        return unassignedHref ? <Link href={unassignedHref(a.id)}>{text}</Link> : <span>{text}</span>;
      },
    },
    channelState: {
      key: "channelState",
      header: "Zahlungsweg",
      headerAside: <StatusInfoButton axis="payment_method" />,
      width: "140px",
      cell: (a) => (
        <StatusBadge
          axis="payment_method"
          status={a.validUntil ? "abgeschaltet" : "aktiv"}
          info={false}
        />
      ),
    },
  };
  return columns.map((key) => all[key]);
}

/**
 * The grid tracks of a column set — the same widths in `Table` as in
 * `DataTable`, so a short list and a long one line up.
 *
 * @when    A short list of payment accounts in `Table`, which needs its tracks
 *          as a string.
 * @instead The columns themselves → paymentAccountColumns.
 */
export function paymentAccountTracks(columns?: readonly PaymentAccountColumn[]): string {
  return paymentAccountColumns(columns ? { columns } : {})
    .map((c) => c.width ?? "minmax(0, 1fr)")
    .join(" ");
}
