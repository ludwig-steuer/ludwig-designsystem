import type {
  BusinessPartnerListItem,
  PartnerAccountRef,
} from "@/ludwig/modules/business-partners/domain/business-partner";

import { formatCount } from "../../format";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { BusinessPartnerCell } from "./BusinessPartner";

/**
 * The points of a business partner as cells — the master-record list (0140).
 *
 * **A column set, not a `BusinessPartnerRow` component.** There is exactly one
 * partner list and it has 6,363 rows at the p90, so it is a `DataTable` with a
 * server filter. A second, short list of partners exists nowhere — the tabs on
 * the partner page show *other* entities. With only one frame around the row,
 * the row is a column definition; two row builds for one entity is what R17
 * forbids.
 *
 * The measure of this list is that it is a **haystack**: 14,950 partners over
 * six clients, 77 % of them without a single booking. Somebody comes here with
 * a number or a name and wants to know who is behind it.
 */

export type BusinessPartnerColumn =
  | "partner"
  | "creditorAccount"
  | "debtorAccount"
  | "clearing"
  | "onboarding"
  | "bookings"
  | "lastBooking"
  | "city";

/**
 * The order of the points — one order for every form of this family, the
 * profile's rule. `columns` **selects**, it never reorders.
 *
 * It is also the one named set, so `PARTNER_LIST_COLUMNS` is this list and not
 * a copy of it: the list has exactly one set today, and two identical arrays
 * would mean a new column has to be added twice while the typechecker keeps
 * quiet. A second set that shows *fewer* columns picks from here.
 */
const ORDER: BusinessPartnerColumn[] = [
  "partner",
  "creditorAccount",
  "debtorAccount",
  "clearing",
  "onboarding",
  "bookings",
  "lastBooking",
  "city",
];

/**
 * The master-record list. Ranks 1–7 of the profile plus the clearing accounts.
 *
 * **Rank 2 stands as two columns**, and that is the one place where the list
 * departs from the profile: the profile keeps creditor and debtor account as
 * **one** data point, because 99.9 % of partners carry exactly one and the
 * point would fail the 20 % rule if split. The table has the room, though, and
 * two columns say the role **without a word of their own** — filled on the
 * left means creditor, filled on the right means debtor, both empty with
 * clearing filled means a settling partner (owner decision 2026-09-09: no
 * separate role column).
 */
export const PARTNER_LIST_COLUMNS: readonly BusinessPartnerColumn[] = ORDER;

/**
 * The word above each cell. Here and not in the caller, so head and cell say
 * the same thing wherever the set is used — and so a hand-rolled `Table` gets
 * its header from the same place `DataTable` does.
 */
export const PARTNER_COLUMN_LABEL: Record<BusinessPartnerColumn, string> = {
  partner: "Geschäftspartner",
  creditorAccount: "Kreditorkonto",
  debtorAccount: "Debitorkonto",
  clearing: "Verrechnung",
  onboarding: "Reifegrad",
  bookings: "Buchungen",
  lastBooking: "Letzte Buchung",
  city: "Ort",
};

const TRACK: Record<BusinessPartnerColumn, string> = {
  partner: "minmax(240px, 1fr)",
  creditorAccount: "130px",
  debtorAccount: "130px",
  clearing: "150px",
  onboarding: "130px",
  bookings: "110px",
  lastBooking: "130px",
  city: "160px",
};

/**
 * The chosen cells in the fixed order — the one place that applies it.
 *
 * @when    Building the header of a hand-rolled `Table` over these cells, so
 *          the labels come out in the order the cells will.
 * @instead One `DataTable` → businessPartnerColumns(), which carries its own
 *          headers. The track widths → businessPartnerTracks().
 */
export function businessPartnerColumnOrder(
  columns: readonly BusinessPartnerColumn[] = PARTNER_LIST_COLUMNS,
): BusinessPartnerColumn[] {
  const chosen = new Set(columns);
  return ORDER.filter((c) => chosen.has(c));
}

/**
 * @when    Head and rows of a hand-rolled `Table` over partner cells need the
 *          same track widths.
 * @instead `DataTable` reads the widths off the column definitions itself.
 */
export function businessPartnerTracks(
  columns: readonly BusinessPartnerColumn[] = PARTNER_LIST_COLUMNS,
): string {
  return businessPartnerColumnOrder(columns)
    .map((c) => TRACK[c])
    .join(" ");
}

/**
 * What one row shows. A cut of `BusinessPartnerListItem` plus its key — not a
 * model of its own: the mirror decides what a partner is.
 */
