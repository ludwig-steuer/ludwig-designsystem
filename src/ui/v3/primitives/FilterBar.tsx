import type { ReactNode } from "react";
import { formatCount } from "../format";
import { Button } from "./Button";
import { FilterAutoSubmit } from "./FilterAutoSubmit";
import { Link } from "./Link";
import { TextButton } from "./TextButton";

/**
 * The filter row above the card (0003).
 *
 * Twelve pages build this by hand today. It is deliberately only the shell:
 * it holds no filter state, reads no URL, validates nothing. All of that is
 * domain knowledge and stays at the call site — otherwise the shell would
 * pull `useSearchParams` and with it the router into the design system.
 *
 * **It already works as a server form**, and that is worth saying because it
 * is not obvious: no `"use client"`, no state, `submitLabel` renders a plain
 * `type="submit"`, and `resetHref` is the link version of `onReset`. Wrap it
 * in `<form method="get">` and the fields end up in the query string — no
 * client component anywhere. The same holds for `Field`, `Input` and `Select`
 * (`Form.tsx`), which are server components too. A page that reaches for its
 * own `inputStyle` instead is not missing a building block (finding of the
 * DATEV page, 2026-09-08).
 */

/**
 * **The rule since 0200** (design guidelines I4, F1–F7): filters act on the
 * click, „Zurücksetzen" is always there (locked while nothing is set), and
 * `result` says how much of the list is left — „Gefiltert: 12 von 47".
 *
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
  result,
  autoSubmit,
}: {
  children: ReactNode;
  /** How many filters are set — said as a word, not only as a colour (V7). */
  activeCount?: number;
  onReset?: () => void;
  /** Server-form alternative to `onReset`: a link to the unfiltered page. */
  resetHref?: string;
  /**
   * A button „Filtern" — **the exception** (F1): only where a query is
   * noticeably expensive, and the page says why in its code. Without it the
   * fields take effect immediately.
   */
  submitLabel?: string;
  /**
   * What the filter leaves of the list, counted with the list's own filter
   * (I12): „Gefiltert: 12 von 47"; unfiltered the total with its word, „47
   * Belege". Replaces „n Filter gesetzt".
   */
  result?: { shown: number; total: number; unit?: readonly [one: string, other: string] };
  /**
   * Inside a `<form method="get">`: every change sends the form — a server
   * page filters on the click too (F1). Text waits for a short pause.
   */
  autoSubmit?: boolean;
}) {
  const active = activeCount ?? 0;
  const count = result
    ? active > 0
      ? `Gefiltert: ${formatCount(result.shown)} von ${formatCount(result.total)}`
      : result.unit
        ? formatCount(result.total, result.unit)
        : formatCount(result.total)
    : active > 0
      ? active === 1
        ? "1 Filter gesetzt"
        : `${active} Filter gesetzt`
      : null;
  return (
    <div className="v2fbar">
      {autoSubmit ? <FilterAutoSubmit /> : null}
      {children}
      <div className="v2fbar__end">
        {submitLabel ? (
          <Button size="sm" variant="primary" type="submit">
            {submitLabel}
          </Button>
        ) : null}
        {count ? <span className="v2fbar__count">{count}</span> : null}
        {/* Always there (F2): locked while nothing is set, so the bar does not
            jump and the way back is where it always is. */}
        {active > 0 && onReset ? (
          <TextButton tone="quiet" onClick={onReset}>
            Zurücksetzen
          </TextButton>
        ) : active > 0 && resetHref ? (
          <Link href={resetHref} className="v2link v2link--quiet">
            Zurücksetzen
          </Link>
        ) : onReset || resetHref ? (
          <TextButton tone="quiet" disabled>
            Zurücksetzen
          </TextButton>
        ) : null}
      </div>
    </div>
  );
}
