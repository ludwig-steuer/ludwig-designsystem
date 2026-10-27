import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";
import { AXIS_LABEL, resolveStatus } from "@/ludwig/ui/status/status-registry";

import { Confidence, type ConfidenceLevel } from "../../patterns/Confidence";
import { ProvenanceRows, ProvenanceSources } from "../../patterns/Provenance";
import { CheckItems, type CheckItem } from "../../patterns/Review";
import { StatusBadge } from "../../patterns/StatusBadge";
import { LongText } from "../../primitives/LongText";
import { aiSourcesToProvenance, type AiSource, type JudgeVerdict } from "./AiBookingNotes";
import { JournalEntryCard, type JournalLine } from "./JournalEntryCompact";

/**
 * The review of a case's entries — one view for the row's fold-out and the
 * case view (F355 / 0219, owner 2026-10-01; template: the case view).
 *
 * Always in the same order, each a section with a group head (0232, owner
 * 2026-10-27): **Buchung** — the entry, whole; **Begründung** — why Ludwig
 * booked it so, with its sources; **Prüfungen**; the judge; the actions. What
 * is empty does not stand there — not even its heading. Several entries of one
 * case stand one under the other, each complete with its own checks (§3a).
 *
 * In the list's grey fold-out (`compact`) every section is a white box — the
 * fold-out of the set stays grey, the boxes separate. In the case view
 * (`full`), inside a card, the same sections stand without boxes.
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
    <div className={lines === "compact" ? "v3bkr v3bkr--boxes" : "v3bkr"}>
      {caseKind && on("kind") ? (
        // A word with its name, not a badge nobody can place (owner 2026-10-27).
        // The kinds of the case's entries together („Aufwand mit Zahlung", P58) —
        // the GLOSSARY word „Satzart" is per entry, so here its plural (0232, M5).
        <p className="lw-ui-hint v3bkr__case" title={caseKind.description ?? undefined}>
          Satzarten: {caseKind.label}
        </p>
      ) : null}
      {entries.map((e, i) => {
        const kind = on("kind") && e.kindLabel ? e.kindLabel : null;
        const confidence = on("confidence") && e.confidence ? e.confidence : null;
        // In `full` the entry's own form (grid, editor) shows the status — the
        // head would say it twice. „Vorschlag" says nothing in a review where
        // every entry is one; a different state (accepted, rejected) does, and
        // that is a state, so a StatusBadge (Z2).
        const status = lines === "full" && e.full ? null : e.status && e.status !== "proposed" ? e.status : null;
        const evidence = on("evidence") && e.evidence ? e.evidence : null;
        const sources = e.sources && e.sources.length > 0 ? e.sources : null;
        const rationale = on("rationale") && Boolean(e.rationale || sources);

        return (
          <article key={e.id} className={evidence ? "v3bkr__item v3bkr__item--aside" : "v3bkr__item"}>
            <div className="v3bkr__main">
              <section className="v3bkr__sec">
                <div className="v3bkr__head">
                  {/* The count belongs in the head: „Buchung 1 von 2", not an overline above it (0232, N4). */}
                  <h3 className="lw-ui-group v3bkr__label">
                    {entries.length > 1 ? `Buchung ${i + 1} von ${entries.length}` : "Buchung"}
                  </h3>
                  {/* Each word with its name (owner 2026-10-27): „Satzart" from the
                      GLOSSARY; the confidence keeps its step and hover — the
                      set's `Confidence`, after the registry's name of the axis. */}
                  {kind ? (
                    <span className="lw-ui-hint v3bkr__meta" title={e.kindDescription ?? undefined}>
                      Satzart: {kind}
                    </span>
                  ) : null}
                  {confidence ? (
                    // The hover says what the step means („Nicht ungeprüft freigeben.", 0232, M1).
                    <span className="lw-ui-hint v3bkr__meta" title={resolveStatus("confidence", confidence).description}>
                      {AXIS_LABEL.confidence}: <Confidence level={confidence} />
                    </span>
                  ) : null}
                  {status ? (
                    <span className="v3bkr__status">
                      <StatusBadge axis="journal_entry" status={status} info={false} />
                    </span>
                  ) : null}
                </div>
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
              </section>
              {rationale ? (
                <section className="v3bkr__sec">
                  {e.rationale ? (
                    <>
                      <h3 className="lw-ui-group v3bkr__label">Begründung</h3>
                      {/* Whole — it is what is read after the accounts; cut only
                          past about five lines (owner 2026-10-27). */}
                      {/* A div, not a p: past the cut, LongText is a <details>. */}
                      <div className="lw-ui-text v3bkr__text">
                        <LongText max={420}>{e.rationale}</LongText>
                      </div>
                    </>
                  ) : null}
                  {sources ? (
                    <>
                      <h3 className="lw-ui-group v3bkr__label">Quellen</h3>
                      <ProvenanceSources sources={aiSourcesToProvenance(sources)} />
                    </>
                  ) : null}
                </section>
              ) : null}
              {on("checks") && e.checks && e.checks.length > 0 ? (
                <section className="v3bkr__sec">
                  <h3 className="lw-ui-group v3bkr__label">Prüfungen</h3>
                  <CheckItems items={[...e.checks]} />
                </section>
              ) : null}
              {on("judge") && judgeRelevant(e) ? (
                <section className="v3bkr__sec">
                  {/* A group head like the other boxes (0232, M2), the registry's word for the axis. */}
                  <div className="v3bkr__head">
                    <h3 className="lw-ui-group v3bkr__label">{AXIS_LABEL.judge}</h3>
                    {e.verdict ? <StatusBadge axis="judge" status={e.verdict} info={false} /> : null}
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
