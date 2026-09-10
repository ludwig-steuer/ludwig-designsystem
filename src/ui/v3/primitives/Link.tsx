import type { AnchorHTMLAttributes, Ref } from "react";

/**
 * The design system's link — deliberately a plain `<a>`: `next/link` would tie
 * the bundle to the Next runtime, which does not exist in Storybook or other
 * consumers. The components use only `<a>` semantics.
 *
 * ponytail: when the app needs client-side navigation, only this file switches
 * to `next/link`.
 *
 * @when    Anything that leads to a URL — in a row, in a sentence, on a card.
 * @instead An action without a URL → Button or TextButton. A whole row that
 *          leads somewhere → the row's own `href` (`.v2rowlink`).
 */
export function Link({
  href,
  ref,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; ref?: Ref<HTMLAnchorElement> }) {
  return <a href={href} ref={ref} {...rest} />;
}
