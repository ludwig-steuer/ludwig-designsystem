import type { BankBalanceComparison, SourcedAmount } from "./types";

/**
 * The little arithmetic the card does beside the view model (0202): which
 * figures may be compared, and their difference. The verdict stays with the
 * view model — the app computes it. Plain Node runs this file for
 * `pnpm check:bank-balance`, so it imports types only.
 */

/** Rounded to the cent; `-0` becomes `0`, or it would print as „−0,00". */
export function cents(value: number): number {
  return Math.round(value * 100) / 100 || 0;
}

export function dayBefore(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export type Side = "old" | "new";

/** The cut-off a column stands for: the day before the period, or its last day. */
export function cutOff(c: BankBalanceComparison, side: Side): string {
  return side === "old" ? dayBefore(c.period.from) : c.period.to;
}

/**
 * Whether a balance can stand against the ledger at the column's cut-off.
 * The opening balance of a file holds for the day before its first row: a
 * file starting on 03.08. says 02.08., and nothing moved in between. A
 * closing balance must be the period's last day — one from 22.08. is not
 * „new on 31.08.".
 */
export function comparable(
  c: BankBalanceComparison,
  side: Side,
  value: SourcedAmount,
  coveredFrom: string | null = null,
): boolean {
  const day = cutOff(c, side);
  if (value.asOf === day) return true;
  return side === "old" && coveredFrom !== null && value.asOf > day && value.asOf < coveredFrom;
}

/** The movement of the file counts only if the file reaches the end of the period. */
export function movementComparable(c: BankBalanceComparison): boolean {
  const { movement, coveredTo } = c.statement;
  return movement !== null && coveredTo !== null && coveredTo >= c.period.to;
}

/** What the released ledger is compared with at „new": the file first, then one's own balance. */
export function releasedDifferenceNew(c: BankBalanceComparison): number | null {
  const own = c.statement.new && comparable(c, "new", c.statement.new) ? c.statement.new : null;
  const other = own ?? (c.manual.new && comparable(c, "new", c.manual.new) ? c.manual.new : null);
  return other ? cents(c.ledger.released.new.amount - other.amount) : null;
}

/** The contributions of the explanation — the remainder line has its own field (A4). */
export function explainedSum(c: BankBalanceComparison): number {
  return cents(
    c.explanation
      .filter((line) => line.key !== "remainder")
      .reduce((sum, line) => sum + (line.amount ?? 0), 0),
  );
}
