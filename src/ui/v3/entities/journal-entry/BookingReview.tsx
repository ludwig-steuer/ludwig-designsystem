import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import type { ConfidenceLevel } from "../../patterns/Confidence";
import { ProvenanceRows } from "../../patterns/Provenance";
import { CheckItems, type CheckItem } from "../../patterns/Review";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Badge } from "../../primitives/Badge";
import { AiBookingNotesBody, type AiSource, type JudgeVerdict } from "./AiBookingNotes";
import { JournalEntryCard, type JournalLine } from "./JournalEntryCompact";

/**
 * The review of a case's entries — one view for the row's fold-out and the
 * case view (F355 / 0219, owner 2026-10-01; template: the case view).
 *
 * Always in the same order: the entry, whole and on white; why Ludwig booked it
 * so; what the checks say; what the judge says; the actions. What is empty does
 * not stand there — not even its heading. Several entries of one case stand one
 * under the other, each complete with its own checks (§3a).
 */

export interface BookingReviewEntry {
  id: string;
  /** **Every** line of the entry — tax, § 13b and the contra account included. Never filtered (§3a). */
  lines: readonly JournalLine[];
  currency: Currency;
  /** The full entry for `lines="full"`: `JournalEntryGrid` to read, `JournalEntryEditor` to edit — composed by the caller. */
  full?: ReactNode;
  /** This entry's kind as the app's registry words it — „Aufwand", „Zahlung" (P58). */
  kindLabel?: string | null;
  kindDescription?: string | null;
  /** Axis `journal_entry`. */
  status?: string | null;
  /** Ludwig's own assessment (axis `confidence`) — the case view showed it, so this one does (0219 M2). */
  confidence?: ConfidenceLevel | null;
  /** The agent's rationale — empty for routine (F356). */
  rationale?: string | null;
  /** The sources the rationale rests on. */
  sources?: readonly AiSource[];
  verdict?: JudgeVerdict | null;
  judgeReasoning?: string | null;
  checks?: readonly CheckItem[];
  /** Document & VAT, or the payment — beside the entry. */
  evidence?: ReactNode;
  /** Actions on this entry („Diesen Satz ablehnen") — always last. */
  actions?: ReactNode;
}

export type BookingReviewBlock = "kind" | "confidence" | "rationale" | "checks" | "judge" | "evidence";

/** The judge counts only where it adds something: a verdict other than confirm, or a sentence. */
function judgeRelevant(e: BookingReviewEntry): boolean {
  return Boolean(e.judgeReasoning) || (e.verdict != null && e.verdict !== "confirm");
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
  caseKind,
  lines = "compact",
  show = {},
  accountHref,
  taxKeyHref,
}: {
  entries: readonly BookingReviewEntry[];
  /**
   * The kind of the **case** where it differs from its entries — „Aufwand mit
   * Zahlung" for invoice plus payment (P58). Once, above the entries.
   */
  caseKind?: { label: string; description?: string | null } | null;
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
      {caseKind && on("kind") ? (
        <div className="v3bkr__case">
          <span title={caseKind.description ?? undefined}>
            <Badge tone="neutral">{caseKind.label}</Badge>
          </span>
        </div>
      ) : null}
      {entries.map((e, i) => {
        const kind = on("kind") && e.kindLabel ? e.kindLabel : null;
        const confidence = on("confidence") && e.confidence ? e.confidence : null;
        // In `full` the entry's own form (grid, editor) shows the status — the
        // head would say it twice. Without that form the head shows it.
        const status = lines === "full" && e.full ? null : (e.status ?? null);
        const head = entries.length > 1 || kind || confidence || status;
        const evidence = on("evidence") && e.evidence ? e.evidence : null;
        const rationale = on("rationale") && Boolean(e.rationale || (e.sources && e.sources.length > 0));
        return (
          <article key={e.id} className={evidence ? "v3bkr__item v3bkr__item--aside" : "v3bkr__item"}>
            <div className="v3bkr__main">
              {head ? (
                <div className="v3bkr__head">
                  {entries.length > 1 ? (
                    <span className="lw-ui-overline">
                      Satz {i + 1} von {entries.length}
                    </span>
                  ) : null}
                  {kind ? (
                    <span title={e.kindDescription ?? undefined}>
                      <Badge tone="neutral">{kind}</Badge>
                    </span>
                  ) : null}
                  {confidence ? (
                    <span className="v3bkr__who">
                      Ludwig <StatusBadge axis="confidence" status={confidence} info={false} />
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
              {rationale ? <AiBookingNotesBody rationale={e.rationale ?? null} sources={[...(e.sources ?? [])]} /> : null}
              {on("checks") && e.checks && e.checks.length > 0 ? (
                <section className="v3bkr__block">
                  <h4 className="lw-ui-group v3bkr__label">Prüfpunkte</h4>
                  <CheckItems items={[...e.checks]} />
                </section>
              ) : null}
              {on("judge") && judgeRelevant(e) ? (
                <section className="v3bkr__block">
                  <div className="v3bkr__who">
                    Judge {e.verdict ? <StatusBadge axis="judge" status={e.verdict} info={false} /> : null}
                  </div>
                  {/* „Einschätzung", not „Einschätzung des Judge": the line above
                      already names him (0219 M5). */}
                  {e.judgeReasoning ? (
                    <ProvenanceRows provenance={{ assessment: { label: "Einschätzung", text: e.judgeReasoning } }} />
                  ) : null}
                </section>
              ) : null}
            </div>
            {evidence ? <aside className="v3bkr__aside">{evidence}</aside> : null}
            {/* Last, also when the evidence goes under the entry (0219 M1). */}
            {e.actions ? <div className="v3bkr__actions">{e.actions}</div> : null}
          </article>
        );
      })}
    </div>
  );
}
