import type { ReactNode } from "react";

/**
 * Label/Wert-Paare in einer Karte. `tone="soft"` tönt die Fläche — das Design
 * nutzt das, um die DATEV-Seite von der Ludwig-Seite zu trennen, ohne eine
 * zweite Überschrift zu brauchen.
 *
 * @when    Stammdaten und Eigenschaften einer Sache, nur lesend.
 * @instead Werte, die bearbeitet werden → Field. Viele gleichartige Sätze → Table.
 */
export function FieldList({
  title,
  rows,
  tone = "surface",
  empty,
}: {
  title: string;
  rows: [ReactNode, ReactNode][];
  tone?: "surface" | "soft";
  empty?: string;
}) {
  return (
    <div className={`v2fields${tone === "soft" ? " v2fields--soft" : ""}`}>
      <div className="v2fields__h">{title}</div>
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
