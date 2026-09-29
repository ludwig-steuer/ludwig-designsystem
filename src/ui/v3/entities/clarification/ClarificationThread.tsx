import { Disclosure } from "../../primitives/Disclosure";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import type { ClarificationVM } from "./Clarification";
import { actorName, type ClarificationDetailVM, type ClarificationEvent } from "./ClarificationCard";

/**
 * The thread of a case (0214, owner 2026-09-29): every question and note of
 * the case in time order, oldest first — read like a chat. A question has
 * exactly one answer; when it goes back and forth, Ludwig asks a new
 * question on the same case (staging: 40 of 223 cases have several, up to
 * 12). Each entry folds open for its details and stays closed by default; the
 * question on screen stands last, marked, and is not written out twice.
 */

/** The words of `Clarification.tsx` — no axis carries the audience yet. */
const AUDIENCE_WORD: Record<ClarificationVM["audience"], string> = {
  accounting: "Kanzlei",
  client: "Mandant",
  agent: "Ludwig",
};

export type ThreadItem = ClarificationVM & Pick<ClarificationDetailVM, "question" | "raisedBy" | "answeredBy" | "history" | "deferredReason">;

function Line({ c, current }: { c: ThreadItem; current: boolean }) {
  const isComment = c.type === "comment";
  return (
    <span className="v3clt__line">
      <span className="v3clt__kind">{isComment ? "Notiz" : "Frage"}</span>
      <span>
        {actorName(c.raisedBy, "Ludwig")}
        {isComment ? null : ` → ${AUDIENCE_WORD[c.audience]}`}
      </span>
      <Time value={c.raisedAt} format="date" size="sm" />
      {isComment ? null : <StatusBadge axis="clarification" status={c.state} info={false} />}
      <span className="v3clt__title" title={c.title}>
        {c.title}
      </span>
      {current ? <span className="v3clt__current">aktuell</span> : null}
    </span>
  );
}

const STEP: Record<Exclude<ClarificationEvent["kind"], "raised">, string> = {
  answered: "Antwort",
  resolved: "Anderweitig geklärt",
  deferred: "Zurückgestellt",
};

/** What happened to a question after it was asked — answer, resolution, deferral — with who and when. */
function Steps({ c }: { c: ThreadItem }) {
  const events = (c.history ?? []).filter((e) => e.kind !== "raised");
  // Without an audit trail the row still says who answered and when.
  const steps: ClarificationEvent[] =
    events.length > 0 ? events : c.answeredAt ? [{ kind: "answered", at: c.answeredAt, by: c.answeredBy ?? null }] : [];
  return (
    <div className="v3clt__detail">
      <p className="v3clt__q">{c.question ?? c.title}</p>
      {steps.length === 0 ? <p className="v2muted">Noch keine Antwort.</p> : null}
      {steps.map((e, i) => (
        <div key={`${e.kind}-${e.at}-${i}`} className="v3clt__step">
          <span className="v3clt__stephead">
            <strong>{STEP[e.kind as keyof typeof STEP]}</strong>
            {e.kind === "deferred" && c.deferredUntil ? (
              <>
                {" bis "}
                <Time value={c.deferredUntil} format="date" size="sm" />
              </>
            ) : null}
            {" · "}
            {actorName(e.by, "System")}
            {" · "}
            <Time value={e.at} format="dateTime" size="sm" />
          </span>
          {e.text ? <p className="v3clt__text">{e.text}</p> : null}
        </div>
      ))}
    </div>
  );
}

/**
 * @when    Under the clarification card: every question and note of the case
 *          in time order, each folding open for answer, resolution, deferral.
 * @instead One question with everything it carries → ClarificationCard. The
 *          questions of a batch grouped by who is asked → ClarificationList.
 *          The course of the case itself → CaseTimeline.
 */
export function ClarificationThread({
  items,
  currentId,
  defaultOpen = false,
}: {
  /** Oldest first — the app orders (E2). */
  items: readonly ThreadItem[];
  /** The question on screen: marked, not written out again. */
  currentId?: string;
  /** Closed by default: the question on screen comes first. */
  defaultOpen?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="v3clt" aria-label="Verlauf der Rückfragen">
      <Disclosure summary="Verlauf" count={items.length} defaultOpen={defaultOpen}>
        <ol className="v3clt__list">
          {/* In the order the app hands in — oldest first (E2). */}
          {items.map((c) => {
            const current = c.id === currentId;
            return (
              <li key={c.id} className={current ? "v3clt__item is-current" : "v3clt__item"}>
                {current || c.type === "comment" ? (
                  // The question on screen: marked, not written out twice. A
                  // note awaits no answer — its line is all there is.
                  <div className="v3clt__currentrow">
                    <Line c={c} current={current} />
                  </div>
                ) : (
                  <Disclosure summary={<Line c={c} current={false} />} tone="quiet">
                    <Steps c={c} />
                  </Disclosure>
                )}
              </li>
            );
          })}
        </ol>
      </Disclosure>
    </section>
  );
}
