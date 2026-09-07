"use client";

import { type ReactNode } from "react";
import { useId, useState } from "react";
import { ActionIcon } from "../Icons";
import { rowCells } from "./Table";

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
 * Der Knopf sitzt in der **ersten Zelle** und deckt die Zeile über
 * `.v2rowbtn::after` ab. Vorher trug die Zeile selbst `role="button"` — das
 * ging nur, solange sie ein `<div>` war; ein `<tr>` kann keine Schaltfläche
 * sein, und eine Zeile, die eine Schaltfläche ist, ist für eine Vorlesehilfe
 * keine Zeile mehr (0106).
 *
 * @when    The click does something client-side, such as selecting in MasterDetail.
 * @instead The target is a URL → Row with `href`.
 */
export function ClickRow({
  onClick,
  active,
  children,
  label,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  /** What the button is called when the first cell has no text of its own. */
  label?: string;
  className?: string;
}) {
  return (
    <tr
      className={`v2tbl__row is-clickable${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
    >
      {rowCells(children, (node) => (
        <button type="button" className="v2rowbtn" onClick={onClick} aria-label={label}>
          {node}
        </button>
      ))}
    </tr>
  );
}

/**
 * Zeile, die sich in die Tabelle hinein aufklappt — kein Modal, kein Drawer
 * für kleine Zusatzinfos (Baukasten §7).
 *
 * @when    A small extra detail for a row that is read and collapsed again —
 *          on its own (`defaultOpen`) or steered from the list
 *          (`open`/`onOpenChange`).
 * @instead Working on the item → MasterDetail. Confirmation with consequences → Dialog.
 */
export function ExpandableRow({
  summary,
  children,
  lead,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
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
  /**
   * Controlled: the list decides, not the row. A list with a switch that
   * opens **every** row at once cannot do that through `defaultOpen` — the
   * rows are already mounted (0072). Without it the row keeps its own state.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const open = openProp ?? ownOpen;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };
  const id = useId();
  return (
    <>
      <tr className="v2tbl__row is-clickable">
        {rowCells(lead)}
        <td className="v2tbl__chev">
          {/* The chevron is the button, and it covers the row. It carries no
              text of its own, so it says what it does. */}
          <button
            type="button"
            className="v2rowbtn"
            aria-expanded={open}
            aria-controls={id}
            aria-label={open ? "Zeile zuklappen" : "Zeile aufklappen"}
            onClick={() => setOpen(!open)}
          >
            <span className={`v2chev v2chev--icon${open ? " is-open" : ""}`}>
              <ActionIcon action="collapse" size={12} />
            </span>
          </button>
        </td>
        {rowCells(summary)}
      </tr>
      {open ? (
        <tr>
          <td className="v2tbl__detail" id={id} colSpan={999}>
            {children}
          </td>
        </tr>
      ) : null}
    </>
  );
}
