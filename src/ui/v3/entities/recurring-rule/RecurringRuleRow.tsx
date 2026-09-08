import {
  RULE_INTERVAL_LABEL,
  type RuleBookingMode,
  type RuleDirection,
  type RuleExpectedInterval,
} from "@/ludwig/modules/recurring-rules/domain/rule";

import { formatCount } from "../../format";
import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Row } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import { caseIdentifier, caseTitle, type CaseLink } from "../accounting-case/case-title";
import { ruleLabel, type RecurringRuleLabels } from "./recurring-rule";

/**
 * One recurring rule in a table (0132) — the first form of the family.
 *
 * Three questions are asked of a rule before anybody reads on: **who does it
 * concern, what does it do on a hit, does it still apply?** The hand-written
 * four-column row in step 5 of the batch review leaves out exactly the two
 * answers — booking mode and validity — and prints the rhythm raw in English.
 *
 * **The leading cell is derived, not a name column.** A rule has no name; what
 * a person recognises it by is the counterparty, and that sits in two columns:
 * where the payment carried an IBAN, the learning path stores the IBAN and
 * writes **no** name. A row that only showed the name would be empty for every
 * rule learned from a payment.
 */

/**
 * The cells this row can render. `columns` **selects**, it never reorders —
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
  | "periods"
  | "lastPayment";

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
  "periods",
  "lastPayment",
];

/** Ranks 1–5 and 7 — everything a rule carries out of its own columns. */
const DEFAULT_COLUMNS: RecurringRuleColumn[] = [
  "counterparty",
  "bookingMode",
  "validity",
  "amount",
  "interval",
  "direction",
];

/** The word above each cell, for the head row of whoever frames this row. */
export const RECURRING_RULE_COLUMN_LABEL: Record<RecurringRuleColumn, string> = {
  case: "Sachverhalt",
  counterparty: "Gegenpartei",
  bookingMode: "Buchungsweise",
  validity: "Gültigkeit",
  amount: "Erwartet",
  interval: "Rhythmus",
  direction: "Richtung",
  periods: "Perioden",
  lastPayment: "Letzte Zahlung",
};

/**
 * The grid track of each cell. The counterparty is the only one that gives
 * way, and it is `minmax(0, 1fr)` and not `1fr`: a bare `1fr` is
 * `minmax(auto, 1fr)`, and head and rows are separate grids — each would size
 * the track by its own content and the columns would stand at different x
 * positions (measured in 0101).
 */
const TRACK: Record<RecurringRuleColumn, string> = {
  case: "200px",
  counterparty: "minmax(0, 1fr)",
  bookingMode: "150px",
  validity: "90px",
  amount: "130px",
  interval: "120px",
  direction: "130px",
  periods: "110px",
  lastPayment: "170px",
};

/** The cells that carry a number and therefore its right edge (V3). */
const NUMERIC: ReadonlySet<RecurringRuleColumn> = new Set<RecurringRuleColumn>(["amount"]);

/**
 * The grid track list for a column set — head and rows read the same string.
 *
 * It exists because the caller builds the frame (`Table cols={…}`), and a
 * second, hand-written list is a measure that drifts: the head shrinks while
 * the rows do not, and nobody notices until a column stands in two places.
 *
 * @when    A `Table` is framed around `RecurringRuleRow`.
 * @instead A sortable, filterable table of every rule of a client → the
 *          column set of 0131, once it exists.
 */
export function recurringRuleTracks(
  columns: readonly RecurringRuleColumn[] = DEFAULT_COLUMNS,
): string {
  return pick(columns)
    .map((c) => TRACK[c])
    .join(" ");
}

/** The chosen cells in the fixed order — the one place that applies it. */
function pick(columns: readonly RecurringRuleColumn[]): RecurringRuleColumn[] {
  const chosen = new Set(columns);
  return ORDER.filter((c) => chosen.has(c));
}

