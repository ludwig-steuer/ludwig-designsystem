import { DataTable, type DataTableProps, type ListPatch } from "../../patterns/DataTable";
import {
  paymentAccountColumns,
  type PaymentAccountColumn,
  type PaymentAccountColumnOptions,
} from "./payment-account-columns";
import type { PaymentAccountRowData } from "./payment-account";

type Table = DataTableProps<PaymentAccountRowData>;

/**
 * The accounts that move (0181) — Monday morning's question: **which
 * statement do I have to open?**
 *
 * Two figures answer it per account: what moved, and what of it carries no
 * case yet. No pager and no filter: a client keeps four accounts in use, and
 * mechanics without an occasion is what §8 forbids.
 *
 * @when    The year's list of payment accounts, sorted by movement.
 * @instead Setting them up → PaymentAccountSettingsList. The accounts of a
 *          batch with their gates → 0168.
 */
export function PaymentAccountList({
  accounts,
  head,
  columns,
  sort,
  href,
  empty,
  loading,
  error,
  minWidth = 1240,
  statementHref,
  accountHref,
  unassignedHref,
}: {
  /** Already sorted — movement first; the list sorts nothing (E2). */
  accounts: readonly PaymentAccountRowData[];
  head: Table["head"];
  columns?: readonly PaymentAccountColumn[];
  sort?: Table["sort"];
  href?: (patch: ListPatch) => string;
  empty?: Table["empty"];
  loading?: boolean;
  error?: Table["error"];
  /** Below this the table scrolls instead of squeezing — most tracks are `fr`. */
  minWidth?: number;
  statementHref?: PaymentAccountColumnOptions["statementHref"];
  accountHref?: PaymentAccountColumnOptions["accountHref"];
  unassignedHref?: PaymentAccountColumnOptions["unassignedHref"];
}) {
  return (
    <DataTable<PaymentAccountRowData>
      columns={paymentAccountColumns({
        ...(columns ? { columns } : {}),
        ...(statementHref ? { statementHref } : {}),
        ...(accountHref ? { accountHref } : {}),
        ...(unassignedHref ? { unassignedHref } : {}),
      })}
      rows={[...accounts]}
      rowKey={(a) => a.id}
      head={head}
      minWidth={minWidth}
      {...(sort ? { sort } : {})}
      {...(href ? { href } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      empty={
        empty ?? {
          title: "Kein Konto hat in diesem Jahr Bewegung.",
          description: "Sobald ein Kontoauszug importiert ist, steht das Konto hier.",
        }
      }
    />
  );
}
