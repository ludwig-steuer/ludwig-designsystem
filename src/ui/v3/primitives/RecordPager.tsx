"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useHotkeys } from "../patterns/Hotkeys";
import { IconButton } from "./IconButton";
import { Kbd } from "./Kbd";
import { Link } from "./Link";

/**
 * Through a work queue, one record at a time (0047) — „3 von 117", back and
 * forth, and the named way back into the queue.
 *
 * The pager counts nothing itself: `position` and `total` come from the
 * caller, the way they loaded the list. If the record drops out of the filter
 * while someone works on it, the pager does not move — a number that changes
 * under the hand is worse than one that is a minute old.
 */

type Common = {
  /** 1-based, the way the caller counts. */
  position: number;
  total: number;
  /** What is counted, singular — „Sachverhalt". Without it: just „3 von 117". */
  label?: string;
  /** The way back into the queue, named („Sachverhalte"). */
  back?: { href: string; label: string };
};

/** Links — works without JavaScript. `null` means: end of the queue. */
type PagerLinkProps = Common & {
  prevHref?: string | null;
  nextHref?: string | null;
  onPrev?: undefined;
  onNext?: undefined;
  hotkeys?: undefined;
};

/** Callbacks — the client variant, and the only one that can bind keys. */
type PagerButtonProps = Common & {
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  /** Bind `K`/`J` and show both as `Kbd`. Without it no key is shown (V14). */
  hotkeys?: boolean;
  prevHref?: undefined;
  nextHref?: undefined;
};

/**
 * @when    One record out of a queue is in focus and the next one follows
 *          without a detour through the list.
 * @instead Pages of a list (page 2 of 9) → Pagination. Steps of a process in
 *          a fixed order → StepRail. Narrowing a list down → FilterBar.
 */
export function RecordPager(props: PagerLinkProps | PagerButtonProps) {
  const { position, total, label, back } = props;
  const isLinks = props.prevHref !== undefined || props.nextHref !== undefined;
  const hotkeys = "hotkeys" in props ? Boolean(props.hotkeys) : false;
  const onPrev = "onPrev" in props ? props.onPrev : undefined;
  const onNext = "onNext" in props ? props.onNext : undefined;

  // Hooks run unconditionally; `enabled` decides whether they listen. In the
  // link variant there is nothing to bind — a key cannot follow an `href`.
  useHotkeys(
    [
      { key: "k", label: "Vorheriger", handler: () => onPrev?.() },
      { key: "j", label: "Nächster", handler: () => onNext?.() },
    ],
    hotkeys && !isLinks,
  );

  const prev = isLinks ? props.prevHref ?? null : onPrev ?? null;
  const next = isLinks ? props.nextHref ?? null : onNext ?? null;

  return (
    <div className="v2pager">
      {back ? (
        <Link href={back.href} className="v2pager__back">
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <Step dir="prev" target={prev} hotkey={hotkeys ? "K" : undefined} />
      <span className="v2pager__count">
        {label ? `${label} ` : ""}
        {position} von {total}
      </span>
      <Step dir="next" target={next} hotkey={hotkeys ? "J" : undefined} />
    </div>
  );
}

/**
 * One arrow. At the end of the queue it stays **visible** and inactive: an
 * arrow that disappears makes the bar jump and takes away the information
 * „this is the end".
 */
function Step({
  dir,
  target,
  hotkey,
}: {
  dir: "prev" | "next";
  target: string | (() => void) | null;
  hotkey?: string;
}) {
  const label = dir === "prev" ? "Vorheriger Datensatz" : "Nächster Datensatz";
  const icon =
    dir === "prev" ? (
      <ChevronLeft size={16} strokeWidth={1.5} />
    ) : (
      <ChevronRight size={16} strokeWidth={1.5} />
    );
  const key = hotkey ? <Kbd>{hotkey}</Kbd> : null;
  const body =
    target === null ? (
      <span className="v2ibtn v2ibtn--md v2pager__off" aria-disabled title={label}>
        {icon}
      </span>
    ) : typeof target === "string" ? (
      <IconButton href={target} label={label} icon={icon} />
    ) : (
      <IconButton label={label} icon={icon} onClick={target} />
    );
  if (!key) return body;
  return (
    <span className="v2pager__step">
      {dir === "prev" ? (
        <>
          {body}
          {key}
        </>
      ) : (
        <>
          {key}
          {body}
        </>
      )}
    </span>
  );
}
