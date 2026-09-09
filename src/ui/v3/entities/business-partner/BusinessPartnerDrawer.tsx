import type { ReactNode } from "react";

import type {
  BusinessPartnerDetail,
  PartnerPersonalAccount,
} from "@/ludwig/modules/business-partners/domain/business-partner";

import { formatCount } from "../../format";
import { Button } from "../../primitives/Button";
import { MonoCell } from "../../primitives/Cells";
import { Drawer } from "../../primitives/Drawer";
import { Link } from "../../primitives/Link";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { BusinessPartnerFacts } from "./BusinessPartnerFacts";

/**
 * The business partner beside the work (0143).
 *
 * Five foreign views point at him without being able to show him — `CaseFacts`,
 * `case-columns`, `account-columns`, the `GlanceCard` on the document and the
 * dashboard tile — and all five leave the page for it. This answers the
 * question that came up there, and offers the way for everything else.
 *
 * **It is an overview with three abstracts** (owner decision 2026-09-09), each
 * with its **own** way „mehr dazu" into the matching tab of the full view —
 * not one foot button for everything. That departs from A10 on purpose: if the
 * drawer is an overview of three areas, then each area leads somewhere else,
 * and a single button would make the accountant look for the tab again that
 * she was just reading. Two targets, two ways — the same argument as I11, one
 * level up.
 *
 * **What an abstract shows, its coverage decides** (D15): the accounts as a
 * list, the cases as a number with a way, the booking behaviour not at all
 * until the fields exist.
 */

/** Which tab of the full view an abstract leads to. */
export type PartnerTab = "accounts" | "cases" | "bookings";

function Abstract({
  title,
  href,
  wayLabel,
  children,
}: {
  title: string;
  href: string;
  /** Names what is behind it (I11) — never „mehr". */
  wayLabel: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHead
        title={title}
        actions={
          <Link href={href} className="v2bpdrawer__way">
            {wayLabel}
          </Link>
        }
      />
      {children}
    </Card>
  );
}

/**
 * @when    Looking a business partner up in the middle of other work — out of a case, an account, a document row.
 * @instead Everything about him, with his documents and bookings → the full view. Only what stands on him → BusinessPartnerFacts. Naming him in a row → BusinessPartnerCell.
 */
export function BusinessPartnerDrawer({
  open,
  onClose,
  partner,
  accounts,
  caseCount,
  tabHref,
  href,
  renderBookingBehaviour,
  accountHref,
}: {
  open: boolean;
  /** Escape, scrim, cross — all three report the same. */
  onClose: () => void;
  partner: BusinessPartnerDetail;
  /** The first abstract. Empty means „none" — two partners of 14,950. */
  accounts: readonly PartnerPersonalAccount[];
  /**
   * The second abstract, as a **number**: 168 of 14,950 partners have a case
   * at all, and among those the median is 1 (D15: `p50 ≤ 1` → a number with a
   * way). `0` or missing and the abstract is gone.
   */
  caseCount?: number;
  /**
   * The three ways „mehr dazu". **Required**: an abstract without a way is a
   * dead end with figures.
   */
  tabHref: (tab: PartnerTab) => string;
  /** The foot button onto the partner without a tab (A10). */
  href: string;
  /**
   * The third abstract — usual contra account, usual tax key, last bookings.
   *
   * A callback, not data: the app computes those in the `ReviewCasePartner`
   * view model of the batch review, **not** on the partner
   * (`defaultDebitAccountNumber` and `typicalTaxKeys` are 0 % filled). Without
   * it the abstract is absent — no placeholder, no empty card (A12).
   */
  renderBookingBehaviour?: () => ReactNode;
  accountHref?: (accountNumber: string) => string;
}) {
  const behaviour = renderBookingBehaviour?.();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={partner.legalName}
      ariaLabel={partner.legalName}
      size="lg"
      footer={
        <Button variant="secondary" size="sm" href={href}>
          Geschäftspartner öffnen
        </Button>
      }
    >
      <div className="v2bpdrawer">
        <BusinessPartnerFacts
          partner={partner}
          {...(accountHref ? { accountHref } : {})}
        />

        {accounts.length > 0 ? (
          <Abstract
            title="Personenkonten"
            href={tabHref("accounts")}
            wayLabel="Alle Konten"
          >
            <Table cols="110px 1fr 90px 110px" minWidth={480}>
              <HeadRow>
                <span>Konto</span>
                <span>Name</span>
                <span>Jahr</span>
                <span>Buchungen</span>
              </HeadRow>
              {accounts.map((a) => (
                <Row key={a.accountId}>
                  {accountHref ? (
                    <Link href={accountHref(a.accountNumber)}>
                      <MonoCell value={a.accountNumber} />
                    </Link>
                  ) : (
                    <MonoCell value={a.accountNumber} />
                  )}
                  <span>{a.accountName}</span>
                  <span className="v2num">{a.fiscalYear}</span>
                  <span className="v2num">{formatCount(a.usageBookingCount)}</span>
                </Row>
              ))}
            </Table>
          </Abstract>
        ) : null}

        {caseCount && caseCount > 0 ? (
          // A **number**, not a list: among the 168 partners that have a case
          // at all the median is one. A card that shows one row and calls
          // itself an abstract costs height and says nothing (D15).
          <Abstract title="Sachverhalte" href={tabHref("cases")} wayLabel="Sachverhalte">
            <p className="v2bpdrawer__count">
              <span className="v2num">{formatCount(caseCount)}</span>{" "}
              {caseCount === 1 ? "Sachverhalt" : "Sachverhalte"}
              {partner.lastBookingDate ? (
                <>
                  {" · zuletzt gebucht "}
                  <Time value={partner.lastBookingDate} format="date" />
                </>
              ) : null}
            </p>
          </Abstract>
        ) : null}

        {behaviour ? (
          <Abstract
            title="Buchungsverhalten"
            href={tabHref("bookings")}
            wayLabel="Buchungen"
          >
            {behaviour}
          </Abstract>
        ) : null}
      </div>
    </Drawer>
  );
}
