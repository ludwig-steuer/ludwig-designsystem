import {
  ACCOUNT_CLASS_LABEL,
  ACCOUNT_ORIGIN_LABEL,
  type AccountRow,
  type AccountSortKey,
} from "@/ludwig/modules/accounts/domain/account";
import { formatCount } from "../../format";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";

/**
 * The points of an account as cells — the chart of accounts (0062).
 *
 * **A column set, not an `AccountRow` component.** The movement line of this
 * same entity is already a set (`accountEntryColumns()`, decision A11), and
 * two row builds for one entity are what R17 forbids one level up. What the
 * page does with the cells — flat, grouped, paged — is the page's business.
 *
 * The measure of this list is its size: **41,570 accounts per client and
 * year, 85 % of them with zero bookings.** That is why the booking count sits
 * in the standard set and not in the catalogue set, and why the page shows
 * accounts that have been posted to by default (`AccountFilter.usedOnly`
 * already defaults to `true` — the page profile did not invent that, it read
 * it).
 */

export type AccountColumn =
  | "skrClass"
  | "number"
  | "name"
  | "role"
  | "partner"
  | "origin"
  | "bookings"
  | "lastBooking";

/**
 * The order of the points — one order for every form of this family, the
 * profile's rule. `columns` **selects**, it never reorders.
 */
const ORDER: AccountColumn[] = [
  "skrClass",
  "number",
  "name",
  "role",
  "partner",
  "origin",
  "bookings",
  "lastBooking",
];

/**
 * The chart of accounts: „which accounts of this year have worked, and which
 * have not." The booking count is the question, everything before it is the
 * identity.
 *
 * Without **Kontostatus**: 99 % of the rows say `active`, catalogue rows say
 * nothing at all, and the question it looks like it answers — which account
 * is a dead letter — is answered by the booking count. A column that is
 * constant is not an answer (finding L-90: the app's `usedOnly` filters over
 * `status`, while the profile's condition is `usage_booking_count > 0`).
 */
export const ACCOUNT_LIST_COLUMNS: AccountColumn[] = [
  "skrClass",
  "number",
  "name",
  "role",
  "bookings",
  "lastBooking",
];

/**
 * With the SKR catalogue (`scope=all`): the question is „does this account
 * exist here at all", so **Angelegt** joins and the two usage columns go —
 * a catalogue row that the client never created has neither a booking count
 * nor a last booking, and a column that is empty in half the list answers
 * nothing.
 */
export const ACCOUNT_CATALOG_COLUMNS: AccountColumn[] = [
  "skrClass",
  "number",
  "name",
  "role",
  "origin",
];

export interface AccountColumnOptions {
  /** Where a row leads — drawer or account page; the page decides (A10). */
  href?: (account: AccountRow) => string;
  /**
   * The business partner of a personal account — an **override**, for a caller
   * who knows a better name than the row carries. The row carries one since
   * L-89 (`businessPartnerName`); without this callback the column reads it.
   */
  partnerName?: (account: AccountRow) => string | null;
  partnerHref?: (account: AccountRow) => string | undefined;
  columns?: AccountColumn[];
  /**
   * The two words of the column „Angelegt" — an **override**. They come from
   * the domain since 2026-09-07 (`eaf73d45`, finding L-96); a caller only
   * passes them to word the column differently.
   */
  originLabels?: { client: string; catalog: string };
}

/**
 * @when    The chart of accounts is built with `DataTable`, or by hand with
 *          `Table` + `GroupRow` where it is grouped by class.
 * @instead One account named inside foreign markup → AccountCell. The
 *          movements of an account → accountEntryColumns.
 */
