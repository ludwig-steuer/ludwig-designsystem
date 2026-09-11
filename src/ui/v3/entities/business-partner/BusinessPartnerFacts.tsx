import type { ReactNode } from "react";

import {
  PARTNER_NATURE_LABEL,
  PARTNER_VAT_PROFILE_LABEL,
  type BusinessPartnerDetail,
  type PartnerAccountRef,
} from "@/ludwig/modules/business-partners/domain/business-partner";

import { formatCount } from "../../format";
import { StatusBadge } from "../../patterns/StatusBadge";
import { MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";

/**
 * What is known about a business partner (0142) — the part the drawer (0143)
 * and the full view (0127) **share**.
 *
 * That is why the facts come before the drawer and not the other way round:
 * the rule says the drawer follows the view because it shows the view's core
 * facts out of the same component — this is that component.
 *
 * Today the same information stands as `MasterDataTab`, 21 fields in five
 * boxes. Five boxes for 21 fields of which most are empty: with this stock the
 * fill rate decides more than the grouping does, so **a field without a value
 * gets no row and a group without a field gets no heading**.
 */

type Rows = [ReactNode, ReactNode][];

function accountRow(account: PartnerAccountRef, accountHref?: (n: string) => string): ReactNode {
  const number = <MonoCell value={account.accountNumber} />;
  return accountHref ? <Link href={accountHref(account.accountNumber)}>{number}</Link> : number;
}

/**
 * @when    Everything that stands on the partner himself — in the drawer, in the full view, in a card beside a case.
 * @instead Naming him inside foreign markup → BusinessPartnerCell. Choosing one → BusinessPartnerPicker. His accounts, cases and bookings → BusinessPartnerDrawer.
 */
export function BusinessPartnerFacts({
  partner,
  all = false,
  underHead = false,
  accountHref,
  hints,
}: {
  /** The record from the mirror. This form calculates nothing. */
  partner: BusinessPartnerDetail;
  /**
   * Additionally „Verhalten" and „Herkunft". Off by default — the drawer shows
   * the short form, the view the whole.
   */
  all?: boolean;
  /**
   * The facts stand under the partner's own head — the overview of the full
   * view. The head already names him, his city and the account he is booked
   * under, so those rows drop (D7, owner 2026-09-11). The drawer has no such
   * head and shows everything.
   */
  underHead?: boolean;
  accountHref?: (accountNumber: string) => string;
  /** Sentences of the caller above the first group. */
  hints?: readonly string[];
}) {
  const wer: Rows = underHead ? [] : [["Name", partner.legalName]];
  // The short name only where it says something the name does not: it is
  // capped at 15 characters and 53 % sit exactly at the cap, so most of them
  // are the name with its tail cut off.
  if (
    partner.shortName &&
    !partner.legalName.toLowerCase().startsWith(partner.shortName.trim().toLowerCase())
  ) {
    wer.push(["Kurzname", partner.shortName]);
  }
  if (partner.city && !underHead) wer.push(["Ort", partner.city]);
  if (partner.ustIds.length > 0) {
    wer.push(["USt-IdNr.", <MonoCell key="ust" value={partner.ustIds.join(" · ")} />]);
  }

  // Under the head, the account the head names drops — in the head's order:
  // creditor, else debtor, else the clearing accounts.
  const headNames = {
    creditor: underHead && Boolean(partner.creditorAccount),
    debtor: underHead && !partner.creditorAccount && Boolean(partner.debtorAccount),
    clearing: underHead && !partner.creditorAccount && !partner.debtorAccount,
  };
  const accounts: Rows = [];
  if (partner.creditorAccount && !headNames.creditor) {
    accounts.push(["Kreditorkonto", accountRow(partner.creditorAccount, accountHref)]);
  }
  if (partner.debtorAccount && !headNames.debtor) {
    accounts.push(["Debitorkonto", accountRow(partner.debtorAccount, accountHref)]);
  }
  if (partner.clearingAccounts.length > 0 && !headNames.clearing) {
    accounts.push([
      partner.clearingAccounts.length === 1 ? "Verrechnungskonto" : "Verrechnungskonten",
      <span key="cl">
        {partner.clearingAccounts.map((a, i) => (
          <span key={a.accountNumber}>
            {i > 0 ? <span className="v2muted"> · </span> : null}
            {accountRow(a, accountHref)}
          </span>
        ))}
      </span>,
    ]);
  }

  // Zero is an answer, not a gap: 77 % of the stock has never been posted to,
  // and that is the most useful thing this group says.
  const activity: Rows = [
    ["Buchungen", <span key="n" className="v2num">{formatCount(partner.usageBookingCount)}</span>],
  ];
  if (partner.lastBookingDate) {
    activity.push(["Letzte Buchung", <Time key="lb" value={partner.lastBookingDate} format="date" />]);
  }

  const behaviour: Rows = [];
  if (all) {
    // **The VAT profile, with the words of the domain** (L-223, resolved
    // 2026-09-10). It waited for `PARTNER_VAT_PROFILE_LABEL`: the map lived
    // privately in `MasterDataTab.tsx`, and a local copy here would have been
    // the second vocabulary — the raw key claims a statement it does not make,
    // „domestic_reverse_charge" means nothing to an accountant.
    //
    // It stands **before** the typical delivery, because it is the stronger
    // answer to the same question: filled on only 11 % of the stock, but on
    // 75 % of the partners anybody books against (measurement of the app,
    // 2026-09-10). `unknown` is left out — a profile nobody determined is not
    // a profile, and an empty row would turn „not looked at" into „none".
    if (partner.vatProfile !== "unknown") {
      behaviour.push(["USt-Profil", PARTNER_VAT_PROFILE_LABEL[partner.vatProfile]]);
    }
    if (partner.typicalNature !== "unknown") {
      behaviour.push(["Typische Lieferung", PARTNER_NATURE_LABEL[partner.typicalNature]]);
    }
    if (partner.businessDescription) {
      behaviour.push(["Beschreibung", partner.businessDescription]);
    }
  }

  const origin: Rows = [];
  if (all) {
    // The maturity sits **here**, not at the top: it is `confirmed` for
    // 99.7 % of the stock, and a badge that almost always says the same thing
    // does not belong in the first place a reader looks. Where it is
    // `proposed` or `draft` it says something about the origin of the record,
    // not about the partner.
    origin.push([
      "Reifegrad",
      <StatusBadge key="ob" axis="business_partner" status={partner.onboardingState} />,
    ]);
    // **The origin stays out for the same reason as the VAT profile.** Its six
    // values are English keys (`onboarding_import`, `auto_profiled`, …) and no
    // German word exists for them — neither in the GLOSSARY entry „Creditor
    // source" nor in the domain. Writing the key on screen would be the same
    // mistake this file avoids two rows above, and being inconsistent about it
    // would be worse than either choice (finding L-272).
    const address = [partner.addressLine1, [partner.postalCode, partner.city].filter(Boolean).join(" ")]
      .filter((p) => p && p.length > 0)
      .join(", ");
    if (address) origin.push(["Anschrift", address]);
    // **Kontakt (rank 14) is missing** — `contactEmail` and `contactPhone` are
    // columns in the database (14 % / 39 % filled) and are **not** on the
    // mirrored `BusinessPartnerDetail`. Inventing them here is what §5 forbids;
    // the rows arrive when the type does (finding L-271).
  }

  return (
    <div className="v2bpfacts">
      {hints && hints.length > 0 ? (
        <div className="v2bpfacts__hints">
          {hints.map((h) => (
            <p key={h} className="v2muted">
              {h}
            </p>
          ))}
        </div>
      ) : null}
      {/*
        **The tombstone (rank 16) is missing too.** `mergedIntoPartnerId` is a
        self-FK in the database — the app filters over it in three queries —
        and it is not on the mirrored type either (finding L-271). The spec
        wanted the row built before the first merge; that is not possible
        without inventing the field, so it waits for it.
      */}
      {wer.length > 0 ? <FieldList title="Wer" tone="bare" rows={wer} /> : null}
      {accounts.length > 0 ? <FieldList title="Konten" tone="bare" rows={accounts} /> : null}
      {behaviour.length > 0 ? <FieldList title="Verhalten" tone="bare" rows={behaviour} /> : null}
      <FieldList title="Bewegung" tone="bare" rows={activity} />
      {origin.length > 0 ? <FieldList title="Herkunft" tone="bare" rows={origin} /> : null}
    </div>
  );
}
