"use client";

import { useState, type ReactNode } from "react";

import { ActionIcon } from "../Icons";
import { AXIS_LABEL } from "./entity-icons";
import { StatusInfoDialog } from "./StatusInfoDialog";
import type { StatusAxis } from "@/ludwig/ui/status/status-registry";

interface StatusInfoButtonProps {
  axis: StatusAxis;
  /** Aktueller DB-Wert — im Dialog hervorgehoben. */
  current?: string | null;
  /**
   * The trigger itself, in place of the (i): then **the chip** is what opens
   * the dialog (0150).
   *
   * Hit area and expectation are the reason. A 24 x 24 (i) beside a chip that
   * looks clickable is the smaller of two targets, and whoever clicks the
   * state wants to know what it means, not nothing. Where room and quiet
   * matter — a list cell, a column head — the (i) stays.
   */
  children?: ReactNode;
}

/**
 * Das (i) neben einem Status-Chip: öffnet den gemeinsamen `StatusInfoDialog`
 * mit allen Ausprägungen dieser Achse. Winziges Client-Island, damit
 * `StatusBadge` eine Server-Komponente bleiben kann.
 *
 * @when    „What can this status be?" — as the (i) beside the status, or with
 *          `children` as the chip itself.
 * @instead The legend without a trigger → StatusInfoDialog. Help on a field
 *          → Field `hint`. A whole page of explanation → ProseCard.
 */
export function StatusInfoButton({ axis, current, children }: StatusInfoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={children ? "v2sinfo v2sinfo--wrap" : "v2sinfo"}
        aria-label={`${AXIS_LABEL[axis]}: Zustände erklären`}
        title={`${AXIS_LABEL[axis]}: Zustände erklären`}
        onClick={(e) => {
          // The chip often sits in a clickable row — the info opens the
          // dialog, it does not follow the row.
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children ?? <ActionIcon action="info" size={12} />}
      </button>
      <StatusInfoDialog axis={axis} current={current} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
