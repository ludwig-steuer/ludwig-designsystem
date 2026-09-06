import { FileWarning, Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { caseKindLabel } from "@/ludwig/modules/accounting-cases/domain/case";
import type { Currency } from "@/ludwig/shared/money";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Drawer } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Skeleton } from "../../primitives/Skeleton";
import { Card, CardHead } from "../../primitives/Table";
import { CaseFacts, type CaseFactsVM } from "./CaseFacts";
import { caseIdentifier, caseTitle } from "./case-title";

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

/** What the head and the facts need. `null` is **not found**, not „loading". */
export interface CaseQuickView {
  /** Ranks 11–16 for zone 3, plus the head's ranks 1–7. */
  facts: CaseFactsVM;
  /** Rank 1 — the display name; rank 3 the number. */
  title: string | null;
  counterpartyName?: string | null;
  /** Rank 4 — in the meta line of the head. */
  totalAmount?: number | null;
  currency?: Currency | null;
  /** Rank 7 — „wer dran ist", as a word. */
  dispositionLabel?: string | null;
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
        title: record.title,
        kind: record.facts.kind,
        counterpartyName: record.counterpartyName ?? null,
      })
    : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      title={name ?? `Sachverhalt ${reference}`}
      meta={
        record ? (
          <span className="v2cdr__meta">
            <code>{caseIdentifier({ caseId: reference, caseNumber: record.facts.caseNumber })}</code>
            {record.facts.lifecycleStatus ? (
              <StatusBadge axis="sachverhalt" status={record.facts.lifecycleStatus} info={false} />
            ) : null}
            {record.totalAmount == null ? null : (
              <Amount value={record.totalAmount} currency={record.currency ?? "EUR"} size="sm" />
            )}
            <span>
              {caseKindLabel(record.facts.kind)}
              {record.counterpartyName ? ` · ${record.counterpartyName}` : ""}
            </span>
            {record.dispositionLabel ? <span>{record.dispositionLabel} ist dran</span> : null}
            {record.eventCount === undefined ? null : (
              <span>
                {record.eventCount} {record.eventCount === 1 ? "Ereignis" : "Ereignisse"}
              </span>
            )}
          </span>
        ) : null
      }
      footer={
        // Zone 5 steht **auch im Fehlerfall** — bewusst anders als der
        // Beleg-Drawer: wer den Fall nicht laden kann, will erst recht in die
        // vollständige Ansicht (Entscheid der Freigabe 2026-09-06).
        <Button variant="primary" icon={<Maximize2 size={16} strokeWidth={1.5} />} onClick={onOpenFull}>
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
    </Drawer>
  );
}

/** The four states in their order of precedence: error → loading → not found → content. */
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
        Sachverhalt {reference} konnte nicht geladen werden: {error}
      </Callout>
    );
  }
  if (loading) {
    // Die Form des Inhalts, nicht eine Karte: fünf Zeilen für Zone 3, weil
    // dort fünf stehen werden (Mangel M2 der 0052-Abnahme, hier nicht
    // wiederholt).
    return <Skeleton lines={5} label="Sachverhalt wird geladen …" />;
  }
  if (!record) {
    return (
      <EmptyState
        inline
        icon={<FileWarning size={20} strokeWidth={1.5} />}
        title={`Kein Sachverhalt zu ${reference}`}
        description="Zu dieser Kennung gibt es keinen Sachverhalt dieses Mandanten. Vielleicht gehört sie einem anderen Wirtschaftsjahr."
      />
    );
  }

  return (
    <>
      {/* Zone 3: dieselbe Komponente wie im View, ohne `all` — das ist die
          Deckung, die 0052 verlangt: der Drawer erfindet keine zweite
          Feldliste. */}
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

      {/* Zone 4: was der Schnellblick nicht beantwortet — benannt, nicht
          verschwiegen. */}
      <p className="v2cdr__limit">{LIMIT}</p>
    </>
  );
}
