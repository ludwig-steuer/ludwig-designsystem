"use client";

import { Badge } from "../primitives/Badge";
import { Dialog } from "../primitives/Dialog";
import { AXIS_LABEL, AXIS_SOURCE } from "./entity-icons";
import { axisLegend, type StatusAxis } from "@/ludwig/ui/status/status-registry";

interface StatusInfoDialogProps {
  axis: StatusAxis;
  /** Aktueller DB-Wert — wird in der Liste hervorgehoben. */
  current?: string | null;
  open: boolean;
  onClose: () => void;
}

/**
 * DER Status-Dialog — einer für alle Achsen. Erklärt, was für ein Status das
 * ist (Achse + technische Herkunft) und listet **alle** Ausprägungen mit
 * Badge, Klartext, DB-Wert und Bedeutung. Der aktuell angezeigte Wert ist
 * hervorgehoben.
 *
 * Inhalt kommt vollständig aus `status-registry.ts` — hier steht kein
 * einziger Statustext. Eine neue Ausprägung in der Registry erscheint
 * automatisch, ohne dass jemand diese Datei anfassen muss.
 *
 * @when    All values of one status axis explained, with badge and DB value.
 * @instead One status as a chip → StatusBadge. The (i) that opens this →
 *          StatusInfoButton. Any other confirmation → Dialog.
 *          The same axis as a **picture**, with its transitions → StateMachine.
 */
export function StatusInfoDialog({ axis, current, open, onClose }: StatusInfoDialogProps) {
  const items = axisLegend(axis);

  return (
    <Dialog open={open} onClose={onClose} title={AXIS_LABEL[axis]} size="md">
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", lineHeight: 1.45 }}>
          Woher der Wert kommt:{" "}
          <code style={{ fontSize: 11.5, opacity: 0.9 }}>{AXIS_SOURCE[axis]}</code>
        </div>

        <div style={{ display: "grid", gap: 2 }}>
          {items.map((it) => {
            const active = current != null && it.value === current;
            return (
              <div
                key={it.value}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, auto) 1fr",
                  gap: 12,
                  alignItems: "baseline",
                  padding: "9px 11px",
                  borderRadius: 8,
                  background: active ? "var(--color-surface-raised, rgba(127,127,127,0.09))" : "transparent",
                  outline: active ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div style={{ display: "grid", gap: 3, justifyItems: "start" }}>
                  <Badge tone={it.kind}>{it.label}</Badge>
                  <code style={{ fontSize: 11, color: "var(--color-text-muted)", opacity: 0.75 }}>
                    {it.value}
                  </code>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
                  {it.meaning || <span style={{ color: "var(--color-text-muted)" }}>—</span>}
                  {active ? (
                    <span style={{ marginLeft: 6, fontSize: 11.5, color: "var(--color-text-muted)" }}>
                      · aktuell
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
