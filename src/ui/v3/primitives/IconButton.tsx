import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "./Link";

/**
 * The named exception to T8 „no icon without a word" (0012).
 *
 * It exists for the four places where the word would be noise and the icon is
 * universally understood: the close cross of a dialog, the pager arrows, the
 * sidebar collapse, the icons in a header bar. `label` is mandatory — the word
 * is not gone, it moved to `aria-label` and `title`.
 *
 * Whoever reaches for it to save space in a row has the wrong component:
 * a writing action needs a labelled way next to it.
 */

export type IconButtonSize = "sm" | "md" | "lg";
export type IconButtonTone = "ghost" | "surface";

type Common = {
  /** What the button does — becomes `aria-label` and `title`. Never optional. */
  label: string;
  icon: ReactNode;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  className?: string;
};

export type IconButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "aria-label" | "title"> & {
    href?: undefined;
  };

export type IconButtonLinkProps = Common & { href: string; target?: string };

function classes(size: IconButtonSize, tone: IconButtonTone, className?: string) {
  return ["v2ibtn", `v2ibtn--${size}`, tone === "surface" ? "v2ibtn--surface" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

/**
 * @when    Close cross, pager arrow, sidebar collapse — an icon everyone reads
 *          the same way, with a labelled way to the same goal nearby.
 * @instead Any action with a word → Button. An action inside running text →
 *          TextButton. Several row actions behind one icon → OverflowMenu.
 */
export function IconButton(props: IconButtonProps | IconButtonLinkProps) {
  const { label, icon, size = "md", tone = "ghost", className } = props;
  if ("href" in props && props.href !== undefined) {
    const { href, target } = props;
    return (
      <Link
        href={href}
        target={target}
        aria-label={label}
        title={label}
        className={classes(size, tone, className)}
      >
        {icon}
      </Link>
    );
  }
  const {
    label: _l,
    icon: _i,
    size: _s,
    tone: _t,
    className: _cl,
    href: _href,
    ...rest
  } = props as IconButtonProps;
  return (
    <button
      type="button"
      {...rest}
      aria-label={label}
      title={label}
      className={classes(size, tone, className)}
    >
      {icon}
    </button>
  );
}
