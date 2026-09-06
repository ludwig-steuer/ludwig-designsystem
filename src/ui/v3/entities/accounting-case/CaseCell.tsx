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
}: {
  cases: readonly CaseLink[];
  /** Where each case leads. The cell builds no URL — it knows neither client nor year. */
  href: (caseId: string) => string;
  /** Where „offen" leads. Without it the word stands without a way. */
  emptyHref?: string;
  /** The state as a chip behind the name; `false` where the row has its own column. */
  showState?: boolean;
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
        <span className="v2case__one" key={c.caseId}>
          <Link href={href(c.caseId)} className="v2case__link" title={caseTitle(c)}>
            {caseTitle(c)}
          </Link>
          <code className="v2case__no">{caseIdentifier(c)}</code>
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
