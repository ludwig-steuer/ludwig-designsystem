import type { ReactNode } from "react";

import type { InvoiceLineItem } from "@/ludwig/modules/invoices/domain/invoice";
import { confidenceLevel } from "@/ludwig/shared/confidence";

import { Badge } from "../../primitives/Badge";
import { AmountCell } from "../../primitives/Cells";
import { ExpandableRow } from "../../primitives/ExpandableRow";
import { LongText } from "../../primitives/LongText";
import { Row } from "../../primitives/Table";
import { Confidence } from "../../patterns/Confidence";
import { formatAmount } from "../../format";
import { lineLabel, lineTitle, type InvoiceLineLabels } from "./invoice-line";

/**
 * The tracks of the row, and the same ones for the head of the list: six data
 * columns. Whoever renders the expander adds `--v2-tbl-pick` in front — the
 * chevron owns its own column, and without an expander there is nothing to
 * put in it.
 */
export const invoiceLineTracks =
  "56px minmax(0, 1fr) 110px 120px 84px 132px";

/** The same tracks with the chevron column in front. */
export const invoiceLineTracksExpandable = `var(--v2-tbl-pick) ${invoiceLineTracks}`;

/** How much the six columns need before they start to squeeze each other. */
export const invoiceLineMinWidth = 760;

type Props = {
  line: InvoiceLineItem;
  labels: InvoiceLineLabels;
  /** Controlled from the list, which opens every row at once. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What stands in the expander. Without it the row has no expander at all. */
  children?: ReactNode;
};

/**
 * One position of an invoice: what was delivered, how much of it, at what
 * price — and **how Ludwig classified it**. The classification is part of the
 * row, not of the expander: whoever checks a booking proposal is looking for
 * the one line that sits wrong, and cannot open twenty-two of them.
 *
 * All amounts are EUR. The `*_value` columns are already converted (GLOSSARY
 * *Transaction currency*) and `InvoiceLineItem` has no currency column; the
 * foreign-currency mirror belongs to `InvoiceLineFacts`.
 *
 * The row shows **no discount column**: `line_discount_value` is empty in 726
 * of 726 lines (L-201), and the head in the app prints an em dash in every
 * single row.
 *
 * @when    One invoice line in a table — the list of an invoice.
 * @instead Its reasoning and its VAT details → InvoiceLineFacts. The whole
 *          list with its head, switch and sum → InvoiceLineList.
 */
export function InvoiceLineRow({ line, labels, open, onOpenChange, children }: Props) {
  // Without a name the title is the first line of the description — then that
  // line must not stand twice (acceptance of 0072, M6).
  const rest = line.itemName
    ? line.productDescription
    : line.productDescription?.split("\n").slice(1).join(" ").trim() || null;

  const summary = (
    <>
      <span className="v2ilrow__pos">#{line.position}</span>
      <span>
        <span className="v2ilrow__name">{lineTitle(line)}</span>
        {rest ? (
          <span className="v2ilrow__desc">
            <LongText max={81}>{rest}</LongText>
          </span>
        ) : null}
        <Strip line={line} labels={labels} />
      </span>
      <span className="v2num">
        {line.quantity === null ? (
          <span className="v2muted">—</span>
        ) : (
          <>
            {formatAmount(line.quantity, null)}
            {line.unit ? ` ${line.unit}` : ""}
          </>
        )}
      </span>
      <AmountCell value={line.unitPriceValue} />
      <span className="v2num">
        {line.taxRatePercent === null ? (
          <span className="v2muted">—</span>
        ) : (
          `${line.taxRatePercent} %`
        )}
      </span>
      {/* The wrapper carries the emphasis, so it has to carry the alignment
          too: `.v2tbl :is(th,td) > .v2num` only reaches a direct child, and an
          `AmountCell` inside a span quietly loses its right edge (found in the
          acceptance of 0072, measured 81 px of slack). */}
      <span className="v2ilrow__total">
        <AmountCell value={line.lineTotalNetValue} />
      </span>
    </>
  );

  // The row is dimmed through the word, not next to it: `.v2ilrow__off` is
  // the badge that says „deaktiviert", and the CSS dims the row that contains
  // it (`:has`). So there is no dimmed row without the word (V7), and the two
  // cannot drift apart — `ExpandableRow` takes no class of its own.
  if (!children) {
    return <Row>{summary}</Row>;
  }
  return (
    <ExpandableRow summary={summary} open={open} onOpenChange={onOpenChange}>
      {children}
    </ExpandableRow>
  );
}

/**
 * The third line of the name cell: what Ludwig made of the position.
 *
 * Two of them stand **always** — the fund usage and the confidence, because
 * that is where they stand in the app today, in the compact row, and that is
 * the strongest evidence a rank can have. The other four appear only where
 * they deviate from the normal case; a badge on 98 % of all rows says nothing.
 *
 * None of the four value ranges has a registry axis (L-99), so these are plain
 * `Badge`s with a word, not `StatusBadge`s with a colour.
 */
function Strip({ line, labels }: { line: InvoiceLineItem; labels: InvoiceLineLabels }) {
  const nature = lineLabel(labels.fundUsageNature, line.fundUsageNature);
  const source = line.source === "extracted" ? null : lineLabel(labels.source, line.source);
  const special =
    line.vatSpecialCase === "none" ? null : lineLabel(labels.vatSpecialCase, line.vatSpecialCase);
  const kind =
    line.lineSpecialType === "none"
      ? null
      : lineLabel(labels.lineSpecialType, line.lineSpecialType);

  return (
    <span className="v2ilrow__strip">
      {nature ? <Badge>{nature}</Badge> : null}
      <Confidence
        level={confidenceLevel(line.fundUsageConfidence)}
        value={line.fundUsageConfidence ?? undefined}
      />
      {source ? <Badge tone="info">{source}</Badge> : null}
      {line.disabled ? <Badge tone="warning" className="v2ilrow__off">deaktiviert</Badge> : null}
      {special ? <Badge tone="info">{special}</Badge> : null}
      {kind ? <Badge>{kind}</Badge> : null}
    </span>
  );
}
