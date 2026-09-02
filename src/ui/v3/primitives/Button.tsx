import { Link } from "./Link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * v2-Knöpfe (F123 T123.1, Design `_ds` React-`Button` + `StapelSeite.dc.html`).
 *
 * Zwei Größen, weil das Design nur zwei kennt: `md` (40 px) trägt Kopf-Karte
 * und Aktionsleiste, `sm` (32 px) trägt Zeilen- und Kartenaktionen. Alles
 * andere — Radius, Farbe, Innenabstand — steht in `v2.css`.
 *
 * Server-Component: `href` rendert einen `Link`, `onClick` gehört in einen
 * Client-Wrapper des Aufrufers.
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
   * Die Taste, die dieselbe Handlung auslöst. Sie steht **am Knopf**, nicht
   * nur im Legende-Overlay — die Zielgruppe öffnet Ludwig alle zwei bis vier
   * Wochen und soll die Tastatur nicht auswendig lernen müssen (UX-Guidelines V14).
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
      {hotkey ? <span className="v2btn__key">· {hotkey}</span> : null}
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
 * Knopf, der seine Taste immer zeigt — `hotkey` ist Pflicht statt optional.
 * Reine Bequemlichkeit für Aktionsleisten, in denen jede Handlung eine Taste
 * hat; identisch gerendert zu `Button`.
 *
 * @when    Action bars where every action has a key.
 */
export function KeyButton(props: (ButtonProps | ButtonLinkProps) & { hotkey: string }) {
  return <Button {...props} />;
}
