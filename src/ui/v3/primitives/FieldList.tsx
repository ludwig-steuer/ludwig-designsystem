import type { ReactNode } from "react";

/**
 * Label/value pairs in a card. `tone="soft"` tints the surface — the design
 * uses it to set the DATEV side apart from the Ludwig side without a second
 * heading. `tone="bare"` drops surface, border and padding, for drawers and
 * details where a card already surrounds the list (0006). Without `title`
 * there is no header row.
 *
 * `split` sets the pairs in two columns once each gets 300 px (CSS columns,
 * measured on the list, not the window): at full width a label on the far left
 * and its value on the far right are no longer a pair.
 *
 * `layout="row"` turns the pairs sideways (0049): label above value, pairs
 * next to each other — the facts line of a detail head.
 *
 * @when    Master data and properties of an item, read-only — in a card
 *          (`surface`/`soft`) or free-standing inside one (`bare`).
 * @instead Values that get edited → Field. Many records of the same kind → Table.
 */
export function FieldList({
  title,
  rows,
  tone = "surface",
  layout = "stack",
  split = false,
  empty,
}: {
  /** Without a title there is no header row — and no gap where it would be. */
  title?: string;
  rows: [ReactNode, ReactNode][];
  tone?: "surface" | "soft" | "bare";
  /** `row` puts the pairs next to each other, label above value (0049). */
  layout?: "stack" | "row";
  /**
   * Two columns of pairs from ~640 px of **list** width on. Off by default:
   * the same list stands in drawers and side columns, and there two columns
   * would be two narrow ones.
   */
  split?: boolean;
  empty?: string;
}) {
  return (
    <div
      className={`v2fields${tone === "surface" ? "" : ` v2fields--${tone}`}${
        layout === "row" ? " v2fields--cols" : ""
      }${split ? " v2fields--split" : ""}`}
    >
      {title ? <div className="v2fields__h">{title}</div> : null}
      {rows.length === 0 ? (
        <div className="v2fields__empty">{empty ?? "Keine Angaben."}</div>
      ) : (
        rows.map(([label, value], i) => (
          <div className="v2fields__row" key={i}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))
      )}
    </div>
  );
}
