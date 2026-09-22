import { taxKeyEntry, toCurrentTaxKey } from "@/ludwig/core/datev/tax-keys";

import { MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";

/**
 * The DATEV tax key (BU) as it is **read** — nachtrag to 0125, from F271.
 *
 * Stored and shown are two different keys. DATEV renumbered the keys with the
 * fiscal year 2018 („9" became „401"), Ludwig keeps storing the old form
 * (rule R10) and the app has been showing the current one since F271. The set
 * showed the raw value, so the same line said „9" in the card and „401" in the
 * table above it — the contradiction the owner found on staging.
 *
 * One cell for every reading place, so there is one answer: the current form,
 * and in the tooltip what is stored where the two differ. Input fields keep
 * the stored form (`TaxKeyField`) — this is display, never data.
 *
 * @when    Showing a tax key that was read — booking line, list column, facts row.
 * @instead Choosing a key → TaxKeyField. What the key means in a sentence → the tooltip is here.
 */
export function TaxKeyCell({
  taxKey,
  reverseChargeCase,
  taxKeyHref,
}: {
  /** The key **as stored** („9"), not the current form — the cell converts. */
  taxKey: string | null | undefined;
  /**
   * DATEV „Sachverhalt L+L" (§ 13b case code) of the line, where the caller
   * has it. Without it § 13b keeps its stored key: „94" has four current
   * forms and only the case tells them apart — a guess would name a different
   * key than DATEV (`toCurrentTaxKey`).
   */
  reverseChargeCase?: number | null;
  /**
   * The way to the reference work of the keys, per **stored** key — the app
   * builds the URL in the current form itself (`useTaxKeyHref`). Same pattern
   * as `accountHref`: without it the key stays text, never a link that goes
   * nowhere (V14).
   */
  taxKeyHref?: (taxKey: string) => string;
}) {
  const stored = taxKey?.trim();
  if (!stored) return <MonoCell value={null} />;

  const current = toCurrentTaxKey(stored, reverseChargeCase ?? null).key;
  // The catalog's own word for the key, so the tooltip says what was chosen
  // and not only how it is numbered today.
  const label = taxKeyEntry(stored)?.label;
  const title = [label, current === stored ? null : `gespeichert als ${stored}`]
    .filter(Boolean)
    .join(" · ");

  // The tooltip sits on the value, not on the link: a title on both would put
  // two tooltips over one word.
  const body = <MonoCell value={current} {...(title ? { title } : {})} />;
  if (!taxKeyHref) return body;
  return (
    <Link href={taxKeyHref(stored)} className="v2taxkey">
      {body}
    </Link>
  );
}
