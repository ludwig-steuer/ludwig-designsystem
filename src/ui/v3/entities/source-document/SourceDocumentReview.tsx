"use client";

import { useId, type ReactNode } from "react";

import { ChoicePrompt, type ChoiceAnswer, type ChoiceOption } from "../../patterns/ChoicePrompt";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { Callout } from "../../primitives/Callout";
import { Time } from "../../primitives/Time";
import type { SourceDocumentVM } from "./SourceDocument";
import { resolveSourceDocumentDetail } from "./source-document-detail";

/**
 * One document of the batch review, decided (0223): the original on the left,
 * on the right why Ludwig did not book it and „Wohin gehört dieser Beleg?"
 * with the decisions — one of them recommended and preselected, its why right
 * under the options, a field where a decision needs a sentence.
 *
 * It decides nothing itself: the options come finished from the app's choice
 * model (word, sub-line, `recommended`, `note`), the original comes as a slot
 * (the caller loads it), and paging lives outside (`RecordPager`).
 *
 * @when    Deciding what happens to one document Ludwig did not book — in the
 *          review, one at a time.
 * @instead Looking at a document without deciding → SourceDocumentDrawer. All
 *          documents of the review at once → SourceDocumentList with
 *          `DOCUMENT_REVIEW_VIEW`. A question about a case → ClarificationCard.
 */
export function SourceDocumentReview({
  document: d,
  preview,
  reasonNote,
  options,
  recommendation,
  onDecide,
  submitLabel = "Entscheiden und weiter",
  pending,
  error,
}: {
  /** Counterparty, document date and amount for the topic line; `reviewReason` for the reason. */
  document: SourceDocumentVM;
  /** The left column — as a rule `SourceDocumentPreview`; loading and failure of the original are the caller's. */
  preview: ReactNode;
  /** Ludwig's note on the reason (`review_note`, finding L-365), one to three sentences. */
  reasonNote?: string | null;
  /** The decisions: `hint` is the sub-line, at most one `recommended`, `note` where a sentence is needed. */
  options: ChoiceOption[];
  /** Why the recommended decision, one sentence — under the options. */
  recommendation?: string | null;
  /** The decision taken; `text` is the note of the chosen option. */
  onDecide: (answer: ChoiceAnswer) => Promise<void>;
  /** On the last document: „Entscheiden und zur Übersicht". */
  submitLabel?: string;
  pending?: boolean;
  error?: string;
}) {
  const headId = useId();
  const measure = resolveSourceDocumentDetail(d.sourceDocType, d.detail)?.measure;
  const topic = [
    d.counterparty ? <span key="who">{d.counterparty}</span> : null,
    d.documentDate ? <Time key="when" value={d.documentDate} format="date" size="sm" /> : null,
    measure ? <Amount key="amount" value={measure.value} currency={measure.currency} size="sm" /> : null,
  ].filter(Boolean);
  const recommended = options.some((o) => o.recommended);

  return (
    <div className="v3docreview">
      <div className="v3docreview__original">{preview}</div>
      <section className="v3docreview__decide" aria-labelledby={headId}>
        {topic.length > 0 ? (
          <p className="v3docreview__topic">
            {topic.map((part, i) => (
              <span key={i}>
                {i > 0 ? " · " : null}
                {part}
              </span>
            ))}
          </p>
        ) : null}
        <h2 className="lw-ui-section" id={headId}>
          Wohin gehört dieser Beleg?
        </h2>
        {d.reviewReason || reasonNote ? (
          <Callout tone="soft">
            <strong>Warum Ludwig nicht gebucht hat:</strong>{" "}
            {d.reviewReason ? <StatusBadge axis="document_review_reason" status={d.reviewReason} info={false} /> : null}
            {reasonNote ? <p className="v3docreview__note">{reasonNote}</p> : null}
          </Callout>
        ) : null}
        <ChoicePrompt
          // Keyed by the document: paging on starts from the next one's
          // recommendation, not from the decision taken on the last.
          key={d.id}
          question="Wohin gehört dieser Beleg?"
          hideQuestion
          optionsLabel="Entscheidung"
          optionStyle="rows"
          options={options}
          optionsNote={
            recommended && recommendation ? (
              <Callout tone="soft">
                <strong>Warum empfohlen:</strong> {recommendation}
              </Callout>
            ) : null
          }
          submitLabel={submitLabel}
          onSubmit={onDecide}
          pending={pending}
          error={error}
        />
      </section>
    </div>
  );
}
