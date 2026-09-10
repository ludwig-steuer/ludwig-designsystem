/**
 * Tax assistance of the journal entry editor (BL-121) — pure arithmetic.
 *
 * The editor works in **gross**: a line with an input-tax key (8/9) carries the
 * gross amount; its input-tax line is derived — computed live for display and
 * expanded into an explicit line on save (`taxForLineNo`), the same model as
 * `grossLines` in the agent submit. Opening a stored entry folds net + tax
 * pairs back into gross.
 *
 * Rounding: only gross is authoritative. net = round(gross / (1 + rate)),
 * tax = gross − net, so net + tax = gross by construction — no cent drift.
 *
 * Only pure constants and lookups from `domain/tax-keys` are imported — the
 * same truth the agent submit and the EXTF export use.
 */
import {
  STANDARD_TAX_ACCOUNT_NUMBERS,
  taxAccountFor,
  vatRateForTaxKey,
} from "@/ludwig/modules/accounting-cases/domain/tax-keys";
/** The only thing this file needed from the deleted `booking/types.ts` (0043). */
type BookingSide = "debit" | "credit";

/** Tax keys the editor handles as a gross line with derived input tax. */
const EDITOR_ASSIST_KEYS: ReadonlySet<string> = new Set(["8", "9"]);

export interface DerivedTax {
  account: { accountNumber: string; accountName: string };
  ratePercent: number;
  /** Cent-genau: netto + tax = brutto. */
  net: number;
  tax: number;
}

/**
 * Gross → net/tax; the rounding difference sits on the tax line.
 *
 * @when    One gross amount has to be split at a known rate.
 * @instead Deciding whether a line gets tax assistance at all → deriveTax.
 */
export function splitGross(grossAmount: number, ratePercent: number): { net: number; tax: number } {
  const grossCents = Math.round(grossAmount * 100);
  const netCents = Math.round(grossCents / (1 + ratePercent / 100));
  return { net: netCents / 100, tax: (grossCents - netCents) / 100 };
}

/**
 * The derived input-tax line of an editor line — `null` when the line gets no
 * assistance (no 8/9 key, unknown chart, empty amount, or itself a tax account).
 *
 * @when    A line was entered and the editor asks whether it needs a tax line.
 * @instead Splitting a known gross at a known rate → splitGross.
 */
export function deriveTax(
  line: { accountNumber: string; taxKey: string | null; amount: number },
  accountFramework: string | null | undefined,
): DerivedTax | null {
  if (!line.taxKey || !EDITOR_ASSIST_KEYS.has(line.taxKey)) return null;
  if (STANDARD_TAX_ACCOUNT_NUMBERS.has(line.accountNumber)) return null;
  if (!(line.amount > 0)) return null;
  const account = taxAccountFor(accountFramework ?? null, line.taxKey);
  const rate = vatRateForTaxKey(line.taxKey);
  if (!account || rate == null || rate <= 0) return null;
  const { net, tax } = splitGross(line.amount, rate);
  if (tax <= 0) return null;
  return { account, ratePercent: rate, net, tax };
}

export interface CollapsibleLine {
  side: BookingSide;
  accountNumber: string;
  amount: number;
  taxKey: string | null;
  taxRatePercent?: number | null;
}

/**
 * Folds explicit net + tax pairs back into gross, for opening stored entries.
 * A pair is a tax-account line plus a base line on the same side with matching
 * key and rate × net ±1 cent. Unmatched tax lines stay as normal lines —
 * nothing is lost.
 *
 * @when    Reading a stored entry back into the editor's assisted form.
 * @instead Writing it out again → expandWithTaxLines.
 */
export function collapseTaxPairs<L extends CollapsibleLine>(
  lines: L[],
  accountFramework: string | null | undefined,
): L[] {
  if (!accountFramework) return lines;
  const out: (L | null)[] = [...lines];
  for (let ti = 0; ti < lines.length; ti += 1) {
    const taxLine = lines[ti]!;
    if (!STANDARD_TAX_ACCOUNT_NUMBERS.has(taxLine.accountNumber)) continue;
    const taxCents = Math.round(taxLine.amount * 100);
    for (let bi = 0; bi < lines.length; bi += 1) {
      if (bi === ti || out[bi] == null || out[ti] == null) continue;
      const base = out[bi]!;
      if (STANDARD_TAX_ACCOUNT_NUMBERS.has(base.accountNumber)) continue;
      if (base.side !== taxLine.side) continue;
      if (!base.taxKey || !EDITOR_ASSIST_KEYS.has(base.taxKey)) continue;
      const rate = vatRateForTaxKey(base.taxKey);
      const expectedAccount = taxAccountFor(accountFramework, base.taxKey);
      if (rate == null || rate <= 0) continue;
      if (!expectedAccount || expectedAccount.accountNumber !== taxLine.accountNumber) continue;
      const expectedTax = Math.round((Math.round(base.amount * 100) * rate) / 100);
      if (Math.abs(taxCents - expectedTax) > 1) continue;
      // Pair found: the base line becomes gross, the tax line disappears.
      out[bi] = { ...base, amount: (Math.round(base.amount * 100) + taxCents) / 100 };
      out[ti] = null;
      break;
    }
  }
  return out.filter((l): l is L => l != null);
}

export interface ExpandableLine {
  side: BookingSide;
  accountNumber: string;
  accountName: string;
  /** Gross, when the line gets a derived tax line. */
  amount: number;
  taxKey: string | null;
  taxRatePercent: number | null;
  lineText: string;
  externalDocumentNumber: string;
  externalDocumentNumber2: string;
  costCenter1: string;
  kost2: string;
}

export type ExpandedLine = ExpandableLine & { taxForLineNo: number | null };

/**
 * Editor lines (gross) → explicit lines for saving: per assisted line a net
 * base line plus a linked tax line (`taxForLineNo` = 1-based position of the
 * base line in the result).
 *
 * @when    Writing the editor's assisted lines back out as real entry lines.
 * @instead Reading them in → collapseTaxPairs.
 */
export function expandWithTaxLines(
  lines: ExpandableLine[],
  accountFramework: string | null | undefined,
): ExpandedLine[] {
  const out: ExpandedLine[] = [];
  for (const l of lines) {
    const derived = deriveTax(l, accountFramework);
    if (!derived) {
      out.push({ ...l, taxForLineNo: null });
      continue;
    }
    const baseLineNo = out.length + 1;
    out.push({ ...l, amount: derived.net, taxRatePercent: derived.ratePercent, taxForLineNo: null });
    out.push({
      side: l.side,
      accountNumber: derived.account.accountNumber,
      accountName: derived.account.accountName,
      amount: derived.tax,
      taxKey: l.taxKey,
      taxRatePercent: derived.ratePercent,
      lineText: `${derived.ratePercent}% ${derived.account.accountName}`,
      externalDocumentNumber: l.externalDocumentNumber,
      externalDocumentNumber2: l.externalDocumentNumber2,
      costCenter1: l.costCenter1,
      kost2: l.kost2,
      taxForLineNo: baseLineNo,
    });
  }
  return out;
}
