import type { AnchorHTMLAttributes, Ref } from "react";

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
