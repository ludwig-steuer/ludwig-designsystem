import { DataTable, type DataTableProps, type TableGroup } from "../../patterns/DataTable";
import { formatCount } from "../../format";
import {
  SETTINGS_COLUMNS,
  paymentAccountColumns,
  type PaymentAccountColumn,
  type PaymentAccountColumnOptions,
} from "./payment-account-columns";
import type { PaymentAccountRowData } from "./payment-account";

type Table = DataTableProps<PaymentAccountRowData>;
type BulkAction = NonNullable<Table["selection"]>["actions"][number];

/** „1 Konto", „24 Konten" — a section head that says „1 Konten" reads like a bug. */
function countLabel(n: number): string {
  return n === 1 ? "1 Konto" : `${formatCount(n)} Konten`;
}

/**
 * Setting up the payment accounts (0182).
 *
 * Onboarding promotes the whole SKR bank block, so a client has 25 to 43
 * accounts of which about four ever move. The accounts in use stand **above**,
 * the rest under their own heading — hiding them would lock out a wrongly
 * derived expectation, sorting them in would bury the live ones.
 *
 * The split is the caller's: `isPaymentAccountInUse()` in the domain decides
 * it, this list only shows it.
 *
 * @when    The configuration page of the payment accounts.
 * @instead The year's list with movement → PaymentAccountList. One account
 *          named in a foreign row → PaymentAccountCell.
 */
export function PaymentAccountSettingsList({
  inUse,
  others,
  head,
  columns = SETTINGS_COLUMNS,
  retireAction,
  rowActions,
  empty,
  loading,
  error,
  minWidth = 1240,
  statementHref,
  accountHref,
}: {
  /** The accounts that are in use — statements, movement or an auto-assignment. */
  inUse: readonly PaymentAccountRowData[];
  /** The rest of the chart of accounts. */
  others: readonly PaymentAccountRowData[];
  head: Table["head"];
  columns?: readonly PaymentAccountColumn[];
  /** „Abschaltung bestätigen" over the selection; without it there are no boxes. */
  retireAction?: BulkAction;
  rowActions?: Table["rowActions"];
  empty?: Table["empty"];
  loading?: boolean;
  error?: Table["error"];
  /** Below this the table scrolls instead of squeezing — most tracks are `fr`. */
  minWidth?: number;
  statementHref?: PaymentAccountColumnOptions["statementHref"];
  accountHref?: PaymentAccountColumnOptions["accountHref"];
}) {
  const groups: TableGroup<PaymentAccountRowData>[] = [
    {
      key: "in-use",
      label: "In Gebrauch",
      rows: [...inUse],
      aside: countLabel(inUse.length),
      // The only section that speaks when it is empty: a client without a
      // single live account is exactly what the setup is looking for.
      emptyHint: "Kein Konto ist in Gebrauch — noch erwartet der Buchungslauf keinen Auszug.",
    },
  ];
  if (others.length > 0) {
    groups.push({
      key: "others",
      label: "Weitere aus dem Kontenrahmen",
      rows: [...others],
      aside: countLabel(others.length),
    });
  }

  return (
    <DataTable<PaymentAccountRowData>
      columns={paymentAccountColumns({
        columns,
        ...(statementHref ? { statementHref } : {}),
        ...(accountHref ? { accountHref } : {}),
      })}
      groups={groups}
      rowKey={(a) => a.id}
      head={head}
      minWidth={minWidth}
      {...(rowActions ? { rowActions } : {})}
      {...(retireAction ? { selection: { actions: [retireAction], label: (a) => a.displayName } } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      empty={
        empty ?? {
          title: "Keine Zahlungskonten.",
          description: "Sie entstehen mit dem DATEV-Abgleich, sobald der Kontenrahmen steht.",
        }
      }
    />
  );
}
