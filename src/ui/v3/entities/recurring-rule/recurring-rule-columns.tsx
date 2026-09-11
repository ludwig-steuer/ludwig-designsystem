import {
  RULE_INTERVAL_LABEL,
  type RuleBookingMode,
  type RuleDirection,
  type RuleDocumentNumberStrategy,
  type RuleExpectedInterval,
  RULE_DIRECTION_LABEL,
  RULE_DOCUMENT_NUMBER_STRATEGY_LABEL,
} from "@/ludwig/modules/recurring-rules/domain/rule";
import type { PreviewAccount } from "@/ludwig/modules/recurring-rules/domain/booking-preview";

import { formatCount } from "../../format";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";
import { AccountCell } from "../account/Account";
import { CaseCell } from "../accounting-case/CaseCell";
import { caseIdentifier, caseTitle, type CaseLink } from "../accounting-case/case-title";

/**
 * The cells of a recurring rule — **once**, for the row and for `DataTable`
 * (0132 for the row, 0131 for the client's rule book).
 *
 * A row component and a column set are two ways of arranging the same cells,
 * not two components. Everything a cell decides is decided here; `Row` and
 * `DataTable` only choose the frame. Two row components for one entity are
 * exactly what R17 forbids, and two cell definitions would be the same thing
 * one level down — the wording is `bank-transaction-columns.tsx`'s, and so is
 * the cut. 0132 named the trigger for this file in its own „Ausbau": the day
 * somebody frames `DataTable` around these cells.
 *
 * **The leading cell is derived, not a name column.** A rule has no name; what
 * a person recognises it by is the counterparty, and that sits in two columns:
 * where the payment carried an IBAN, the learning path stores the IBAN and
 * writes **no** name (`prefillFromTransaction`). A row that only showed the
 * name would be empty for every rule learned from a payment.
 */

/**
 * The cells this family can render. `columns` **selects**, it never reorders —
 * the order of the points is the profile's rank order and is the same in every
 * form of the family; a caller who could reorder would break that.
 */
export type RecurringRuleColumn =
  | "case"
  | "counterparty"
  | "bookingMode"
  | "validity"
  | "amount"
  | "interval"
  | "direction"
  | "counterAccount"
  | "personalAccount"
  | "documentNumberStrategy"
  | "periods"
  | "lastPayment";

/**
 * The fields of one rule as a row — **not a model**. `RuleOverviewItem` and
 * `OverdueRecurringItem` live in the app's `infrastructure/` and
 * `application/` and are not mirrored (L-240); a type of our own would be the
 * local invention §5 forbids. So the fields come one by one, and the day
 * L-240 is closed they collapse into one prop.
 */
export interface RecurringRuleRowData {
  /** Rank 1a — the counterparty name of the match criteria. */
  counterpartyName: string | null;
  /**
   * Rank 1b. Name **or** IBAN stand in the same place: the domain's summary
   * decides the same way, and a rule learned from a payment structurally
   * carries no name.
   */
  counterpartyIban: string | null;
  /** Rank 2 — the axis `regel_modus`, three values, `match_only` included. */
  bookingMode: RuleBookingMode;
  /** Rank 3 — shown as a word without colour until `is_active` has an axis (L-241). */
  isActive: boolean;
  /**
   * Rank 4 — what the accrual would book, **already derived by the caller**
   * with `accrualAmount()`. The row does no arithmetic: the derivation has
   * three steps and belongs to the domain (and the overview query today
   * derives a second, different one — L-262).
   */
  amount: number | null;
  /** Rank 5 — the word comes from `RULE_INTERVAL_LABEL`, never raw English. */
  interval: RuleExpectedInterval | null;
  /** Rank 7 — the word comes from `RULE_DIRECTION_LABEL`, never raw English. */
  direction: RuleDirection | null;
  /** Rank 6 — set only where the list has left its own case. */
  case?: CaseLink;
  /**
   * How many rules hang on that case **in total** — the third of the three
   * anomalies the rule book is read for („which one grips twice?").
   *
   * It cannot be counted from the visible rows: as soon as a filter is on,
   * the second rule of a case may be hidden and the mark would be a lie. So
   * it is a number per row, and the query does not carry it yet (L-263).
   * Without it there is no mark, which is the honest state.
   */
  caseRuleCount?: number;
  /** Rank 10 — the counter account of the template, number **and** name. */
  counterAccount?: PreviewAccount | null;
  /** Rank 11 — mandatory for `accrue_then_settle`; missing is the anomaly. */
  personalAccount?: PreviewAccount | null;
  /** Rank 22 — `RULE_DOCUMENT_NUMBER_STRATEGY_LABEL` has the word; `fixed` breaks the OPOS match. */
  documentNumberStrategy?: RuleDocumentNumberStrategy | null;
  /** The events of this rule as a counter („3 Perioden"). */
  periodCount?: number;
  /**
   * The last payment assigned to this rule. The prop **missing** means the
   * column does not exist; **`null`** means there has not been one yet.
   */
  lastPayment?: { date: string; amount: number } | null;
}

