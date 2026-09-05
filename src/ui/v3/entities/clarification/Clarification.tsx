import type { ReactNode } from "react";

import type {
  ClarificationState,
  ClarificationType,
} from "@/ludwig/modules/accounting-cases/domain/case";
import type { ClarificationSeverity } from "@/ludwig/modules/invoices/domain/invoice";

import { Disclosure } from "../../primitives/Disclosure";
import { EmptyState } from "../../primitives/EmptyState";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import type { TodoItem } from "../../patterns/TodoList";
import type { StateKind } from "../../patterns/Review";

/**
 * The reading family of a clarification question (0059): preview, row, list.
 *
 * One question stands on four surfaces — at the case („what is holding this
 * up?"), in the batch review („all queries of this batch in one go"), in the
 * portal („what does my firm need from me?") and at the agent run („what did
 * this run ask?"). Four surfaces, one question; the app builds four rows for
 * it today.
 *
 * The list stays small on purpose: 0 to 33 rows in the data (p90 is 1 at the
 * case, 28 in the batch). No paging, no sorting, no virtual scrolling — that
 * is what `DataTable` (0057) is for, and none of these lists is a list page.
 */

/** Who is expected to answer — `client_accounting_case_clarification.audience`. */
export type ClarificationAudience = "accounting" | "client" | "agent";

/** German word per audience; the axis has none, so it lives here (V7, T1). */
const AUDIENCE_LABEL: Record<ClarificationAudience, string> = {
  accounting: "Kanzlei",
  client: "Mandant",
  agent: "Agent",
};

/** Group order of the batch review: the firm's own work first. */
const AUDIENCE_ORDER: readonly ClarificationAudience[] = ["accounting", "client", "agent"];

/**
 * One row of `ludwig.client_accounting_case_clarification`, as far as a row
 * shows it (ranks 1–7 of the entity profile).
 *
 * `state` is **derived, never stored** — the caller runs `clarificationState()`
 * from `@/ludwig/modules/accounting-cases/domain/case`, so that „open" means
 * the same thing here as it does in a query.
 */
export interface ClarificationVM {
  id: string;
  /** Rank 1. Missing in 1 % of the rows — the caller substitutes, not the row. */
  title: string;
  state: ClarificationState;
  severity: ClarificationSeverity;
  /** A comment gets no answer and no severity — it is context, not work. */
  type: ClarificationType;
  audience: ClarificationAudience;
  /** `created_at` — ISO timestamp. */
  raisedAt: string;
  answeredAt?: string | null;
  /** The deferral day: the question is deliberately not now. */
  deferredUntil?: string | null;
  /** Only shown with `showCase`, in lists outside the case. */
  caseNumber?: string | null;
  caseTitle?: string | null;
  /** Without it the row is not a link (portal, read-only). */
  href?: string | null;
}

function stateBadges(c: ClarificationVM) {
  if (c.type === "comment") {
    return <StatusBadge axis="klaerung_typ" status="comment" info={false} />;
  }
  return (
    <>
      <StatusBadge axis="klaerung_status" status={c.state} info={false} />
      {/* Severity is a second axis and only matters while the answer is out. */}
      {c.state !== "answered" && c.severity === "required" ? (
        <StatusBadge axis="klaerung" status="required" info={false} />
      ) : null}
    </>
  );
}

/**
 * @when    A clarification named inside something else — the source behind a
 *          booking rationale, the counter-question behind a deferral.
 * @instead The question with its answer → ClarificationCard. A row in the list
 *          of a case or batch → ClarificationRow.
 */
export function ClarificationCell({
  clarification,
  href,
}: {
  clarification: ClarificationVM;
  href?: string;
}) {
  const target = href ?? clarification.href ?? undefined;
  const body = (
    <>
      {/* One line, cut with an ellipsis; the whole question is in the hover. */}
      <span className="v2cl__clamp" title={clarification.title}>
        {clarification.title}
      </span>
      {stateBadges(clarification)}
    </>
  );
  if (target) {
    return (
      <a className="v2cl__cell v2link" href={target}>
        {body}
      </a>
    );
  }
  return <span className="v2cl__cell">{body}</span>;
}

/**
 * @when    A clarification in a list — at the case, in the batch review, in
 *          the portal, at the run; with `detail` it folds open.
 * @instead Mentioned inside something else → ClarificationCell. Read or
 *          answered on its own → ClarificationCard. Several of them →
 *          ClarificationList.
 */
