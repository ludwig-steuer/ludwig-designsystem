import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, Ref } from "react";

/**
 * The design system's link. A path inside the app (`/…`, `?…`) goes through
 * `next/link`: the click swaps the page on the client instead of loading every
 * layout and the login check again — seconds per click on staging (llcto
 * 2026-10-27). Everything else stays a plain `<a>`: another origin,
 * `mailto:`/`tel:`, a download, a new tab, and a bare `#anchor` (the browser
 * scrolls; the hash state of the page stories relies on it).
 *
 * No prefetch by default: a list of 300 rows would fetch every row that
 * scrolls into view. A short, fixed set of ways — the step bar — asks for it
 * with `prefetch="auto"` (down to the next `loading.tsx`).
 *
 * ponytail: no prefetch on hover — it needs client state per link; add it here
 * if a list proves slow to open.
 *
 * @when    Anything that leads to a URL — in a row, in a sentence, on a card.
 * @instead An action without a URL → Button or TextButton. A whole row that
 *          leads somewhere → the row's own `href` (`.v2rowlink`).
 */
export function Link({
  href,
  ref,
  prefetch = false,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
  prefetch?: LinkProps["prefetch"];
}) {
  const inApp = (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("?");
  const leaves = (rest.download !== undefined && rest.download !== false) || (rest.target !== undefined && rest.target !== "_self");
  if (!inApp || leaves) return <a href={href} ref={ref} {...rest} />;
  return <NextLink href={href} ref={ref} prefetch={prefetch} {...rest} />;
}
