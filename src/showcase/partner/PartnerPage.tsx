import type { ReactNode } from "react";

import type { BusinessPartnerDetail } from "@/ludwig/modules/business-partners/domain/business-partner";

import { EntityIcon } from "@/ui/v3/Icons";
import { Badge } from "@/ui/v3/primitives/Badge";
import { MonoCell } from "@/ui/v3/primitives/Cells";
import { Tabs } from "@/ui/v3/primitives/Nav";
import { RecordPager } from "@/ui/v3/primitives/RecordPager";
import { DetailView } from "@/ui/v3/patterns/DetailView";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";

import { listHref, PARTNER_TABS, tabHref } from "./fixtures";

/**
 * The frame every 0127 scenario is drawn in — and the first caller of
 * `DetailView` (0138 way 1). Not a set component: the page belongs to the app;
 * this keeps the scenarios comparable.
 *
 * **There is deliberately no `BusinessPartnerView`**: the partner needs no
 * slot `DetailView` lacks, and a fourth frame component would carry nothing
 * but its name.
 */
export function PartnerPage({
  partner,
  tab = "uebersicht",
  signal,
  actions,
  position = 12,
  total = 6396,
  children,
}: {
  partner: BusinessPartnerDetail;
  tab?: string;
  /** **One** signal or none — the page decides which wins. */
  signal?: ReactNode;
  actions?: ReactNode;
  position?: number;
  total?: number;
  children: ReactNode;
}) {
  // Rank 2 of the page: the number booked under. 99.9 % of partners carry
  // **exactly one**; its role is in the key it hangs under.
  const account = partner.creditorAccount
    ? { role: "Kreditor", ref: partner.creditorAccount }
    : partner.debtorAccount
      ? { role: "Debitor", ref: partner.debtorAccount }
      : null;

  return (
    <DetailView
      pager={
        <RecordPager
          position={position}
          total={total}
          label="Partner"
          back={{ href: listHref, label: "Geschäftspartner" }}
          prevHref="?partner=vorher"
          nextHref="?partner=nachher"
        />
      }
      header={
        <EntityHeader
          icon={<EntityIcon entity="partner" />}
          overline="Geschäftspartner"
          title={partner.legalName}
          // **One** state: the maturity. Role, VAT profile and typical delivery are
          // properties, not axes — they stand in the facts, not the head (D6/D7).
          status={<StatusBadge axis="partner" status={partner.onboardingState} />}
          meta={
            <>
              {account ? (
                <span>
                  {account.role} <MonoCell value={account.ref.accountNumber} />
                  {account.ref.isInternal ? <Badge tone="neutral">intern</Badge> : null}
                </span>
              ) : partner.clearingAccounts.length > 0 ? (
                // The billing provider: twelve in stock, **all twelve** without a
                // creditor or debtor number. Without this line nothing would stand
                // where every other partner shows the number.
                <span>
                  Verrechnung <MonoCell value={partner.clearingAccounts.map((a) => a.accountNumber).join(" · ")} />
                </span>
              ) : null}
              {partner.city ? <span>{partner.city}</span> : null}
            </>
          }
          {...(actions ? { actions } : {})}
        />
      }
      {...(signal ? { signal } : {})}
      tabs={
        <Tabs
          items={PARTNER_TABS.map((t) => ({ ...t, href: tabHref(t.key) }))}
          active={tab}
          ariaLabel="Geschäftspartner"
        />
      }
    >
      {children}
    </DetailView>
  );
}
