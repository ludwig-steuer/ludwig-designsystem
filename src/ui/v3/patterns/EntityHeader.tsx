import type { ReactNode } from "react";

import { FieldList } from "../primitives/FieldList";

/**
 * The card above a record (0048) — the first half second on a detail page:
 * what is this, in which state, how much money is on it.
 *
 * Every slot is optional and every empty slot takes its whole line with it,
 * including the gap. Two of those decisions come from the page profile
 * (`docs/seiten/sachverhalt-detail.md`):
 *
 * - **No empty metric.** Without `metric` nothing stands in the strongest
 *   place of the page — „TOTAL —" costs the best position for an answer that
 *   does not exist.
 * - **One state, not four.** `status` takes a single node. The other axes
 *   belong where they apply: on the event, in the facts line, in the
 *   timeline.
 *
 * @when    The head of a record's detail page: symbol, title, one state,
 *          a metric, facts.
 * @instead The header of the page itself (area, actions, way back) →
 *          PageHeader. A record's state defining the whole page →
 *          StatusCallout. A card around a table → Card with CardHead.
 */
export function EntityHeader({
  icon,
  overline,
  title,
  status,
  meta,
  metric,
  process,
  summary,
  facts,
  actions,
}: {
  /**
   * The symbol tile. Comes from the caller, **not** from a status axis — this
   * head also has to work for an account or a partner, which have no axis
   * with an icon.
   */
  icon?: ReactNode;
  /** Where this sits: entity and number („Sachverhalt · 2026-0815"). */
  overline?: ReactNode;
  /** The subject, once. No full stop (T3). */
  title: ReactNode;
  /** **One** state — the leading axis. */
  status?: ReactNode;
  /**
   * The line under the title: links, chips, short facts. The caller composes
   * it; the card only separates the parts with a dot — so every child has to
   * be an inline element. A block with its own label (`InlineEdit`) belongs
   * in `summary`, not here.
   */
  meta?: ReactNode;
  /** The value comes formatted (`Amount`); the card does not calculate. */
  metric?: { label: string; value: ReactNode };
  /**
   * The process picture of a chain (Z7) — its own line between the title block
   * and `summary`.
   *
   * A `ReactNode`, not `ProcessPhase[]`: `patterns/` knows no entity, and which
   * phases a chain has only the caller knows. The head calculates nothing and
   * does not know a stepper is standing there — it keeps a line free. The same
   * place therefore works for `ProcessMini` on a narrow page.
   *
   * **It does not compete with `status`.** The badge sits in the title line and
   * answers „in which state"; this sits a line below and answers „where in the
   * chain". D7 forbids two displays of the same question — and a `StatusBadge`
   * in here would be exactly that.
   */
  process?: ReactNode;
  /** One line, only when there is text — no placeholder for an empty summary. */
  summary?: ReactNode;
  /** The facts line — goes through `FieldList layout="row"` (0049). */
  facts?: [ReactNode, ReactNode][];
  actions?: ReactNode;
}) {
  return (
    <div className="v2ehead">
      <div className="v2ehead__top">
        {icon ? <span className="v2ehead__ico">{icon}</span> : null}
        <div className="v2ehead__id">
          {overline ? <div className="v2ehead__over">{overline}</div> : null}
          <div className="v2ehead__title">
            <span>{title}</span>
            {status}
          </div>
          {meta ? <div className="v2ehead__meta">{meta}</div> : null}
        </div>
        {metric ? (
          <div className="v2ehead__metric">
            <div className="v2ehead__metric__label">{metric.label}</div>
            <div className="v2ehead__metric__value">{metric.value}</div>
          </div>
        ) : null}
        {actions ? <div className="v2ehead__actions">{actions}</div> : null}
      </div>
      {process ? <div className="v2ehead__process">{process}</div> : null}
      {summary ? <div className="v2ehead__summary">{summary}</div> : null}
      {facts && facts.length > 0 ? (
        <div className="v2ehead__facts">
          <FieldList rows={facts} tone="bare" layout="row" />
        </div>
      ) : null}
    </div>
  );
}
