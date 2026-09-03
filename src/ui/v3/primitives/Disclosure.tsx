import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The fold-out (0005) — native `<details>`, styled.
 *
 * No JavaScript and no state prop: opening and closing, keyboard and
 * accessibility come from the element itself. The chevron turns via CSS
 * (`.v2disc[open]`), which is why this stays a server component.
 */

export type DisclosureTone = "default" | "quiet";

/**
 * @when    Secondary content that has a place but not the first look — raw
 *          data, a rule set, a long list under a summary.
 * @instead Two things side by side, one selected → MasterDetail. A decision
 *          that must be made now → Dialog. Steps in order → StepRail.
 */
export function Disclosure({
  summary,
  count,
  children,
  defaultOpen,
  tone = "default",
}: {
  /** Says what is inside, in half a sentence — never „Details" (T2). */
  summary: ReactNode;
  /** How many entries are inside; stands next to the summary. */
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: DisclosureTone;
}) {
  return (
    <details className={`v2disc${tone === "quiet" ? " v2disc--quiet" : ""}`} open={defaultOpen}>
      <summary className="v2disc__sum">
        <ChevronRight className="v2disc__chev" size={14} strokeWidth={1.5} aria-hidden="true" />
        <span>{summary}</span>
        {count === undefined ? null : <span className="v2disc__count">{count}</span>}
      </summary>
      <div className="v2disc__body">{children}</div>
    </details>
  );
}
