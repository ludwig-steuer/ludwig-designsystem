import type { CaseHeaderVM } from "@/ludwig/modules/accounting-cases/domain/overview-vm";
import type { Currency } from "@/ludwig/shared/money";

import { Amount } from "../../primitives/Amount";

/**
 * The amount of a case, and under it what is still open (0192, B-01).
 *
 * The head names the amount **once** (D24). The rest after the payments so
 * far stands under it only where it says something the amount does not:
 * partly paid, or fully covered. When nothing is paid yet the rest **is** the
 * amount — writing it again is exactly what D24 forbids. This rule lived in
 * the showcase page and would have been rebuilt in the app; it belongs here,
 * in one place (owner 2026-09-21).
 *
 * The component computes nothing: the rest comes ready from the app
 * (`openAmountOf`, Σ documents − Σ payments). It colours nothing either — an
 * open rest is not an error (V6).
 */

/**
 * @when    The amount of a case in its head (`EntityHeader.metric`), with the
 *          open rest under it.
 * @instead Any other amount → Amount. The case's other facts → CaseFacts.
 *          The payments themselves → CaseTimeline.
 */
export function CaseAmount({
  amount,
  openAmount,
  currency,
}: {
  /** The case's amount. `null` renders **nothing** — no „— €" (D7). */
  amount: CaseHeaderVM["totalAmount"];
  /** What is still open; `null` = no document to measure a rest against. */
  openAmount: CaseHeaderVM["openAmount"];
  /** The app narrows its `string` with `asCurrency`. */
  currency: Currency | null;
}) {
  if (amount === null) return null;
  return (
    <>
      <Amount value={amount} currency={currency} />
      <Rest open={openAmount} total={amount} currency={currency} />
    </>
  );
}

/** The one place of the rule. Signs are compared without direction. */
function Rest({ open, total, currency }: { open: number | null; total: number; currency: Currency | null }) {
  if (open === null || Math.abs(open) === Math.abs(total)) return null;
  return (
    <span className="v2sub v3camt__rest">
      {open === 0 ? (
        "gedeckt"
      ) : (
        <>
          offen <Amount value={open} currency={currency} size="sm" />
        </>
      )}
    </span>
  );
}