export interface RecurringRuleRowProps {
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
   * Rank 4 — what the accrual would book, **already derived by the caller**.
   * The row does no arithmetic: the derivation has three steps and belongs to
   * the domain.
   */
  amount: number | null;
  /** Rank 5 — the word comes from `RULE_INTERVAL_LABEL`, never raw English. */
  interval: RuleExpectedInterval | null;
  /** Rank 7 — the word comes from `labels`; a value without one shows raw. */
  direction: RuleDirection | null;
  /** The German words the mirror does not carry (L-242, L-256). */
  labels: RecurringRuleLabels;
  /** Rank 6 — set only where the list has left its own case. */
  case?: CaseLink;
  /**
   * The way to the case. Without it the name stands without a way — the row
   * builds no URL, it knows neither client nor fiscal year.
   */
  caseHref?: (caseId: string) => string;
  /** The events of this rule as a counter („3 Perioden"). */
  periodCount?: number;
  /**
   * The last payment assigned to this rule. The prop **missing** means the
   * column does not exist; **`null`** means there has not been one yet.
   */
  lastPayment?: { date: string; amount: number } | null;
  /**
   * Which cells, in the order of the list. Default: ranks 1–5 and 7 — the
   * points a rule carries without anything the caller has to fetch.
   */
  columns?: readonly RecurringRuleColumn[];
}

/**
 * @when    A recurring rule as a row in a table — the overdue list, the rule
 *          set of a client, the second rule of a case.
 * @instead Everything about one rule → RecurringRuleFacts. Changing it →
 *          RecurringRuleEditor. The whole overdue list with head and empty
 *          state → RecurringRuleList.
 */
export function RecurringRuleRow(props: RecurringRuleRowProps) {
  const columns = pick(props.columns ?? DEFAULT_COLUMNS);
  return (
    /*
      **No `href` on the row.** `Row href` makes the whole row an `<a>`, and
      the case cell carries its own way. An anchor inside an anchor is invalid
      markup — measured as a hydration warning in 0101.
    */
    <Row>
      {columns.map((column) => (
        <span key={column} className={NUMERIC.has(column) ? "v2num" : undefined}>
          {cell(column, props)}
        </span>
      ))}
    </Row>
  );
}

/** What stands in one cell. One place, so head and row cannot part ways. */
function cell(column: RecurringRuleColumn, p: RecurringRuleRowProps) {
  switch (column) {
    case "case":
      return p.case ? <Case link={p.case} href={p.caseHref} /> : null;
    case "counterparty":
      return <Counterparty name={p.counterpartyName} iban={p.counterpartyIban} />;
    case "bookingMode":
      return <StatusBadge axis="regel_modus" status={p.bookingMode} info={false} />;
    // A word, no `tone` and no dot: R1 allows colour only through an axis, and
    // `is_active` has none (L-241). „inaktiv" is a statement about the rule,
    // not a warning — a rule can be switched off on purpose.
    case "validity":
      return p.isActive ? "aktiv" : "inaktiv";
    case "amount":
      return <AmountCell value={p.amount} />;
    // Without a rhythm there is no overdue check at all — that is a statement,
    // so it gets a word rather than a dash.
    case "interval":
      return p.interval ? (
        RULE_INTERVAL_LABEL[p.interval]
      ) : (
        <span className="v2muted">ohne Rhythmus</span>
      );
    // Same case one column on: no direction means the rule accepts both, not
    // that nobody knows which.
    case "direction":
      return (
        ruleLabel(p.labels.direction, p.direction) ?? (
          <span className="v2muted">ohne Richtung</span>
        )
      );
    case "periods":
      return p.periodCount === undefined ? null : (
        <span className="v2muted">
          {formatCount(p.periodCount)} {p.periodCount === 1 ? "Periode" : "Perioden"}
        </span>
      );
    case "lastPayment":
      return <LastPayment payment={p.lastPayment ?? null} />;
  }
}

/**
 * Rank 6 — the case the rule hangs on, and the way to it.
 *
 * Without `caseHref` the case still stands there, as text: the row builds no
 * URL of its own, and a link that leads nowhere is worse than none (I11).
 */
function Case({ link, href }: { link: CaseLink; href?: (caseId: string) => string }) {
  // The state of the case is not the state of its rule, and the row has its
  // own two state cells — a third chip here would say something about a
  // different thing.
  if (href) return <CaseCell cases={[link]} href={href} showState={false} />;
  return (
    <span className="v2rrrow__case" title={caseTitle(link)}>
      <code className="v2rrrow__caseno">{caseIdentifier(link)}</code>
      <span className="v2trunc">{caseTitle(link)}</span>
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
