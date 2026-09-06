import { formatTime } from "../../format";
import { DataTable } from "../../patterns/DataTable";
import type { BulkAction } from "../../patterns/DataTable";
import {
  bankTransactionColumns,
  type BankTransactionColumn,
} from "./bank-transaction-columns";
import type { BankTransactionRowData } from "./bank-transaction";

/**
 * The payments that belong to no case yet (0086).
 *
 * **65 % of all positions are this list.** It differs from the statement
 * (0085) in three of the five criteria of §8 — population (only Z0), bulk
 * action (yes) and column set (no DATEV tick, no assignment column, because
 * every row here is unassigned and the tick answers a different question).
 * Two would have been enough.
 *
 * The page groups by account and renders one table per account; the profile is
 * explicit that this component is **per account**, not across them. Grouping is
 * the page's job — it knows which accounts there are, the list knows its own.
 */

/** Without the assignment column and without the tick: both would say „no" in every row. */
const WORKLIST_COLUMNS: BankTransactionColumn[] = [
  "postingDate",
  "counterparty",
  "purpose",
  "amount",
];

/**
 * @when    The open payments of one account, to be assigned in one go.
 * @instead The whole statement of an account → BankTransactionList. A handful
 *          of rows → BankTransactionRow.
 */
export function BankTransactionWorklist({
  transactions,
  caseHref,
  bulkActions,
  rowActions,
  columns = WORKLIST_COLUMNS,
  loading,
  error,
  head,
  minWidth = 900,
}: {
  transactions: BankTransactionRowData[];
  caseHref: (caseId: string) => string;
  /**
   * „Neuen Sachverhalt anlegen" and „bestehendem zuordnen". The list offers
   * them; **which** case is the caller's question — the picker (0084) is not
   * built, and a list that opened one would decide something that is not hers.
   */
  bulkActions: BulkAction[];
  /** „Einzeln", „Dauer", and the suggestion „→ Beleg Nr." — one row at a time. */
  rowActions?: React.ComponentProps<typeof DataTable<BankTransactionRowData>>["rowActions"];
  columns?: BankTransactionColumn[];
  loading?: boolean;
  error?: { message: string; retry?: React.ReactNode };
  head: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode };
  minWidth?: number;
}) {
  return (
    <DataTable<BankTransactionRowData>
      rows={transactions}
      columns={bankTransactionColumns({ caseHref, columns })}
      rowKey={(t) => t.id}
      head={head}
      minWidth={minWidth}
      selection={{
        actions: bulkActions,
        // The box has to say **which** row it ticks, and it says it the way
        // the row does: an absolute date, not the ISO string (T7).
        label: (t) =>
          `${t.counterpartyName ?? "Zahlung"} vom ${formatTime(t.postingDate, "date", "medium")} auswählen`,
      }}
      {...(rowActions ? { rowActions } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      empty={{
        // Here empty **is** a success, and it says so with the tick: every
        // payment of this account belongs to a case.
        title: "Auf diesem Konto ist nichts mehr offen.",
        description: "Jede Zahlung gehört zu einem Sachverhalt.",
        done: true,
      }}
    />
  );
}
