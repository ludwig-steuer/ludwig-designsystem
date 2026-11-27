import type { AnchorHTMLAttributes, Ref } from "react";

/**
 * Stand-in for `next/link` for consumers without Next (0271), set by the
 * consumer as a bundler alias (`"next/link": "<submodule>/src/compat/next-link.tsx"`)
 * and as a `paths` entry for tsc. The design system itself never imports this
 * file; in the app `Link` keeps `next/link`, its prefetch and client navigation.
 *
 * Only what `primitives/Link.tsx` uses: the default export and the
 * `LinkProps["prefetch"]` type. Without a router a path `href` is a plain page
 * change, so `prefetch` has nothing to do and is dropped — it must not reach
 * the DOM as an unknown attribute.
 *
 * ponytail: `href` as a string only, the way `Link` passes it; add UrlObject
 * when a consumer hands one in.
 */
export type LinkProps = {
  /** The same type as in Next 16 (`next/dist/client/link.d.ts`). */
  prefetch?: boolean | "auto" | null;
};

export default function NextLink({
  href,
  ref,
  prefetch: _prefetch,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  LinkProps & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  }) {
  return <a href={href} ref={ref} {...rest} />;
}
