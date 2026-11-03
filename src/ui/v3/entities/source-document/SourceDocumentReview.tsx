"use client";

import { useId, useRef, type ReactNode } from "react";

import { ChoicePrompt, type ChoiceAnswer, type ChoiceOption } from "../../patterns/ChoicePrompt";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Callout } from "../../primitives/Callout";
import { useFocusOnNewRecord } from "../../primitives/focus";
import { belegAnzeigename } from "@/ludwig/modules/source-docs/domain/beleg-name";
import { documentNameFields, type SourceDocumentVM } from "./SourceDocument";

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
  /** Its name for the topic line (`belegAnzeigename`, R27); `reviewReason` for the reason. */
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
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useFocusOnNewRecord(d.id, rootRef, headingRef);
  // The one name of the document (R27, 0244) — never empty, so the line always stands.
  const topic = belegAnzeigename(documentNameFields(d));
  // A recommended place to file sits inside its group (owner 2026-10-27).
  const recommended = options.some((o) => o.recommended || o.options?.some((c) => c.recommended));

  return (
    <div className="v3docreview" ref={rootRef}>
      <div className="v3docreview__original">{preview}</div>
      <section className="v3docreview__decide" aria-labelledby={headId}>
        <p className="v3docreview__topic">{topic}</p>
        <h2 className="lw-ui-section v3docreview__q" id={headId} ref={headingRef} tabIndex={-1}>
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
