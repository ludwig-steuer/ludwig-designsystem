"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import type { InvoiceLineItem } from "@/ludwig/modules/invoices/domain/invoice";

import { Amount } from "../../primitives/Amount";
import { EmptyState } from "../../primitives/EmptyState";
import { Segmented } from "../../primitives/Nav";
import { Card, CardFoot, CardHead, EmptyRow, HeadRow, Table } from "../../primitives/Table";
import { isTyping } from "../../primitives/hotkey";
import { formatCount } from "../../format";
import { InvoiceLineRow, invoiceLineMinWidth, invoiceLineTracks, invoiceLineTracksExpandable } from "./InvoiceLineRow";
import { linesNetTotal, type InvoiceLineLabels } from "./invoice-line";

type Props = {
  lines: readonly InvoiceLineItem[];
  labels: InvoiceLineLabels;
  /** Fills the expander of each row — this is where `InvoiceLineFacts` goes. */
  renderFacts?: (line: InvoiceLineItem) => ReactNode;
  /** The **net** total of the invoice (`InvoiceDetail.subtotalValue`). */
  invoiceNetTotal?: number;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

/**
 * The positions of one invoice, in the document's order.
 *
 * > When the clerk checks an account proposal, they want to see which positions
 * > the document has and how Ludwig classified each, so that they find the one
 * > line that is wrong.
 *
 * No pager, filter or loading state — measured: p50 1, p90 5, max 22 positions,
 * and the tab loads only when opened. Half of all invoices have exactly one
 * position, so the one-line and the empty case get the care.
 *
 * @when    The positions of an invoice — the tab "Positionen".
 * @instead One position → InvoiceLineRow. Its reasoning → InvoiceLineFacts.
 *          A long, sortable, filterable table → DataTable.
 */
export function InvoiceLineList({
  lines,
  labels,
  renderFacts,
  invoiceNetTotal,
  defaultExpanded = false,
  onExpandedChange,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  // The positions that deviate from what the switch last said. Whoever closes
  // one row does not move the switch: it says what was last set for all, not
  // what is true for each.
  const [deviating, setDeviating] = useState<ReadonlySet<number>>(new Set());
  const canExpand = Boolean(renderFacts) && lines.length > 0;
  // The key handler is bound once; it reads the current value from here
  // instead of closing over a stale one. The write happens **after** the
  // render, not during it — a render can be thrown away, and the handler
  // would then switch from a value that was never committed (acceptance of
  // 0115, second round).
  const expandedRef = useRef(expanded);
  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  function switchTo(next: boolean) {
    setExpanded(next);
    setDeviating(new Set());
    onExpandedChange?.(next);
  }

  function toggleRow(position: number) {
    setDeviating((set) => {
      const next = new Set(set);
      if (next.has(position)) next.delete(position);
      else next.add(position);
      return next;
    });
  }

  // Alt+E, bound by hand: `useHotkeys` drops every combination with Alt, and
  // `Segmented` has no slot for a `Kbd` — the key stands in the label instead.
  // `E`, because J and K belong to the pager.
  useEffect(() => {
    if (!canExpand) return;
    function onKey(e: KeyboardEvent) {
      if (!e.altKey || e.key.toLowerCase() !== "e") return;
      // In a text field the press is typing, not a command (V14, the shared
      // half of the rule in `primitives/hotkey.ts`). `matchesKey` cannot be
      // used here: it drops every combination with Alt.
      if (isTyping(e.target)) return;
      e.preventDefault();
      // Not inside the state updater: under StrictMode React runs it twice,
      // and the caller would hear the switch twice (acceptance of 0115, M5).
      switchTo(!expandedRef.current);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canExpand, onExpandedChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = [...lines].sort((a, b) => a.position - b.position);
  const total = linesNetTotal(sorted);
  const difference = invoiceNetTotal === undefined ? null : total - invoiceNetTotal;

  const expandable = Boolean(renderFacts) && sorted.length > 0;

  return (
    <Card className="v2illist">
      <CardHead
        title="Positionen"
        meta={
          <span className="v2muted">
            {formatCount(lines.length)} {lines.length === 1 ? "Position" : "Positionen"}
          </span>
        }
        actions={
          canExpand ? (
            <Segmented
              ariaLabel="Wie viel je Position"
              active={expanded ? "wide" : "compact"}
              options={[
                { key: "compact", label: "Kompakt" },
                { key: "wide", label: "Erweitert · Alt+E" },
              ]}
              onPick={(key) => switchTo(key === "wide")}
            />
          ) : null
        }
      />

      <Table
        cols={expandable ? invoiceLineTracksExpandable : invoiceLineTracks}
        minWidth={invoiceLineMinWidth}
        density="wide"
      >
        <HeadRow>
          {expandable ? <span /> : null}
          <span>Pos.</span>
          <span>Bezeichnung</span>
          <span className="v2num">Menge</span>
          <span className="v2num">Einzelpreis</span>
          <span className="v2num">USt-Satz</span>
          <span className="v2num">Netto-Summe</span>
        </HeadRow>
        {sorted.length === 0 ? (
          <EmptyRow>
            <EmptyState
              title="Für diesen Beleg wurden keine Positionen erkannt."
              description="Das ist kein Erfolg, sondern selten und meist ein Problem der Extraktion: 4 von 318 Rechnungen im Bestand. Der Beleg lässt sich erneut lesen."
            />
          </EmptyRow>
        ) : (
          sorted.map((line) => (
            // `position` is the key: `InvoiceLineItem` has no id, and the
            // column is unique per invoice.
            <InvoiceLineRow
              key={line.position}
              line={line}
              labels={labels}
              {...(renderFacts
                ? {
                    open: deviating.has(line.position) ? !expanded : expanded,
                    onOpenChange: () => toggleRow(line.position),
                  }
                : {})}
            >
              {renderFacts?.(line)}
            </InvoiceLineRow>
          ))
        )}
      </Table>

      {sorted.length > 0 ? (
        <CardFoot>
          <span className="v2muted">Summe der Positionen</span>
          <Amount value={total} currency="EUR" />
          {difference === null ? null : Math.abs(difference) < 0.005 ? (
            <span className="v2muted">stimmt mit dem Rechnungsbetrag überein</span>
          ) : (
            <span className="v2illist__off">
              weicht vom Rechnungsbetrag ab: <Amount value={difference} currency="EUR" signed />
            </span>
          )}
        </CardFoot>
      ) : null}
    </Card>
  );
}
