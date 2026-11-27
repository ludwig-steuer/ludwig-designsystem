"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ActionIcon } from "../Icons";

/**
 * The frame of the application (0030).
 *
 * 240 px of sidebar, 56 px of top bar, the work surface in between — the only
 * thing on every single screen. Deliberately just the grid: it knows no
 * session, no client, no route. What goes into the sidebar is passed in;
 * the navigation itself is `NavList` (0031).
 *
 * Narrower than 1280 px the frame folds (0253, L1): from 640 px the sidebar
 * stands collapsed to 64 px, below 640 px it is a drawer from the left behind
 * „Menü". All of that is CSS — the media query is the one honest source for a
 * width. JavaScript only moves the focus into the drawer and back, and
 * closes it when the window grows past 640 px, so top bar and work surface
 * do not stay `inert`.
 *
 * The dark sidebar keeps the raw hex values of `app-chrome.css` — named
 * exception to A5, decided 2026-09-03 (see `design-guidelines.md`).
 */

/** The width from which the drawer is no drawer any more (`--bp-phone`). */
const PHONE_UP = "(min-width: 640px)";

/** What can take the focus inside the drawer. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @when    Around every screen of the app: sidebar, top bar, work surface.
 * @instead Splitting one work surface → MasterDetail. The head of a page
 *          inside the surface → PageHeader. The page of a browser extension,
 *          a few areas as tabs and no sidebar → ExtensionShell.
 */
export function AppShell({
  sidebar,
  topbar,
  children,
  collapsed,
  navOpen = false,
  onNavOpenChange,
}: {
  /** Logo, switcher, navigation — the caller composes it. */
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  /**
   * Sidebar down to 64 px. The caller owns the state — remembering it is
   * browser storage, and the set touches none.
   */
  collapsed?: boolean;
  /** The drawer below 640 px is open. The caller owns the state. */
  navOpen?: boolean;
  /**
   * Without it there is no drawer. With it the shell renders the scrim
   * („Menü schließen"), closes on `Esc` and when the window grows to 640 px.
   */
  onNavOpenChange?: (open: boolean) => void;
}) {
  const open = navOpen && Boolean(onNavOpenChange);
  const nav = useRef<HTMLElement>(null);

  // Focus follows the drawer: into it when it opens — „Menü" lies under it
  // then — and back to „Menü" when it closes, not onto `body` (0253).
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    // One frame later: in the commit itself the drawer still counts as
    // hidden (`visibility`), and focus() on a hidden element does nothing.
    const frame = requestAnimationFrame(() => nav.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus());
    return () => {
      cancelAnimationFrame(frame);
      const back =
        opener && opener !== document.body
          ? opener
          : document.querySelector<HTMLElement>('[aria-controls="app-nav"]');
      back?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !onNavOpenChange) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onNavOpenChange(false);
    };
    const wide = window.matchMedia(PHONE_UP);
    const onWide = () => {
      if (wide.matches) onNavOpenChange(false);
    };
    onWide();
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open, onNavOpenChange]);

  return (
    <div className={`app${collapsed ? " app--collapsed" : ""}${open ? " app--nav-open" : ""}`}>
      <aside ref={nav} id="app-nav" className={`app__sidebar${collapsed ? " is-collapsed" : ""}`}>
        {sidebar}
      </aside>
      {onNavOpenChange ? (
        <button
          type="button"
          className="app__scrim"
          aria-label="Menü schließen"
          tabIndex={open ? 0 : -1}
          onClick={() => onNavOpenChange(false)}
        />
      ) : null}
      {/* `display: contents` — the bar stays a cell of the grid; the wrapper
          only carries `inert` while the drawer lies over it. */}
      <div className="app__topwrap" inert={open || undefined}>
        {topbar}
      </div>
      <main className="app__main" inert={open || undefined}>
        {children}
      </main>
    </div>
  );
}

/**
 * @when    The top row of the shell: where you are, search, the few actions
 *          that belong to the whole app.
 * @instead Title and actions of a page → PageHeader. Narrowing a list →
 *          FilterBar.
 */
export function TopBar({
  crumb,
  search,
  actions,
  onOpenNav,
  navOpen = false,
  onOpenSearch,
}: {
  /** Where you are, on the left. */
  crumb?: ReactNode;
  /** The search field in the middle. */
  search?: ReactNode;
  /** On the right: role marker, settings, help. Below 640 px they move into the drawer. */
  actions?: ReactNode;
  /** „Menü" below 640 px — opens the sidebar as a drawer (0253). */
  onOpenNav?: () => void;
  /** For `aria-expanded` of „Menü". */
  navOpen?: boolean;
  /** „Suchen" below 640 px, where the search field gives way. */
  onOpenSearch?: () => void;
}) {
  return (
    <header className="app__topbar">
      {onOpenNav ? (
        <button
          type="button"
          className="v2btn v2btn--tertiary v2btn--sm tb__menu"
          aria-expanded={navOpen}
          aria-controls="app-nav"
          onClick={onOpenNav}
        >
          <ActionIcon action="menu" size={16} />
          Menü
        </button>
      ) : null}
      <div className="tb__crumb">{crumb}</div>
      <div className="tb__search">{search}</div>
      {onOpenSearch ? (
        <button type="button" className="v2btn v2btn--tertiary v2btn--sm tb__searchbtn" onClick={onOpenSearch}>
          <ActionIcon action="search" size={16} />
          Suchen
        </button>
      ) : null}
      <div className="tb__actions">{actions}</div>
    </header>
  );
}
