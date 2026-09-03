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
 * @when    Master data and properties of an item, read-only — in a card
 *          (`surface`/`soft`) or free-standing inside one (`bare`).
 * @instead Values that get edited → Field. Many records of the same kind → Table.
 */
export function FieldList({
  title,
  rows,
  tone = "surface",
  empty,
}: {
  /** Without a title there is no header row — and no gap where it would be. */
  title?: string;
  rows: [ReactNode, ReactNode][];
  tone?: "surface" | "soft" | "bare";
  empty?: string;
}) {
  return (
    <div className={`v2fields${tone === "surface" ? "" : ` v2fields--${tone}`}`}>
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
