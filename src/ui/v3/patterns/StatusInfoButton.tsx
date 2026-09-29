"use client";

import { useState, type ReactNode } from "react";

import { ActionIcon } from "../Icons";
import { AXIS_LABEL } from "./entity-icons";
import { StatusInfoDialog } from "./StatusInfoDialog";
import { axisLegend, type StatusAxis } from "@/ludwig/ui/status/status-registry";
import { Badge } from "../primitives/Badge";
import { Dialog } from "../primitives/Dialog";

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
 * The (i) next to a status chip: opens the shared `StatusInfoDialog` with all
 * values of the axis. A tiny client island, so `StatusBadge` stays a server
 * component.
 *
 * @when    "What can this status be?" — as the (i) beside the status, or with
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

/**
 * A column whose values come from **more than one** axis — the booking state
 * of an account movement shows the entry's state, „übergeben" from the way to
 * DATEV and „Mandantenstapel" from the origin (0211, acceptance hint). One
 * legend, the parts in order, every word and meaning from the registry; no
 * word of its own.
 */
export interface StatusLegendPart {
  axis: StatusAxis;
  /** Only these values of the axis, in this order; without it all of them. */
  only?: readonly string[];
}

/**
 * @when    The (i) at the head of a column that mixes values of several axes.
 * @instead A column of one axis → StatusInfoButton (with its diagram).
 */
export function StatusLegendButton({ title, parts }: { title: string; parts: readonly StatusLegendPart[] }) {
  const [open, setOpen] = useState(false);
  const items = parts.flatMap((p) => axisLegend(p.axis, p.only).map((it) => ({ ...it, axis: p.axis })));
  return (
    <>
      <button
        type="button"
        className="v2sinfo"
        aria-label={`${title}: Zustände erklären`}
        title={`${title}: Zustände erklären`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <ActionIcon action="info" size={12} />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title} size="md">
        <div className="v3stlegend">
          {items.map((it) => (
            <div key={`${it.axis}:${it.value}`} className="v3stlegend__row">
              <div>
                <Badge tone={it.kind}>{it.label}</Badge>
              </div>
              <div className="v3stlegend__text">
                {it.meaning || <span className="v3stlegend__muted">—</span>}
                <div className="v3stlegend__tech">
                  Technisch: <code>{`${it.axis} · ${it.value}`}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
}
