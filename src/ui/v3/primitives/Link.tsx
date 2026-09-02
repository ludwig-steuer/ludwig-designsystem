import type { AnchorHTMLAttributes } from "react";

/**
 * Der Link des Design-Systems.
 *
 * Bewusst ein schlichtes `<a>`: `next/link` würde das Bundle an den
 * Next-Runtime koppeln, und außerhalb der App — in Claude Design, in einem
 * Storybook, in jedem anderen Konsumenten — existiert der nicht. Die
 * Komponenten nutzen ohnehin nur `<a>`-Semantik (href, target, download,
 * aria-current), kein Prefetch, kein Router-Feature.
 *
 * ponytail: Wenn die App v3 übernimmt und clientseitige Navigation braucht,
 * wird NUR diese Datei auf `next/link` umgestellt — nicht die sechs
 * Komponenten, die hier importieren.
 */
export function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={href} {...rest} />;
}
