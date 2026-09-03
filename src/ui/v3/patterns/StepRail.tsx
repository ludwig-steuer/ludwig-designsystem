import { ActionBar } from "../primitives/ActionBar";
import { Link } from "../primitives/Link";
import { PageHeader } from "../primitives/PageHeader";
import { Progress } from "../primitives/Progress";
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
 * It is a `PageHeader` (0002 A6), not a second head with its own markup: a
 * step of the review is a page like any other. What it adds is the way
 * forward and back, and those go into an `ActionBar` — the order primary →
 * secondary → tertiary comes from there and is not renegotiated per screen.
 *
 * @when    Header of every step in the rail: overline, title, lead, way forward and back.
 * @instead A page that is not a step of a rail → PageHeader directly.
 */
export function StepHeader({
  overline,
  title,
  lead,
  prevHref,
  nextHref,
  onPrev,
  onNext,
  nextLabel,
  actions,
}: {
  overline: string;
  title: string;
  lead?: string;
  prevHref?: string | null;
  nextHref?: string | null;
  /** Alternative to `prevHref` for a step held in client state. */
  onPrev?: (() => void) | null;
  /** Alternative to `nextHref` for a step held in client state. */
  onNext?: (() => void) | null;
  /** „Weiter zu Schritt 5" — where it leads, not merely „Weiter". */
  nextLabel?: string;
  actions?: ReactNode;
}) {
  // A step that lives in client state (an unsaved form, a wizard inside a
  // dialog) cannot be a link. Without a callback path such a page used to get
  // two dead buttons it could not switch off; now it passes `onPrev`/`onNext`
  // instead, and a page that navigates elsewhere entirely passes neither and
  // gets no navigation at all.
  const hasPrev = Boolean(prevHref) || Boolean(onPrev);
  const hasNext = Boolean(nextHref) || Boolean(onNext);
  const showNav = hasPrev || hasNext;

  // Forward is the action, backward the way out: „Weiter" carries the primary
  // color and says where it leads; „Zurück" stays a plain secondary button
  // with no destination in its text. The disabled state stays for the first
  // and the last step — there the place has to hold, or the header jumps
  // (guidelines §2).
  return (
    <PageHeader
      overline={overline}
      title={title}
      description={lead}
      actions={
        actions || showNav ? (
          <ActionBar
            primary={
              showNav ? (
                <StepNav href={nextHref} onClick={onNext} variant="primary">
                  {nextLabel ?? "Weiter"} →
                </StepNav>
              ) : null
            }
            secondary={
              showNav ? (
                <StepNav href={prevHref} onClick={onPrev} variant="secondary">
                  ← Zurück
                </StepNav>
              ) : null
            }
            tertiary={actions}
          />
        ) : null
      }
    />
  );
}

/** One of the two header steps: link, button, or the held-open disabled place. */
function StepNav({
  href,
  onClick,
  variant,
  children,
}: {
  href?: string | null;
  onClick?: (() => void) | null;
  variant: "primary" | "secondary";
  children: ReactNode;
}) {
  const cls = `v2btn v2btn--${variant} v2btn--sm`;
  if (href) {
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <span className={cls} aria-disabled style={{ opacity: 0.4 }}>
      {children}
    </span>
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
  return (
    <div title={`${done} von ${total} ${label} erledigt`}>
      <Progress done={done} total={total} label={`${done} von ${total} ${label}`} inline />
    </div>
  );
}
