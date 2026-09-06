"use client";

import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { ClickRow } from "../../primitives/ExpandableRow";
import { GroupRow, Row } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import {
  AGE_BUCKET_LABEL,
  type OpenItem,
  type OpenItemAgeGroupVM,
} from "./open-item";
import { formatAmount } from "../../format";
import type { Currency } from "@/ludwig/shared/money";

/**
 * What is open on the reference date — and **how long already** (0029).
 *
 * The page renders this table itself today, with local formatters and a local
 * label map for the kind; the age grouping that makes the view useful does not
 * exist at all. Whoever wants to know what is more than 90 days overdue counts
 * by hand.
 *
 * „Open" is always a statement **about a date**. That is why `asOf` is
 * required and stands in the empty state, in the group heading and in the
 * settlement column: an item that is settled today can have been open on the
 * reference date, and the row must not collapse the two.
 */

const KIND_AXIS = "konto_typ" as const;

/**
 * @when    One line of the DATEV open-item list, on the OPOS page or in the
 *          duplicate check.
 * @instead The age class as a heading over a group → OpenItemAgeGroup. A case
 *          behind the item → CaseCell.
 */
export function OpenItemRow({
  item,
  currency = "EUR",
  asOf,
  onOpen,
}: {
  item: OpenItem;
  currency?: Currency;
  /** The reference date — „open" is never true in the abstract. */
  asOf: string;
  /** Jump into the case. Without it the row is not clickable. */
  onOpen?: (personalAccount: string) => void;
}) {
  const cells = <Cells item={item} currency={currency} asOf={asOf} />;
  return onOpen ? (
    <ClickRow onClick={() => onOpen(item.personalAccount)}>{cells}</ClickRow>
  ) : (
    <Row>{cells}</Row>
  );
}

function Cells({
  item,
  currency,
  asOf,
}: {
  item: OpenItem;
  currency: Currency;
  asOf: string;
}) {
  return (
    <>
      {/* Kreditor / Debitor over the registry, not over a local map — the
          axis `konto_typ` already carries both words (R1). */}
      <span>{resolveStatus(KIND_AXIS, item.kind).label}</span>
      <MonoCell value={item.personalAccount} />
      <MonoCell value={item.externalDocumentNumber} />
      <Time value={item.invoiceDate} format="date" length="short" size="sm" />
      <Time value={item.dueDate} format="date" length="short" size="sm" />
      <span className="v2oi__text" title={item.description ?? undefined}>
        {item.description ?? <span className="v2muted">—</span>}
      </span>
      <span>
        {/* The dunning level as a **word**, and only above zero — `null` is an
            old snapshot, `0` is „not dunned yet". Two different silences. */}
        {item.dunningLevel ? `${item.dunningLevel}. Mahnung` : <span className="v2muted">—</span>}
      </span>
      <span>
        <StatusBadge
          axis="opos_ausgleich"
          status={item.clearedAfterStichtag ? "spaeter_ausgeglichen" : "offen"}
          note={`Stichtag ${asOf}`}
        />
      </span>
      <AmountCell value={item.grossAmount} currency={currency} />
      {/* An approximated amount says so with „≈" and gives the reason in the
          title — a number that pretends to be exact is worse than none. */}
      <span className="v2num">
        {item.amountApprox && item.openAtStichtag !== null ? (
          <span
            className="v2amount"
            title="Genähert: Alt-Snapshot mit Teilzahlung oder Sammel-OP."
          >
            ≈ {formatAmount(item.openAtStichtag, currency)}
          </span>
        ) : (
          <AmountCell value={item.openAtStichtag} currency={currency} />
        )}
      </span>
    </>
  );
}

/**
 * The age class as a heading over its items — count **and** sum, because a
 * class without its sum answers „how many" and not „how much".
 *
 * @when    Grouped open items: one heading per class above its rows.
 * @instead One item → OpenItemRow.
 */
export function OpenItemAgeGroup({
  group,
  currency = "EUR",
}: {
  group: OpenItemAgeGroupVM;
  currency?: Currency;
}) {
  return (
    <GroupRow>
      <span className="v2oi__group">
        <span>{AGE_BUCKET_LABEL[group.bucket]}</span>
        <span className="v2oi__groupnum">
          {group.count} {group.count === 1 ? "Posten" : "Posten"} ·{" "}
          {formatAmount(group.sum, group.currency ?? currency)}
        </span>
      </span>
    </GroupRow>
  );
}
