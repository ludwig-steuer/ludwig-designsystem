import { formatAmount } from "../../format";
import { parseAmount } from "../../primitives/AmountInput";
import { deriveTax } from "./tax-assist";

/**
 * What the reading grid and the editor share — the data, not the markup.
 *
 * A field differs from a value in every cell, so the two do not share a
 * component (0113). They **do** share the DATEV batch order and the column
 * widths: two pictures of one entry is exactly what this family already had
 * once, and the one nobody maintained was the reading half.
 */

export type Side = "S" | "H";
export type JournalMode = "einfach" | "voll";
export type JournalStatus = "proposed" | "accepted" | "posted" | "reversed";

/** One line of an entry, as it is read. The editor's row adds what it edits. */
export interface JournalRow {
  id: string;
  datum: string;
  currency?: string;
  /** Gross, German format („1.475,60"). */
  umsatz: string;
  side: Side;
  /** DATEV tax key („9", „8", „94", …) or empty. */
  bu: string;
  konto: string;
  kontoName: string;
  beleg1: string;
  beleg2?: string;
  text: string;
  kost1?: string;
}

/** The account that balances the entry — it stands above the rows, not in them. */
export interface ContraAccount {
  konto: string;
  name: string;
  tag?: string;
}

const euro = (n: number) => formatAmount(n, "EUR");

/**
 * A German amount string as a number. Empty and unparsable both become 0 —
 * the grid shows what is there, it does not judge.
 *
 * @when    Reading an amount out of a row.
 * @instead Formatting one → formatAmount.
 */
export function rowAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  const parsed = parseAmount(String(value ?? "").replace("€", ""));
  return typeof parsed === "number" ? parsed : 0;
}

/** The sum of the rows on the document's own side. */
export function documentSideTotal(rows: readonly JournalRow[], side: Side): number {
  return rows.filter((r) => r.side === side).reduce((sum, r) => sum + rowAmount(r.umsatz), 0);
}

/**
 * One line of the DATEV batch — **not** the same as `JournalLine` in
 * `JournalEntryCompact`, which is what the card draws. This one is what gets
 * saved; the card's is what gets shown.
 */
export interface JournalBatchLine {
  konto: string;
  name: string;
  text: string;
  side: Side;
  amount: number;
}

/**
 * The entry in **DATEV batch order** — account · account name · posting text ·
 * debit · credit. One row can become two lines: where a tax key splits the
 * gross amount, the tax line follows its own row and carries **its** text,
 * because in the batch the same text would stand there.
 *
 * The contra account comes last: it stands separately in the interface but
 * belongs in the sum, or „Σ S ≠ Σ H" reports an error that does not exist.
 *
 * @when    Showing or saving the lines of an entry — grid, card, editor.
 * @instead One row's own amount → rowAmount.
 */
export function journalLines(
  rows: readonly JournalRow[],
  contraAccount: ContraAccount | null,
  documentSide: Side,
  accountFramework?: string | null,
): JournalBatchLine[] {
  const lines: JournalBatchLine[] = [];
  for (const r of rows) {
    const gross = rowAmount(r.umsatz);
    const tax = deriveTax(
      { accountNumber: r.konto, taxKey: r.bu || null, amount: gross },
      accountFramework,
    );
    if (!tax) {
      lines.push({ konto: r.konto, name: r.kontoName, text: r.text, side: r.side, amount: gross });
      continue;
    }
    lines.push({ konto: r.konto, name: r.kontoName, text: r.text, side: r.side, amount: tax.net });
    lines.push({
      konto: tax.account.accountNumber,
      name: tax.account.accountName,
      text: r.text,
      side: r.side,
      amount: tax.tax,
    });
  }

  if (contraAccount?.konto) {
    const total = documentSideTotal(rows, documentSide);
    if (total !== 0) {
      lines.push({
        konto: contraAccount.konto,
        name: contraAccount.name,
        // The contra account has no text of its own — it takes the one of the
        // first line, the way the batch would.
        text: rows[0]?.text ?? "",
        side: documentSide === "S" ? "H" : "S",
        amount: total,
      });
    }
  }
  return lines;
}

/** Debit and credit of the whole entry, for the head of the journal. */
export function journalTotals(lines: readonly JournalBatchLine[]): { soll: number; haben: number } {
  return {
    soll: lines.filter((l) => l.side === "S").reduce((s, l) => s + l.amount, 0),
    haben: lines.filter((l) => l.side === "H").reduce((s, l) => s + l.amount, 0),
  };
}

/** „Σ S 1.475,60 € = Σ H 1.475,60 €" — the sentence the head carries. */
export function journalBalanceText(lines: readonly JournalBatchLine[]): string {
  const { soll, haben } = journalTotals(lines);
  return `Σ S ${euro(soll)} ${Math.abs(soll - haben) < 0.005 ? "=" : "≠"} Σ H ${euro(haben)}`;
}

/**
 * The column tracks of the reading grid, in both modes.
 *
 * They are **not** the editor's: a field needs room for its own frame, a value
 * does not, and the reading grid has no action column at all. What the two
 * share is the **order** of the columns — that is what makes the two pictures
 * one entry.
 */
export const journalGridTracks: Record<JournalMode, string> = {
  einfach: "88px 104px 40px 62px 148px minmax(0, 1fr) 96px",
  voll: "88px 56px 104px 40px 62px 148px 96px 96px minmax(0, 1fr) 80px",
};
