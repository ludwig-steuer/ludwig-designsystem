import type { ReactNode } from "react";

import { formatCount } from "../../format";
import { DataTable, type ListPatch } from "../../patterns/DataTable";
import { TextButton } from "../../primitives/TextButton";
import {
  recurringRuleColumns,
  RECURRING_RULE_BOOK_COLUMNS,
  type RecurringRuleListRow,
} from "./recurring-rule-columns";

/**
 * The rule book of one client (0131) — every recurring rule side by side.
 *
 * > When a client has been taken on, the case worker wants to see every
 * > recurring booking rule side by side, so that she recognises which one
 * > stands still, which one has no personal account and which one grips twice.
 *
 * Three numbers are the whole job, measured across all six clients on
 * 2026-09-08: **one** of 30 rules is switched off, **one** has no personal
 * account, **one** case carries two rules. The page has failed if those three
 * rows look like the 27 healthy ones — so each of the three gets a **word** in
 * its row, not a footnote: „inaktiv", „ohne Personenkonto", „2 Regeln". No
 * colour: R1 allows it only through a registry axis, and neither `is_active`
 * (L-241) nor „two rules on one case" has one — nor would either be an error.
 *
 * The fourth number is the larger one: **75 of 104 recurring cases carry no
 * rule at all** (72 %). Whoever sees the 30 built ones sees under a third of
 * what should be running. That number therefore rides along — as a number with
 * a way (zone 6), and as the whole content of the empty case, which is the
 * normal case here: five of six clients have not one rule.
 *
 * **It sorts nothing, filters nothing, loads nothing** (E1, E2). `rules` are
 * the rows of this page, already sorted and filtered; `sort` and `href` are
 * the mirror of the URL. The filter row above the card stays with the page —
 * it holds the state and knows the values, which is domain knowledge
 * (`FilterBar`, the same split as `CaseList` and `BankTransactionList`).
 */

/**
 * Below this the table scrolls inside its own card instead of squeezing.
 *
 * Measured, not guessed: the nine fixed tracks come to 1300 px, the nine gaps
 * to 126, and the counterparty needs its 180-px floor — 1606. At 1480 the
 * counterparty was left with 54 px and „ohne Kriterium" wrapped into a second
 * line (V1). The page itself never scrolls sideways: `.v2tbl__scroll` does.
 */
const MIN_WIDTH = 1620;

/**
 * @when    Every recurring rule of one client, across cases — sortable,
 *          filterable, the configuration page of the client.
 * @instead The expected payments that did not arrive in a period →
 *          RecurringRuleList. A handful of rows in a plain table →
 *          RecurringRuleRow. Everything about one rule → RecurringRuleFacts.
 */
