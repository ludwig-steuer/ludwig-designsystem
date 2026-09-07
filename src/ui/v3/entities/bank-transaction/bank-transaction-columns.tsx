import {
  derivePurposeParts,
  deriveZ,
  restOf,
  resolveEventBookingState,
} from "./derive";
import { caseIdentifier } from "../accounting-case/case-title";
import type { ColumnDef } from "../../patterns/DataTable";
import { Link } from "../../primitives/Link";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
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
  /**
   * Where the **row** leads: the drawer of one payment (0103). The link sits
   * on the counterparty, not on the first cell — a link whose text is
   * „30.08.2026" does not say where it goes, and I11 forbids healing that
   * with an `aria-label`. Both sister catalogues do the same:
   * `sourceDocumentColumns` leads with the counterparty, `caseColumns` with
   * the case name.
   */
  rowHref?: (t: BankTransactionRowData) => string;
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
  rowHref,
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
      // Rank 3 carries the row link. Where the name is missing (3 % of the
      // stock) the link takes the purpose instead — never a bare dash: a
      // focus stop has to say where it goes.
      cell: (t) => {
        const name = t.counterpartyName ?? purposeLead(t);
        const body = t.counterpartyName ? (
          name
        ) : (
          <span className="v2muted">{name}</span>
        );
        // The 180-px track carries about 20 characters; the stock goes to 54.
        // Without clipping the cell wrapped and the row grew by 38 % at p90
        // — V1 asks for one row height (acceptance 0101, M2).
        return (
          <span className="v2trunc" title={name}>
            {rowHref ? (
              <Link className="v2rowlink" href={rowHref(t)}>
                {body}
              </Link>
            ) : (
              body
            )}
          </span>
        );
      },
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
      // 160 px, measured: „Keine Buchung nötig" is the widest word of the
      // axis — 132 px as a badge, ~150 with its (i). A fixed track narrower
      // than its widest value pushes that value into the neighbour, and
      // `max-content` is out: head and row are separate grids (0106).
      width: "160px",
      // Z4: a status column carries its (i) — **once**, in the head. It goes
      // into `headerAside`, not `header`: a button inside the sort link would
      // be invalid HTML (acceptance 0101, M5).
      headerAside: <StatusInfoButton axis="ereignis" />,
      cell: (t) => <EventStateCell transaction={t} />,
    },
    matchStage: {
      key: "matchStage",
      header: "DATEV-Historie",
      // 180 px: „außerhalb des Bestands" needs 169 px with its (i) — the
      // track stood at 160 and the text ran 9 px into the gutter. Measured.
      width: "180px",
      headerAside: <StatusInfoButton axis="bank_match_stage" />,
      // Since `cc141f7b` there is an axis for this (`bank_match_stage`), and
      // with it the four open classes — 29 % of the stock — have a word for
      // the first time. Before that a tick said yes and nothing said no.
      cell: (t) =>
        t.matchStage ? (
          <StatusBadge axis="bank_match_stage" status={t.matchStage} info={false} />
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
              <span className="v2btxrow__statefor">{caseIdentifier(c)}</span>
            ) : null}
            <StatusBadge axis="ereignis" status={state.value} info={false} />
          </span>
        );
      })}
    </span>
  );
}

/**
 * The first meaningful words of a purpose — what a payment without a
 * counterparty is recognised by („Kontoführungsentgelt August 2026").
 *
 * It does **not** parse the SEPA tags a second time: `derivePurposeParts`
 * already knows which part is the text and which are references, and a second
 * parser would drift from the first. Measured, the hand-rolled version ate
 * the word it was supposed to keep — `SVWZ+Kontoführungsentgelt` has no space
 * after the tag.
 */
function purposeLead(t: BankTransactionRowData): string {
  const text = derivePurposeParts(t.purpose, t.sepaTags).text.trim();
  if (!text) return "ohne Namen";
  return text.length > 34 ? `${text.slice(0, 33)}…` : text;
}
