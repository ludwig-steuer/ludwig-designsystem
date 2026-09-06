import {
  deriveZ,
  restOf,
  resolveEventBookingState,
} from "./derive";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import { BankTransactionPurpose } from "./BankTransactionPurpose";
import type { BankTransactionRowData } from "./bank-transaction";

/**
 * The eight points of a statement line as cells — **once**, for the short list
 * and for `DataTable` (0101, cut of the Freigabe).
 *
 * A row component and a column set are two ways of arranging the same cells,
 * not two components. Everything a cell decides is decided here; `Row` and
 * `DataTable` only choose the frame. Two row components for one entity are
 * exactly what R17 forbids, and two cell definitions would be the same thing
 * one level down.
 *
 * **Whose state is it?** Two of the eight belong to different things, and
 * that is not an oversight:
 *
 * - Rank 7 is the booking state of the **event** behind this line, never the
 *   state of the case. One line of the statement is exactly one payment; if
 *   the same case stands twice in the statement, one payment can be booked
 *   and the other open.
 * - Rank 8 counts the open clarifications of the **case** — case-wide, not
 *   per payment. The same number stands on every line of that case.
 */

export type BankTransactionColumn =
  | "postingDate"
  | "counterparty"
  | "purpose"
  | "account"
  | "cases"
  | "eventState"
  | "matchStage"
  | "clarifications"
  | "amount";

/**
 * The order of the columns. `columns` **selects**, it never reorders — the
 * sequence of the points is the same in every form of this family (the
 * profile's rule), and a caller who could reorder would break that.
 */
const ORDER: BankTransactionColumn[] = [
  "postingDate",
  "counterparty",
  "purpose",
  "account",
  "cases",
  "eventState",
  "matchStage",
  "clarifications",
  "amount",
];

const DEFAULT_COLUMNS: BankTransactionColumn[] = ORDER.filter((c) => c !== "account");

export interface BankTransactionColumnOptions {
  /** Where a case leads. Required — the set builds no URL of its own. */
  caseHref: (caseId: string) => string;
  /** Where „offen" leads: the assignment tab. */
  openHref?: string;
  /** Only for the cross-account worklist; the statement sets it as a page fact. */
  accountLabel?: string;
  columns?: BankTransactionColumn[];
}

/**
 * The grid track list for a column set — head and rows read the same string.
 *
 * It exists because the caller builds the frame (`Table cols={…}`), and a
 * second, hand-written list is a measure that drifts: the head shrinks while
 * the rows do not, and nobody notices until a column stands in two places.
 *
 * @when    A `Table` is framed around `bankTransactionColumns()`.
 * @instead `DataTable` does it itself.
 */
export function bankTransactionTracks(columns: ColumnDef<BankTransactionRowData>[]): string {
  return columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
}

/**
 * @when    A statement or a worklist is built with `DataTable` — sortable,
 *          selectable, paged.
 * @instead A short list of a handful of rows → BankTransactionRow. One
 *          payment mentioned elsewhere → BankTransactionCell.
 */
