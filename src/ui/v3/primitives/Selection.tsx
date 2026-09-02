"use client";

import type { ReactNode } from "react";
import { TextButton } from "./TextButton";

/**
 * Mehrfachauswahl in einer Tabelle (F123 T123.1): Kästchen in der Zeile,
 * Leiste über dem Spaltenkopf. Zusammen mit `ClickRow` aus `./ExpandableRow`.
 */

/**
 * Auswahl-Leiste über dem Spaltenkopf — innerhalb der Karte, nicht im
 * Seitenkopf (Baukasten §4). Erscheint erst, wenn etwas ausgewählt ist.
 *
 * @when    Actions on several selected rows at once.
 * @instead Action on exactly one row → RowActions.
 */
export function SelectionBar({
  count,
  actions,
  onClear,
}: {
  count: number;
  actions: ReactNode;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="v2selbar">
      <span className="v2selbar__count">{count} ausgewählt</span>
      <span className="v2selbar__actions">
        {actions}
        <TextButton tone="quiet" onClick={onClear}>
          Auswahl aufheben
        </TextButton>
      </span>
    </div>
  );
}

/**
 * Auswahl-Kästchen als erste Zelle einer Zeile.
 *
 * @when    First cell of every selectable row, together with SelectionBar.
 */
export function SelectCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      className="v2check"
      checked={checked}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
