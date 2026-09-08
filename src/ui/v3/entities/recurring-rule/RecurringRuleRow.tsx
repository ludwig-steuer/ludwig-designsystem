import { Row } from "../../primitives/Table";
import {
  recurringRuleColumns,
  type RecurringRuleColumnOptions,
  type RecurringRuleRowData,
} from "./recurring-rule-columns";

/**
 * One recurring rule in a table (0132) — the first form of the family.
 *
 * Three questions are asked of a rule before anybody reads on: **who does it
 * concern, what does it do on a hit, does it still apply?** The hand-written
 * four-column row in step 5 of the batch review leaves out exactly the two
 * answers — booking mode and validity — and prints the rhythm raw in English.
 *
 * The cells come from `recurringRuleColumns()`, the same catalogue `DataTable`
 * uses. The row is the frame for a handful of lines; the column set is the
 * frame for the rule book of a whole client (0131). Two cell definitions for
 * one entity would be R17 one level down.
 */

/**
 * What the row takes: the fields of one rule, plus the words and the ways.
 *
 * Thirteen props, and §4 still says one component: eleven of them are columns
 * of **one** row that only arrive singly because their model is not mirrored
 * (L-240). Splitting would not decouple anything, it would create pass-through
 * props.
 */
export type RecurringRuleRowProps = RecurringRuleRowData & RecurringRuleColumnOptions;

/**
 * @when    A recurring rule as a row in a plain table — the overdue list, the
 *          second rule of a case, a handful of rows inside a card.
 * @instead A sortable, filterable table of every rule of a client →
 *          `recurringRuleColumns()` in `DataTable`, see RecurringRuleOverview.
 *          Everything about one rule → RecurringRuleFacts. Changing it →
 *          RecurringRuleEditor. The whole overdue list with head and empty
 *          state → RecurringRuleList.
 */
export function RecurringRuleRow({
  labels,
  caseHref,
  accountHref,
  columns,
  ...data
}: RecurringRuleRowProps) {
  const cols = recurringRuleColumns({
    labels,
    ...(columns ? { columns } : {}),
    ...(caseHref ? { caseHref } : {}),
    ...(accountHref ? { accountHref } : {}),
  });
  return (
    /*
      **No `href` on the row.** `Row href` makes the whole row an `<a>`, and
      the case cell carries its own way. An anchor inside an anchor is invalid
      markup — measured as a hydration warning in 0101. A list that wants the
      whole row to lead somewhere uses `DataTable rowHref` and leaves
      `caseHref` unset (0131).
    */
    <Row>
      {cols.map((c) => (
        <span key={c.key} className={c.align === "end" ? "v2num" : undefined}>
          {c.cell(data)}
        </span>
      ))}
    </Row>
  );
}
