import type { ReactNode } from "react";

/**
 * Label/Wert-Paare in einer Karte. `tone="soft"` tönt die Fläche — das Design
 * nutzt das, um die DATEV-Seite von der Ludwig-Seite zu trennen, ohne eine
 * zweite Überschrift zu brauchen.
 *
 * `tone="bare"` stellt dieselben Zeilen frei: keine Fläche, kein Rahmen, kein
 * Innenabstand — für Drawer, Detail und Zusammenfassung, wo die Karte schon
 * um die Liste herum steht (0006). Ohne `title` entfällt die Kopfzeile.
 *
 * `layout="row"` turns the pairs sideways (0049): label above value, pairs
 * next to each other — the facts line of a detail head, where four short
 * answers have to fit on one line.
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
  empty,
}: {
  /** Without a title there is no header row — and no gap where it would be. */
  title?: string;
  rows: [ReactNode, ReactNode][];
  tone?: "surface" | "soft" | "bare";
  /** `row` puts the pairs next to each other, label above value (0049). */
  layout?: "stack" | "row";
  empty?: string;
}) {
  return (
    <div
      className={`v2fields${tone === "surface" ? "" : ` v2fields--${tone}`}${
        layout === "row" ? " v2fields--cols" : ""
      }`}
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
