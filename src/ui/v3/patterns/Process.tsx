import { Link } from "../primitives/Link";
import type { ReactNode } from "react";
import {
  Bot,
  Building2,
  Database,
  Hourglass,
  Minus,
  Share2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/**
 * The process picture of a batch — **one** component in three sizes
 * (F119 §3, F114 §1.1).
 *
 * Ten states are too many dots for the clerk. The same picture of four phases
 * with a baton everywhere; the raw state sits below it as a sub-line wherever
 * there is room.
 *
 *  - `ProcessMini` in the list row — four segments, the active one filled.
 *  - `ProcessStepper` in the detail header — with raw states, owner, loops.
 *  - `BatonBar` in the log — the timeline, colored by owner.
 *
 * The **baton** is icon *and* word, never color alone: „Kanzlei" as a blue
 * dot is unreadable for anyone who does not know the legend.
 *
 * **Red only** on `failed` and on „überfällig". Everything else stays
 * neutral — otherwise the color goes dull and the one case that is burning
 * does not stand out.
 *
 * The component **derives nothing**: phases and owner arrive ready-made as
 * props from `modules/datev-export/domain/batch-process.ts`. `@/ui` imports no
 * feature module (`web-ui-offen.md` P20 B1) — and a primitive that brings its
 * own domain logic is no longer a primitive.
 */

export type ProcessPhaseStatus = "done" | "active" | "pending" | "failed";

export interface ProcessPhase {
  key: string;
  /** „Buchen", „Prüfen", … */
  label: string;
  /** Who works in this phase. */
  sub: string;
  /** The raw states behind it — the sub-line in the stepper. */
  states: readonly string[];
  status: ProcessPhaseStatus;
}

export type BatonKey =
  | "agent"
  | "bereit"
  | "mandant"
  | "kanzlei"
  | "bridge"
  | "datev"
  | "spiegel"
  | "niemand";

export interface BatonMeta {
  key: BatonKey;
  label: string;
  /** CSS variable, never a hex literal. */
  color: string;
}

const OWNER_ICON: Record<BatonKey, LucideIcon> = {
  agent: Bot,
  bereit: Hourglass,
  mandant: UserRound,
  kanzlei: Building2,
  bridge: Share2,
  datev: Database,
  spiegel: Database,
  niemand: Minus,
};

/**
 * Four segments for the list row.
 *
 * @when    Process state in the list row.
 * @instead The whole run with its phases → Process. One phase as a
 *          state → StatusBadge on the axis `lauf`.
 */
export function ProcessMini({ phases }: { phases: readonly ProcessPhase[] }) {
  return (
    <span className="pz-mini" title={phases.map((p) => p.label).join(" → ")}>
      {phases.map((p) => (
        <span key={p.key} className={p.status === "pending" ? undefined : `is-${p.status}`} />
      ))}
    </span>
  );
}

/**
 * Who currently holds the batch. `alarm` colors it red — there are exactly two
 * reasons for that: an overdue follow-up request and a failed export.
 *
 * @when    Who currently holds the batch — icon and word.
 * @instead Entity status → StatusBadge.
 */
export function Baton({
  owner,
  alarm = false,
  detail,
  size = 13,
}: {
  owner: BatonMeta;
  alarm?: boolean;
  /** Addition after the word, e.g. „Durchgang 3 läuft seit 14 Min." */
  detail?: ReactNode;
  size?: number;
}) {
  const Icon = OWNER_ICON[owner.key];
  return (
    <span className={`pz-owner${alarm ? " is-alarm" : ""}`}>
      <Icon size={size} strokeWidth={1.75} style={alarm ? undefined : { color: owner.color }} />
      <span>
        {owner.label}
        {detail ? <> · {detail}</> : null}
      </span>
    </span>
  );
}

export interface ProcessLoops {
  /** How often the practice has sent it back. */
  returned: number;
  /** How often an incoming document has woken the batch. */
  reopened: number;
}

/**
 * The stepper in the detail header. Loops are counted and link into the log —
 * a batch that went back four times looks different from one that ran
 * straight through.
 *
 * @when    Process state in the detail header with raw states and loops.
 * @instead Steps of a review → StepRail. Which ways exist between the
 *          states — the map instead of the position → StateMachine (Z7).
 */
export function ProcessStepper({
  phases,
  owner,
  alarm = false,
  loops,
  logHref,
  phaseSince,
}: {
  phases: readonly ProcessPhase[];
  owner: BatonMeta;
  alarm?: boolean;
  loops?: ProcessLoops;
  logHref?: string;
  /** Phase key → time of entry (already formatted). */
  phaseSince?: Partial<Record<string, string>>;
}) {
  const parts = [
    loops?.returned ? `↺ ${loops.returned}× zurück an den Agenten` : null,
    loops?.reopened ? `↺ ${loops.reopened}× neuer Beleg` : null,
  ].filter(Boolean);

  return (
    <div>
      <div className="pz-stepper">
        {phases.map((p) => (
          <div key={p.key} className={p.status === "pending" ? undefined : `is-${p.status}`}>
            <div className="phase">{p.label}</div>
            <div className="who">{p.sub}</div>
            <div className="raw">{p.states.join(" · ")}</div>
            {p.status === "active" || p.status === "failed" ? (
              <div className="now">
                <Baton owner={owner} alarm={alarm} />
              </div>
            ) : p.status === "done" && phaseSince?.[p.key] ? (
              <div className="who">seit {phaseSince[p.key]}</div>
            ) : null}
          </div>
        ))}
      </div>
      {parts.length > 0 ? (
        <div className="pz-loops">
          {logHref ? <Link href={logHref}>{parts.join(" · ")}</Link> : parts.join(" · ")}
        </div>
      ) : null}
    </div>
  );
}

export interface BatonSegment {
  owner: BatonMeta;
  /** Share of the total duration (0…1). */
  share: number;
  /** Tooltip: owner, from–to, duration. */
  title: string;
}

/**
 * The baton bar above the log: the timeline from opening until now, each
 * section colored by owner.
 *
 * This is the one glance that answers „warum hat der August drei Wochen
 * gedauert?" — two days agent, nine days waiting for the client, one day
 * practice.
 *
 * @when    Timeline above the log, colored by owner.
 */
export function BatonBar({ segments }: { segments: readonly BatonSegment[] }) {
  if (segments.length === 0) return null;
  const legend = new Map<string, BatonMeta>();
  for (const a of segments) if (!legend.has(a.owner.key)) legend.set(a.owner.key, a.owner);
  return (
    <div>
      <div className="pz-staffel">
        {segments.map((a, i) => (
          <span
            key={i}
            title={a.title}
            style={{ flex: `${Math.max(a.share, 0.005)}`, background: a.owner.color }}
          />
        ))}
      </div>
      <div className="pz-staffel-legend">
        {[...legend.values()].map((o) => (
          <span key={o.key}>
            <i style={{ background: o.color }} />
            {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}
