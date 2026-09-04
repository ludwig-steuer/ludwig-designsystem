"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

/**
 * Die Client-Zwillinge von `Row` (F123 T123.1).
 *
 * `Row` und `Table` aus `./Table` sind Server-Components ohne `onClick` —
 * bewusst. Wo eine Zeile wirklich interaktiv ist (Ausklappen, Master-Detail-
 * Klick), steht sie hier; die Mehrfachauswahl steht in `./Selection`.
 */

/**
 * Zeile mit `onClick` statt `href`. Ansonsten identisch zu `Row`.
 *
 * @when    The click does something client-side, such as selecting in MasterDetail.
 * @instead The target is a URL → Row with `href`.
 */
export function ClickRow({
  onClick,
  active,
  children,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`v2tbl__row is-clickable${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * Zeile, die sich in die Tabelle hinein aufklappt — kein Modal, kein Drawer
 * für kleine Zusatzinfos (Baukasten §7).
 *
 * @when    A small extra detail for a row that is read and collapsed again.
 * @instead Working on the item → MasterDetail. Confirmation with consequences → Dialog.
 */
export function ExpandableRow({
  summary,
  children,
  lead,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  /**
   * Cells **before** the chevron — the selection checkbox, which comes first
   * in the column order (0057, Zone 3). It stands outside `summary` because
   * the chevron owns its own grid column between the two.
   */
  lead?: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={id}
        className="v2tbl__row is-clickable"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {lead}
        <span className={`v2chev${open ? " is-open" : ""}`} />
        {summary}
      </div>
      {open ? (
        <div className="v2tbl__detail" id={id}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
