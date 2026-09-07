import { Link } from "../../primitives/Link";
import { Amount } from "../../primitives/Amount";
import { Time } from "../../primitives/Time";
import { BankTransactionPurpose } from "./BankTransactionPurpose";
import type { BankTransactionCellData } from "./bank-transaction";

/**
 * A payment, mentioned in a foreign view (0100).
 *
 * The timeline of a case, a step of the batch review: they name a payment
 * without being the statement. Four points are enough — counterparty, date,
 * amount, purpose — but four, not one line of text.
 *
 * **The sign is the direction**: positive is money in, negative is money out.
 * There is no direction column and there must not be one, which has two
 * consequences that are both acceptance criteria: the sign carries **no
 * colour** (V6/A7 — red is criticality, and an outgoing payment is not an
 * error), and the word „Eingang"/„Ausgang" is not written next to it, because
 * that is the same information twice.
 */

/**
 * @when    A foreign view mentions one payment — a case timeline, a step of
 *          the batch review, a search result.
 * @instead The line of the statement with its state → BankTransactionRow.
 *          Everything about the payment → BankTransactionFacts. Only the
 *          purpose → BankTransactionPurpose.
 */
export function BankTransactionCell({
  transaction,
  account,
  href,
}: {
  transaction: BankTransactionCellData;
  /**
   * The payment account — **only when the cell stands away from it**. In the
   * statement it would be the column the page already sets; in a case
   * timeline nobody else knows it.
   */
  account?: { label: string; href?: string };
  /** Where the cell leads. Without it, it is text. */
  href?: string;
}) {
  const { counterpartyName, postingDate, amount, currency, purpose, sepaTags } = transaction;
  // 3 % of the lines have no counterparty. Then the purpose **is** the
  // identity and moves up — it is never missing (100 % filled).
  const name = counterpartyName?.trim();

  return (
    <div className="v2btx">
      <div className="v2btx__top">
        <span className="v2btx__who">
          {name ? (
            href ? (
              <Link href={href}>{name}</Link>
            ) : (
              name
            )
          ) : (
            <BankTransactionPurpose purpose={purpose} tags={sepaTags} href={href} />
          )}
        </span>
        {account ? (
          <span className="v2btx__acct">
            {account.href ? <Link href={account.href}>{account.label}</Link> : account.label}
          </span>
        ) : null}
        {/* With the year: the statement drops it today („15.04."), which is
            ambiguous in a list filtered across financial years — and in a
            case timeline all the more.
            **Named, not only correct** (finding L-61): a date alone does not
            say which of the two it is, and `BankPane` over there labels the
            posting date „Wertstellung". So the word travels with it — as a
            **visible** prefix, not as a `title`: `Time` writes its own
            `title` (the full timestamp), so the outer one only covered the
            6,0 px above and 3,8 px below the glyphs and never the digits
            themselves (acceptance 0100, M1). A word one has to hover for is
            not a word (V11, T8). */}
        <span className="v2btx__when">
          <Time value={postingDate} format="date" length="short" size="sm" prefix="Buchung" />
        </span>
        <Amount value={amount} currency={currency} size="sm" />
      </div>
      {name ? (
        <div className="v2btx__what">
          <BankTransactionPurpose purpose={purpose} tags={sepaTags} />
        </div>
      ) : null}
    </div>
  );
}
