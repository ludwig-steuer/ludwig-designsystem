import type { ReactNode } from "react";

import {
  PARTNER_NATURE_LABEL,
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
  accountHref?: (accountNumber: string) => string;
  /** Sentences of the caller above the first group. */
  hints?: readonly string[];
}) {
  const wer: Rows = [["Name", partner.legalName]];
  // The short name only where it says something the name does not: it is
  // capped at 15 characters and 53 % sit exactly at the cap, so most of them
  // are the name with its tail cut off.
  if (
    partner.shortName &&
    !partner.legalName.toLowerCase().startsWith(partner.shortName.trim().toLowerCase())
  ) {
    wer.push(["Kurzname", partner.shortName]);
  }
  if (partner.city) wer.push(["Ort", partner.city]);
  if (partner.ustIds.length > 0) {
    wer.push(["USt-IdNr.", <MonoCell key="ust" value={partner.ustIds.join(" · ")} />]);
  }

  const konten: Rows = [];
  if (partner.creditorAccount) {
    konten.push(["Kreditorkonto", accountRow(partner.creditorAccount, accountHref)]);
  }
  if (partner.debtorAccount) {
    konten.push(["Debitorkonto", accountRow(partner.debtorAccount, accountHref)]);
  }
  if (partner.clearingAccounts.length > 0) {
    konten.push([
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
  const bewegung: Rows = [
    ["Buchungen", <span key="n" className="v2num">{formatCount(partner.usageBookingCount)}</span>],
  ];
  if (partner.lastBookingDate) {
    bewegung.push(["Letzte Buchung", <Time key="lb" value={partner.lastBookingDate} format="date" />]);
  }

  const verhalten: Rows = [];
  if (all) {
    // **The VAT profile stays out until it has words.** `VAT_PROFILE_LABEL`
    // lives privately in `MasterDataTab.tsx` (L-223); the domain carries none.
    // A local map would break R1, and the raw key claims a statement it does
    // not make: `domestic_reverse_charge` means nothing to an accountant.
    if (partner.typicalNature !== "unknown") {
      verhalten.push(["Typische Lieferung", PARTNER_NATURE_LABEL[partner.typicalNature]]);
    }
    if (partner.businessDescription) {
      verhalten.push(["Beschreibung", partner.businessDescription]);
    }
  }

  const herkunft: Rows = [];
  if (all) {
    // The maturity sits **here**, not at the top: it is `confirmed` for
    // 99.7 % of the stock, and a badge that almost always says the same thing
    // does not belong in the first place a reader looks. Where it is
    // `proposed` or `draft` it says something about the origin of the record,
    // not about the partner.
    herkunft.push([
      "Reifegrad",
      <StatusBadge key="ob" axis="partner" status={partner.onboardingState} />,
    ]);
    // **The origin stays out for the same reason as the VAT profile.** Its six
    // values are English keys (`onboarding_import`, `auto_profiled`, …) and no
    // German word exists for them — neither in the GLOSSARY entry „Creditor
    // source" nor in the domain. Writing the key on screen would be the same
    // mistake this file avoids two rows above, and being inconsistent about it
    // would be worse than either choice (finding L-272).
    const anschrift = [partner.addressLine1, [partner.postalCode, partner.city].filter(Boolean).join(" ")]
      .filter((p) => p && p.length > 0)
      .join(", ");
    if (anschrift) herkunft.push(["Anschrift", anschrift]);
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
      <FieldList title="Wer" tone="bare" rows={wer} />
      {konten.length > 0 ? <FieldList title="Konten" tone="bare" rows={konten} /> : null}
      {verhalten.length > 0 ? <FieldList title="Verhalten" tone="bare" rows={verhalten} /> : null}
      <FieldList title="Bewegung" tone="bare" rows={bewegung} />
      {herkunft.length > 0 ? <FieldList title="Herkunft" tone="bare" rows={herkunft} /> : null}
    </div>
  );
}
