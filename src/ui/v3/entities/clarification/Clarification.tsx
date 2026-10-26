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
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import type { TodoItem } from "../../patterns/TodoList";
import type { StateKind } from "../../patterns/Review";
import { Link } from "../../primitives/Link";

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

/**
 * German word per audience; the axis has none, so it lives here — **once**
 * for card, row and thread (V7, T1; acceptance 0214, M2).
 */
export const AUDIENCE_LABEL: Record<ClarificationAudience, string> = {
  accounting: "Kanzlei",
  client: "Mandant",
  agent: "Ludwig",
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
  /**
   * The answer given, as text — the chosen option or the free text (0224).
   * The app derives it from `answer_payload` (L-367); the row shows it under
   * the title.
   */
  answer?: string | null;
  /**
   * Why it was resolved without an answer, as text (0224, acceptance M2): a
   * resolution is no answer and must not read like one (entity profile
   * „Eine Antwort, nicht mehrere"). With it the row says „Anderweitig
   * geklärt: …" instead of „Antwort: …" and it wins over `answer`.
   * `…Reason`, because the column `resolution` holds the **kind**
   * (`answered`/`obsolete`), not the reason (second check of 0224, hint 3).
   */
  resolutionReason?: string | null;
}

/**
 * The word for a question closed without an answer — once, for the way out of
 * the card, its history, the row and the thread (0224, acceptance M2; one
 * word for one thing, llcto 2026-10-26: „Ohne Antwort aufgelöst" is gone).
 */
export const RESOLVED_WORD = "Anderweitig geklärt";

