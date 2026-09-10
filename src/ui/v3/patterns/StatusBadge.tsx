import { Badge } from "../primitives/Badge";
import { ActionIcon, EntityIcon } from "../Icons";
import { AXIS_ENTITY, AXIS_LABEL } from "./entity-icons";
import { StatusInfoButton } from "./StatusInfoButton";
import { resolveStage, resolveStatus, type StatusAxis } from "@/ludwig/ui/status/status-registry";

export interface StatusBadgeProps {
  /** Which status axis — decides label, colour and explanation. */
  axis: StatusAxis;
  status: string | null | undefined;
  /** Only `beleg`: the pipeline stage reached (`processing_stage`) as detail. */
  stage?: string | null;
  /** Show the icon if the axis has one (default true). */
  showIcon?: boolean;
  /**
   * (i) next to the chip: opens the shared `StatusInfoDialog` with ALL values
   * of the axis. On by default; switch off where the chip itself is clickable
   * (e.g. `EntityStatusBadgeButton`).
   */
  info?: boolean;
  /**
   * A chevron behind the label, for a chip that opens a menu of follow-up
   * states (0049). Markup only — the `aria-haspopup`/`aria-expanded`
   * relation belongs on the trigger, and `Popover` already sets it there.
   */
  chevron?: boolean;
  /**
   * Free text of this one record, appended to the tooltip — a completion's
   * reason (`completed_reason`), a replacement's note. It belongs to the record,
   * not the state, and never replaces the word on the badge (V7).
   */
  note?: string | null;
  className?: string;
}

/**
 * The app's status chip. Label, colour and explanation come from the registry
 * (`status-registry.ts`), so the same state looks the same everywhere.
 *
 * Three levels of explanation: the label, the hover (`title`: axis, state,
 * meaning — no client JS), and the (i) with every value of the axis. The chip
 * stays server-renderable; only the (i) is a client island.
 *
 * @when    A state from a status axis (beleg, sachverhalt, buchung, job …). The
 *          one allowed status display (R1).
 * @instead A property without an axis — kind, role, counter → Badge.
 *          A state with an explanation and an action → StatusCallout.
 */
export function StatusBadge({
  axis,
  status,
  stage,
  showIcon = true,
  info = true,
  chevron = false,
  note,
  className,
}: StatusBadgeProps) {
  const desc = resolveStatus(axis, status);
  const stageDesc = axis === "beleg" ? resolveStage(stage) : null;
  const entity = AXIS_ENTITY[axis];
  const raw = typeof status === "string" ? status.trim() : "";
  const title = [
    `${AXIS_LABEL[axis]}: ${desc.label}`,
    stageDesc ? `Stufe: ${stageDesc.label}` : null,
    desc.description ?? null,
    note ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      title={title}
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <Badge tone={desc.kind}>
        {showIcon && entity ? (
          <span style={{ display: "inline-flex", marginRight: 4 }}>
            <EntityIcon entity={entity} size={12} />
          </span>
        ) : null}
        {desc.label}
        {chevron ? (
          <span style={{ display: "inline-flex", marginLeft: 3 }}>
            <ActionIcon action="expand" size={12} />
          </span>
        ) : null}
      </Badge>
      {stageDesc ? (
        <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
          · {stageDesc.label}
        </span>
      ) : null}
      {info ? <StatusInfoButton axis={axis} current={raw || null} /> : null}
    </span>
  );
}
