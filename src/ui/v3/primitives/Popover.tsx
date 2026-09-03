"use client";

import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * The three fields that float above the work (0038): `Popover` on click,
 * `Tooltip` on hover and focus, `HoverCard` on hover with content.
 *
 * Built on the **native popover API**: the browser puts the panel into the top
 * layer, so there is no `z-index` anywhere in this family; for `popover="auto"`
 * it also brings click-outside, Escape and returning the focus to the trigger.
 * What is left is what Radix would add — measuring the window edge and hover
 * intent — and that is the ~40 lines below.
 *
 * ponytail: the panel is placed once, when it opens, exactly like
 * `OverflowMenu` (0008). Scrolling with an open field moves the anchor away
 * from it; if that ever bites, the fix is a scroll listener, not a positioning
 * library.
 */

/** Keeps the panel off the window edge; the gap to the anchor is the second. */
const EDGE = 8;
const GAP = 6;

const TOOLTIP_DELAY = 300;
const CARD_OPEN_DELAY = 500;
const CARD_CLOSE_DELAY = 200;

type Align = "start" | "end";

/** Measures once and flips upwards when there is no room below. */
function place(anchor: HTMLElement | null, panel: HTMLElement | null, align: Align): void {
  if (!anchor || !panel) return;
  const a = anchor.getBoundingClientRect();
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const wanted = align === "start" ? a.left : a.right - w;
  const left = Math.max(EDGE, Math.min(wanted, window.innerWidth - w - EDGE));
  const below = a.bottom + GAP;
  const flip = below + h > window.innerHeight - EDGE && a.top - GAP - h > EDGE;
  panel.style.left = `${left}px`;
  panel.style.top = `${Math.max(EDGE, flip ? a.top - GAP - h : below)}px`;
}

function isShown(panel: HTMLElement | null): boolean {
  return !!panel && panel.matches(":popover-open");
}

/** Shows or hides the panel and places it while it has a size. */
function useLayer(open: boolean, align: Align) {
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const p = panel.current;
    if (!p) return;
    if (open && !isShown(p)) {
      p.showPopover();
      place(anchor.current, p, align);
    } else if (!open && isShown(p)) {
      p.hidePopover();
    }
  }, [open, align]);
  return { anchor, panel };
}

/** Escape closes what the browser does not close by itself (`manual`). */
function useEscape(open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);
}

/**
 * Hover with intent: opens after `openDelay`, closes after `closeDelay` —
 * the pause on closing is what lets the pointer travel onto the card.
 * Keyboard focus opens without any delay (V11).
 */
function useHoverIntent(openDelay: number, closeDelay: number) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => clear, [clear]);
  const schedule = useCallback(
    (next: boolean, delay: number) => {
      clear();
      timer.current = setTimeout(() => setOpen(next), delay);
    },
    [clear],
  );
  return {
    open,
    close: useCallback(() => {
      clear();
      setOpen(false);
    }, [clear]),
    handlers: {
      onPointerEnter: () => schedule(true, openDelay),
      onPointerLeave: () => schedule(false, closeDelay),
      onFocus: () => {
        clear();
        setOpen(true);
      },
      onBlur: () => {
        clear();
        setOpen(false);
      },
    },
  };
}

/** Adds attributes to the element the caller passed, without wrapping it. */
function withProps(element: ReactNode, props: Record<string, unknown>): ReactNode {
  return isValidElement<Record<string, unknown>>(element) ? cloneElement(element, props) : element;
}

/**
 * @when    A small field on click that does not block the page: settings,
 *          column picker, a filter that belongs to one button.
 * @instead A decision that must be made now → Dialog. Three or more actions on
 *          one object → OverflowMenu. Explaining a word → Tooltip. A preview
 *          of what a link leads to → HoverCard.
 */
export function Popover({
  trigger,
  children,
  align = "start",
  open,
  onOpenChange,
}: {
  /** A button **with a word** (T8); gets `aria-expanded` and `aria-controls`. */
  trigger: ReactNode;
  children: ReactNode;
  /** The edge the field hangs on. */
  align?: Align;
  /** Controlled, when an action inside the field has to close it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const id = useId();
  const [self, setSelf] = useState(false);
  const isOpen = open ?? self;
  const set = useCallback(
    (next: boolean) => {
      if (open === undefined) setSelf(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );
  const { anchor, panel } = useLayer(isOpen, align);

  return (
    <>
      <span className="v2pop__anchor" ref={anchor}>
        {withProps(trigger, {
          "aria-expanded": isOpen,
          "aria-controls": id,
          onClick: () => set(!isOpen),
        })}
      </span>
      <div
        id={id}
        ref={panel}
        popover="auto"
        className="v2pop"
        // Escape and a click outside close the panel in the browser, not here;
        // this event is how the state hears about it.
        onToggle={(e) => {
          const next = (e as unknown as { newState: string }).newState === "open";
          if (next !== isOpen) set(next);
        }}
      >
        {children}
      </div>
    </>
  );
}

/**
 * @when    One sentence that explains an element which already has a name —
 *          an IconButton, an abbreviation, a badge.
 * @instead A word that only needs a title on hover and no JavaScript → the
 *          `title` attribute (Z3). Content with a link or an action →
 *          HoverCard or Popover. A label the element lacks → give it a label.
 */
export function Tooltip({
  label,
  children,
}: {
  /** Text only — it explains, it does not replace a label (T8). */
  label: string;
  /** The explained element; gets `aria-describedby`. */
  children: ReactNode;
}) {
  const id = useId();
  const { open, close, handlers } = useHoverIntent(TOOLTIP_DELAY, 0);
  const { anchor, panel } = useLayer(open, "start");
  useEscape(open, close);

  return (
    <>
      <span className="v2pop__anchor" ref={anchor} {...handlers}>
        {withProps(children, { "aria-describedby": id })}
      </span>
      {/* `manual`: a tooltip must not close the field that is currently open. */}
      <div id={id} ref={panel} popover="manual" role="tooltip" className="v2pop v2pop--tip">
        {label}
      </div>
    </>
  );
}

/**
 * @when    A preview of what an anchor leads to — the account behind an
 *          account number, the partner behind a name — read without leaving
 *          the list.
 * @instead One sentence of explanation → Tooltip. A field on click →
 *          Popover. The whole record → the detail pane (MasterDetail).
 */
export function HoverCard({
  children,
  content,
}: {
  /** The anchor: a link or a piece of text that leads somewhere itself (I11). */
  children: ReactNode;
  /** The card — the „preview" form of the entity, composed by the caller. */
  content: ReactNode;
}) {
  const id = useId();
  const { open, close, handlers } = useHoverIntent(CARD_OPEN_DELAY, CARD_CLOSE_DELAY);
  const { anchor, panel } = useLayer(open, "start");
  useEscape(open, close);

  return (
    <>
      <span className="v2pop__anchor" ref={anchor} {...handlers}>
        {withProps(children, { "aria-describedby": id })}
      </span>
      <div
        id={id}
        ref={panel}
        popover="manual"
        className="v2pop v2pop--card"
        // Hovering the card keeps it open — otherwise it closes under the
        // pointer that is trying to read it.
        onPointerEnter={handlers.onPointerEnter}
        onPointerLeave={handlers.onPointerLeave}
      >
        {content}
      </div>
    </>
  );
}