export function accountColumns({
  href,
  partnerName,
  partnerHref,
  columns = ACCOUNT_LIST_COLUMNS,
  originLabels = {
    client: ACCOUNT_ORIGIN_LABEL.client,
    catalog: ACCOUNT_ORIGIN_LABEL.skr_catalog,
  },
}: AccountColumnOptions = {}): ColumnDef<AccountRow>[] {
  const picked = new Set(columns);

  const defs: Record<AccountColumn, ColumnDef<AccountRow>> = {
    skrClass: {
      key: "skrClass",
      header: "SKR-Klasse",
      // 200 px, measured: „Sonstige betr. Aufwendungen" is 190 px wide. At
      // 180 it broke onto two lines and drove the row from 47 to 67 px — a
      // fixed track narrower than its widest value costs height instead of
      // width.
      width: "200px",
      // **Text, no badge.** The class is a place in the chart, not a state:
      // no progress, no criticality — and colour in this set means
      // criticality only (V6). The label comes from the app's own map.
      // No cast: an unknown value from the database falls through visibly as
      // its raw word, the way `accountSourceLabel` does it one file over — a
      // silently empty cell would hide exactly the case worth seeing.
      cell: (a) =>
        a.skrClass ? (
          ACCOUNT_CLASS_LABEL[a.skrClass] ?? a.skrClass
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    number: {
      key: "account_number" satisfies AccountSortKey,
      header: "Konto-Nr.",
      width: "110px",
      sortable: true,
      // The number carries the row link: it is what the accountant reads the
      // row by, and a link has to say where it goes (I11).
      cell: (a) =>
        href ? (
          <Link className="v2rowlink" href={href(a)}>
            <MonoCell value={a.accountNumber} />
          </Link>
        ) : (
          <MonoCell value={a.accountNumber} />
        ),
    },
    name: {
      key: "account_name" satisfies AccountSortKey,
      header: "Name",
      // The only flexible track — and its floor in **px**, never `ch`: a `ch`
      // minimum is computed from the font size of the element, and head and
      // row stand at different sizes (the lesson of 0070).
      width: "minmax(200px, 1fr)",
      sortable: true,
      // **Truncate, do not grow.** The profile measures the name at p90 = 39
      // and max = 50 characters; at the floor of this track (200 px) that is
      // 244 px of text and a row of 67 px instead of 47. The full name stays
      // in the `title` — the profile prescribes exactly that („kürzen ab 40,
      // voller Name im `title`", its words), and `caseColumns` has done it
      // since 0096.
      cell: (a) =>
        a.accountName ? (
          <span className="v2trunc" title={a.accountName}>
            {a.accountName}
          </span>
        ) : (
          <span className="v2muted">ohne Namen</span>
        ),
    },
    role: {
      key: "role",
      header: "Rolle",
      // 120 px is enough: the widest word of the axis („Sachkonto",
      // „Erlöskonto") measures 77 px as a badge, and the head with its (i)
      // fits beside it.
      width: "120px",
      headerAside: <StatusInfoButton axis="konto_typ" />,
      cell: (a) =>
        a.accountingRole ? (
          <StatusBadge axis="konto_typ" status={a.accountingRole} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    partner: {
      key: "partner",
      header: "Geschäftspartner",
      width: "200px",
      // Rank 8, 52 % filled — and only on personal accounts, where it is
      // ~100 %. The name comes from the row (`businessPartnerName`, L-89
      // closed 2026-09-07); a caller may still override it. Neither: the
      // column stays empty rather than inventing a value.
      cell: (a) => {
        const name = partnerName ? partnerName(a) : a.businessPartnerName;
        if (!name) return <span className="v2muted">—</span>;
        const to = partnerHref?.(a);
        // A company name has no upper bound in the data — „Musterbau Handels-
        // und Beteiligungs GmbH & Co. KG" is 49 characters and drove the row
        // to 67 px at **every** width. The track stays 200 px, the row does
        // not grow.
        return (
          <span className="v2trunc" title={name}>
            {to ? (
              <Link className="v2link" href={to}>
                {name}
              </Link>
            ) : (
              name
            )}
          </span>
        );
      },
    },
    origin: {
      key: "origin",
      header: "Angelegt",
      width: "140px",
      // **`origin`, not `source`.** `source` is 100 % `imported` and says
      // nothing; `origin` separates the two halves of the catalogue view —
      // the account this client has, and the one the SKR knows and nobody
      // created. That is the whole question of `scope=all`.
      // The two words are **not** in `src/ludwig`: `origin` has no label map
      // there (finding L-96), while `source` has one. Until it exists they
      // stand here once — and the caller can override them rather than build
      // a second pair somewhere else.
      cell: (a) =>
        a.origin === "client" ? (
          originLabels.client
        ) : (
          <span className="v2muted">{originLabels.catalog}</span>
        ),
    },
    bookings: {
      key: "usage_booking_count" satisfies AccountSortKey,
      header: "Buchungen",
      // 120 px: the head measures 69 px, the largest number in the stock
      // („5.474") clearly less — with the sort arrow there is room to spare.
      width: "120px",
      align: "end",
      sortable: true,
      // 85 % of the stock is zero. The zero stands there as a **number**, not
      // as a dash: „0" is the answer this list is read for, and an em dash
      // would claim the count is unknown.
      cell: (a) =>
        a.usageBookingCount === null ? (
          <span className="v2muted">—</span>
        ) : (
          <span className="v2num">{formatCount(a.usageBookingCount)}</span>
        ),
    },
    lastBooking: {
      key: "last_booking_date" satisfies AccountSortKey,
      header: "Letzte Buchung",
      // 130 px: the head measures 94.8 px, the date („31.08.2026") 70.
      width: "130px",
      sortable: true,
      cell: (a) => <Time value={a.lastBookingDate} format="date" length="short" size="sm" />,
    },
  };

  return ORDER.filter((c) => picked.has(c)).map((c) => defs[c]);
}

/**
 * The grid track list for a column set — head and rows read the same string.
 *
 * @when    A `Table` is framed around `accountColumns()` by hand — the
 *          grouped view does exactly that.
 * @instead `DataTable` builds it itself.
 */
export function accountTracks(columns: ColumnDef<AccountRow>[]): string {
  return columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
}

/**
 * The width below which the table scrolls instead of cutting a column off.
 * Fixed tracks plus the floor of the flexible one, the gutters between them
 * and the card padding (12px 18px — 36, measured, not the 70 an earlier note
 * in this set claimed).
 *
 * @when    A chart of accounts is built and needs its `minWidth`.
 * @instead A set whose columns never change → write the number down.
 */
export function accountMinWidth(columns: ColumnDef<AccountRow>[]): number {
  const GUTTER = 10;
  const PADDING = 36;
  const floor = (width: string | undefined): number => {
    if (!width) return 0;
    const min = /minmax\(\s*(\d+)px/.exec(width);
    if (min?.[1]) return Number(min[1]);
    const px = /^(\d+)px$/.exec(width.trim());
    return px?.[1] ? Number(px[1]) : 0;
  };
  const tracks = columns.reduce((sum, c) => sum + floor(c.width), 0);
  return tracks + GUTTER * Math.max(0, columns.length - 1) + PADDING;
}