function stateBadges(c: ClarificationVM) {
  if (c.type === "comment") {
    return <StatusBadge axis="clarification_type" status="comment" info={false} />;
  }
  return (
    <>
      <StatusBadge axis="clarification" status={c.state} info={false} />
      {/* Severity is a second axis and only matters while the answer is out. */}
      {c.state !== "answered" && c.severity === "required" ? (
        <StatusBadge axis="clarification_severity" status="required" info={false} />
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
      <Link className="v2cl__cell v2link" href={target}>
        {body}
      </Link>
    );
  }
  return <span className="v2cl__cell">{body}</span>;
}

/**
 * @when    A clarification in a list — at the case, in the batch review, in
 *          the portal, at the run; with `detail` it folds open, with `onOpen`
 *          the whole row is a way to the question.
 * @instead Mentioned inside something else → ClarificationCell. Read or
 *          answered on its own → ClarificationCard. Several of them →
 *          ClarificationList.
 */
export function ClarificationRow({
  clarification: c,
  showCase,
  detail,
  defaultOpen,
  active = false,
  onOpen,
  hideBadges = false,
}: {
  clarification: ClarificationVM;
  /** Puts case number and title in front — rank 6 is context, not identity. */
  showCase?: boolean;
  /** What appears when the row folds open; without it the row does not fold. */
  detail?: ReactNode;
  defaultOpen?: boolean;
  /** The question shown beside the list — selected, so its row is marked (0214). */
  active?: boolean;
  /**
   * The row is a way to the question (0224): the title is a button whose
   * overlay covers the row. With it the row does not fold — one click, one
   * meaning.
   */
  onOpen?: () => void;
  /**
   * No badges (`groupBy="state"`, owner 2026-10-26): the group above says the
   * state, and nearly every question blocks, so „Blockierend" says nothing. An
   * optional question says so in a word in the meta line instead.
   */
  hideBadges?: boolean;
}) {
  const item = active ? "v2cl__item is-active" : "v2cl__item";
  const head = (
    <div className="v2cl__row">
      {showCase && (c.caseNumber || c.caseTitle) ? (
        <div className="v2cl__case">
          {c.caseNumber ? (
            c.href ? (
              <Link className="v2link" href={c.href}>
                {c.caseNumber}
              </Link>
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
        {onOpen ? (
          <button type="button" className="v2link v2rowlink v2cl__clamp v2cl__open" title={c.title} onClick={onOpen}>
            {c.title}
          </button>
        ) : (
          <span className="v2main v2cl__clamp" title={c.title}>
            {c.title}
          </span>
        )}
        {/* Right-aligned: the state must not move with the length of the
            question, and down a list it becomes a column one can scan. */}
        {hideBadges ? null : <span className="v2cl__state">{stateBadges(c)}</span>}
      </div>

      {/* What was answered — the reason the row is in the list at all, once
          the question is with Ludwig (0224). One line, whole in the hover. */}
      {c.resolutionReason ? (
        <span className="v2cl__answer v2cl__clamp" title={c.resolutionReason}>
          <span className="v2cl__answerlabel">{RESOLVED_WORD}:</span> {c.resolutionReason}
        </span>
      ) : c.answer ? (
        <span className="v2cl__answer v2cl__clamp" title={c.answer}>
          <span className="v2cl__answerlabel">Antwort:</span> {c.answer}
        </span>
      ) : null}

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
        {/* Without badges the exception gets a word: the registry's, in running
            text lower case like „zurückgestellt bis" (0224, owner 2026-10-26). */}
        {hideBadges && c.type === "question" && c.state !== "answered" && c.severity === "optional" ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{resolveStatus("clarification_severity", "optional").label.toLowerCase()}</span>
          </>
        ) : null}
      </div>
    </div>
  );

  if (!detail || onOpen)
    return (
      <div className={item} {...(active ? { "aria-current": "true" as const } : {})}>
        {head}
      </div>
    );

  // `Disclosure` is native `<details>` — the row folds open without a client
  // island, so the list can stay a server component.
  return (
    <div className={item} {...(active ? { "aria-current": "true" as const } : {})}>
      <Disclosure summary={head} defaultOpen={defaultOpen} tone="quiet">
        {detail}
      </Disclosure>
    </div>
  );
}

/** The order of `groupBy="state"` (0224): what is still to do first, then what is done; notes last. */
const STATE_ORDER: readonly ClarificationState[] = ["open", "deferred", "answered"];

/**
 * @when    The clarifications of a case, a batch, a run or a portal user —
 *          few rows, optionally grouped by who is asked or by state; with
 *          `onOpen` each open question is a way to it.
 * @instead Hundreds of rows with columns, sorting and paging → DataTable. The
 *          course of the case itself → CaseTimeline. Items to work through →
 *          TodoList with `toTodoItem`.
 */
export function ClarificationList({
  clarifications,
  groupBy = "none",
  showCase,
  renderDetail,
  openBlocking = true,
  empty,
  onOpen,
  activeId = null,
}: {
  /** The list does not reorder — the caller owns the order. */
  clarifications: readonly ClarificationVM[];
  /**
   * `state`: Offen · Zurückgestellt · Beantwortet, then the notes — words from
   * the registry; the badges leave the rows (0224).
   */
  groupBy?: "audience" | "none" | "state";
  showCase?: boolean;
  /** In the app the `ClarificationCard` (0060); without it the list stays flat. */
  renderDetail?: (c: ClarificationVM) => ReactNode;
  /**
   * An open blocking question folds open by itself. `false` where it already
   * stands open elsewhere on the page — the case's „Zu tun" — so the same
   * answer form does not appear twice (owner 2026-09-18).
   */
  openBlocking?: boolean;
  empty?: { title: string; hint?: string };
  /**
   * Open and deferred questions become a way to the question — in the batch
   * review a jump back into the run (0224). Answered questions and notes get
   * none: they are read here, folded open with `renderDetail`.
   */
  onOpen?: (c: ClarificationVM) => void;
  /** The question on screen right now; its row is marked. */
  activeId?: string | null;
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

  const row = (c: ClarificationVM) => {
    const open = onOpen && c.type === "question" && c.state !== "answered" ? () => onOpen(c) : undefined;
    return (
      <ClarificationRow
        key={c.id}
        clarification={c}
        showCase={showCase}
        detail={open ? undefined : renderDetail?.(c)}
        // A blocking question that is still open is the reason the case stands
        // still — it opens itself, the way the banner does today.
        defaultOpen={openBlocking && c.state === "open" && c.severity === "required" && c.type === "question"}
        active={activeId !== null && c.id === activeId}
        onOpen={open}
        hideBadges={groupBy === "state"}
      />
    );
  };

  if (groupBy === "none") return <div className="v2cl">{clarifications.map(row)}</div>;

  const groups: { key: string; label: string; rows: readonly ClarificationVM[] }[] =
    groupBy === "audience"
      ? AUDIENCE_ORDER.map((a) => ({ key: a, label: AUDIENCE_LABEL[a], rows: clarifications.filter((c) => c.audience === a) }))
      : [
          ...STATE_ORDER.map((st) => ({
            key: st,
            label: resolveStatus("clarification", st).label,
            rows: clarifications.filter((c) => c.type === "question" && c.state === st),
          })),
          {
            key: "comment",
            label: resolveStatus("clarification_type", "comment").label,
            rows: clarifications.filter((c) => c.type === "comment"),
          },
        ];

  return (
    <div className="v2cl">
      {groups.map((g) =>
        g.rows.length === 0 ? null : (
          <section key={g.key}>
            <h3 className="v2cl__group">
              {g.label}
              <span className="v2cl__count">{g.rows.length}</span>
            </h3>
            {g.rows.map(row)}
          </section>
        ),
      )}
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

/** Open and blocking first, then open, then deferred; answered questions and notes last. */
const CASE_RANK: Record<ClarificationState, number> = { open: 1, deferred: 2, answered: 3 };

function caseRank(c: ClarificationVM) {
  if (c.type === "comment") return 3;
  return c.state === "open" && c.severity === "required" ? 0 : CASE_RANK[c.state];
}

/**
 * The order of the list at the case (J-49): what holds the case up first,
 * then open, then deferred, then the rest — answered questions and notes
 * together, newest first (owner 2026-09-18). A new array; the list itself
 * still does not reorder, so the batch and the portal keep their own order.
 *
 * @when    Questions and notes of **one** case in one list — side column,
 *          clarifications tab.
 * @instead Grouped by who is asked (batch review) → `groupBy="audience"` on
 *          the caller's order. Items to work through → toTodoItem.
 */
export function sortForCase<T extends ClarificationVM>(list: readonly T[]): T[] {
  return [...list].sort(
    (a, b) => caseRank(a) - caseRank(b) || b.raisedAt.localeCompare(a.raisedAt),
  );
}
