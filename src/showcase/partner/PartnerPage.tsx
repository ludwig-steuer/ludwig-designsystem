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
 * Der Rahmen, in dem jedes Szenario von 0127 gezeichnet wird — und der
 * **erste Aufrufer von `DetailView`** (0138 Weg 1).
 *
 * Er ist keine Komponente des Sets: er lebt in `showcase/`, weil er die Seite
 * ist, und die Seite gehört der App. Was er hier tut, ist die Szenarien
 * vergleichbar halten — ein Unterschied zwischen zweien ist dann ein
 * Unterschied im Partner, nie darin, wie jemand den Rahmen zusammengesetzt hat.
 *
 * **Es gibt bewusst keinen `BusinessPartnerView`.** Der Partner braucht keinen
 * Slot, den `DetailView` nicht hat — kein Signal-Zusatz, keine Randspalte,
 * keinen zweiten Inhaltsblock zwischen Kopf und Reitern. Eine vierte
 * Rahmen-Komponente wäre genau die Doppelung, die 0138 abstellen sollte; sie
 * hätte nichts getragen als ihren Namen.
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
  /** **Ein** Signal oder keins — welches gewinnt, entscheidet die Seite. */
  signal?: ReactNode;
  actions?: ReactNode;
  position?: number;
  total?: number;
  children: ReactNode;
}) {
  // Rang 2 der Seite: die Nummer, unter der gebucht wird. 99,9 % der Partner
  // tragen **genau eine** — welche Rolle sie hat, steht im Schlüssel, unter
  // dem sie hängt, nicht im Satz.
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
          // **Ein** Zustand: der Reifegrad. Rolle, USt-Profil und typische
          // Lieferung sind Eigenschaften, keine Achsen — sie stehen in den
          // Fakten, nicht im Kopf (D6/D7).
          status={<StatusBadge axis="partner" status={partner.onboardingState} />}
          meta={
            <>
              {account ? (
                <span>
                  {account.role} <MonoCell value={account.ref.accountNumber} />
                  {account.ref.isInternal ? <Badge tone="neutral">intern</Badge> : null}
                </span>
              ) : partner.clearingAccounts.length > 0 ? (
                // Der Abrechner: zwölf im Bestand, und **alle zwölf** tragen
                // weder Kreditor- noch Debitornummer. Ohne diese Zeile stünde
                // bei ihnen nichts, wo bei allen anderen die Nummer steht
                // (Zweifel 2 des Seitenprofils).
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
