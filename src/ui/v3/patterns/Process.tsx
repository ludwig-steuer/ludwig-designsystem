import { ActionIcon, EntityIcon } from "../Icons";
import { Link } from "../primitives/Link";
import type { ReactNode } from "react";

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

/**
 * The sign of each baton holder — **from the registry**, not from a table of
 * its own (0088).
 *
 * Four of the eight are entities the registry already names, and two of them
 * used to carry a different sign here: „Kanzlei" stood on `Building2` (which
 * the registry gives to the business partner) and „Mandant" on `UserRound`
 * (which it gives to the user). Two pictures of the same thing in one set is
 * exactly the drift 0087 was built against.
 *
 * Four are **not** entities, and they say so:
 * - `bereit` is a wait, not a thing → the action `time`.
 * - `datev` and `spiegel` are the same system seen from two sides; the word
 *   next to the sign says which, and `datev-mirror` is the entry for both.
 * - `niemand` gets **no sign at all**. The absence of a holder has no picture,
 *   and a dash pretending to be one is worse than the word alone.
 */
function OwnerSign({ owner }: { owner: BatonMeta }) {
  switch (owner.key) {
    case "agent":
      return <ActionIcon action="agent" />;
    case "bereit":
      return <ActionIcon action="time" />;
    case "mandant":
      return <EntityIcon entity="client" />;
    case "kanzlei":
      return <EntityIcon entity="tenant" />;
    case "bridge":
      return <EntityIcon entity="bridge" />;
    case "datev":
    case "spiegel":
      return <EntityIcon entity="datev-mirror" />;
    case "niemand":
      // **No sign, but the space.** The absence of a holder has no picture;
      // an empty box in the first grid column keeps the word column straight,
      // which measured 19 px out of line before (0088 M1).
      return <span aria-hidden="true" />;
  }
}


/** Nodes with a separator between them — `Array.join` only works on strings. */
function joined(parts: ReactNode[]): ReactNode {
  return parts.map((p, i) => (
    <span key={i}>
      {i > 0 ? " · " : null}
      {p}
    </span>
  ));
}

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
}: {
  owner: BatonMeta;
  alarm?: boolean;
  /** Addition after the word, e.g. „Durchgang 3 läuft seit 14 Min." */
  detail?: ReactNode;
  // No `size` any more (0088 c): it was a free number defaulting to 13, and
  // 13 is not on the ladder. The sign takes 14 from `EntityIcon`, like every
  // other sign in the set.
}) {
  return (
    // The colour rides on the wrapper, not on the sign: `EntityIcon` draws in
    // `currentColor` and takes no `color` prop — that is how `StatusBadge` has
    // done it since 0087, and it is why the registry can stay closed.
    <span
      className={`pz-owner${alarm ? " is-alarm" : ""}`}
      style={alarm ? undefined : { color: owner.color }}
    >
      <OwnerSign owner={owner} />
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
  // The sign is a Lucide one, not „↺" (T9, 0093 c): a text character is read
  // aloud as „anticlockwise open circle arrow" and scales with the font
  // instead of with the icon ladder.
  const parts: ReactNode[] = [
    loops?.returned ? (
      <span className="pz-loop" key="returned">
        <ActionIcon action="retry" size={12} />
        {loops.returned}× zurück an den Agenten
      </span>
    ) : null,
    loops?.reopened ? (
      <span className="pz-loop" key="reopened">
        <ActionIcon action="retry" size={12} />
        {loops.reopened}× neuer Beleg
      </span>
    ) : null,
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
          {/* `join` ginge nicht mehr: die Teile sind Knoten, keine Strings —
              das ist der Preis dafür, dass das Zeichen ein Zeichen ist. */}
          {logHref ? <Link href={logHref}>{joined(parts)}</Link> : joined(parts)}
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
 * @instead One holder as a word with its sign → Baton. The phases of a
 *          run → Process.
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
