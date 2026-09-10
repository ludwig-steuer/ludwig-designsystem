import type { OpenItemLink } from "@/ludwig/modules/datev-truth/domain/open-item";
import { asCurrency, type Currency } from "@/ludwig/shared/money";

import { Amount } from "../../primitives/Amount";
import { Badge } from "../../primitives/Badge";
import { MonoCell } from "../../primitives/Cells";
import { Row } from "../../primitives/Table";
import { Time } from "../../primitives/Time";

/**
 * The bracket „this payment settles that invoice" (0026).
 *
 * Since F77 the assignment is a table of its own; in the interface it was a
 * sentence of running text. What one cannot see there: which invoice hangs on
 * which payment, how much of it was allocated, and whether Ludwig or the
 * practice set the bracket. With a part payment and a discount that is exactly
 * the question.
 */

/** What the row needs from one side — the caller knows which journal it is. */
export interface OpenItemSide {
  /** The booking this side points at — Ludwig's or the mirror's. */
  entryId: string;
  /** What a person reads: document number, counterparty, or both. */
  label: string;
  date: string;
  amount: number;
}

/**
 * @when    An invoice and the payment that settles it, side by side — the
 *          balance tab of a case, the open-item view of an account.
 * @instead One booking on its own → JournalEntryRow. What is still open →
 *          OpenItemRow (0029). The expectation that a document will come →
 *          ExpectationRow (0025).
 */
export function OpenItemLinkRow({
  link,
  invoice,
  payment,
  currency = "EUR",
  onOpen,
}: {
  link: OpenItemLink;
  invoice: OpenItemSide;
  /**
   * No `null`: `client_open_item_links` enforces exactly one payment side. An
   * invoice without a payment is not a bracket — it is an expectation (0025)
   * or an open item (0029).
   */
  payment: OpenItemSide;
  currency?: Currency;
  /** Without it a side is text, never a button that does nothing. */
  onOpen?: (entryId: string) => void;
}) {
  const resolvedCurrency = asCurrency(currency);
  const renderSide = (s: OpenItemSide) =>
    onOpen ? (
      <button type="button" className="v2oil__side" onClick={() => onOpen(s.entryId)}>
        <span className="v2oil__label">{s.label}</span>
        <Time value={s.date} format="date" size="sm" />
      </button>
    ) : (
      <span className="v2oil__side">
        <span className="v2oil__label">{s.label}</span>
        <Time value={s.date} format="date" size="sm" />
      </span>
    );

  return (
    <Row>
      <span className="v2oil__pair">
        {renderSide(invoice)}
        {/* The arrow is a picture and carries no meaning of its own — the two
            sides and the allocated amount say it. `aria-hidden` so it is not
            read out as a word. */}
        <span className="v2oil__arrow" aria-hidden="true">
          →
        </span>
        {renderSide(payment)}
      </span>
      <span className="v2oil__doc" title={link.belegfeldValue ?? undefined}>
        <MonoCell value={link.belegfeldValue} />
      </span>
      <span className="v2num">
        <Amount value={invoice.amount} currency={resolvedCurrency} size="sm" />
      </span>
      <span className="v2num">
        <Amount value={payment.amount} currency={resolvedCurrency} size="sm" />
      </span>
      {/* The allocated amount is the point of the row: a payment may cover
          several receivables, and then it is smaller than both sides. */}
      <span className="v2num">
        <Amount value={link.amountAllocated} currency={resolvedCurrency} size="sm" />
      </span>
      <span>
        {/* `matchedBy` has no value range — the mirrored type says „match, hand,
            rule", the column is a free string, and neither registry nor label
            map knows it. So the raw value stands where there is no word, the
            way `caseKindLabel()` does it. Finding for the app. */}
        {link.matchedBy ?? <span className="v2muted">—</span>}
      </span>
      <span>
        {link.orphanedAt ? (
          // A word, not only a colour (V7). Not a `StatusBadge`: the registry
          // has no axis for this, and one state without a value range is not
          // an axis — it is a word.
          <Badge tone="warning">verwaist</Badge>
        ) : (
          <span className="v2muted">—</span>
        )}
      </span>
    </Row>
  );
}

/** The tracks of the row — the caller sets them on its `Table`. */
export const openItemLinkTracks = "minmax(0, 2fr) 140px 120px 120px 120px 120px 100px";
