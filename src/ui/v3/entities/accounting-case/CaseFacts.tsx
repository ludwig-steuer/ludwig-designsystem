import type { ReactNode } from "react";

import type {
  CaseDocumentNumberMode,
  CaseKind,
  CaseLifecycle,
} from "@/ludwig/modules/accounting-cases/domain/case";
import { StatusBadge } from "../../patterns/StatusBadge";
import { FieldList } from "../../primitives/FieldList";
import { Link } from "../../primitives/Link";
import { LongText } from "../../primitives/LongText";
import { MonoCell } from "../../primitives/Cells";
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
 * The facts of a case, as far as this list shows them.
 *
 * `CaseDetail` of the app lives in `infrastructure/case-detail-queries.ts`
 * instead of `domain/`, so the mirror does not carry it, and eleven of these
 * fields are missing over there anyway — including `title`, which is the root
 * of L-52. Register entry **L-68**; the precedent for a local view model is
 * `AccountFactsVM` (L-13). When it moves, this interface goes away.
 */
export interface CaseFactsVM {
  caseNumber: string | null;
  kind: CaseKind;
  lifecycleStatus: CaseLifecycle | null;
  openedAt: string;
  /** Rank 11 — the agent's sentence about this case. */
  summary?: string | null;
  /** Rank 12. 47 % have one. */
  counterpartyPartnerId?: string | null;
  counterpartyName?: string | null;
  /**
   * Rank 13. **NULL means „deliberately none"** (GLOSSARY) — a collective
   * case, an internal transfer, a pure nominal booking.
   */
  fyPersonalAccountNumber?: string | null;
  /** Rank 14, axis `belegnummern_modus`. */
  documentNumberMode?: CaseDocumentNumberMode | null;
  /** Rank 15. Set = **no document is expected**, and the reason is the value. */
  documentNotRequiredReason?: string | null;
  /** Rank 16. 26 % are closed. */
  closedAt?: string | null;
  /** Rank 17. NULL means „deliberately none". */
  counterpartySide?: "debtor" | "creditor" | null;
  /** Rank 18 — where the case comes from. */
  batchOposReference?: string | null;
  /** Rank 19. */
  createdByLabel?: string | null;
  /** Rank 20 — the route sets it, the drawer does not know it. */
  fiscalYear?: number | null;
  /** Rank 21, 3 % — only on a recurring case. */
  expectedInterval?: string | null;
  /** Rank 22, 0 % today (2 of 915). */
  fyClearingAccountNumber?: string | null;
  /** Rank 23. */
  agentRunId?: string | null;
  /** Rank 24. */
  exportBatchId?: string | null;
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
  partnerHref,
  accountHref,
}: {
  case: CaseFactsVM;
  /** Also ranks 17–24 — the view shows them, the drawer does not. */
  all?: boolean;
  tone?: "surface" | "bare";
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
      partnerHref && c.counterpartyPartnerId ? (
        <Link href={partnerHref}>{c.counterpartyName}</Link>
      ) : (
        c.counterpartyName
      ),
    );
  }

  // Rang 13 — NULL ist eine Aussage, kein fehlender Wert.
  add(
    "Personenkonto",
    c.fyPersonalAccountNumber ? (
      accountHref ? (
        <Link href={accountHref(c.fyPersonalAccountNumber)}>
          <MonoCell value={c.fyPersonalAccountNumber} />
        </Link>
      ) : (
        <MonoCell value={c.fyPersonalAccountNumber} />
      )
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
    add("Gegenpartei-Seite", c.counterpartySide ? SIDE_LABEL[c.counterpartySide] : "bewusst keine");
    if (c.batchOposReference) add("Anker", <MonoCell value={c.batchOposReference} />);
    if (c.createdByLabel) add("Angelegt von", c.createdByLabel);
    if (c.fiscalYear != null) add("Wirtschaftsjahr", String(c.fiscalYear));
    if (c.expectedInterval) add("Abrechnungsrhythmus", c.expectedInterval);
    if (c.fyClearingAccountNumber) {
      add(
        "Verrechnungskonto",
        accountHref ? (
          <Link href={accountHref(c.fyClearingAccountNumber)}>
            <MonoCell value={c.fyClearingAccountNumber} />
          </Link>
        ) : (
          <MonoCell value={c.fyClearingAccountNumber} />
        ),
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
  return <FieldList rows={rows} tone={tone} />;
}
