import { Kbd } from "./Kbd";
import { Link } from "./Link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * The buttons (F123 T123.1, design `_ds` React `Button` + `StapelSeite.dc.html`).
 *
 * Three sizes: `md` (35 px) carries the head card and the action bar, `sm`
 * (30 px) card actions, `xs` (25 px) dense cells and editors. **Inside a table
 * row** `xs` and `sm` shrink to the height of the text next to them (0008,
 * 0010) — the row keeps its height, the button gives way (V1); the rule for
 * that lives in `v3.css`, not here. Everything else — radius, colour, padding
 * — is in `v3.css` too.
 *
 * Server component: `href` renders a `Link`, `onClick` belongs in a client
 * wrapper of the caller.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "xs" | "sm" | "md";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  /** Icon to the right of the label — "next" arrows, chevrons on toggles. */
  iconEnd?: ReactNode;
  /**
   * The action is running: locked, `aria-busy`, spinner before the label.
   * Purely presentational — the caller passes it. Whoever wants the button to
   * run the action, show the error and confirm takes `ActionButton`.
   */
  loading?: boolean;
  /** Replaces the label while `loading`. Without it the label stays. */
  loadingLabel?: string;
  /** Full width, content centred — sign-in, end of a form. */
  fullWidth?: boolean;
  /**
   * The key that triggers the same action. It stands **on the button**, not
   * only in the legend overlay — the audience opens Ludwig every two to four
   * weeks and must not have to learn the keyboard by heart (V14).
   */
  hotkey?: string;
  children: ReactNode;
  className?: string;
};

export type ButtonProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & { href?: undefined };

export type ButtonLinkProps = Common & { href: string; target?: string; download?: boolean | string };

function classes(variant: ButtonVariant, size: ButtonSize, fullWidth?: boolean, className?: string) {
  return [
    "v2btn",
    `v2btn--${variant}`,
    `v2btn--${size}`,
    fullWidth ? "v2btn--full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Order inside the button: icon · label · icon-end · key. The key stays
 * rightmost — it is the shortcut, not part of the label.
 *
 * While loading a spinner takes the icon slot and the label is always a word
 * next to it — never a bare spinner (V7).
 */
function inner(
  icon: ReactNode,
  children: ReactNode,
  hotkey?: string,
  iconEnd?: ReactNode,
  loading?: boolean,
  loadingLabel?: string,
) {
  return (
    <>
      {loading ? <span className="v2spin" aria-hidden="true" /> : icon}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
      {loading ? null : iconEnd}
      {hotkey ? <Kbd>{hotkey}</Kbd> : null}
    </>
  );
}

/**
 * @when    Every action with a word: `md` in header card and action bar, `sm` in
 *          rows and cards, `xs` in dense cells and editors. `loading` shows that
 *          it is running, `fullWidth` ends a form.
 * @instead Jump to a page within prose → Link. Several actions side by side →
 *          ActionBar. An action inside running text, without a box → TextButton.
 *          Running the action itself, with error and confirmation → ActionButton.
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
  const {
    variant = "secondary",
    size = "md",
    icon,
    iconEnd,
    hotkey,
    loading,
    loadingLabel,
    fullWidth,
    children,
    className,
  } = props;
  const body = inner(icon, children, hotkey, iconEnd, loading, loadingLabel);
  if ("href" in props && props.href !== undefined) {
    const { href, target, download } = props;
    return (
      <Link
        href={href}
        target={target}
        download={download}
        className={classes(variant, size, fullWidth, className)}
      >
        {body}
      </Link>
    );
  }
  const {
    variant: _v,
    size: _s,
    icon: _i,
    iconEnd: _ie,
    hotkey: _h,
    loading: _l,
    loadingLabel: _ll,
    fullWidth: _fw,
    children: _c,
    className: _cl,
    href: _href,
    disabled,
    ...rest
  } = props as ButtonProps;
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes(variant, size, fullWidth, className)}
    >
      {body}
    </button>
  );
}

/**
 * A button that always shows its key — `hotkey` is required instead of
 * optional. Pure convenience for action bars in which every action has a key;
 * renders identically to `Button`.
 *
 * @when    Action bars where every action has a key.
 * @instead A single action whose key is optional → Button. An action that
 *          runs, can fail and may need a confirmation → ActionButton.
 */
export function KeyButton(props: (ButtonProps | ButtonLinkProps) & { hotkey: string }) {
  return <Button {...props} />;
}
