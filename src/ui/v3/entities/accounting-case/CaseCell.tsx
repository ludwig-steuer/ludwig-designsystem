import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";
import { caseIdentifier, caseTitle, type CaseLink } from "./case-title";

/**
 * The case, named inside somebody else's row (0095).
 *
 * Three lists mention a case today, and each builds the mention by hand — the
 * documents list, the bank statement and the stuck documents. The statement's
 * version is the richest: a stack of cases, each with the part of the amount
 * that falls on it, and the word „offen" where none is assigned yet. That
 * version is the one this cell takes over, because it is the only one that
 * covers all three cases.
 *
 * **No case is a statement, not a missing value.** 65 % of the statement rows
 * have none, and „offen" says what that means — a dash would say „unknown".
 */

/**
 * @when    A case is mentioned in a foreign row — statement, document list,
 *          anything that points at one.
 * @instead The case as its own row → CaseRow. Everything about it → CaseFacts
 *          or CaseDrawer.
 */
export function CaseCell({
  cases,
  href,
  emptyHref,
  showState = true,
  layout = "inline",
}: {
  cases: readonly CaseLink[];
  /** Where each case leads. The cell builds no URL — it knows neither client nor year. */
  href: (caseId: string) => string;
  /** Where „offen" leads. Without it the word stands without a way. */
  emptyHref?: string;
  /** The state as a chip behind the name; `false` where the row has its own column. */
  showState?: boolean;
  /**
   * `inline` — **one line**: identifier, then the name with an ellipsis and
   * the whole value in its `title`, then the state. That is what a list
   * needs: a list is read down its row heights, and a cell 24 px taller than
   * its neighbours is a signal without a meaning (owner decision 2026-09-07
   * via the coordinator; measured in the document catalogue, one row of 71,7
   * px among rows of 48).
   *
   * `stacked` — the name keeps its place and everything else moves to the
   * next line. That is right where the cell has room and the name is the
   * point: a card, a facts panel, zone 1 of a drawer.
   */
  layout?: "inline" | "stacked";
}) {
  if (cases.length === 0) {
    const word = "offen";
    return (
      <span className="v2case__none">
        {emptyHref ? (
          <Link href={emptyHref} className="v2case__nonelink">
            {word}
          </Link>
        ) : (
          word
        )}
      </span>
    );
  }

  return (
    <span className={`v2case${cases.length > 1 ? " v2case--stack" : ""}`}>
      {cases.map((c) => (
        <span className={`v2case__one v2case__one--${layout}`} key={c.caseId}>
          {/* The identifier leads: it is what a person searches for and quotes
              on the phone, and in a line it is the fixed part while the name
              is the one that gives way. */}
          <code className="v2case__no">{caseIdentifier(c)}</code>
          <Link href={href(c.caseId)} className="v2case__link" title={caseTitle(c)}>
            {caseTitle(c)}
          </Link>
          {/* Der Zustand als Chip, nicht als Punkt: Farbe steht nie allein
              (V7), und die Erklärung sitzt einmal am Spaltenkopf statt einmal
              je Zeile (R1, 0077). */}
          {showState && c.lifecycleStatus ? (
            <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} info={false} />
          ) : null}
          {/* Der Teilbetrag kommt aus der Zuordnung der Bankzeile, nicht aus
              dem Sachverhalt — die Zelle rechnet ihn nicht (L-56). */}
          {c.amount == null ? null : (
            <span className="v2case__amt">
              <AmountCell value={c.amount} currency={c.currency ?? "EUR"} />
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
