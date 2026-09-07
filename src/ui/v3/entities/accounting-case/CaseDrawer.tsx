import type { ReactNode } from "react";

import { caseKindLabel } from "@/ludwig/modules/accounting-cases/domain/case";
import { asCurrency } from "@/ludwig/shared/money";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { ActionIcon } from "../../Icons";
import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Drawer } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Skeleton } from "../../primitives/Skeleton";
import { Card, CardHead } from "../../primitives/Table";
import { CaseFacts, type CaseFactsVM } from "./CaseFacts";
import { caseTitle } from "./case-title";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

/**
 * The case, looked up beside the work (0098, schema of 0052).
 *
 * **Zone 2 is missing, and that is the point.** A case has no original — the
 * document does. The five-zone schema does not force an empty frame where
 * there is nothing to show; it asks what each zone answers, and here one of
 * them has no question.
 *
 * The drawer answers the question that came up **somewhere else**: what is
 * this case, where does it stand, what hangs on it. Everything that needs the
 * whole history — events, clarifications, bookings — is the view, and zone 4
 * says so in one sentence instead of pretending otherwise.
 */

/**
 * What the head and the facts need. `null` is **not found**, not „loading".
 *
 * **One channel.** Until 2026-09-07 five fields stood here *and* in `facts` —
 * title, counterparty, amount, currency and the word for who is up. Since
 * `CaseFactsVM = Partial<CaseDetail>` the mirror carries them all, and head
 * and zone 3 read the same value from two sources (acceptance 0098, M1). A
 * field kept in two places drifts: that happened twice in a single day. Owner
 * decision: `facts` is the source, and only what is missing there stays here.
 */
export interface CaseQuickView {
  /** Ranks 11–16 for zone 3, plus the head's ranks 1–7. */
  facts: CaseFactsVM;
  /** The one relation the drawer shows: how many events hang on the case. */
  eventCount?: number;
}

/** What the quick view deliberately does not answer. */
const LIMIT =
  "Ereignisse, Klärungen und Buchungen stehen in der vollständigen Sachverhaltsansicht.";

/**
 * @when    A case is looked up beside other work — from a statement row, a
 *          document list, a batch step.
 * @instead Everything about it → CaseDetailView. Its facts alone → CaseFacts.
 *          The document behind it → SourceDocumentDrawer.
 */
export function CaseDrawer({
  open,
  onClose,
  reference,
  record,
  loading,
  error,
  onOpenFull,
  accountHref,
  partnerHref,
}: {
  open: boolean;
  onClose: () => void;
  /** The identifier that was looked up — it stands in the head **and** in the error and empty text. */
  reference: string;
  /** `null` means **not found**, not „still loading". */
  record: CaseQuickView | null;
  /** Beats `record`. */
  loading?: boolean;
  error?: ReactNode;
  /** Zone 5 — without a way out the drawer is a dead end. */
  onOpenFull: () => void;
  accountHref?: (accountNumber: string) => string;
  partnerHref?: string;
}) {
  const name = record
    ? caseTitle({
        title: record.facts.title ?? null,
        kind: record.facts.kind,
        counterpartyName: record.facts.counterpartyName ?? null,
      })
    : null;
  // Whether the head's title is the kind itself — then rank 5 is already said.
  const kindInTitle = record ? name === caseKindLabel(record.facts.kind) : false;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      title={name ?? `Sachverhalt ${reference}`}
      meta={
        record ? (
          <span className="v2cdr__meta">
            {/* The reference is what was **looked up** — not what came back.
                Deriving it from the record would hide the one case that
                matters: a record whose number differs from the reference. */}
            <code>{reference}</code>
            {record.facts.lifecycleStatus ? (
              <StatusBadge axis="sachverhalt" status={record.facts.lifecycleStatus} info={false} />
            ) : null}
            {record.facts.totalAmount == null ? null : (
              <Amount value={record.facts.totalAmount} currency={asCurrency(record.facts.currency)} size="sm" />
            )}
            {/* The title falls back to the kind when a case has none — then
                the meta line must not say it a second time (M6). */}
            {kindInTitle && !record.facts.counterpartyName ? null : (
              <span>
                {kindInTitle ? "" : caseKindLabel(record.facts.kind)}
                {record.facts.counterpartyName
                  ? `${kindInTitle ? "" : " · "}${record.facts.counterpartyName}`
                  : ""}
              </span>
            )}
            {record.facts.disposition ? (
              <span>
                {resolveStatus("disposition", record.facts.disposition).label}{" "}
                ist dran
              </span>
            ) : null}
            {record.eventCount === undefined ? null : (
              <span>
                {record.eventCount} {record.eventCount === 1 ? "Ereignis" : "Ereignisse"}
              </span>
            )}
          </span>
        ) : null
      }
      footer={
        // Zone 5 stands **in the error case too** — deliberately unlike the
        // document drawer: whoever cannot load the case wants the full view
        // all the more (decision of the Freigabe, 2026-09-06).
        <Button variant="primary" icon={<ActionIcon action="open" size={16} />} onClick={onOpenFull}>
          Sachverhalt öffnen
        </Button>
      }
    >
      <DrawerBody
        reference={reference}
        record={record}
        loading={loading}
        error={error}
        accountHref={accountHref}
        partnerHref={partnerHref}
      />
      {/* Zone 4: what the quick look does not answer — named, not hidden, and
          in every state. */}
      <p className="v2cdr__limit">{LIMIT}</p>
    </Drawer>
  );
}

/**
 * The four states in their order of precedence: error → loading → not found →
 * content. Zone 4 stands **outside** this function, because the sentence
 * describes the drawer, not the record: in the error case „the rest is in the
 * view" is the most useful thing on screen (M4).
 */
function DrawerBody({
  reference,
  record,
  loading,
  error,
  accountHref,
  partnerHref,
}: {
  reference: string;
  record: CaseQuickView | null;
  loading?: boolean;
  error?: ReactNode;
  accountHref?: (accountNumber: string) => string;
  partnerHref?: string;
}) {
  if (error) {
    return (
      <Callout tone="danger">
        <strong>Sachverhalt {reference} konnte nicht geladen werden.</strong> {error}. Bitte
        erneut öffnen — oder den Sachverhalt vollständig ansehen.
      </Callout>
    );
  }
  if (loading) {
    // The shape of the content, not one card and not five bare lines: the
    // same card with the same head, so nothing jumps when the data arrives
    // (defect M3 of the first review — 87 px against 301 px).
    return (
      <Card>
        <CardHead title="Kernfakten" />
        <div className="v2cdr__facts">
          <Skeleton lines={5} label="Sachverhalt wird geladen …" />
        </div>
      </Card>
    );
  }
  if (!record) {
    return (
      <EmptyState
        inline
        icon={<ActionIcon action="alert" size={20} />}
        title={`Kein Sachverhalt zu ${reference}`}
        description="Zu dieser Kennung gibt es keinen Sachverhalt dieses Mandanten. Vielleicht gehört sie einem anderen Wirtschaftsjahr."
      />
    );
  }

  return (
    /* Zone 3: the same component as the view, without `all` — that is the
       coverage 0052 asks for: the drawer invents no second field list. */
    <Card>
      <CardHead title="Kernfakten" />
      <div className="v2cdr__facts">
        <CaseFacts
          case={record.facts}
          tone="bare"
          accountHref={accountHref}
          partnerHref={partnerHref}
        />
      </div>
    </Card>
  );
}
