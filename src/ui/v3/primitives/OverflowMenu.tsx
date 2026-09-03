"use client";

import { ChevronDown } from "lucide-react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "./Link";
import type { ButtonSize } from "./Button";

/**
 * The fold-out for the rarer ways (0008).
 *
 * Built on native `<details>`: open, close, keyboard and the tab order come
 * from the element. Three things are ours — Escape closes it, losing focus
 * closes it, and the open panel is placed with `position: fixed`. A menu that
 * stays open when you click elsewhere is broken, and a row menu inside a
 * `Card` would otherwise be cut off by its `overflow` (seen in the InRow
 * story, 2026-09-03).
 *
 * ponytail: the panel is placed once, when it opens. Scrolling the page with
 * an open menu moves the anchor away from it — if that ever bites, the fix is
 * a scroll listener, not a positioning library.
 *
 * The trigger always carries a word (T8). Whoever wants a bare icon has an
 * `IconButton`, and that one may not hide a menu.
 */

export type MenuItemTone = "default" | "danger";

/** Keeps the panel off the window edge. The gap below the trigger is CSS. */
const EDGE = 8;

/**
 * @when    Three or more actions on one object, of which one or two are
 *          frequent — those stay visible, the rest move in here.
 * @instead Two actions side by side → RowActions. One action → Button. An
 *          action that runs and can fail → ActionButton, also inside an item.
 */
export function OverflowMenu({
  label = "Mehr",
  size = "sm",
  align = "end",
  children,
}: {
  label?: string;
  size?: ButtonSize;
  align?: "start" | "end";
  children: ReactNode;
}) {
  const root = useRef<HTMLDetailsElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  function place() {
    const box = root.current;
    const p = panel.current;
    if (!box || !p || !box.open) return;
    const r = box.getBoundingClientRect();
    // The panel is wider than most triggers, so `end` alignment alone pushes
    // it off screen next to a left-hand trigger (found in review, 2026-09-03).
    // Compute the left edge, then keep it inside the window.
    const wanted = align === "start" ? r.left : r.right - p.offsetWidth;
    const room = window.innerWidth - p.offsetWidth - EDGE;
    p.style.position = "fixed";
    p.style.top = `${r.bottom}px`;
    p.style.right = "auto";
    p.style.left = `${Math.max(EDGE, Math.min(wanted, room))}px`;
  }

  return (
    <details
      ref={root}
      onToggle={place}
      className={`v2menu${align === "start" ? " v2menu--start" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.removeAttribute("open");
      }}
      onClick={(e) => {
        // A chosen entry closes the menu — including a jump, which would
        // otherwise leave it standing open behind the new page.
        if ((e.target as HTMLElement).closest(".v2menu__item")) {
          e.currentTarget.removeAttribute("open");
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          e.currentTarget.removeAttribute("open");
        }
      }}
    >
      <summary className={`v2menu__sum v2btn v2btn--secondary v2btn--${size}`}>
        <span>{label}</span>
        <ChevronDown size={14} strokeWidth={1.5} aria-hidden="true" />
      </summary>
      <div className="v2menu__panel" ref={panel}>
        {children}
      </div>
    </details>
  );
}

/**
 * @when    One entry inside an OverflowMenu — a jump with `href`, an action
 *          with `onClick`.
 */
export function MenuItem({
  children,
  href,
  onClick,
  icon,
  tone = "default",
  disabled,
  title,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  tone?: MenuItemTone;
  disabled?: boolean;
  /** The reason, when the entry is disabled. */
  title?: string;
}) {
  const cls = `v2menu__item${tone === "danger" ? " v2menu__item--danger" : ""}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={cls} title={title}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} title={title}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
