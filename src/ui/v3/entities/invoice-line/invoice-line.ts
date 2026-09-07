import type { InvoiceLineItem } from "@/ludwig/modules/invoices/domain/invoice";

/**
 * The words and the small derivations the invoice-line family shares.
 *
 * It is a type file, not a component: `InvoiceLineRow`, `InvoiceLineFacts` and
 * `InvoiceLineList` all need the same labels and the same title fallback, and
 * a second copy of either would be a second truth.
 */

/**
 * The German words for the four value ranges a line shows as a badge.
 *
 * They arrive as a prop because none of them has a registry axis yet (L-99)
 * and R1 forbids a local label map. A value without a word is shown raw —
 * visibly wrong beats silently gone, and today the app prints the raw English
 * key for 92 lines because its own map misses the values (L-203).
 *
 * @when    Rendering any invoice line: row, facts, list.
 * @instead A state with an axis → StatusBadge and the registry.
 */
export interface InvoiceLineLabels {
  source: Readonly<Record<string, string>>;
  fundUsageNature: Readonly<Record<string, string>>;
  lineSpecialType: Readonly<Record<string, string>>;
  vatSpecialCase: Readonly<Record<string, string>>;
}

/**
 * The word for a raw value, or the raw value itself.
 *
 * @when    Turning one of the four value ranges into text.
 * @instead A state from an axis → resolveStatus.
 */
export function lineLabel(
  map: Readonly<Record<string, string>>,
  value: string | null,
): string | null {
  if (!value) return null;
  return map[value] ?? value;
}

/**
 * What the line is called. `itemName` is filled in 100 % of the stock today,
 * but the column is nullable — and a line without a name must not look
 * nameless: first the opening line of the description, then the position.
 *
 * @when    The heading of a line, in the row and in the facts.
 * @instead The full description → productDescription itself.
 */
export function lineTitle(line: InvoiceLineItem): string {
  if (line.itemName) return line.itemName;
  const first = line.productDescription?.split("\n")[0]?.trim();
  if (first) return first;
  return `Position ${line.position}`;
}

/**
 * The net sum over the lines that still count.
 *
 * A `disabled` line was replaced by the document collapse, and the
 * `virtual_aggregate` line is its collector — counting both would show every
 * collapsed invoice twice. `summary_total` lines stay in: where they make the
 * sum differ from the invoice, that difference is exactly what the check is
 * for.
 *
 * @when    The foot of InvoiceLineList, and the check against the invoice.
 * @instead One line's own amount → line.lineTotalNetValue.
 */
export function linesNetTotal(lines: readonly InvoiceLineItem[]): number {
  return lines
    .filter((l) => !l.disabled)
    .reduce((sum, l) => sum + (l.lineTotalNetValue ?? 0), 0);
}