export function bankTransactionColumns({
  caseHref,
  openHref,
  accountLabel,
  columns = DEFAULT_COLUMNS,
}: BankTransactionColumnOptions): ColumnDef<BankTransactionRowData>[] {
  const picked = new Set(columns);
  const defs: Record<BankTransactionColumn, ColumnDef<BankTransactionRowData>> = {
    postingDate: {
      key: "postingDate",
      header: "Datum",
      width: "100px",
      sortable: true,
      // With the year. The statement drops it today („15.04."), which is
      // ambiguous across financial years — and it is the **posting** date,
      // not the value date (finding L-61).
      cell: (t) => <Time value={t.postingDate} format="date" length="short" size="sm" />,
    },
    counterparty: {
      key: "counterparty",
      header: "Gegenpartei",
      width: "180px",
      sortable: true,
      cell: (t) => t.counterpartyName ?? <span className="v2muted">ohne Namen</span>,
    },
    purpose: {
      key: "purpose",
      header: "Verwendungszweck",
      // The only unset track — and `minmax(0, 1fr)`, not `1fr`: a bare `1fr`
      // is `minmax(auto, 1fr)`, and `auto` is the **min-content** width of
      // the cell. Head and every row are separate grids with different
      // content, so each would size the track itself: measured, the amount
      // column stood at three different x positions across six rows, and the
      // rows ran 111 px past the head. `minmax(0, …)` lets the track shrink
      // to zero and makes the measure the same everywhere.
      width: "minmax(0, 1fr)",
      cell: (t) => <BankTransactionPurpose purpose={t.purpose} tags={t.sepaTags} />,
    },
    account: {
      key: "account",
      header: "Konto",
      width: "150px",
      cell: () => accountLabel ?? null,
    },
    cases: {
      key: "cases",
      header: "Sachverhalt",
      width: "200px",
      cell: (t) => <CasesCell transaction={t} caseHref={caseHref} openHref={openHref} />,
    },
    eventState: {
      key: "eventState",
      header: "Buchung",
      width: "140px",
      cell: (t) => <EventStateCell transaction={t} />,
    },
    matchStage: {
      key: "matchStage",
      header: "DATEV-Historie",
      width: "160px",
      // Since `cc141f7b` there is an axis for this (`bank_match_stage`), and
      // with it the four open classes — 29 % of the stock — have a word for
      // the first time. Before that a tick said yes and nothing said no.
      cell: (t) =>
        t.matchStage ? (
          <StatusBadge axis="bank_match_stage" status={t.matchStage} />
        ) : (
          <span className="v2muted">nicht gelaufen</span>
        ),
    },
    clarifications: {
      key: "clarifications",
      header: "Klärung",
      width: "110px",
      // **No `StatusBadge` here, on purpose.** The axis `klaerung` is a
      // severity per question (blocking / optional); what the row has is a
      // count over the case. A count is not a state, and a badge in this set
      // says „here stands a state". So: the number with its word.
      cell: (t) =>
        t.openClarificationsCount > 0 ? (
          <span className="v2btxrow__clar">
            {t.openClarificationsCount}{" "}
            {t.openClarificationsCount === 1 ? "Klärung" : "Klärungen"}
          </span>
        ) : null,
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: "130px",
      align: "end",
      sortable: true,
      // The sign is the direction, so it carries **no** colour: red is
      // criticality in this set, and an outgoing payment is not an error.
      cell: (t) => <Amount value={t.amount} currency={t.currency} />,
    },
  };
  return ORDER.filter((c) => picked.has(c)).map((c) => defs[c]);
}

/**
 * Rank 6 — how far the line is assigned. Z0 says „offen" as a word, never a
 * dash: 65 % of the lines are that case, and it is the answer to the question
 * the statement is read for.
 */
function CasesCell({
  transaction,
  caseHref,
  openHref,
}: {
  transaction: BankTransactionRowData;
  caseHref: (caseId: string) => string;
  openHref?: string;
}) {
  const z = deriveZ(transaction);
  return (
    <span className="v2btxrow__cases">
      {/* **Without the part amounts.** They are what `expanded` is for; in
          the cell they push every assigned row from 47 to 94 px, and with a
          p90 of 251 rows that halves the field of view. */}
      <CaseCell
        cases={transaction.cases.map(({ amount: _amount, ...c }) => c)}
        href={caseHref}
        emptyHref={openHref}
        showState={false}
      />
      {/* Only Z3 gets the mark: with Z1 and Z2 the rest is zero, and „Rest
          0,00 €" says nothing (decision 3 of the Freigabe). */}
      {z === "Z3" ? (
        <span className="v2btxrow__rest">
          Rest <Amount value={restOf(transaction)} currency={transaction.currency} size="sm" />
        </span>
      ) : null}
    </span>
  );
}

/** Rank 7 — the state of the **event**, one badge per assigned case. */
function EventStateCell({ transaction }: { transaction: BankTransactionRowData }) {
  if (transaction.cases.length === 0) return null;
  return (
    <span className="v2btxrow__states">
      {transaction.cases.map((c) => {
        const state = resolveEventBookingState({
          proposalStatus: c.eventBookingState,
          noBookingRequiredReason: c.noBookingRequiredReason,
        });
        return (
          <span className="v2btxrow__state" key={c.caseId}>
            {/* With several cases the badge alone would not say which event
                it belongs to — and „which one" is the whole point of rank 7. */}
            {transaction.cases.length > 1 ? (
              <span className="v2btxrow__statefor">{c.caseNumber ?? c.caseId.slice(0, 8)}</span>
            ) : null}
            <StatusBadge axis="ereignis" status={state.value} />
          </span>
        );
      })}
    </span>
  );
}
