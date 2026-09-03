import type { ReactNode } from "react";
import { Button } from "./Button";
import { Link } from "./Link";
import { TextButton } from "./TextButton";

/**
 * The filter row above the card (0003).
 *
 * Twelve pages build this by hand today. It is deliberately only the shell:
 * it holds no filter state, reads no URL, validates nothing. All of that is
 * domain knowledge and stays at the call site — otherwise the shell would
 * pull `useSearchParams` and with it the router into the design system.
 */

/**
 * @when    Above a list that can be narrowed — the fields in reading order,
 *          how many filters are set, the way back to everything.
 * @instead A handful of exclusive values → FilterChips. Full-text search
 *          alone → SearchInput. Switching between views → Tabs.
 */
export function FilterBar({
  children,
  activeCount,
  onReset,
  resetHref,
  submitLabel,
}: {
  children: ReactNode;
  /** How many filters are set — said as a word, not only as a colour (V7). */
  activeCount?: number;
  onReset?: () => void;
  /** Server-form alternative to `onReset`: a link to the unfiltered page. */
  resetHref?: string;
  /** Without it the fields take effect immediately and there is no button. */
  submitLabel?: string;
}) {
  const active = activeCount ?? 0;
  return (
    <div className="v2fbar">
      {children}
      <div className="v2fbar__end">
        {submitLabel ? (
          <Button size="sm" variant="primary" type="submit">
            {submitLabel}
          </Button>
        ) : null}
        {active > 0 ? (
          <span className="v2fbar__count">
            {active === 1 ? "1 Filter gesetzt" : `${active} Filter gesetzt`}
          </span>
        ) : null}
        {active > 0 && onReset ? (
          <TextButton tone="quiet" onClick={onReset}>
            Zurücksetzen
          </TextButton>
        ) : null}
        {active > 0 && !onReset && resetHref ? (
          <Link href={resetHref} className="v2link v2link--quiet">
            Zurücksetzen
          </Link>
        ) : null}
      </div>
    </div>
  );
}
