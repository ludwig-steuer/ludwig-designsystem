import { formatCount } from "../../format";
import { EmptyState } from "../../primitives/EmptyState";
import { Card, CardHead, EmptyRow, HeadRow, Table } from "../../primitives/Table";
import {
  RECURRING_RULE_COLUMN_LABEL,
  RECURRING_RULE_OVERDUE_COLUMNS,
  recurringRuleColumnOrder,
  recurringRuleTracks,
  type RecurringRuleListRow,
} from "./recurring-rule-columns";
import { RecurringRuleRow } from "./RecurringRuleRow";
import type { RecurringRuleLabels } from "./recurring-rule";

/**
 * The recurring rules whose payment did not arrive (0133).
 *
 * > When a booking cycle is up for review, the bookkeeper wants to see which
 * > expected recurring payment did not arrive in the period, so that she can
 * > ask about it instead of releasing the batch blind.
 *
 * **Information, not a task.** No bulk action, no filter, no selection: the
 * list does not block the release of the batch. Two things are wrong with the
 * hand-built version in step 5 today, and both are what this list is for:
 *
 * 1. At zero hits the whole table disappears — which hides its most important
 *    case, *every expected payment arrived*. Whoever sees nothing cannot tell
 *    whether it was checked or whether there was nothing to check.
 * 2. One cannot see whether the missing payment would have been booked at all:
 *    the booking mode is not in the column set, and the rhythm stands there
 *    raw in English.
 *
 * No pager and no sorting either: the population is the active rules with a
 * rhythm, at most 29 in the stock, and in the usual case one to five rows.
 */

/**
 * The case leads: this list has left its own case — it counts across every
 * case of a client — and the last payment closes the row, because that is the
 * answer the question was asked for.
 *
 * **No validity column**, although the profile's list table names it: the
 * population is the **active** rules, so every row would carry the same word,
 * and a column with one value in every row is a dead column. The cell stays
 * available at the row; 0131 uses it. The set itself lives in the catalogue,
 * next to its two sisters — one place, three named sets.
 */
const COLUMNS = RECURRING_RULE_OVERDUE_COLUMNS;

/** Below this the seven columns start squeezing each other instead of scrolling. */
const MIN_WIDTH = 1180;

/**
 * @when    The expected recurring payments that did not arrive in a period —
 *          step 5 of the batch review.
 * @instead One rule as a row somewhere else → RecurringRuleRow. Everything
 *          about one rule → RecurringRuleFacts. Every rule of a client,
 *          sortable and filterable → DataTable with the column set of 0131.
 */
export function RecurringRuleList({
  rules,
  labels,
  caseHref,
  period,
  total,
  title = "Erwartete Zahlungen ohne Eingang",
}: {
  /**
   * The overdue rules in the order of the query — the list does not sort.
   *
   * **Without `labels` and `caseHref`**: those two are props of the list and
   * are handed to every row. Per row they would make the list's own two props
   * unreachable and repeat the same object in every entry — the one place
   * where this list deviates from the interface written in 0133, and it
   * deviates in order to keep that interface's own sentence true.
   */
  rules: readonly RecurringRuleListRow[];
  /** The German words of the family, handed to every row (L-242, L-256). */
  labels: RecurringRuleLabels;
  /**
   * The way to the case. Required: without it the list is a dead end — the
   * asking happens **at the case**, not at the rule.
   */
  caseHref: (caseId: string) => string;
  /** The period of the batch, in the head („August 2026"). */
  period?: string;
  /** How many rules were checked — the denominator of the counter. */
  total?: number;
  title?: string;
}) {
  return (
    <Card className="v2rrlist">
      <CardHead
        title={title}
        {...(period ? { sub: period } : {})}
        meta={<span className="v2muted">{counter(rules.length, total)}</span>}
      />
      <Table cols={recurringRuleTracks(COLUMNS)} minWidth={MIN_WIDTH}>
        <HeadRow>
          {recurringRuleColumnOrder(COLUMNS).map((c) => (
            <span key={c} className={c === "amount" ? "v2num" : undefined}>
              {RECURRING_RULE_COLUMN_LABEL[c]}
            </span>
          ))}
        </HeadRow>
        {rules.length === 0 ? (
          <EmptyRow>
            {/*
              The success sentence, and the card stays where it is. This is the
              core of the task: today the list vanishes at zero hits and says
              nothing — neither that it looked nor that it found nothing.
              It is a success, not a shortcoming, so there is no way out of it
              and nothing to do.
            */}
            <EmptyState
              title="Alle erwarteten Dauerzahlungen sind im Zeitraum eingegangen."
              description="Keine aktive Regel mit Rhythmus wartet noch auf ihre Zahlung. Der Stapel lässt sich freigeben."
            />
          </EmptyRow>
        ) : (
          rules.map(({ id, ...rule }) => (
            <RecurringRuleRow key={id} {...rule} labels={labels} caseHref={caseHref} columns={COLUMNS} />
          ))
        )}
      </Table>
    </Card>
  );
}

/**
 * „3 von 27 Regeln", or „3 Regeln" where the caller knows no denominator.
 *
 * Without the denominator the „3" says nothing about how thoroughly it was
 * checked — three out of four is a different message from three out of 27.
 */
function counter(hits: number, total?: number): string {
  const word = total === 1 || (total === undefined && hits === 1) ? "Regel" : "Regeln";
  if (total === undefined) return `${formatCount(hits)} ${word}`;
  return `${formatCount(hits)} von ${formatCount(total)} ${word}`;
}