export type BusinessPartnerRowData = Pick<
  BusinessPartnerListItem,
  | "businessPartnerId"
  | "legalName"
  | "shortName"
  | "city"
  | "onboardingState"
  | "usageBookingCount"
  | "lastBookingDate"
  | "creditorAccount"
  | "debtorAccount"
  | "clearingAccounts"
>;

export interface BusinessPartnerColumnOptions {
  /** The way to the partner — on the **name cell**, not on the whole row. */
  partnerHref?: (partnerId: string) => string;
  /** The way to the account **drawer**, on every number: creditor, debtor, clearing. */
  accountHref?: (accountNumber: string) => string;
  columns?: readonly BusinessPartnerColumn[];
}

/**
 * An account number with its way, or nothing at all.
 *
 * **Nothing, not an em dash.** An empty personal account means „he has none",
 * not „we do not know" — and a dash reads as the second. That is why this does
 * not go through `MonoCell`'s own null branch.
 */
function accountCell(
  account: PartnerAccountRef | null,
  accountHref?: (accountNumber: string) => string,
) {
  if (!account) return null;
  const number = <MonoCell value={account.accountNumber} />;
  return accountHref ? <Link href={accountHref(account.accountNumber)}>{number}</Link> : number;
}

/**
 * @when    The master-record list of business partners is built with `DataTable`.
 * @instead One partner named inside foreign markup → BusinessPartnerCell.
 *          Choosing one out of many → BusinessPartnerPicker. Everything about
 *          one → BusinessPartnerFacts.
 */
export function businessPartnerColumns({
  partnerHref,
  accountHref,
  columns = PARTNER_LIST_COLUMNS,
}: BusinessPartnerColumnOptions = {}): ColumnDef<BusinessPartnerRowData>[] {
  const defs: Record<BusinessPartnerColumn, ColumnDef<BusinessPartnerRowData>> = {
    partner: {
      key: "legal_name",
      header: PARTNER_COLUMN_LABEL.partner,
      width: TRACK.partner,
      sortable: true,
      // Rank 1 goes through the cell, not through a second way of writing a
      // name — that is what 0139 exists for.
      cell: (p) => (
        <BusinessPartnerCell
          name={p.legalName}
          shortName={p.shortName}
          {...(partnerHref ? { href: partnerHref(p.businessPartnerId) } : {})}
        />
      ),
    },
    creditorAccount: {
      key: "creditorAccount",
      header: PARTNER_COLUMN_LABEL.creditorAccount,
      width: TRACK.creditorAccount,
      cell: (p) => accountCell(p.creditorAccount, accountHref),
    },
    debtorAccount: {
      key: "debtorAccount",
      header: PARTNER_COLUMN_LABEL.debtorAccount,
      width: TRACK.debtorAccount,
      cell: (p) => accountCell(p.debtorAccount, accountHref),
    },
    clearing: {
      key: "clearing",
      header: PARTNER_COLUMN_LABEL.clearing,
      width: TRACK.clearing,
      // Plural on purpose: a settling partner normally carries several (card
      // plus expenses, two cards). Twelve partners in the whole stock have
      // any — and all twelve carry neither creditor nor debtor number, which
      // is what makes the three columns say the role without a word.
      cell: (p) =>
        p.clearingAccounts.length === 0
          ? null
          : p.clearingAccounts.map((a, i) => (
              <span key={a.accountNumber}>
                {i > 0 ? <span className="v2muted"> · </span> : null}
                {accountCell(a, accountHref)}
              </span>
            )),
    },
    onboarding: {
      key: "onboarding_state",
      header: PARTNER_COLUMN_LABEL.onboarding,
      width: TRACK.onboarding,
      sortable: true,
      cell: (p) => <StatusBadge axis="partner" status={p.onboardingState} />,
    },
    bookings: {
      key: "usage_booking_count",
      header: PARTNER_COLUMN_LABEL.bookings,
      width: TRACK.bookings,
      align: "end",
      sortable: true,
      // **Zero is an answer**, not a gap: 77 % of the stock has never been
      // posted to, and that is the most useful thing this column says.
      cell: (p) => formatCount(p.usageBookingCount),
    },
    lastBooking: {
      key: "last_booking_date",
      header: PARTNER_COLUMN_LABEL.lastBooking,
      width: TRACK.lastBooking,
      sortable: true,
      cell: (p) =>
        p.lastBookingDate ? <Time value={p.lastBookingDate} format="date" /> : null,
    },
    city: {
      key: "city",
      header: PARTNER_COLUMN_LABEL.city,
      width: TRACK.city,
      cell: (p) => p.city,
    },
  };

  return businessPartnerColumnOrder(columns).map((c) => defs[c]);
}
