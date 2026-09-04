import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import { Amount } from "../../primitives/Amount";
import { MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";

/**
 * Cell and facts of a ledger account (0066) — two steps of the same thing.
 *
 * The cell names an account inside foreign markup, the facts answer „what
 * kind of account is this?" in seven rows. The order of those rows is decided
 * **here, once**, so that the drawer (0068) and the full view (0063) cannot
 * drift apart — the same reason `SourceDocumentFacts` exists.
 *
 * Both are server components: the way to the account sheet is an `href` over
 * a search param (L3), not a context. The app resolves it through
 * `AccountDrawerProvider` today; that becomes a URL on the way over.
 */

/**
 * Longer names are cut with an ellipsis. 40 because the p90 of all 41.570
 * account names on staging is 39 characters and the maximum is 50 — cutting
 * at 40 leaves nine names in ten untouched.
 */
const NAME_LIMIT = 40;

/** The sync state every account has and nobody needs to read. */
const SYNC_SILENT = "synced";

function clip(text: string): { shown: string; title?: string } {
  if (text.length <= NAME_LIMIT) return { shown: text };
  return { shown: `${text.slice(0, NAME_LIMIT - 1)}…`, title: text };
}

/**
 * @when    Naming an account inside foreign markup — a booking line, a contra account, running text; with `href` it leads to the account sheet.
 * @instead Choosing an account from candidates → AccountField. What kind of account it is → AccountFacts. The account next to a list → AccountDrawer.
 */
export function AccountCell({
  number,
  name,
  href,
}: {
  /**
   * The logical DATEV number, exactly as stored — leading zeros stay, never
   * cast to a number (GLOSSARY „Account number canon": storing = showing).
   */
  number: string;
  /** `null` shows the number alone — no placeholder, no em dash. */
  name?: string | null;
  /** The way to the account sheet. Without it the cell is plain text — never a button that does nothing. */
  href?: string;
}) {
  const cut = name ? clip(name) : null;
  const body = (
    <>
      <MonoCell value={number} />
      {cut ? (
        <span className="v2muted" title={cut.title}>
          {" "}
          {cut.shown}
        </span>
      ) : null}
    </>
  );

  if (!href) return <span className="v2acc">{body}</span>;
  return (
    <Link href={href} className="v2acc v2acc--link" title="Kontenblatt öffnen">
      {body}
    </Link>
  );
}

/**
 * The facts of one account in one fiscal year.
 *
 * Structurally `client_ledger_accounts` plus two aggregates of its movements.
 * A canonical view model for this does not exist in `src/ludwig/` — the app
 * assembles it twice, in the drawer and on the account page (finding for
 * `ludwig/app`, see 0066).
 */
export interface AccountFactsVM {
  accountNumber: string;
  accountName: string | null;
  /** `client_ledger_accounts.accounting_role` — axis `konto_typ`. */
  role: string;
  /** The year whose chart of accounts this row is (GLOSSARY F64). */
  fiscalYear: number;
  currency: Currency;
  /** Σ debit − Σ credit of the **mirror** entries. `null` = never reconciled. */
  datevBalance: number | null;
  datevCount: number;
  /** Ludwig entries without `datev_mirror_entry_id` — count and sum. */
  ludwigOnlyCount: number;
  ludwigOnlyAmount: number | null;
  /** Personal account: the business partner behind it (52 % of all accounts). */
  partnerName?: string | null;
  /** `client_ledger_accounts.last_booking_date` — filled on 15 %. */
  lastBookingDate?: string | null;
  /**
   * Axis `konto_datev_sync`. Only shown when it is **not** `synced`: 41.555
   * of 41.570 accounts on staging are, so the normal case stays quiet.
   */
  syncState?: string | null;
}

/**
 * The block carries **no header of its own**: wherever it stands, something
 * already names the account — the drawer title, the anchor of the HoverCard,
 * the page header of the view. Repeating number and name below them was the
 * one thing that looked wrong in the first browser pass.
 *
 * @when    What kind of account this is, read-only — in its drawer, in its view, as the content of a HoverCard over an AccountCell.
 * @instead Just naming the account → AccountCell. Its movements → AccountEntryList. Chart of accounts, tax automation, monthly figures → AccountView.
 */
export function AccountFacts({ facts }: { facts: AccountFactsVM }) {
  const rows: [ReactNode, ReactNode][] = [
    ["Kontoart", <StatusBadge key="role" axis="konto_typ" status={facts.role} info={false} />],
    [
      // The year rides on the label of the number it belongs to. Without it a
      // balance in a HoverCard says nothing about *which* year it is — and a
      // chart of accounts exists only per fiscal year (GLOSSARY F64). A row of
      // its own would repeat what the drawer's year switch already says.
      `Saldo in DATEV ${facts.fiscalYear}`,
      <Amount key="bal" value={facts.datevBalance} currency={facts.currency} />,
    ],
  ];

  // Two rows disappear instead of standing empty: both are findings, and
  // their absence is the good news. „Letzte Buchung" is the counter-example
  // — that it is unknown is something the reader wants to see.
  if (facts.ludwigOnlyCount > 0) {
    rows.push([
      `+ ${facts.ludwigOnlyCount} nur in Ludwig`,
      <Amount key="lud" value={facts.ludwigOnlyAmount ?? null} currency={facts.currency} />,
    ]);
  }

  rows.push([
    "Bewegungen",
    <span key="cnt">
      {facts.datevCount.toLocaleString("de-DE")} in DATEV
      {facts.ludwigOnlyCount > 0 ? `, ${facts.ludwigOnlyCount} nur in Ludwig` : ""}
    </span>,
  ]);

  if (facts.partnerName) rows.push(["Geschäftspartner", facts.partnerName]);

  rows.push([
    "Letzte Buchung",
    <Time key="last" value={facts.lastBookingDate ?? null} format="date" />,
  ]);

  if (facts.syncState && facts.syncState !== SYNC_SILENT) {
    rows.push([
      "DATEV-Abgleich",
      <StatusBadge key="sync" axis="konto_datev_sync" status={facts.syncState} />,
    ]);
  }

  return (
    <div className="v2acc__facts">
      <FieldList tone="bare" rows={rows} />
    </div>
  );
}