export function RecurringRuleOverview({
  rules,
  ruleHref,
  accountHref,
  casesWithoutRule,
  total,
  sort,
  href,
  filtered,
  loading,
  error,
}: {
  /** The rows of this page, already sorted and filtered — the list does neither. */
  rules: readonly RecurringRuleListRow[];
  /**
   * Question 4 of the page profile: the way into the rule tab of the case.
   *
   * It lies on the **whole row** (I11), which is why the column set gets no
   * `caseHref` here: the case is the first cell, the row link wraps it, and
   * an anchor inside an anchor is invalid markup. The text of that cell —
   * „2026-0413 Miete Musterstraße 12" — says by itself where it goes.
   */
  ruleHref: (rule: RecurringRuleListRow) => string;
  /** The way to the account sheet for both accounts. Without it: plain text. */
  accountHref?: (accountNumber: string) => string;
  /**
   * Question 3 of the page profile: the recurring cases **without** a rule,
   * with their way.
   *
   * `count` has to count with exactly the filter `href` applies (**I12**) —
   * a number with a way that counts differently is a claim. It carries zone 6
   * **and** the empty case; a tile above the card would put the same number on
   * the page twice, and two numbers drift.
   */
  casesWithoutRule?: { count: number; href: string };
  /** How many rules the client has — the denominator of the counter in the head. */
  total?: number;
  /** The state out of the URL; the active head carries the arrow. */
  sort?: { key: string; dir: "asc" | "desc" };
  /** The page builds the URL. Required as soon as `sort` is set. */
  href?: (patch: ListPatch) => string;
  /** A filter is on: gives the empty text **after** the filter (T6). */
  filtered?: { summary: string; resetHref: string };
  /** Head and column heads stay in place (I7). */
  loading?: boolean;
  /** Text after T5 plus one way to try again (I7). */
  error?: { message: string; retry?: ReactNode };
}) {
  return (
    <DataTable<RecurringRuleListRow>
      rows={[...rules]}
      columns={recurringRuleColumns({
        columns: RECURRING_RULE_BOOK_COLUMNS,
        ...(accountHref ? { accountHref } : {}),
      })}
      rowKey={(rule) => rule.id}
      rowHref={ruleHref}
      head={{
        title: "Regelwerk des Mandanten",
        meta: <span className="v2muted">{counter(rules.length, total)}</span>,
      }}
      minWidth={MIN_WIDTH}
      {...(sort ? { sort } : {})}
      {...(href ? { href } : {})}
      {...(filtered ? { filtered } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      empty={emptyState(casesWithoutRule)}
      {...(casesWithoutRule && casesWithoutRule.count > 0
        ? { next: <TextButton href={casesWithoutRule.href}>{gap(casesWithoutRule.count)}</TextButton> }
        : {})}
    />
  );
}

/**
 * „8 von 30 Regeln", or „8 Regeln" where the caller knows no denominator.
 *
 * Without the denominator the „8" says nothing about how much of the rule book
 * is in front of you — eight of nine is a different message from eight of 30.
 */
function counter(shown: number, total?: number): string {
  const word = total === 1 || (total === undefined && shown === 1) ? "Regel" : "Regeln";
  if (total === undefined) return `${formatCount(shown)} ${word}`;
  return `${formatCount(shown)} von ${formatCount(total)} ${word}`;
}

/** Zone 6 — the next step with its number (I10): where a rule is still missing. */
function gap(count: number): string {
  return count === 1
    ? "Ein Dauersachverhalt hat noch keine Regel"
    : `${formatCount(count)} Dauersachverhalte haben noch keine Regel`;
}

/**
 * The empty case — and here that is the **normal** case: five of six clients
 * carry not one rule.
 *
 * „Keine Einträge" would be no statement at all, so the number of recurring
 * cases makes it one. Two shapes, and the number decides which:
 *
 * - **more than none** — „15 Dauersachverhalte, keiner mit Regel", plus the
 *   way into the case list. That is the answer the page profile sets as the
 *   default of its third open question, and the stock carries it: 75 of the
 *   104 recurring cases sit at exactly these five clients.
 * - **none, or no number at all** — the sentence without a figure. „0
 *   Dauersachverhalte, keiner mit Regel" is as empty as „Keine Einträge", and
 *   a way into a list that is itself empty leads nowhere.
 *
 * No `done`: empty is not a success here, it is a stock state.
 */
function emptyState(cases?: { count: number; href: string }) {
  if (cases && cases.count > 0) {
    return {
      title:
        cases.count === 1
          ? "Ein Dauersachverhalt, und der trägt keine Regel."
          : `${formatCount(cases.count)} Dauersachverhalte, keiner mit Regel.`,
      description:
        "Eine Regel entsteht am Sachverhalt, nicht hier — sie braucht den Fall, an dem sie hängt.",
      action: <TextButton href={cases.href}>Dauersachverhalte ansehen</TextButton>,
    };
  }
  return {
    title: "Für diesen Mandanten ist noch keine Wiederkehr-Regel angelegt.",
    description: cases
      ? "Es gibt auch keinen Dauersachverhalt, an dem eine hängen könnte."
      : "Eine Regel entsteht am Sachverhalt, nicht hier — sie braucht den Fall, an dem sie hängt.",
  };
}
