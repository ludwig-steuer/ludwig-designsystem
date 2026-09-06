import { formatTime } from "../../format";
import { DataTable } from "../../patterns/DataTable";
import type { BulkAction, ListPatch } from "../../patterns/DataTable";
import {
  bankTransactionColumns,
  type BankTransactionColumn,
} from "./bank-transaction-columns";
import type { BankTransactionRowData } from "./bank-transaction";

/**
 * The payments that belong to no case yet (0086).
 *
 * **65 % of all positions are this list.** It differs from the statement
 * (0085) in three of the five criteria of §8 — **column set, filter and bulk
 * action**. The population is *not* one of the three: both lists show one
 * account (the profile's review run struck the word „across accounts"
 * explicitly), and grouping several accounts is the page's job — it knows
 * which accounts there are, the list knows its own.
 *
 * It carries **two** callers: the open payments of an account, and the
 * configuration page, which lists *every* payment of an account. That is why
 * sorting and paging are passed through even though the first caller rarely
 * needs them — 500 rows without a pager is not a list, it is a truncation.
 */

/**
 * Ranks 1–4 and 6 — the profile's set for this list.
 *
 * Without the **DATEV tick**: it answers a different question (does the line
 * stand in the history?) than the one this list is read for (whose is it?).
 *
 * With the **case column**, although in the first caller every row is
 * unassigned: it is the place where the assignment shows up the moment it
 * happens, and the second caller (the configuration page) sees rows that
 * already have one. A column that is empty in one caller and full in the
 * other is a column, not a duplication.
 */
const WORKLIST_COLUMNS: BankTransactionColumn[] = [
  "postingDate",
  "counterparty",
  "purpose",
  "cases",
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
  openHref,
  bulkActions,
  rowActions,
  rowHref,
  columns = WORKLIST_COLUMNS,
  listHref,
  sort,
  pager,
  loading,
  error,
  head,
  total,
  minWidth = 1100,
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
  /**
   * Where a row leads — the drawer of one payment (0103). Through the column
   * set, so the link sits on the counterparty and says where it goes.
   */
  rowHref?: (t: BankTransactionRowData) => string;
  /** Where „offen" leads in the case column. */
  openHref?: string;
  columns?: BankTransactionColumn[];
  /** The second caller lists **all** payments of an account, 500 at a time. */
  listHref?: (patch: ListPatch) => string;
  sort?: { key: string; dir: "asc" | "desc" };
  pager?: { page: number; pageSize: number; totalItems: number; totalPages: number };
  loading?: boolean;
  error?: { message: string; retry?: React.ReactNode };
  head: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode };
  /**
   * How many payments the account has in total. Only the empty case uses it,
   * and it needs it: „nothing open" is a success, and a success without its
   * number („all 251 of them") is a claim (profile, §8 empty case).
   */
  total?: number;
  minWidth?: number;
}) {
  return (
    <DataTable<BankTransactionRowData>
      rows={transactions}
      columns={bankTransactionColumns({
        caseHref,
        columns,
        ...(openHref ? { openHref } : {}),
        ...(rowHref ? { rowHref } : {}),
      })}
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
      {...(listHref ? { href: listHref } : {})}
      {...(sort ? { sort } : {})}
      {...(pager ? { pager } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      empty={{
        // Here empty **is** a success, and it says so with the tick — and
        // with the number, where the caller knows it: „nothing open" without
        // „of how many" is a claim, not a result.
        title: "Auf diesem Konto ist nichts mehr offen.",
        description:
          total === undefined
            ? "Jede Zahlung gehört zu einem Sachverhalt."
            : `Alle ${total.toLocaleString("de-DE")} Zahlungen dieses Kontos gehören zu einem Sachverhalt.`,
        done: true,
      }}
    />
  );
}
