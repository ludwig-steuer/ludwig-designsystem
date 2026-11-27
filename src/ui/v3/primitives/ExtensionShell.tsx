import type { ReactNode } from "react";

import { ActionIcon } from "../Icons";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Link } from "./Link";

/**
 * The frame of a browser extension (0263): the page in a tab and the popup of
 * the toolbar symbol. Both share the head — mark, product name, environment —
 * and nothing else. Neither holds state: which area is active belongs to the
 * caller's `Tabs`, the popup's one action to the caller's callback.
 *
 * The page borrows the build of `AppShell` without its sidebar: head and
 * navigation stand outside the scroll area, `main` is the only scroll
 * container, so no fixed head can cover a focus ring (WCAG 2.4.11). The content
 * width is capped by growing side padding, not `max-width` (`.app__main`), at
 * `--container-narrow`.
 */

/** Mark, name and — outside production — the environment. Not exported (see 0263 „Ausbau"). */
function Brand({
  markSrc,
  productName,
  environment,
  page,
}: {
  markSrc: string;
  productName: string;
  environment?: string;
  /** On the page the name is the one `h1`; in the popup it is plain text. */
  page: boolean;
}) {
  return (
    <div className="v3ext__brand">
      {/* `alt=""`: the name stands right beside it, a second reading says nothing. */}
      <img className="v3ext__mark" src={markSrc} alt="" />
      {page ? (
        <h1 className="v3ext__name">{productName}</h1>
      ) : (
        <span className="v3ext__name">{productName}</span>
      )}
      {environment ? <Badge tone="neutral">{environment}</Badge> : null}
    </div>
  );
}

const leavesExtension = (href: string) => /^https?:\/\//.test(href);

/**
 * The page of a browser extension in a tab: head with mark and product name,
 * the area tabs below it, the content of the active area in a narrow column,
 * the footer with version and links at the end of the content.
 *
 * @when    The page of a browser extension in its own tab — a few areas side
 *          by side as tabs, one narrow column of content.
 * @instead An app with sidebar, top bar and work surface → AppShell. The head
 *          of a page inside a work surface → PageHeader. The extension's
 *          toolbar popup → ExtensionPopup.
 */
export function ExtensionShell({
  markSrc,
  productName,
  environment,
  nav,
  children,
  version,
  links,
}: {
  markSrc: string;
  productName: string;
  environment?: string;
  nav?: ReactNode;
  children: ReactNode;
  version?: string;
  links?: { label: string; href: string }[];
}) {
  const footer: ReactNode[] = [];
  if (version) footer.push(<span key="version">Version {version}</span>);
  for (const l of links ?? []) {
    const external = leavesExtension(l.href);
    footer.push(
      <Link
        key={l.href}
        href={l.href}
        className={`v2link v2link--quiet${external ? " v2link--icon" : ""}`}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
      >
        {l.label}
        {external ? <ActionIcon action="external" size={12} /> : null}
      </Link>,
    );
  }
  return (
    <div className="v3ext">
      <div className="v3ext__top">
        <header className="v3ext__head">
          <Brand markSrc={markSrc} productName={productName} environment={environment} page />
        </header>
        {nav ? <nav className="v3ext__nav">{nav}</nav> : null}
      </div>
      <main className="v3ext__main">
        <div className="v3ext__body">{children}</div>
        {footer.length > 0 ? (
          <footer className="v3ext__foot">
            {footer.flatMap((part, i) => (i === 0 ? [part] : [<span key={`sep${i}`}> · </span>, part]))}
          </footer>
        ) : null}
      </main>
    </div>
  );
}

/**
 * The popup of a browser extension's toolbar symbol: 320 px, head, one line of
 * state, an optional detail, exactly one button. The state sits in a live
 * region, so a change („Nicht verbunden" → „Verbunden als …") is announced;
 * the detail stands outside it, so a counter („Beleg 37 von 120") does not
 * speak on every step. The button takes the focus when the popup opens;
 * `Enter` right after the click on the symbol is the fastest way, and the
 * action only opens a page.
 *
 * @when    The toolbar popup of a browser extension: what state it is in, and
 *          the one way into its page.
 * @instead The extension's page in a tab → ExtensionShell. A choice between
 *          several actions → the page, not a second button here.
 */
export function ExtensionPopup({
  markSrc,
  productName,
  environment,
  status,
  detail,
  action,
}: {
  markSrc: string;
  productName: string;
  environment?: string;
  status: ReactNode;
  /** Under the state, outside the live region: a last sync, a counter (0263, Nachtrag 2). */
  detail?: ReactNode;
  action: { label: string; onClick: () => void };
}) {
  return (
    <div className="v3extpop">
      <Brand markSrc={markSrc} productName={productName} environment={environment} page={false} />
      <div className="v3extpop__status" role="status">
        {status}
      </div>
      {detail ? <div className="v3extpop__detail">{detail}</div> : null}
      {/* The one action opens a page and changes nothing — focus on it is safe (0263, Offene Frage 3). */}
      <Button variant="primary" fullWidth autoFocus onClick={action.onClick}>
        {action.label}
      </Button>
    </div>
  );
}
