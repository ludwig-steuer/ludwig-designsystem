import type { ReactNode } from "react";

/**
 * The frame of the application (0030).
 *
 * 240 px of sidebar, 56 px of top bar, the work surface in between — the only
 * thing on every single screen. Deliberately just the grid: it knows no
 * session, no client, no route. What goes into the sidebar is passed in;
 * the navigation itself is `NavList` (0031).
 *
 * The dark sidebar keeps the raw hex values of `app-chrome.css` — named
 * exception to A5, decided 2026-09-03 (see `design-guidelines.md`).
 */

/**
 * @when    Around every screen of the app: sidebar, top bar, work surface.
 * @instead Splitting one work surface → MasterDetail. The head of a page
 *          inside the surface → PageHeader.
 */
export function AppShell({
  sidebar,
  topbar,
  children,
  collapsed,
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
}) {
  return (
    <div className={`app${collapsed ? " app--collapsed" : ""}`}>
      <aside className={`app__sidebar${collapsed ? " is-collapsed" : ""}`}>{sidebar}</aside>
      {topbar}
      <main className="app__main">{children}</main>
      {/*
        Below 1280 px rail, list and detail lie on top of each other, and then
        nobody checks any more — they guess (L1). Pure CSS, no measuring in
        JavaScript: the media query is the one honest source for a width.
      */}
      <div className="app__toonarrow">
        <strong>Zu schmal für die Prüfung.</strong>
        <span>
          Ludwig braucht mindestens 1280 px Breite — darunter liegen Schrittleiste, Liste und
          Detail übereinander. Bitte vergrößern Sie das Fenster.
        </span>
      </div>
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
}: {
  /** Where you are, on the left. */
  crumb?: ReactNode;
  /** The search field in the middle. */
  search?: ReactNode;
  /** On the right: role marker, settings, help. */
  actions?: ReactNode;
}) {
  return (
    <header className="app__topbar">
      <div className="tb__crumb">{crumb}</div>
      <div className="tb__search">{search}</div>
      <div className="tb__actions">{actions}</div>
    </header>
  );
}
