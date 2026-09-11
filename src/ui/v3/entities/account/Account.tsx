import type { ReactNode } from "react";

import type { AccountFactsVM as MirrorAccountFacts } from "@/ludwig/modules/accounts/domain/account-entry";
import type { Currency } from "@/ludwig/shared/money";

import { formatCount } from "../../format";

import { Amount } from "../../primitives/Amount";
import { EntityIcon } from "../../Icons";
import { MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import { BusinessPartnerCell } from "../business-partner/BusinessPartner";

/**
 * Cell and facts of a ledger account (0066) — two steps of the same thing.
 *
 * The cell names an account inside foreign markup, the facts answer „what
 * kind of account is this?" in seven rows. The order of those rows is decided
 * **here, once**, so that the drawer (0068) and the full view (0063) cannot
 * drift apart — the same reason `SourceDocumentFacts` exists.
 *
 * Both are server components: the way to the account is an `href` over a
 * search param (L3), not a context — and it leads to the **drawer**, not to
 * the account page. The app resolves it through `AccountDrawerProvider` today;
 * that becomes a URL on the way over.
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
 * @when    Naming an account inside foreign markup — a booking line, a contra account, running text; with `href` it opens the account **drawer**.
 * @instead Choosing an account from candidates → AccountField. What kind of account it is → AccountFacts. Everything about the account with its monthly figures → LedgerAccountView, and the drawer offers the way there in its foot (A10).
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
  /**
   * The way to the account — **the drawer, not the account page** (owner,
   * 2026-09-10).
   *
   * Whoever meets an account number inside a booking line has a question, not
   * a destination: „what sits on 6815?". The drawer answers it beside the
   * work; the account page takes the work away and makes coming back a
   * decision. Whoever really wants the whole sheet finds it in the drawer's
   * foot (A10) — one click more for the rarer case, none for the common one.
   *
   * Technically that is a **search param**, not a path: the drawer is a URL
   * (L3), so `?account=6815`, not `/accounts/6815`. The caller builds it; this
   * component only knows that there is a way. Without one the cell is plain
   * text — never a button that does nothing (V14).
   */
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
    <Link href={href} className="v2acc v2acc--link" title="Konto aufschlagen">
      {/* The mark stands **only where there is a way**, never on plain text:
          it says „the account sheet is over here", and where nothing is over
          there it promises nothing (V14). The word beside it is the number
          itself — an icon without a word is a riddle (V11), a number is not.
          Owner, 2026-09-10: he wants to open the account from a booking line
          without reading the number and searching for it. */}
      <EntityIcon entity="ledger-account" size={12} />
      {body}
    </Link>
  );
}

/**
 * The facts of one account in one fiscal year — **from the mirror**.
 *
 * The app assembled this twice, in the drawer and on the account page; since
 * 2026-09-07 it does it once, in `accounts/domain/account-entry.ts`
 * (`eaf73d45`, findings L-94 and L-95), and `accountFacts()` sums Σ debit and
 * Σ credit out of the monthly figures. What this interface adds are three
 * fields the record does not carry — and one it carries differently.
 */
export interface AccountFactsVM extends MirrorAccountFacts {
  /** The mirror types it as `string`; every amount here needs the real one. */
  currency: Currency;
  /**
   * Ludwig entries **without** `datev_mirror_entry_id` — the count that goes
   * with `ludwigOnlyAmount`. The record has the sum and not the count
   * (`ludwigEntryCount` is all Ludwig entries of the year, which is a
   * different number): finding **L-209**. Swapping one for the other would
   * turn „+ 3 nur in Ludwig" into a larger, wrong figure.
   */
  ludwigOnlyCount: number;
  /**
   * The place in the chart of accounts (rank 9, filled 100 %). Optional: the
   * drawer answers „which account", the page answers „what is it for". The
   * label comes from `ACCOUNT_CLASS_LABEL`, never from a second map here.
   */
  skrClassLabel?: string | null;
  /** Personal account: the business partner behind it (52 % of all accounts). */
  partnerName?: string | null;
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
export function AccountFacts({
  facts,
  figures = true,
}: {
  facts: AccountFactsVM;
  /**
   * `false` = the master-data set: no balance, delta, movement count or last
   * booking. For the side column of the account page, where tiles above
   * already carry those numbers — the same figure twice is D7 (0157, B4).
   */
  figures?: boolean;
}) {
  const rows: [ReactNode, ReactNode][] = [
    [
      "Kontoart",
      // `accountingRole` is nullable in the record: an account without a role
      // in the chart shows the axis' own word for „unknown", not an empty cell.
      <StatusBadge key="role" axis="ledger_account_type" status={facts.accountingRole ?? ""} info={false} />,
    ],
  ];

  if (figures) {
    rows.push([
      // The year rides on the label of the number it belongs to. Without it a
      // balance in a HoverCard says nothing about *which* year it is — and a
      // chart of accounts exists only per fiscal year (GLOSSARY F64). A row of
      // its own would repeat what the drawer's year switch already says.
      `Saldo in DATEV ${facts.fiscalYear}`,
      <Amount key="bal" value={facts.datevBalance} currency={facts.currency} />,
    ]);
  }

  // Two rows disappear instead of standing empty: both are findings, and
  // their absence is the good news. „Letzte Buchung" is the counter-example
  // — that it is unknown is something the reader wants to see.
  if (figures && facts.ludwigOnlyCount > 0) {
    rows.push([
      `+ ${facts.ludwigOnlyCount} nur in Ludwig`,
      <Amount key="lud" value={facts.ludwigOnlyAmount ?? null} currency={facts.currency} />,
    ]);
  }

  // Σ debit / Σ credit stand **together** in one row: they are a pair, and
  // apart the column invites reading one without the other. Both are required
  // in the mirror and become `0` when the caller has no monthly figures (the
  // drawer loads none). Showing two zeros would claim „nothing booked" where
  // „not loaded" is meant — so the row stands only once one of the sums
  // carries something.
  if (facts.totalDebit !== 0 || facts.totalCredit !== 0) {
    rows.push([
      "Σ Soll / Σ Haben",
      <span key="sums">
        <Amount value={facts.totalDebit} currency={facts.currency} size="sm" />
        {" / "}
        <Amount value={facts.totalCredit} currency={facts.currency} size="sm" />
      </span>,
    ]);
  }

  if (facts.skrClassLabel) rows.push(["SKR-Klasse", facts.skrClassLabel]);

  if (figures) rows.push([
    "Bewegungen",
    <span key="cnt">
      {formatCount(facts.datevEntryCount)} in DATEV
      {facts.ludwigOnlyCount > 0 ? `, ${facts.ludwigOnlyCount} nur in Ludwig` : ""}
    </span>,
  ]);

  if (facts.partnerName) {
    // The cell (0139), so the name is written the same way here as in the
    // chart of accounts and in the case facts. No `href`: the account sheet
    // does not know the partner's id.
    rows.push([
      "Geschäftspartner",
      <BusinessPartnerCell key="bp" name={facts.partnerName} />,
    ]);
  }

  if (figures) rows.push([
    "Letzte Buchung",
    <Time key="last" value={facts.lastBookingDate ?? null} format="date" />,
  ]);

  if (facts.syncState && facts.syncState !== SYNC_SILENT) {
    rows.push([
      "DATEV-Abgleich",
      <StatusBadge key="sync" axis="ledger_account_datev_sync" status={facts.syncState} />,
    ]);
  }

  return (
    <div className="v2acc__facts">
      <FieldList tone="bare" rows={rows} />
    </div>
  );
}
