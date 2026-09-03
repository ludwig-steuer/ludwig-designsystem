import type { Currency, Money } from "@/ludwig/shared/money";
import { formatAmount } from "../format";
import type { CellTone } from "./Cells";

/**
 * One amount, three sizes, one rule (0032, P24).
 *
 * Seven formatters and 47 files with their own `Intl.NumberFormat` produced
 * seven slightly different amounts. Whoever checks compares numbers — then
 * they must look the same and line up under each other.
 */

export type AmountSize = "sm" | "md" | "lg";

type Common = {
  /** `sm` cell and inline · `md` row and detail · `lg` tile and total. */
  size?: AmountSize;
  /** Colour only where the number itself is the alarm — never the sign (A7). */
  tone?: CellTone;
  /** Also show `+` on positive values — for deviations. */
  signed?: boolean;
  /** The calculation behind it, as a tooltip. */
  title?: string;
};

/**
 * The currency comes from the value. A bare number has to name it — the silent
 * EUR default is what produced the 47 copies.
 */
export type AmountProps = Common &
  (
    | { value: Money | null; currency?: never }
    /** `currency: null` is a decimal without one — a count, a quantity. */
    | { value: number | null; currency: Currency | null }
  );

/**
 * @when    Every amount that is shown — in a tile, a total row, running text.
 * @instead An amount in a table cell → AmountCell (right-aligned, same rule).
 *          An amount someone types → AmountInput. A deviation in percent →
 *          DeviationCell.
 */
export function Amount(props: AmountProps) {
  const { size = "md", tone = "neutral", signed, title } = props;
  const text = formatAmount(props.value, props.currency, signed);
  const classes = [
    "v2amount",
    `v2amount--${size}`,
    props.value === null ? "v2muted" : "",
    tone === "neutral" ? "" : `v2num--${tone}`,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} title={title}>
      {text}
    </span>
  );
}
