import type { PaymentAccountOption } from "@/ludwig/modules/bank-transactions/domain/payment-account-options";

import { EntityIcon } from "../../Icons";
import { Link } from "../../primitives/Link";

/**
 * A payment account of the client, named inside foreign markup (0174) — the
 * facts of a bank statement, a recurring rule, a bank line.
 *
 * The shape both places in the app name an account in: an id, a finished
 * label and the IBAN. **Picked from the mirror**, not defined here. The
 * profile wants the name alone and a sign per kind; neither shape carries them
 * yet (L-334), so the label stands as delivered and one sign serves all kinds.
 */
export type PaymentAccountRef = Pick<PaymentAccountOption, "id" | "label" | "iban">;

/**
 * @when    Naming a payment account of the client inside foreign markup — a
 *          facts row, a table cell; with `href` the name leads to its statement.
 * @instead Choosing one → PaymentAccountField. An account of the chart of
 *          accounts → AccountCell.
 */
export function PaymentAccountCell({
  account,
  href,
}: {
  /** Rank 1 — the label as the app builds it; the IBAN goes into the `title`. */
  account: PaymentAccountRef;
  /** The way to the account's statement (`banks/[accountId]`). Without it, text. */
  href?: string;
}) {
  const title = account.iban ?? undefined;
  // The anchor wraps the **name**: the sign carries no word of its own
  // (`aria-hidden`), the name is the word (V11) — one target (I11).
  return (
    <span className="v2pacc">
      <EntityIcon entity="bank-account" />
      {href ? (
        <Link href={href} className="v2pacc__name" title={title}>
          {account.label}
        </Link>
      ) : (
        <span className="v2pacc__name" title={title}>
          {account.label}
        </span>
      )}
    </span>
  );
}