/** One row with its key — what any list of rules hands to its frame. */
export type RecurringRuleListRow = RecurringRuleRowData & { id: string };

/** The order of the cells: the profile's rank order, the same in every form. */
const ORDER: RecurringRuleColumn[] = [
  // The case leads where it is shown at all: the list that shows it has left
  // its own case, and then it is what names the row.
  "case",
  "counterparty",
  "bookingMode",
  "validity",
  "amount",
  "interval",
  "direction",
  "counterAccount",
  "personalAccount",
  "documentNumberStrategy",
  "periods",
  "lastPayment",
];

/** Ranks 1–5 and 7 — everything a rule carries out of its own columns. */
export const RECURRING_RULE_ROW_COLUMNS: readonly RecurringRuleColumn[] = [
  "counterparty",
  "bookingMode",
  "validity",
  "amount",
  "interval",
  "direction",
];

/**
 * The set of the overdue list (0133): the case leads, the last payment closes.
 *
 * **No validity column**: that list's population is the **active** rules, so
 * every row would carry the same word, and a column with one value in every
 * row is a dead column.
 */
export const RECURRING_RULE_OVERDUE_COLUMNS: readonly RecurringRuleColumn[] = [
  "case",
  "counterparty",
  "bookingMode",
  "amount",
  "interval",
  "direction",
  "lastPayment",
];

/**
 * The set of the client's rule book (0131): ranks 1–7, 10, 11 and 22.
 *
 * Validity is in and the two accounts are in, because they carry two of the
 * three anomalies the page is read for („which one stands still, which one has
 * no personal account"). Periods and last payment are out: they answer the
 * question of the overdue list, not of this one.
 */
export const RECURRING_RULE_BOOK_COLUMNS: readonly RecurringRuleColumn[] = [
  "case",
  "counterparty",
  "bookingMode",
  "validity",
  "amount",
  "interval",
  "direction",
  "counterAccount",
  "personalAccount",
  "documentNumberStrategy",
];

/** The word above each cell, for the head row of whoever frames these cells. */
export const RECURRING_RULE_COLUMN_LABEL: Record<RecurringRuleColumn, string> = {
  case: "Sachverhalt",
  counterparty: "Gegenpartei",
  bookingMode: "Buchungsweise",
  validity: "Gültigkeit",
  amount: "Erwartet",
  interval: "Rhythmus",
  direction: "Richtung",
  counterAccount: "Gegenkonto",
  personalAccount: "Personenkonto",
  documentNumberStrategy: "Belegnummern-Strategie",
  periods: "Perioden",
  lastPayment: "Letzte Zahlung",
};

/**
 * The grid track of each cell. The counterparty is the only one that gives
 * way, and it is `minmax(180px, 1fr)` and not `1fr`: a bare `1fr` is
 * `minmax(auto, 1fr)`, and `auto` is the **content** width — head and rows
 * would each size the track themselves and the columns would stand at
 * different x positions (measured in 0101).
 *
 * The floor is **180 px and no longer 0**. With the ten columns of the rule
 * book the share left over was 54 px, and „ohne Kriterium" — the word for the
 * rule that matches nothing — wrapped to two lines and pushed that row from
 * 47 to 63 px, against V1 (measured 2026-09-08 at 700–1400 px). A fixed floor
 * cannot bring the drift back: it is the same number in head and rows,
 * unlike `auto`.
 */
const TRACK: Record<RecurringRuleColumn, string> = {
  case: "200px",
  counterparty: "minmax(180px, 1fr)",
  bookingMode: "150px",
  validity: "90px",
  amount: "130px",
  interval: "120px",
  direction: "130px",
  counterAccount: "150px",
  personalAccount: "150px",
  // „Belegnummern-Strategie" is the widest head word of the family; a fixed
  // track narrower than its own head pushes the word into the neighbour.
  documentNumberStrategy: "180px",
  periods: "110px",
  lastPayment: "170px",
};

/** The cells that carry a number and therefore its right edge (V3). */
const NUMERIC: ReadonlySet<RecurringRuleColumn> = new Set<RecurringRuleColumn>(["amount"]);

