import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "./Link";

/**
 * The head of a page (0002).
 *
 * It is the anchor that does not move: it stands while the content below is
 * still loading. Everything but the title is optional — a head with four empty
 * slots is a head with a title.
 */

/**
 * @when    The top of every page: what this is, in what context, what can be
 *          done with it.
 * @instead The head of a card inside the page → CardHead. Switching views
 *          below the head → Tabs. Narrowing a list → FilterBar.
 */
export function PageHeader({
  overline,
  title,
  description,
  meta,
  actions,
  back,
}: {
  /** Where this sits: area, fiscal year, client. */
  overline?: string;
  /** What this is — the object, not the activity. No full stop (T3). */
  title: ReactNode;
  description?: ReactNode;
  /** State next to the title — StatusBadge, timestamp. */
  meta?: ReactNode;
  /** Actions of the page, exactly one of them primary. */
  actions?: ReactNode;
  /** The way back; `label` names the target, never „Zurück" (V14). */
  back?: { href: string; label: string };
}) {
  return (
    <header className="v2phead">
      {back ? (
        <Link href={back.href} className="v2phead__back">
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className="v2phead__main">
        <div>
          {overline ? <div className="v2phead__over">{overline}</div> : null}
          <div className="v2phead__titlerow">
            <h1 className="v2phead__title">{title}</h1>
            {meta}
          </div>
          {description ? <p className="v2phead__desc">{description}</p> : null}
        </div>
        {actions ? <div className="v2phead__acts">{actions}</div> : null}
      </div>
    </header>
  );
}
