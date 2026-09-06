import { FileWarning, Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Drawer } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Amount } from "../../primitives/Amount";
import { Skeleton } from "../../primitives/Skeleton";
import { Card, CardHead } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { BankTransactionFacts } from "./BankTransactionFacts";
import type { BankTransactionDetailData } from "./bank-transaction";

/**
 * The payment, looked up beside the work (0103, schema of 0052).
 *
 * For this entity the drawer is **not** the little sister of a view — it is
 * the only detail there is. No route shows a single statement line, and the
 * statement is the screen. Three views open it: the statement, and steps 3
 * and 4 of the batch review.
 *
 * The change this task makes is not the markup, it is the class: the app's
 * drawer holds `useState` for row, loading and error and calls
 * `getBankTransactionDetail` itself. That belongs to the caller (F113). The
 * gain is not elegance — a drawer that loads cannot be shown in Storybook,
 * and its four states are exactly what a review has to see.
 *
 * **Zone 2 is missing**, like the case drawer: a payment has no original. The
 * statement it came from is joined by a soft edge without a foreign key
 * (finding L-45), so there would be nothing to show even if the zone existed.
 */

/** What zone 5 leads to. The drawer decides which; the caller knows the route. */
export type BankTransactionExit = "case" | "assign";

/**
 * @when    A payment is looked up beside other work — from the statement,
 *          from a step of the batch review.
 * @instead Everything about it → BankTransactionFacts. One line of the
 *          statement → BankTransactionRow. The case behind it → CaseDrawer.
 */
export function BankTransactionDrawer({
  open,
  onClose,
  reference,
  record,
  loading,
  error,
  onOpenFull,
  caseHref,
}: {
  open: boolean;
  onClose: () => void;
  /** The identifier looked up — it stands in the head **and** in both texts. */
  reference: string;
  /** `null` means **not found**, not „still loading". */
  record: BankTransactionDetailData | null;
  loading?: boolean;
  error?: ReactNode;
  /**
   * Zone 5. **One exit, and which one depends on the situation**: with 65 % of
   * the lines assigned to no case, the useful way out is not „to the case" but
   * „assign". The drawer picks by `cases.length`, the caller turns the choice
   * into a route — two buttons of which one points nowhere in two thirds of
   * the cases are worse than one that always fits.
   */
  onOpenFull: (exit: BankTransactionExit, caseId?: string) => void;
  caseHref: (caseId: string) => string;
}) {
  const assigned = (record?.cases.length ?? 0) > 0;
  const first = record?.cases[0];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      title={record?.counterpartyName ?? `Zahlung ${reference}`}
      meta={
        record ? (
          <span className="v2btxd__meta">
            <Amount value={record.amount} currency={record.currency} size="sm" />
            {/* The **posting** date, and it says so — a bare date does not
                tell which of the two it is (finding L-61). */}
            <span title="Buchungsdatum">
              <Time value={record.postingDate} format="date" length="short" size="sm" />
            </span>
            {/* No `StatusBadge` in zone 1. Not because there is no axis — since
                `cc141f7b` there is one for the match stage — but because zone 3
                carries it, and 0052 forbids saying the same thing twice. The
                event state exists only where a case is assigned, so it cannot
                be the head's one state either. */}
          </span>
        ) : null
      }
      footer={
        <Button
          variant="primary"
          icon={<Maximize2 size={16} strokeWidth={1.5} />}
          onClick={() => onOpenFull(assigned ? "case" : "assign", first?.caseId)}
        >
          {assigned ? "Sachverhalt öffnen" : "Zahlung zuordnen"}
        </Button>
      }
    >
      <Body
        reference={reference}
        record={record}
        loading={loading}
        error={error}
        caseHref={caseHref}
      />
      {/* Zone 4 — what the quick look does not answer, in every state. */}
      <p className="v2btxd__limit">Herkunft und Rohdaten stehen im Kontoauszug.</p>
    </Drawer>
  );
}

/** Error → loading → not found → content. */
function Body({
  reference,
  record,
  loading,
  error,
  caseHref,
}: {
  reference: string;
  record: BankTransactionDetailData | null;
  loading?: boolean;
  error?: ReactNode;
  caseHref: (caseId: string) => string;
}) {
  if (error) {
    return (
      <Callout tone="danger">
        <strong>Zahlung {reference} konnte nicht geladen werden.</strong> {error}. Bitte erneut
        öffnen — oder im Kontoauszug nachsehen.
      </Callout>
    );
  }
  if (loading) {
    // The shape of the content: the same card with the same head, so nothing
    // jumps when the data arrives.
    return (
      <Card>
        <CardHead title="Zahlung" />
        <div className="v2btxd__pad">
          <Skeleton lines={5} label="Zahlung wird geladen …" />
        </div>
      </Card>
    );
  }
  if (!record) {
    return (
      <EmptyState
        inline
        icon={<FileWarning size={20} strokeWidth={1.5} />}
        title={`Keine Zahlung zu ${reference}`}
        description="Zu dieser Kennung gibt es keine Position dieses Mandanten. Vielleicht gehört sie einem anderen Konto oder Wirtschaftsjahr."
      />
    );
  }
  return (
    // Zone 3 is `BankTransactionFacts` **without** the import block: that is
    // origin, and zone 4 says where it stands. No second field list.
    <BankTransactionFacts
      transaction={record}
      caseHref={caseHref}
      blocks={["payment", "purpose", "counterparty", "assignment"]}
      tone="bare"
    />
  );
}
