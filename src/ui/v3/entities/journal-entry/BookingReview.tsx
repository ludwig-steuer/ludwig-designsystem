import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import { CheckItems, type CheckItem } from "../../patterns/Review";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Badge } from "../../primitives/Badge";
import { AiBookingNotesBody, type JudgeVerdict } from "./AiBookingNotes";
import { JournalEntryCard, type JournalLine } from "./JournalEntryCompact";

/**
 * The review of a case's entries — one view for the row's fold-out and the
 * case view (F355 / 0219, owner 2026-10-01; template: the case view).
 *
 * Always in the same order: the entry, whole and on white; why Ludwig booked it
 * so; what the checks say; what the judge says. What is empty does not stand
 * there — not even its heading. Several entries of one case stand one under
 * the other, each complete with its own checks (§3a).
 */

export interface BookingReviewEntry {
  id: string;
  /** **Every** line of the entry — tax, § 13b and the contra account included. Never filtered (§3a). */
  lines: readonly JournalLine[];
  currency: Currency;
  /** The full entry for `lines="full"`: `JournalEntryGrid` to read, `JournalEntryEditor` to edit — composed by the caller. */
  full?: ReactNode;
  /** The entry kind as the app's registry words it — „Aufwand", „Zahlung", „Aufwand mit Zahlung" (P58). */
  kindLabel?: string | null;
  kindDescription?: string | null;
  /** Axis `journal_entry`. */
  status?: string | null;
  /** The agent's rationale — empty for routine (F356). */
  rationale?: string | null;
  verdict?: JudgeVerdict | null;
  judgeReasoning?: string | null;
  checks?: readonly CheckItem[];
  /** Document & VAT, or the payment — beside the entry. */
  evidence?: ReactNode;
  /** Actions on this entry („Diesen Satz ablehnen"), under its blocks. */
  actions?: ReactNode;
}

export type BookingReviewBlock = "kind" | "rationale" | "checks" | "judge" | "evidence";

/** The judge counts only where it adds something: a verdict other than confirm, or a sentence. */
function judgeRelevant(e: BookingReviewEntry): boolean {
  return Boolean(e.judgeReasoning) || (e.verdict != null && e.verdict !== "confirm");
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="v3bkr__block">
      <h4 className="lw-overline v3bkr__label">{label}</h4>
      {children}
    </section>
  );
}

/**
 * @when    The entries of one case to be reviewed — in the fold-out of a list
 *          (`lines="compact"`) or as the case view (`lines="full"`, the editor
 *          in the slot).
 * @instead One entry to read on its own → JournalEntryGrid. Its lines alone →
 *          JournalEntryCard. Changing it → JournalEntryEditor (in `full`).
 */
export function BookingReview({
  entries,
  lines = "compact",
  show = {},
  accountHref,
  taxKeyHref,
}: {
  entries: readonly BookingReviewEntry[];
  /** `compact`: the lines as in the journal. `full`: `entry.full`, else the compact lines. */
  lines?: "compact" | "full";
  /** Switch blocks off; all are on by default. An empty block never renders. */
  show?: Partial<Record<BookingReviewBlock, boolean>>;
  accountHref?: (accountNumber: string) => string;
  taxKeyHref?: (taxKey: string) => string;
}) {
  const on = (b: BookingReviewBlock) => show[b] !== false;
  return (
    <div className="v3bkr">
      {entries.map((e, i) => {
        const kind = on("kind") && e.kindLabel ? e.kindLabel : null;
        // In `full` the entry's own form (grid, editor) shows the status — the
        // head would say it twice.
        const status = lines === "full" && e.full ? null : (e.status ?? null);
        const head = entries.length > 1 || kind || status;
        const evidence = on("evidence") && e.evidence ? e.evidence : null;
        const body = (
          <div className="v3bkr__main">
            {head ? (
              <div className="v3bkr__head">
                {entries.length > 1 ? (
                  <span className="lw-overline">
                    Satz {i + 1} von {entries.length}
                  </span>
                ) : null}
                {kind ? (
                  <span title={e.kindDescription ?? undefined}>
                    <Badge tone="neutral">{kind}</Badge>
                  </span>
                ) : null}
                {status ? (
                  <span className="v3bkr__status">
                    <StatusBadge axis="journal_entry" status={status} info={false} />
                  </span>
                ) : null}
              </div>
            ) : null}
            {/* On white, also inside a list's grey fold-out: the entry is what is
                read first and longest (brief §3). */}
            <div className="v3bkr__entry">
              {lines === "full" && e.full ? (
                e.full
              ) : (
                <JournalEntryCard
                  lines={e.lines}
                  currency={e.currency}
                  totals={false}
                  {...(accountHref ? { accountHref } : {})}
                  {...(taxKeyHref ? { taxKeyHref } : {})}
                />
              )}
            </div>
            {/* The rationale labels its own row („Begründung") — a heading over
                it would say the word twice. */}
            {on("rationale") && e.rationale ? <AiBookingNotesBody rationale={e.rationale} /> : null}
            {on("checks") && e.checks && e.checks.length > 0 ? (
              <Block label="Prüfpunkte">
                <CheckItems items={[...e.checks]} />
              </Block>
            ) : null}
            {on("judge") && judgeRelevant(e) ? (
              <section className="v3bkr__block">
                <div className="v3bkr__judge">
                  <h4 className="lw-overline v3bkr__label">Judge</h4>
                  {e.verdict ? <StatusBadge axis="judge" status={e.verdict} info={false} /> : null}
                </div>
                {e.judgeReasoning ? <AiBookingNotesBody judgeReasoning={e.judgeReasoning} /> : null}
              </section>
            ) : null}
            {e.actions ? <div className="v3bkr__actions">{e.actions}</div> : null}
          </div>
        );
        return (
          <article key={e.id} className={evidence ? "v3bkr__item v3bkr__item--aside" : "v3bkr__item"}>
            {body}
            {evidence ? <aside className="v3bkr__aside">{evidence}</aside> : null}
          </article>
        );
      })}
    </div>
  );
}
