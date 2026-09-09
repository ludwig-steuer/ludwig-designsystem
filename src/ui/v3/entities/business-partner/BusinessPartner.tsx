import { MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";

/**
 * The business partner in foreign markup (0139).
 *
 * The partner is the FK target of case, account, invoice, journal entry and
 * expectation. In three v3 places his name is written out by hand today, each
 * with its own cut and its own link callback — this is that job, once.
 *
 * **What it deliberately cannot take is a counterparty string.** The profile
 * counted six places; three of them name no partner at all: `case-columns`
 * and `CaseCard` show `counterpartyName` and `CaseListItem` carries no partner
 * id (L-69), `source-document-columns` shows `partnerLegalName ?? vendorName`,
 * and `BankTransactionCell` shows the counterparty **of the bank statement**,
 * whose table has no `business_partner_id`. A name without a partner id is not
 * a partner, and a cell that draws it as one promises a way that does not
 * exist.
 */

/**
 * Where the name is cut. 36 because that is `MAX_COUNTERPARTY` in
 * `SourceDocument.tsx`, which cuts the same kind of name in the same kind of
 * row — and it covers the p90 of `legalName` (21 characters) with room to
 * spare. The maximum in stock is 50.
 */
const NAME_LIMIT = 36;

function clip(text: string, max: number): { shown: string; title?: string } {
  if (text.length <= max) return { shown: text };
  return { shown: `${text.slice(0, max - 1).trimEnd()}…`, title: text };
}

/**
 * Does the short name say anything the name does not?
 *
 * Not only when they are equal: the DATEV short name is capped at 15
 * characters and **53 % sit exactly at that cap**, so most of them are the
 * name with its tail cut off. Repeating that helps nobody.
 */
function saysSomethingNew(name: string, shortName: string | null): shortName is string {
  if (!shortName) return false;
  const a = shortName.trim().toLowerCase();
  const b = name.trim().toLowerCase();
  return a !== b && !b.startsWith(a);
}

/**
 * @when    Naming a business partner inside foreign markup — a facts row, a table cell, running text; with `href` the name leads to him.
 * @instead Choosing one out of many → BusinessPartnerPicker. Everything about him → BusinessPartnerFacts. Him beside other work → BusinessPartnerDrawer.
 */
export function BusinessPartnerCell({
  name,
  shortName = null,
  href,
  account = null,
  limit = NAME_LIMIT,
}: {
  /**
   * Rank 1 — `legalName`, never `shortName` (owner decision 2026-09-09).
   * The short name is the same name cut at the DATEV cap; preferring it means
   * preferring the truncated one.
   */
  name: string;
  /** Rank 7 — stands behind the name where it differs from it. */
  shortName?: string | null;
  /** The way to the partner. A search param, not a context (L3). */
  href?: string;
  /**
   * Rank 2 — the personal account number.
   *
   * **The role comes in with the prop, not out of the record**:
   * `PartnerAccountRef` carries only `accountNumber` and `isInternal`; which
   * role it is, the caller knows from the key it read it under
   * (`creditorAccount` against `debtorAccount`).
   */
  account?: { number: string; role: "creditor" | "debtor" } | null;
  /** Where the name is cut. */
  limit?: number;
}) {
  const { shown, title } = clip(name, limit);
  // The anchor wraps the **name**, not the whole cell: the account number has
  // its own way in the list, and two targets in one anchor is what I11 forbids.
  const named = href ? (
    <Link href={href} className="v2bp__name" title={title}>
      {shown}
    </Link>
  ) : (
    <span className="v2bp__name" title={title}>
      {shown}
    </span>
  );

  return (
    <span className="v2bp">
      {named}
      {saysSomethingNew(name, shortName) ? (
        <span className="v2bp__short">{shortName}</span>
      ) : null}
      {account ? (
        <span
          className="v2bp__acc"
          title={account.role === "creditor" ? "Kreditorkonto" : "Debitorkonto"}
        >
          <MonoCell value={account.number} tone="muted" />
        </span>
      ) : null}
    </span>
  );
}
