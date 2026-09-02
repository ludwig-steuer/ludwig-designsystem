import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "./Link";

/**
 * The action without a box (0011, `.v2link` — 86 hand-written uses in the app).
 *
 * Geometry, colour and hover live in `v3.css` (`.v2link`): no padding, no
 * height of its own, underline instead of a filled surface. That is what makes
 * it fit into a table row without pushing it open (V1).
 *
 * Server component: `href` renders a `Link`, `onClick` belongs in a client
 * wrapper of the caller — same rule as `Button`.
 */

export type TextButtonTone = "default" | "quiet";

type Common = {
  /** `default` in accent, semibold; `quiet` muted and regular weight. */
  tone?: TextButtonTone;
  /** Lucide icon to the left — never on its own, always next to a word (T8). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export type TextButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & { href?: undefined };

export type TextButtonLinkProps = Common & {
  href: string;
  target?: string;
  download?: boolean | string;
};

function classes(tone: TextButtonTone, icon: ReactNode, className?: string) {
  return [
    "v2link",
    tone === "quiet" ? "v2link--quiet" : "",
    icon ? "v2link--icon" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * @when    An action inside a row, next to an amount or in running text — where
 *          a box would push the line open. Two volumes via `tone`.
 * @instead An action with a surface, a size, a spinner → Button (`tertiary` is
 *          borderless but still has button geometry). A jump to another page
 *          rather than an action → Link. Several actions in a bar → ActionBar.
 */
export function TextButton(props: TextButtonProps | TextButtonLinkProps) {
  const { tone = "default", icon, children, className } = props;
  const body = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
  if ("href" in props && props.href !== undefined) {
    const { href, target, download } = props;
    return (
      <Link href={href} target={target} download={download} className={classes(tone, icon, className)}>
        {body}
      </Link>
    );
  }
  const {
    tone: _t,
    icon: _i,
    children: _c,
    className: _cl,
    href: _href,
    ...rest
  } = props as TextButtonProps;
  return (
    <button type="button" {...rest} className={classes(tone, icon, className)}>
      {body}
    </button>
  );
}