export function ClarificationRow({
  clarification: c,
  showCase,
  detail,
  defaultOpen,
}: {
  clarification: ClarificationVM;
  /** Puts case number and title in front — rank 6 is context, not identity. */
  showCase?: boolean;
  /** What appears when the row folds open; without it the row does not fold. */
  detail?: ReactNode;
  defaultOpen?: boolean;
}) {
  const head = (
    <div className="v2cl__row">
      {showCase && (c.caseNumber || c.caseTitle) ? (
        <div className="v2cl__case">
          {c.caseNumber ? (
            c.href ? (
              <a className="v2link" href={c.href}>
                {c.caseNumber}
              </a>
            ) : (
              <span className="v2main">{c.caseNumber}</span>
            )
          ) : null}
          {c.caseTitle ? <span className="v2sub">{c.caseTitle}</span> : null}
        </div>
      ) : null}

      <div className="v2cl__head">
        {/*
          The title is cut to one line — a question runs long and would push
          the badges around. The whole of it stays in the hover.
        */}
        <span className="v2main v2cl__clamp" title={c.title}>
          {c.title}
        </span>
        {/* Right-aligned: the state must not move with the length of the
            question, and down a list it becomes a column one can scan. */}
        <span className="v2cl__state">{stateBadges(c)}</span>
      </div>

      <div className="v2cl__meta">
        {/* A comment addresses nobody — naming an audience would claim work. */}
        {c.type === "question" ? (
          <>
            <span>{AUDIENCE_LABEL[c.audience]}</span>
            <span aria-hidden="true">·</span>
          </>
        ) : null}
        {/*
          Every date says what it is. While the question is out, its **age** is
          the pressure, so it is its age („vor 13 Tagen", exact form in the
          hover — `age`, not `relative`, which gives up after a week); once it
          is answered, the age of the question no longer
          matters and the answer date takes the place (T7).
        */}
        {c.answeredAt ? (
          <span>
            Beantwortet am <Time value={c.answeredAt} format="date" size="sm" />
          </span>
        ) : (
          <span>
            {c.type === "comment" ? "Notiert " : "Gefragt "}
            <Time value={c.raisedAt} format="age" size="sm" />
          </span>
        )}
        {/* „Deferred" is a state nobody may have to guess from a colour (V7). */}
        {c.state === "deferred" && c.deferredUntil ? (
          <>
            <span aria-hidden="true">·</span>
            <span>
              zurückgestellt bis <Time value={c.deferredUntil} format="date" size="sm" />
            </span>
          </>
        ) : null}
      </div>
    </div>
  );

  if (!detail) return <div className="v2cl__item">{head}</div>;

  // `Disclosure` is native `<details>` — the row folds open without a client
  // island, so the list can stay a server component.
  return (
    <div className="v2cl__item">
      <Disclosure summary={head} defaultOpen={defaultOpen} tone="quiet">
        {detail}
      </Disclosure>
    </div>
  );
}

/**
 * @when    The clarifications of a case, a batch, a run or a portal user —
 *          few rows, optionally grouped by who is asked.
 * @instead Hundreds of rows with columns, sorting and paging → DataTable. The
 *          course of the case itself → CaseTimeline. Items to work through →
 *          TodoList with `toTodoItem`.
 */
export function ClarificationList({
  clarifications,
  groupBy = "none",
  showCase,
  renderDetail,
  empty,
}: {
  /** The list does not reorder — the caller owns the order. */
  clarifications: readonly ClarificationVM[];
  groupBy?: "audience" | "none";
  showCase?: boolean;
  /** In the app the `ClarificationCard` (0060); without it the list stays flat. */
  renderDetail?: (c: ClarificationVM) => ReactNode;
  empty?: { title: string; hint?: string };
}) {
  if (clarifications.length === 0) {
    return (
      <EmptyState
        inline
        title={empty?.title ?? "Keine Rückfragen."}
        description={empty?.hint}
      />
    );
  }

  const row = (c: ClarificationVM) => (
    <ClarificationRow
      key={c.id}
      clarification={c}
      showCase={showCase}
      detail={renderDetail?.(c)}
      // A blocking question that is still open is the reason the case stands
      // still — it opens itself, the way the banner does today.
      defaultOpen={c.state === "open" && c.severity === "required" && c.type === "question"}
    />
  );

  if (groupBy === "none") return <div className="v2cl">{clarifications.map(row)}</div>;

  return (
    <div className="v2cl">
      {AUDIENCE_ORDER.map((audience) => {
        const rows = clarifications.filter((c) => c.audience === audience);
        if (rows.length === 0) return null;
        return (
          <section key={audience}>
            <h3 className="v2cl__group">
              {AUDIENCE_LABEL[audience]}
              <span className="v2cl__count">{rows.length}</span>
            </h3>
            {rows.map(row)}
          </section>
        );
      })}
    </div>
  );
}

/**
 * What a clarification state means for a to-do item.
 *
 * `deferred` maps to `skipped`, not to `open`: `TodoList`'s jump to the next
 * open item must not land on a question that is deliberately not now — that
 * is the whole point of a deferral.
 */
const TODO_STATE: Record<ClarificationState, StateKind> = {
  open: "question",
  deferred: "skipped",
  answered: "done",
};

/**
 * Returns `null` for a comment: a note is not work, so it has no place on a
 * list someone works through — the same rule that keeps comments out of
 * `CaseTimeline`. It lives here, not at the call site, so the third caller
 * cannot get it wrong.
 *
 * @when    Clarifications as items of a `TodoList` — a review step that works
 *          through them one by one.
 * @instead Reading them in place → ClarificationList. In the course of the
 *          case → CaseTimeline, which takes clarifications itself.
 */
export function toTodoItem(c: ClarificationVM): TodoItem | null {
  if (c.type === "comment") return null;
  return {
    id: c.id,
    state: TODO_STATE[c.state],
    title: c.title,
    sub: AUDIENCE_LABEL[c.audience],
    blocking: c.severity === "required",
  };
}
