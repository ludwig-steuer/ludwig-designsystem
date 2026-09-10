import type { Currency } from "@/ludwig/shared/money";

import { formatAmount } from "../../format";
import { AmountCell } from "../../primitives/Cells";
import { Badge } from "../../primitives/Badge";
import { AccountCell } from "../account/Account";

/**
 * Cell and card of a journal entry (0044) — the reading forms of the family,
 * without the editor.
 *
 * `JournalEntryEditor` covers the full view (`editable={false}`) and brings
 * a status head, a message block, the remainder against the document, the tax
 * assistant and the AI notes. At an event, on a creditor card or in a preview
 * of a recurring entry the clerk reads none of that — she wants to know
 * **what is being booked**. That is what stands here: the same lines, the same
 * column order of the DATEV batch, five blocks fewer.
 *
 * Neither export calculates (no tax derivation, no consolidation of the
 * contra account) and neither validates. The caller hands in the lines that
 * would be saved.
 */

/**
 * One line of the entry. Structural subset of the app's `BookingLineVM` —
 * a `BookingLineVM[]` fits in without mapping.
 */
export interface JournalLine {
  side: "debit" | "credit";
  accountNumber: string;
  accountName?: string | null;
  amount: number;
  /** Posting text of the line — column 3 of the batch. */
  text?: string | null;
  /** DATEV tax key (BU) of the line, e.g. „9" — `BookingLineVM.taxKey`. */
  taxKey?: string | null;
  /** Tax rate in percent where one was read — `BookingLineVM.taxRatePercent`. */
  taxRatePercent?: number | null;
  /**
   * The **fixed rate of an automatic account**, where this account is one
   * (`client_ledger_accounts.datev_tax_rate`).
   *
   * On such an account the account itself determines the tax, not a key. The
   * caller resolves it — the component knows no chart of accounts (E2), and
   * the app has the map already (`loadAutomaticAccountsByExec`).
   *
   * **The pair `taxKey` + `automaticRate` is the error the guard reports**
   * (`findTaxKeysOnAutomaticAccounts`): a key sent on an automatic account is
   * removed by the export or the batch is rejected — either way Ludwig then
   * says something different from DATEV. The card shows both, so the conflict
   * is visible where it happens.
   */
  automaticRate?: number | null;
}

/** From here on an entry counts as unbalanced — half a cent is rounding. */
const BALANCE_EPSILON = 0.005;

function sum(lines: readonly JournalLine[]): number {
  return lines.reduce((total, line) => total + line.amount, 0);
}

/**
 * Number and name of an account — **`AccountCell` from the account family**.
 *
 * This file carried its own copy until 2026-09-10: mono number, muted name,
 * cut at 40 characters. That is exactly what `AccountCell` does, and its
 * `@when` names this very place („a booking line, a contra account"). Two
 * copies means one of them stops being fixed, and this one had already lost
 * the way to the account drawer.
 *
 * With `accountHref` the number becomes a way — with the account icon in
 * front of it, so the reader sees there is somewhere to go without reading
 * the number first (owner, 2026-09-10).
 */
function AccountRef({
  line,
  showName,
  accountHref,
}: {
  line: JournalLine;
  showName: boolean;
  accountHref?: (accountNumber: string) => string;
}) {
  return (
    <AccountCell
      number={line.accountNumber}
      {...(showName ? { name: line.accountName ?? null } : {})}
      {...(accountHref ? { href: accountHref(line.accountNumber) } : {})}
    />
  );
}

/**
 * The tax part of a line: the DATEV key, and whether the account decides the
 * tax by itself.
 *
 * **Both together is the error, not the rule.** On an automatic account the
 * account's own rate applies; a key sent along is silently removed by the
 * export or rejects the batch — either way Ludwig then says something other
 * than DATEV (`core/datev/automatic-account.ts`). The card therefore shows
 * both side by side where both are set: the conflict belongs on the line where
 * it happens, not only in a guard message above it.
 */
function TaxCell({ line }: { line: JournalLine }) {
  const key = line.taxKey?.trim();
  return (
    <span className="v2je__bu">
      {key ? <span className="v2mono">{key}</span> : null}
      {line.automaticRate !== null && line.automaticRate !== undefined ? (
        <Badge tone={key ? "warning" : "neutral"}>
          {`Automatik ${line.automaticRate} %`}
        </Badge>
      ) : null}
    </span>
  );
}

/**
 * @when    A booking entry named inside a foreign list or a sentence — debit, credit, amount, one line.
 * @instead All lines of the entry → JournalEntryCard. Editing or the full read-only view → JournalEntryEditor.
 */
