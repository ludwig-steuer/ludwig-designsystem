import { ActionIcon } from "../Icons";
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
 *          data, a rule set, a long list under a summary; with `group` a set
 *          of sections of which only one stays open.
 * @instead Two things side by side, one selected → MasterDetail. A decision
 *          that must be made now → Dialog. Steps in order → StepRail.
 */
export function Disclosure({
  summary,
  count,
  children,
  defaultOpen,
  tone = "default",
  group,
}: {
  /** Says what is inside, in half a sentence — never „Details" (T2). */
  summary: ReactNode;
  /** How many entries are inside; stands next to the summary. */
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
  tone?: DisclosureTone;
  /**
   * Fold-outs sharing a `group` close each other — native `name` on
   * `<details>`, which is why this needs no state either.
   */
  group?: string;
}) {
  return (
    <details
      className={`v2disc${tone === "quiet" ? " v2disc--quiet" : ""}`}
      open={defaultOpen}
      name={group}
    >
      <summary className="v2disc__sum">
        <ActionIcon action="collapse" size={14} className="v2disc__chev" />
        <span className="v2disc__label">{summary}</span>
        {count === undefined ? null : <span className="v2disc__count">{count}</span>}
      </summary>
      <div className="v2disc__body">{children}</div>
    </details>
  );
}
