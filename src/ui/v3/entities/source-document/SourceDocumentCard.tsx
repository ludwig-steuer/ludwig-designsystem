import type { ReactNode } from "react";

import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";

import {
  SourceDocumentFacts,
  type SourceDocumentGap,
  type SourceDocumentGroup,
} from "./SourceDocumentFacts";
import { SourceDocumentList } from "./SourceDocumentList";
import { SourceDocumentPreview } from "./SourceDocumentPreview";
import type { SourceDocumentVM } from "./SourceDocument";

/**
 * One document, whole: the original on the left, what Ludwig read out of it on
 * the right (0071).
 *
 * **It has no head of its own.** In the view the `EntityHeader` above already
 * says which document this is; a second title line would say it twice — the
 * page profile lists that as its first doubt about today's screen. In the
 * drawer the `Drawer` title does the same job. The card starts where the
 * question starts: at the paper.
 *
 * It is used **twice, deliberately**: as the content of the first tab of
 * `SourceDocumentView`, and as the body of `SourceDocumentDrawer` with
 * `tone="bare"`. That is the rule of 0052 — zone 3 of a drawer is the same
 * component as the view, or the two drift apart.
 */
export interface SourceDocumentCardProps {
  /** The document itself (0074) — the card derives nothing else from it. */
  document: SourceDocumentVM;
  /** The caller picks which of the two summaries this is (0076). */
  summary?: string | null;
  /** Signed URL of the preview; `null` means there is none. */
  previewUrl?: string | null;
  /** Why there is no preview — said in a sentence, not left blank. */
  previewUnavailableReason?: string | null;
  /** „Seiten 5–7 aus …" for a document cut out of a collection PDF. */
  excerpt?: { from: number; to?: number; parentTitle?: string; parentHref?: string } | null;
  /** The group block of the facts — original with its parts, or one of them. */
  group?: SourceDocumentGroup | null;
  /**
   * The parts of a collection PDF, as rows under the two columns. Empty or
   * absent → no block: a document that is not a collection must not grow a
   * heading with „keine" under it.
   */
  parts?: readonly SourceDocumentVM[];
  partHref?: (document: SourceDocumentVM) => string;
  /** What is missing and how it gets filled in — passed to the facts. */
  missing?: readonly SourceDocumentGap[];
  /**
   * `bare` for the drawer body, where the `Drawer` already provides the
   * surface; `surface` in the view.
   */
  tone?: "surface" | "bare";
  /**
   * Passed to the facts (0120): provenance and DATEV filing.
   *
   * Default `false`, because the card does not know where it stands — it is
   * the body of the detail **and** of the drawer, and every route to the facts
   * runs through it. The caller decides: on in the detail page, off wherever
   * the card stands beside other work.
   */
  provenance?: boolean;
  /** What the caller adds under the two columns — the drawer puts its limit there. */
  children?: ReactNode;
  /**
   * The three boxes beside the facts (0150) — what is open, what the VAT
   * amounts to, what has happened so far.
   *
   * The owner's rule for this page: **the overview is a preview of the tabs
   * below it**, and what is wrong shows here rather than two clicks away. They
   * are slots and not data, because each of them is fed from somewhere else —
   * the defects from the domain, the VAT from the invoice line, the events
   * from the audit log — and the card loads nothing (E2).
   *
   * The order is fixed: facts, then what somebody has to do, then the two
   * previews. A box that moves depending on what is in it makes the page
   * unreadable for whoever works through fifty of them in a row.
   */
  defects?: ReactNode;
  vat?: ReactNode;
  history?: ReactNode;
  /**
   * The heading of the facts box. Default „Belegdaten"; `null` in the drawer,
   * where the drawer title already names the document (0150).
   */
  factsTitle?: string | null;
  /** Where the counterparty stands as a business partner — passed to the facts. */
  counterpartyHref?: string | null;
  /** The batch that booked the document — passed to the facts. */
  batchHref?: string | null;
}

/**
 * @when    A document shown whole — the first tab of its view, the body of its
 *          drawer.
 * @instead One row of it in a list → sourceDocumentColumns. Only the read-out
 *          values → SourceDocumentFacts. Only the original →
 *          SourceDocumentPreview.
 */
export function SourceDocumentCard({
  document,
  summary,
  previewUrl,
  previewUnavailableReason,
  excerpt,
  group,
  parts,
  partHref,
  missing,
  tone = "surface",
  provenance,
  children,
  defects,
  vat,
  history,
  factsTitle,
  counterpartyHref,
  batchHref,
}: SourceDocumentCardProps) {
  const kind = sourceDocTypeLabel(document.sourceDocType, document.classDocumentForm);
  return (
    <div className="v2doccard">
      <div className="v2doccard__cols">
        {/* Rank 2 — the paper, first and large, and **not** behind a click:
            whoever is here brought a doubt, and the original is what settles
            it (page profile, rank 2). */}
        <div className="v2doccard__orig">
          <SourceDocumentPreview
            url={previewUrl ?? null}
            unavailableReason={previewUnavailableReason}
            title={kind}
            fileName={document.fileName}
            excerpt={excerpt}
          />
        </div>

        {/* Rank 3 and 6 — what Ludwig read, and what the kind of document adds.
            The heading „Belegdaten" sits **inside** the box since 0150: it
            stood above it as a bare line while three boxes beside it carried a
            proper head, and `FieldList` has had a `title` since 0006. */}
        <div className="v2doccard__facts">
          <SourceDocumentFacts
            document={document}
            summary={summary}
            group={group}
            missing={missing}
            tone={tone === "bare" ? "bare" : "surface"}
            provenance={provenance}
            {...(factsTitle !== undefined ? { title: factsTitle } : {})}
            {...(counterpartyHref ? { counterpartyHref } : {})}
            {...(batchHref ? { batchHref } : {})}
            // In the card there is room for the sentence under the state; in a
            // row there is not, and that is where the tooltip stays.
            explainCompletion
          />
          {defects}
          {vat}
          {history}
        </div>
      </div>

      {parts && parts.length > 0 ? (
        <div className="v2doccard__parts">
          <div className="v2doc__h">Teilbelege</div>
          <SourceDocumentList documents={parts} {...(partHref ? { href: partHref } : {})} />
        </div>
      ) : null}

      {children}
    </div>
  );
}
