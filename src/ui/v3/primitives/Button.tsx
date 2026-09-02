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
export type ButtonSize = "sm" | "md";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
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

function classes(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return `v2btn v2btn--${variant} v2btn--${size}${className ? ` ${className}` : ""}`;
}

function inner(icon: ReactNode, children: ReactNode, hotkey?: string) {
  return (
    <>
      {icon}
      <span>{children}</span>
      {hotkey ? <span className="v2btn__key">· {hotkey}</span> : null}
    </>
  );
}

/**
 * @when    Every action with a word: `md` in header card and action bar, `sm` in rows and cards.
 * @instead Jump to a page within prose → Link. Several actions side by side → ActionBar.
 */
export function Button(props: ButtonProps | ButtonLinkProps) {
  const { variant = "secondary", size = "md", icon, hotkey, children, className } = props;
  if ("href" in props && props.href !== undefined) {
    const { href, target, download } = props;
    return (
      <Link href={href} target={target} download={download} className={classes(variant, size, className)}>
        {inner(icon, children, hotkey)}
      </Link>
    );
  }
  const { variant: _v, size: _s, icon: _i, hotkey: _h, children: _c, className: _cl, href: _href, ...rest } =
    props as ButtonProps;
  return (
    <button type="button" {...rest} className={classes(variant, size, className)}>
      {inner(icon, children, hotkey)}
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