/** The cells a list may sort by — the three keys of the overview query plus the amount. */
const SORTABLE: ReadonlySet<RecurringRuleColumn> = new Set<RecurringRuleColumn>([
  "case",
  "counterparty",
  "validity",
  "amount",
]);

/**
 * The chosen cells in the fixed order — the one place that applies it.
 *
 * `columns` **selects, it never reorders**: the rank order is the same in
 * every form of the entity, so a caller cannot put the amount first here and
 * leave it last in the facts.
 *
 * @when    Building the header of a hand-rolled `Table` over these cells —
 *          the labels must come out in the order the cells will.
 * @instead One `DataTable` → recurringRuleColumns(), which carries its own
 *          headers. The track widths → recurringRuleTracks().
 */
export function recurringRuleColumnOrder(
  columns: readonly RecurringRuleColumn[] = RECURRING_RULE_ROW_COLUMNS,
): RecurringRuleColumn[] {
  const chosen = new Set(columns);
  return ORDER.filter((c) => chosen.has(c));
}

const pick = recurringRuleColumnOrder;

export interface RecurringRuleColumnOptions {
  /**
   * Rank 6 — the way to the case, **on the case cell**.
   *
   * Not together with `DataTable rowHref`: the case is the first cell, and
   * the row link wraps the first cell — `CaseCell` would put an anchor inside
   * that anchor, which is invalid markup (measured as a hydration warning in
   * 0101). A list that makes the whole row a way leaves this one unset.
   */
  caseHref?: (caseId: string) => string;
  /** Ranks 10 and 11 — the way to the account sheet. Without it: plain text. */
  accountHref?: (accountNumber: string) => string;
  /** Which cells, in the order above. Default: the row's set (ranks 1–5, 7). */
  columns?: readonly RecurringRuleColumn[];
}

/**
 * The grid track list for a column set — head and rows read the same string.
 *
 * It exists because the caller builds the frame (`Table cols={…}`), and a
 * second, hand-written list is a measure that drifts: the head shrinks while
 * the rows do not, and nobody notices until a column stands in two places.
 *
 * @when    A `Table` is framed around `RecurringRuleRow` by hand.
 * @instead `DataTable` builds the track itself out of `ColumnDef.width` —
 *          there `recurringRuleColumns()` is enough.
 */
export function recurringRuleTracks(
  columns: readonly RecurringRuleColumn[] = RECURRING_RULE_ROW_COLUMNS,
): string {
  return pick(columns)
    .map((c) => TRACK[c])
    .join(" ");
}

/**
 * @when    A sortable, filterable table of recurring rules is built with
 *          `DataTable` — the rule book of a client (0131).
 * @instead A handful of rows in a plain `Table` → RecurringRuleRow, which
 *          renders these very cells. Everything about one rule →
 *          RecurringRuleFacts.
 */
export function recurringRuleColumns({
  caseHref,
  accountHref,
  columns = RECURRING_RULE_ROW_COLUMNS,
}: RecurringRuleColumnOptions): ColumnDef<RecurringRuleRowData>[] {
  return pick(columns).map((column) => ({
    key: column,
    header: RECURRING_RULE_COLUMN_LABEL[column],
    width: TRACK[column],
    ...(NUMERIC.has(column) ? { align: "end" as const } : {}),
    ...(SORTABLE.has(column) ? { sortable: true } : {}),
    cell: (rule: RecurringRuleRowData) => cell(column, rule, caseHref, accountHref),
  }));
}