export function JournalEntryCell({
  lines,
  currency,
  showNames = true,
  accountHref,
}: {
  /** The lines of the entry, exactly as they would be stored. */
  lines: readonly JournalLine[];
  currency: Currency;
  /** Account name next to the number; `false` = numbers only, for narrow columns. */
  showNames?: boolean;
  /**
   * The way to the account **drawer**, per account number (0155).
   *
   * Not to the account page: whoever meets a number inside a booking line has
   * a question, not a destination. The drawer answers it beside the work; the
   * page takes the work away (owner, 2026-09-10). A search param, not a
   * context — the drawer is a URL (L3). Without it the numbers stay text: a
   * cell that looks clickable and goes nowhere is worse than one that does
   * not (V14).
   */
  accountHref?: (accountNumber: string) => string;
}) {
  // Empty renders the em dash like `AmountCell` does — the cell stands in
  // foreign markup and must not bring a box or a message of its own.
  if (lines.length === 0) return <span className="v2muted">—</span>;

  const debits = lines.filter((l) => l.side === "debit");
  const credits = lines.filter((l) => l.side === "credit");
  // The debit side carries the amount. A one-sided entry has none, and „0,00 €"
  // would be a statement — then the credit side stands in.
  const total = sum(debits) || sum(credits);

  const single = (side: readonly JournalLine[]) => (side.length === 1 ? side[0] : null);
  const debit = single(debits);
  const credit = single(credits);

  let body;
  if (debit && credit) {
    body = (
      <>
        <AccountRef line={debit} showName={showNames} accountHref={accountHref} /> an{" "}
        <AccountRef line={credit} showName={showNames} accountHref={accountHref} />
      </>
    );
  } else if (debit && credits.length > 1) {
    body = (
      <>
        <AccountRef line={debit} showName={showNames} accountHref={accountHref} /> an {credits.length} Konten
      </>
    );
  } else if (credit && debits.length > 1) {
    body = (
      <>
        {debits.length} Konten an <AccountRef line={credit} showName={showNames} accountHref={accountHref} />
      </>
    );
  } else {
    // Split on both sides, or one side missing entirely — counting is the only
    // honest summary left.
    body = <>{lines.length} Zeilen</>;
  }

  return (
    <span className="v2je__cell">
      {body} <span className="v2muted">·</span>{" "}
      <AmountCell value={total} currency={currency} />
    </span>
  );
}

/**
 * @when    What gets booked, shown next to another entity — event stack, creditor card, recurring rule preview.
 * @instead One line inside a foreign row → JournalEntryCell. Editing, messages, tax assistance → JournalEntryEditor.
 */
export function JournalEntryCard({
  lines,
  currency,
  caption,
  totals = true,
  accountHref,
}: {
  lines: readonly JournalLine[];
  currency: Currency;
  /** Heading above the lines — posting text or „Buchungsvorschlag". */
  caption?: string;
  /**
   * The way to the account **drawer**, per account number (0155) — same as in
   * the cell. Here it matters more: every line names its own account, and the
   * reader who wonders „what else sits on 6815?" is one click away, without
   * leaving the entry they are checking.
   */
  accountHref?: (accountNumber: string) => string;
  /** Σ debit / Σ credit below the lines; `false` when the caller already carries the sum. */
  totals?: boolean;
}) {
  const debit = sum(lines.filter((l) => l.side === "debit"));
  const credit = sum(lines.filter((l) => l.side === "credit"));
  const balanced = Math.abs(debit - credit) < BALANCE_EPSILON;
  // The column only appears when a line has something in it.
  const withTaxKey = lines.some((l) => l.taxKey || l.automaticRate !== null);

  return (
    <div className={withTaxKey ? "v2je v2je--bu" : "v2je"}>
      {caption ? <div className="v2je__caption">{caption}</div> : null}
      {lines.length === 0 ? (
        // An excerpt, not a screen — no EmptyState with a button.
        <div className="v2muted v2je__empty">Keine Buchungszeilen.</div>
      ) : (
        <div className="v2je__body">
          <div className="v2je__row v2je__row--head">
            <span className="v2num">Konto</span>
            <span>Kontoname</span>
            {/* „BU" is DATEV's word for the tax key; the column stands
                before the text, as it does in the batch. It only appears when
                a line has something in it — an empty column in every entry
                would be a column that never says anything. */}
            {withTaxKey ? <span>BU</span> : null}
            <span>Buchungstext</span>
            <span className="v2num">Soll Umsatz</span>
            <span className="v2num">Haben Umsatz</span>
          </div>
          {lines.map((line, i) => (
            <div className="v2je__row" key={i}>
              {/* The number keeps its right-aligned column — the mark comes
                  before it, inside the same cell, and does not shift the
                  figures. */}
              <span className="v2num">
                {accountHref ? (
                  <AccountCell number={line.accountNumber} href={accountHref(line.accountNumber)} />
                ) : (
                  line.accountNumber
                )}
              </span>
              <span className="v2muted v2je__clip" title={line.accountName ?? undefined}>
                {line.accountName ?? ""}
              </span>
              {withTaxKey ? <TaxCell line={line} /> : null}
              <span className="v2je__clip" title={line.text ?? undefined}>
                {line.text ?? ""}
              </span>
              <span className="v2num">
                {line.side === "debit" ? formatAmount(line.amount, currency) : ""}
              </span>
              <span className="v2num">
                {line.side === "credit" ? formatAmount(line.amount, currency) : ""}
              </span>
            </div>
          ))}
          {totals ? (
            <div className="v2je__row v2je__row--sum">
              <span />
              <span />
              {withTaxKey ? <span /> : null}
              {/* The only finding the card makes: it adds up what is there. */}
              <span>Σ Soll {balanced ? "=" : "≠"} Σ Haben</span>
              <span className="v2num">{formatAmount(debit, currency)}</span>
              <span className="v2num">{formatAmount(credit, currency)}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
