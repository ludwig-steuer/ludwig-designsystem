import type { ReactNode } from "react";
import { Link } from "./Link";

/**
 * The main navigation of the sidebar (0031).
 *
 * Sections, targets, the one that is active, a counter where something waits.
 * The active path arrives as a prop: reading it here would pull the Next
 * router into the design system — the very thing `Link` avoids by staying a
 * plain `<a>`.
 */

export interface NavItem {
  href: string;
  label: string;
  icon?: ReactNode;
  /** A number at the right edge — „3 offen". Without it nothing stands there. */
  count?: number;
  /** The counter calls: a tone step, plus the word in `title` (V7). */
  alarm?: boolean;
  /** Visible but not clickable — the roadmap stays readable. */
  future?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

/**
 * Longest matching prefix wins, so a sub-page still lights up its entry.
 * Exact match beats everything; `/` only matches itself, otherwise it would
 * light up on every page.
 */
export function activeHref(items: NavItem[], path: string): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (item.future) continue;
    if (item.href === path) return item.href;
    const isPrefix = item.href !== "/" && (path === item.href || path.startsWith(`${item.href}/`));
    if (isPrefix && (best === null || item.href.length > best.length)) best = item.href;
  }
  return best;
}

/**
 * @when    The main navigation of an app frame: a handful of sections, one
 *          active target, counters where work waits.
 * @instead Switching a view inside a page → Tabs. Narrowing a list →
 *          FilterChips. Work to be done → TodoList.
 */
export function NavList({
  sections,
  activePath,
  collapsed,
  ariaLabel = "Hauptnavigation",
}: {
  sections: NavSection[];
  /** The current path — a prop, never read from a router here. */
  activePath: string;
  collapsed?: boolean;
  ariaLabel?: string;
}) {
  const active = activeHref(
    sections.flatMap((s) => s.items),
    activePath,
  );
  return (
    <nav className="sb__nav" aria-label={ariaLabel}>
      {sections.map((section, i) =>
        section.items.length === 0 ? null : (
          <div key={section.label ?? i}>
            {section.label ? <div className="sb__navlabel">{section.label}</div> : null}
            {section.items.map((item) => (
              <Entry
                key={item.href}
                item={item}
                active={item.href === active}
                collapsed={collapsed}
              />
            ))}
          </div>
        ),
      )}
    </nav>
  );
}

function Entry({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
}) {
  // Collapsed the label moves into `title` — it must not vanish without a
  // trace. Without an icon the first letter stands in: an empty button is a
  // riddle (V11).
  const title = collapsed ? item.label : undefined;
  const mark = item.icon ?? <span className="sb__navinitial">{item.label.slice(0, 1)}</span>;
  const body = (
    <>
      <span className="icon">{mark}</span>
      <span className="label">{item.label}</span>
      {item.count === undefined ? null : (
        <span
          className={`count${item.alarm ? " is-alarm" : ""}`}
          title={`${item.count} offen`}
        >
          {item.count}
        </span>
      )}
    </>
  );

  if (item.future) {
    // Collapsed the label lives in `title` — so the roadmap entry has to carry
    // both, otherwise it is the one icon without a word (found in review).
    return (
      <span
        className="sb__navitem is-future"
        aria-disabled="true"
        title={collapsed ? `${item.label} — bald verfügbar` : "bald verfügbar"}
      >
        {body}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      className={`sb__navitem${active ? " active" : ""}`}
      aria-current={active ? "page" : undefined}
      title={title}
    >
      {body}
    </Link>
  );
}
