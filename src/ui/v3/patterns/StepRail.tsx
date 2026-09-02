import { Link } from "../primitives/Link";
import type { ReactNode } from "react";

/**
 * Frame building blocks (F123 T123.2): step rail, screen header,
 * progress bar, too-small lock.
 *
 * Generic: the rail knows nothing about batch review, it knows rows with a
 * tone and a counter. What is counted is computed by the caller.
 */

export type RailTone = "neutral" | "open" | "done" | "blocked" | "dimmed";

export interface RailItem {
  key: string;
  /** The number in front of the label — at the same time the jump key. */
  index: number;
  label: string;
  sub: string;
  tone: RailTone;
  /** „3 von 18 offen", „bereit" — `null` where there is nothing to count. */
  counterText: string | null;
  href: string | null;
  /** Why the row is not clickable. Required when `href === null`. */
  disabledReason?: string;
  current?: boolean;
}

/**
 * The rail is a **suggestion, not a constraint**: every reachable step is
 * clickable at any time. The dot on the left carries the traffic light, the
 * counter below it says how much is waiting there — both together, because
 * color alone is not a signal (UX-Guidelines V7).
 *
 * @when    Multi-step review with a traffic light and counter per step, on the left.
 * @instead Two to four views → Tabs. Process phases of a batch → ProcessStepper.
 */
export function StepRail({
  items,
  head,
  foot,
  ariaLabel,
}: {
  items: RailItem[];
  head?: ReactNode;
  foot?: ReactNode;
  ariaLabel: string;
}) {
  return (
    <nav className="abn__rail" aria-label={ariaLabel}>
      {head}
      {items.map((it) => (
        <RailRow key={it.key} item={it} />
      ))}
      {foot}
    </nav>
  );
}

function RailRow({ item }: { item: RailItem }) {
  const cls =
    `abn__step abn__step--${item.tone}` +
    (item.current ? " is-current" : "") +
    (item.tone === "dimmed" ? " is-dimmed" : "");
  const inner = (
    <>
      <span className="dot" />
      <span style={{ minWidth: 0 }}>
        <span className="label">
          {item.index} · {item.label}
        </span>
        <span className="question">{item.sub}</span>
        {item.counterText ? <span className="count">{item.counterText}</span> : null}
      </span>
    </>
  );
  if (item.href === null) {
    return (
      <span className={cls} title={item.disabledReason}>
        {inner}
      </span>
    );
  }
  return (
    <Link className={cls} href={item.href} aria-current={item.current ? "step" : undefined}>
      {inner}
    </Link>
  );
}

/**
 * The header of a step: overline, title, lead — and on the right the way
 * forward and back. The number belongs in the overline, not in the title:
 * „Vollständigkeit" answers „wo bin ich?", „1 · Vollständigkeit" is a
 * header line.
 *
 * @when    Header of every step in the rail: overline, title, lead, way forward and back.
 */
export function StepHeader({
  overline,
  title,
  lead,
  prevHref,
  nextHref,
  nextLabel,
  actions,
}: {
  overline: string;
  title: string;
  lead?: string;
  prevHref?: string | null;
  nextHref?: string | null;
  /** „Weiter zu Schritt 5" — where it leads, not merely „Weiter". */
  nextLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="abn__screenhead">
      <div className="abn__screenhead__row">
        <div style={{ minWidth: 0 }}>
          <div className="lw-overline">{overline}</div>
          <h1>{title}</h1>
        </div>
        {/* Forward is the action, backward the way out: „Weiter" carries the
            primary color and says where it leads; „Zurück" stays a plain
            secondary button with no destination in its text. */}
        <div className="abn__screenhead__nav">
          {actions}
          {prevHref ? (
            <Link className="v2btn v2btn--secondary v2btn--sm" href={prevHref}>
              ← Zurück
            </Link>
          ) : (
            <span className="v2btn v2btn--secondary v2btn--sm" aria-disabled style={{ opacity: 0.4 }}>
              ← Zurück
            </span>
          )}
          {nextHref ? (
            <Link className="v2btn v2btn--primary v2btn--sm" href={nextHref}>
              {nextLabel ?? "Weiter"} →
            </Link>
          ) : (
            <span className="v2btn v2btn--primary v2btn--sm" aria-disabled style={{ opacity: 0.4 }}>
              {nextLabel ?? "Weiter"} →
            </span>
          )}
        </div>
      </div>
      {lead ? <p className="abn__screenhead__lead">{lead}</p> : null}
    </div>
  );
}

/**
 * „41 von 118 Punkten" — narrow bar across all steps.
 *
 * @when    Progress of a step in the header, number plus bar.
 */
export function ProgressBar({
  done,
  total,
  label = "Punkte",
}: {
  done: number;
  total: number;
  label?: string;
}) {
  if (total === 0) return null;
  const pct = Math.max(0, Math.min(1, done / total));
  return (
    <div className="abn__progress" title={`${done} von ${total} ${label} erledigt`}>
      <span className="abn__progress__text">
        {done} von {total} {label}
      </span>
      <span className="v2bar" style={{ width: 120 }}>
        <span className="v2bar__fill" style={{ width: `${pct * 100}%` }} />
      </span>
    </div>
  );
}
