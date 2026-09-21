import { bankMatchStage } from "@/ludwig/modules/bank-transactions/domain/bank-transaction-vm";
import {
  derivePurposeParts,
  deriveZ,
  restOf,
  resolveEventBookingState,
} from "./derive";
import { caseIdentifier } from "../accounting-case/case-title";
import type { ColumnDef } from "../../patterns/DataTable";
import { Link } from "../../primitives/Link";
import { ActionIcon } from "../../Icons";
import { Badge } from "../../primitives/Badge";
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
  | "payment"
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
  "payment",
  "counterparty",
  "purpose",
  "account",
  "cases",
  "eventState",
  "matchStage",
  "clarifications",
  "amount",
];

/**
 * The full statement (0193): the owner's five ranks plus the clarification.
 * The DATEV history, the account and the compact `payment` column are
 * switched on by the caller — the history answers a check before the run,
 * not the daily question „is this done?".
 */
const DEFAULT_COLUMNS: BankTransactionColumn[] = ORDER.filter(
  (c) => c !== "account" && c !== "matchStage" && c !== "payment",
);

/** Up to this many cases stand one per line in a row; beyond, the row condenses (0193). */
const STACK_MAX = 2;

/**
 * The excerpt (0193): a fixed set for a handful of rows in a foreign place —
 * date, payment (counterparty over purpose), case, booking, amount. Fixed on
 * purpose: an excerpt that looks different at every place is the problem it
 * exists to solve.
 */
export const COMPACT_COLUMNS: readonly BankTransactionColumn[] = [
  "postingDate",
  "payment",
  "cases",
  "eventState",
  "amount",
];

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
    payment: {
      key: "payment",
      header: "Zahlung",
      // Counterparty over purpose, the two first ranks in one cell — the
      // excerpt has no room for two tracks of text. Without a counterparty
      // (3 % of the stock) the purpose moves up and is the identity.
      width: "minmax(0, 1fr)",
      cell: (t) => {
        const text = derivePurposeParts(t.purpose, t.sepaTags).text.trim();
        const name = t.counterpartyName ?? (text || "ohne Namen");
        const head = <span className="v2main v2trunc" title={name}>{name}</span>;
        return (
          <span className="v3btxpay">
            {rowHref ? (
              <Link className="v2rowlink" href={rowHref(t)}>
                {head}
              </Link>
            ) : (
              head
            )}
            {t.counterpartyName && text ? (
              <span className="v2sub v2trunc" title={text}>
                {text}
              </span>
            ) : null}
          </span>
        );
      },
    },
    counterparty: {
      key: "counterparty",
      header: "Gegenpartei",
      // 210 px, not 180: a German IBAN with its spaces (27 characters in the
      // small mono) measures about 200 px, and under the name it has to stand
      // whole — cut, it loses exactly the digits that tell two accounts apart.
      width: "210px",
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
        const nameCell = (
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
        // The IBAN small and grey under the name, where it is known (owner
        // 2026-09-21): the name varies from statement to statement, the IBAN
        // is the identity that holds.
        return t.counterpartyIban ? (
          <span className="v3btxcp">
            {nameCell}
            <span className="v3btxcp__iban" title={t.counterpartyIban}>
              {t.counterpartyIban}
            </span>
          </span>
        ) : (
          nameCell
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
      headerAside: <StatusInfoButton axis="event_booking" />,
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
      // `bankMatchStage` turns NULL into `not_run` — the axis has had the value
      // since `c1e8e752` (L-218, closed). Until then both this file and
      // `BankTransactionFacts` wrote the word by hand, and for two days they
      // wrote two different ones.
      cell: (t) => (
        <StatusBadge axis="bank_match_stage" status={bankMatchStage(t.matchStage)} info={false} />
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
  // From three cases on the row names the count: stacked, six cases made the
  // line six times as high, and the split under it repeats them anyway with
  // their part amounts (0193). The stock never had more than two.
  if (transaction.cases.length > STACK_MAX) {
    return (
      <span className="v2btxrow__cases">
        <span>{transaction.cases.length} Sachverhalte</span>
        {z === "Z3" ? (
          <span className="v2btxrow__rest">
            Rest <Amount value={restOf(transaction)} currency={transaction.currency} size="sm" />
          </span>
        ) : null}
      </span>
    );
  }
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

/**
 * Rank 7 and the owner's „fully booked" (0193) in **one** cell. Done → one
 * mark with its word; otherwise the state of every event, which says what
 * holds the line up. Side by side the two would say the same thing for almost
 * every line — the doubling the owner removed from the case strand the same
 * day (0040).
 *
 * The cell does not decide what „done" means: that is `settled`, set by the
 * caller from the domain (L-340). Without it the cell shows the events as
 * before and no mark.
 */
function EventStateCell({ transaction }: { transaction: BankTransactionRowData }) {
  if (transaction.cases.length === 0) return null;
  if (transaction.settled) return <BookedMark transaction={transaction} />;
  // From three cases on: each state once, with how often it occurs — the
  // split under the row carries the state per case (0193).
  if (transaction.cases.length > STACK_MAX) {
    const counts = new Map<string, number>();
    for (const c of transaction.cases) {
      const value = resolveEventBookingState({
        proposalStatus: c.eventBookingState,
        noBookingRequiredReason: c.noBookingRequiredReason,
      }).value;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return (
      <span className="v2btxrow__states">
        {[...counts].map(([value, n]) => (
          <span className="v2btxrow__state v2btxrow__state--count" key={value}>
            <StatusBadge axis="event_booking" status={value} info={false} />
            {n > 1 ? <span className="v2sub">×{n}</span> : null}
          </span>
        ))}
      </span>
    );
  }
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
            <StatusBadge axis="event_booking" status={state.value} info={false} />
          </span>
        );
      })}
    </span>
  );
}

/**
 * The mark of a finished line: a tick and the word „gebucht" (owner
 * 2026-09-21). A line whose events need no booking is finished too — the
 * tooltip names, per event, how it was finished („Keine Buchung nötig"), so
 * the exception is said where it applies instead of weakening the word for
 * every other line.
 */
function BookedMark({ transaction }: { transaction: BankTransactionRowData }) {
  const how = transaction.cases
    .map((c) => {
      const word = resolveEventBookingState({
        proposalStatus: c.eventBookingState,
        noBookingRequiredReason: c.noBookingRequiredReason,
      }).label;
      return transaction.cases.length > 1 ? `${caseIdentifier(c)}: ${word}` : word;
    })
    .join(" · ");
  // A badge like its neighbours in the column, in the success tone, with the
  // tick in front — it looked like a stray line of text next to the pills
  // (owner 2026-09-21).
  return (
    <span title={how}>
      <Badge tone="success" className="v3btxbooked">
        <ActionIcon action="confirm" size={12} />
        gebucht
      </Badge>
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
