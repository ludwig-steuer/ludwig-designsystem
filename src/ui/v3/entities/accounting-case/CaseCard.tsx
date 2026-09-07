import type { ReactNode } from "react";

import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { asCurrency } from "@/ludwig/shared/money";

import { Amount } from "../../primitives/Amount";
import { Link } from "../../primitives/Link";
import { Card, CardHead } from "../../primitives/Table";
import { StatusBadge } from "../../patterns/StatusBadge";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { caseIdentifier, caseTitle, type CaseLink } from "./case-title";
import { caseKindLabel } from "@/ludwig/modules/accounting-cases/domain/case";

/**
 * The case as a **card** — the shape it takes where it does not stand in a
 * row, but with what hangs underneath it (0081).
 *
 * What hangs underneath are **foreign entities** — documents, journal
 * proposals — with profiles and forms of their own. A card that knew them
 * would have to import them and carry their empty state; a card with a
 * `children` slot gives them room and stays with its own entity. Same shape
 * as `CaseDetailView` (0050) and `LedgerAccountView` (0063), same reason.
 */

/** What the card reads: the family's link type plus two fields of the list item. */
export type CaseCardData = CaseLink & Pick<CaseListItem, "summary" | "disposition">;

/** One line of facts under the head — every part optional, none a dash. */
function Meta({ case: c }: { case: CaseCardData }) {
  const teile: ReactNode[] = [];
  teile.push(<span key="kind">{caseKindLabel(c.kind)}</span>);
  if (c.amount != null) {
    teile.push(
      <Amount key="amount" value={c.amount} currency={asCurrency(c.currency)} size="sm" />,
    );
  }
  // The counterparty stands here **unless** there is no `title` — then the
  // display name already carries it through the fallback chain. Measured in
  // the profile: in 51 % of the cases that do have a `title` it is not in
  // there, so leaving it out in general would be the more frequent mistake.
  if (c.title && c.counterpartyName) {
    teile.push(<span key="who">{c.counterpartyName}</span>);
  }
  if (c.disposition) {
    teile.push(<span key="disp">{resolveStatus("disposition", c.disposition).label}</span>);
  }
  return (
    <div className="v2casecard__meta">
      {teile.map((t, i) => (
        <span key={i} className="v2casecard__metaitem">
          {t}
        </span>
      ))}
    </div>
  );
}

/**
 * @when    A case with what hangs underneath it — the acceptance list, where
 *          one takes the proposals of a run one by one.
 * @instead The case as a row in a list → CaseRow. Named inside a foreign row →
 *          CaseCell. Everything about it → CaseFacts or CaseDetailView.
 */
export function CaseCard({
  case: c,
  href,
  aside,
  children,
  summaryLimit = 160,
}: {
  case: CaseCardData;
  /** The way to the case. Without it the head is text — never a button that does nothing. */
  href?: string;
  /** Beside the head: what **this list** says about the case, its selection for one. */
  aside?: ReactNode;
  /** What hangs underneath — documents, proposals. Without children the area falls away with its spacing. */
  children?: ReactNode;
  /** 160 by default (p90 is 309 — unshortened it is a paragraph, not a card); `0` shows it whole. */
  summaryLimit?: number;
}) {
  const name = caseTitle(c);
  const summary = c.summary ?? null;
  const gekuerzt =
    summary && summaryLimit > 0 && summary.length > summaryLimit
      ? `${summary.slice(0, summaryLimit).trimEnd()}…`
      : summary;

  return (
    <Card>
      <CardHead
        title={
          <span className="v2casecard__title">
            {href ? <Link href={href}>{name}</Link> : name}
            {c.lifecycleStatus ? (
              <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} info={false} />
            ) : null}
          </span>
        }
        sub={caseIdentifier(c)}
        actions={aside}
      />
      <div className="v2casecard__body">
        <Meta case={c} />
        {gekuerzt ? (
          // The whole text in the `title`: a shortened value with no way to
          // the whole one is a truncation, not a summary.
          <p className="v2casecard__summary" title={summary ?? undefined}>
            {gekuerzt}
          </p>
        ) : null}
      </div>
      {/* No empty frame: without children the area is gone, spacing and all —
          a case with nothing under it must not look as if something were
          missing. */}
      {children ? <div className="v2casecard__subs">{children}</div> : null}
    </Card>
  );
}
