import type { ReactNode } from "react";

import type { CaseDetail } from "@/ludwig/modules/accounting-cases/domain/case-detail";
import type { CaseKind, CaseLifecycle } from "@/ludwig/modules/accounting-cases/domain/case";
import { StatusBadge } from "../../patterns/StatusBadge";
import { FieldList } from "../../primitives/FieldList";
import { LongText } from "../../primitives/LongText";
import { MonoCell } from "../../primitives/Cells";
import { AccountCell } from "../account/Account";
import { BusinessPartnerCell } from "../business-partner/BusinessPartner";
import { Time } from "../../primitives/Time";

/**
 * Everything that hangs on a case (0097).
 *
 * These facts stand in **three** places today, in three different sets: the
 * head shows opened, closed, personal account and partner; the box shows four
 * child counters and a counterparty computed from the events; the portal
 * shows number, kind, amount and opened. None of the three is a subset of
 * another.
 *
 * This file unifies them — it does not lift an existing list. That is why the
 * order comes from the entity profile and not from the stock.
 *
 * **Three empty values mean something**, and the component says the word
 * instead of a dash: no personal account (a collective case, an internal
 * transfer), no counterparty side, and a reason why no document is expected.
 * A „—" there would be a false statement.
 */

/**
 * The facts of a case — **from the mirror**, not defined here.
 *
 * Until 2026-09-07 this file carried a structure of its own with nineteen
 * fields. It existed because `CaseDetail` sat in `infrastructure/` and was
 * missing eleven of them (finding **L-68**). The app closed that with
 * `18ddaa28`: the type lives in `domain/` now, is mirrored, and carries
 * `title`, `disposition`, `openClarificationsCount`, `exportStatus`,
 * `counterpartySide`, `batchOposReference`, `createdByKind`/`createdByLabel`,
 * `expectedInterval`, `agentRunId` and `exportBatchId`.
 *
 * Four fields are required, because without them no fact line stands at all;
 * everything else is optional, because the view shows what it is given. The
 * ranks are in the entity profile, not here — a second list goes stale.
 */
export interface CaseFactsVM extends Partial<CaseDetail> {
  caseNumber: string | null;
  kind: CaseKind;
  lifecycleStatus: CaseLifecycle | null;
  openedAt: string;
}

/** Above this the summary is a paragraph, not a fact line (p90 309). */
const SUMMARY_MAX = 160;

const SIDE_LABEL: Record<"debtor" | "creditor", string> = {
  debtor: "Debitor",
  creditor: "Kreditor",
};

/**
 * @when    The facts of a case — in its view, in its drawer, on its card.
 * @instead The case named in a foreign row → CaseCell. What happened to it →
 *          CaseTimeline. Changing a value → CaseEditor.
 */
export function CaseFacts({
  case: c,
  all = false,
  tone = "surface",
  split = false,
  partnerHref,
  accountHref,
}: {
  case: CaseFactsVM;
  /** Also ranks 17–24 — the view shows them, the drawer does not. */
  all?: boolean;
  tone?: "surface" | "bare";
  /** Two columns of pairs where the page gives them room — the Details tab. */
  split?: boolean;
  /** The partner becomes a link (47 % have one). */
  partnerHref?: string;
  /** Personal and clearing account become links — **by number**: that is what the route runs on. */
  accountHref?: (accountNumber: string) => string;
}) {
  const rows: [ReactNode, ReactNode][] = [];
  const add = (label: ReactNode, value: ReactNode) => rows.push([label, value]);

  // Rang 11 — lang genug, um sich die Restbreite zu nehmen; ungekürzt ist er ein Absatz.
  if (c.summary) add("Zusammenfassung", <LongText max={SUMMARY_MAX}>{c.summary}</LongText>);

  // Rang 12
  if (c.counterpartyName) {
    add(
      "Geschäftspartner",
      // The cell, not a second way of writing a name (0139). Without a
      // partner id there is no partner behind the name — then it stays text.
      partnerHref && c.counterpartyPartnerId ? (
        <BusinessPartnerCell name={c.counterpartyName} href={partnerHref} />
      ) : (
        <BusinessPartnerCell name={c.counterpartyName} />
      ),
    );
  }

  // Rang 13 — NULL ist eine Aussage, kein fehlender Wert.
  add(
    "Personenkonto",
    c.personalAccountNumber ? (
      // `AccountCell`, not `<Link><MonoCell/></Link>`: the mono class sets its
      // own colour and wins over the link's, so the account looked like plain
      // text and answered no hover — the set decided that in 0066
      // (`.v2acc--link`, `v3.css:2690`). Acceptance 0097, M1.
      <AccountCell
        number={c.personalAccountNumber}
        {...(accountHref ? { href: accountHref(c.personalAccountNumber) } : {})}
      />
    ) : (
      "hat bewusst keins"
    ),
  );

  // Rang 14
  if (c.documentNumberMode) {
    add(
      "Belegnummern",
      <StatusBadge axis="belegnummern_modus" status={c.documentNumberMode} info={false} />,
    );
  }

  // Rang 15 — dass das Feld gesetzt ist, **ist** die Aussage.
  if (c.documentNotRequiredReason) {
    add("Kein Beleg zu erwarten", c.documentNotRequiredReason);
  }

  // Rang 16
  add("Abgeschlossen", c.closedAt ? <Time value={c.closedAt} format="date" /> : "laufend");

  if (all) {
    // Rang 17 — NULL ist auch hier eine Aussage.
    // The mirror types the side as `string`; an unknown value is shown raw
    // rather than silently dropped — visibly wrong beats quietly absent.
    add(
      "Gegenpartei-Seite",
      c.counterpartySide
        ? (SIDE_LABEL[c.counterpartySide as keyof typeof SIDE_LABEL] ?? c.counterpartySide)
        : "bewusst keine",
    );
    if (c.batchOposReference) add("Anker", <MonoCell value={c.batchOposReference} />);
    if (c.createdByLabel) add("Angelegt von", c.createdByLabel);
    if (c.fiscalYear != null) add("Wirtschaftsjahr", String(c.fiscalYear));
    if (c.expectedInterval) add("Abrechnungsrhythmus", c.expectedInterval);
    if (c.clearingAccountNumber) {
      add(
        "Verrechnungskonto",
        <AccountCell
          number={c.clearingAccountNumber}
          {...(accountHref ? { href: accountHref(c.clearingAccountNumber) } : {})}
        />,
      );
    }
    if (c.agentRunId) add("Buchungslauf", <MonoCell value={c.agentRunId} />);
    if (c.exportBatchId) add("Buchungszyklus", <MonoCell value={c.exportBatchId} />);
    // Rang 25 (Abnahme-Bucket) steht bewusst **nicht** hier: das Profil sagt
    // selbst, er gehört zur Abnahmeliste — dort ist er die Gruppierung, hier
    // wäre er eine Zahl ohne ihren Zusammenhang (Freigabe 2026-09-06).
  }

  // `stack`, nicht `row`: die Spec verspricht „Label links, Wert rechts, Zahlen
  // mit tnum" — und genau das ist die Vorgabe-Form der `FieldList`. `row`
  // setzt das Label **über** den Wert und beides linksbündig; damit wäre der
  // Satz im Verhalten nicht eingelöst, sondern nur behauptet (Abnahme 0097).
  return <FieldList rows={rows} tone={tone} split={split} />;
}