/** What stands in one cell. One place, so head and row cannot part ways. */
function cell(
  column: RecurringRuleColumn,
  r: RecurringRuleRowData,
  caseHref: ((caseId: string) => string) | undefined,
  accountHref: ((accountNumber: string) => string) | undefined,
) {
  switch (column) {
    case "case":
      return r.case ? (
        <Case link={r.case} href={caseHref} ruleCount={r.caseRuleCount} />
      ) : null;
    case "counterparty":
      return <Counterparty name={r.counterpartyName} iban={r.counterpartyIban} />;
    case "bookingMode":
      return <StatusBadge axis="rule_mode" status={r.bookingMode} info={false} />;
    // A word, no `tone` and no dot: R1 allows colour only through an axis, and
    // `is_active` has none (L-241). „inaktiv" is a statement about the rule,
    // not a warning — a rule can be switched off on purpose.
    case "validity":
      return r.isActive ? "aktiv" : "inaktiv";
    case "amount":
      return <AmountCell value={r.amount} />;
    // Without a rhythm there is no overdue check at all — that is a statement,
    // so it gets a word rather than a dash.
    case "interval":
      return r.interval ? (
        RULE_INTERVAL_LABEL[r.interval]
      ) : (
        <span className="v2muted">ohne Rhythmus</span>
      );
    // Same case one column on: no direction means the rule accepts both, not
    // that nobody knows which.
    case "direction":
      return (
        (r.direction ? RULE_DIRECTION_LABEL[r.direction] : null) ?? (
          <span className="v2muted">ohne Richtung</span>
        )
      );
    case "counterAccount":
      return <Account account={r.counterAccount} href={accountHref} missing="ohne Gegenkonto" />;
    // Rank 11 carries one of the three anomalies the rule book is read for,
    // so the empty case gets a word: `accrue_then_settle` cannot post its
    // accrual without it, and a dash would read as „unknown".
    case "personalAccount":
      return (
        <Account account={r.personalAccount} href={accountHref} missing="ohne Personenkonto" />
      );
    case "documentNumberStrategy":
      return r.documentNumberStrategy
        ? RULE_DOCUMENT_NUMBER_STRATEGY_LABEL[r.documentNumberStrategy]
        : null;
    case "periods":
      return r.periodCount === undefined ? null : (
        <span className="v2muted">
          {formatCount(r.periodCount)} {r.periodCount === 1 ? "Periode" : "Perioden"}
        </span>
      );
    case "lastPayment":
      return <LastPayment payment={r.lastPayment ?? null} />;
  }
}

/**
 * Rank 6 — the case the rule hangs on, the way to it, and the mark that says
 * this case carries more than one rule.
 *
 * Without `href` the case still stands there, as text: no URL is built here,
 * and a link that leads nowhere is worse than none (I11). That is also the
 * shape a list uses when the **whole row** is the way — then the row's own
 * anchor wraps this text.
 */
function Case({
  link,
  href,
  ruleCount,
}: {
  link: CaseLink;
  href?: (caseId: string) => string;
  ruleCount?: number;
}) {
  // The state of the case is not the state of its rule, and the row has its
  // own two state cells — a third chip here would say something about a
  // different thing.
  const body = href ? (
    <CaseCell cases={[link]} href={href} showState={false} />
  ) : (
    <>
      <code className="v2rrrow__caseno">{caseIdentifier(link)}</code>
      <span className="v2trunc">{caseTitle(link)}</span>
    </>
  );
  return (
    <span className="v2rrrow__case" title={caseTitle(link)}>
      {body}
      {ruleCount !== undefined && ruleCount > 1 ? (
        <span className="v2rrov__dup">{formatCount(ruleCount)} Regeln</span>
      ) : null}
    </span>
  );
}

/**
 * Rank 1 — what a person recognises the rule by.
 *
 * Name first, IBAN second, and if neither is there the word „ohne Kriterium".
 * That is not a missing value: a rule without any criterion is not empty, it
 * is **without effect** — it matches nothing. The whole sentence belongs to
 * the facts; the row carries the word.
 */
function Counterparty({ name, iban }: { name: string | null; iban: string | null }) {
  if (name) {
    // The stock goes to 46 characters; without clipping the cell wraps and the
    // row grows, and V1 asks for one row height.
    return (
      <span className="v2trunc" title={name}>
        {name}
      </span>
    );
  }
  if (iban) return <MonoCell value={iban} />;
  return <span className="v2rrrow__none">ohne Kriterium</span>;
}

/**
 * Ranks 10 and 11 — an account of the rule as **number plus name**.
 *
 * The rule stores the number, not the id, because it outlives a financial
 * year while an account line does not; resolving the name is the caller's job
 * and the overview query already does it. Missing gets a word, never a dash:
 * „ohne Personenkonto" is the statement the page is read for.
 */
function Account({
  account,
  href,
  missing,
}: {
  account: PreviewAccount | null | undefined;
  href?: (accountNumber: string) => string;
  missing: string;
}) {
  if (!account) return <span className="v2rrrow__none">{missing}</span>;
  return (
    <AccountCell
      number={account.accountNumber}
      name={account.accountName}
      {...(href ? { href: href(account.accountNumber) } : {})}
    />
  );
}

/** The date and the amount of the last payment, or the word for „none yet". */
function LastPayment({ payment }: { payment: { date: string; amount: number } | null }) {
  if (!payment) return <span className="v2muted">noch keine</span>;
  return (
    <span className="v2rrrow__last">
      <Time value={payment.date} format="date" length="short" size="sm" />
      <AmountCell value={payment.amount} />
    </span>
  );
}
