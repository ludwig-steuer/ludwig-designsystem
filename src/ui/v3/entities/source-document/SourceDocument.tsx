import type { DocCategory, DocDirection, SourceDocType } from "@/ludwig/modules/source-docs/domain/document-form-mapping";
import { formatDocumentKind } from "@/ludwig/modules/source-docs/domain/document-form-labels";
import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";

import { Amount } from "../../primitives/Amount";
import { Badge } from "../../primitives/Badge";
import { Link } from "../../primitives/Link";
import { Row } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import { resolveSourceDocumentDetail, type SourceDocumentDetail } from "./source-document-detail";

/**
 * The reading family of a document (0074): cell, classification, row.
 *
 * One document stands in six lists today — the year's documents, the stuck
 * ones, the inbox, the submission list, the documents of a case and the
 * children of a split PDF — and all six of them assume a document is an
 * invoice. For 16 % of the data that is wrong: a contract, a bank statement,
 * a credit card statement or a travel expense report has no invoice number
 * and no gross amount.
 *
 * So the family carries the rule of the entity profile instead: **the order of
 * the data points is the same for every kind of document, and which field
 * fills a rank is decided by the registry** (`source-document-detail.ts`),
 * never by a branch in here. Where a kind fills nothing, the fallback of that
 * rank applies — and where there is no fallback either, the place stays empty.
 * There is no em dash for a field this kind of document does not have.
 *
 * None of the three sorts, filters, pages or acts: six rows are not a list
 * (that is `DataTable`, 0070), and every action of today's rows stays with the
 * caller, who sets it beside the row.
 */

/**
 * Why a document counts as done — DB-CHECK on
 * `client_source_docs.completed_via`.
 *
 * Defined here because `src/ludwig/` has no type for it (finding B14, register
 * L-47): the six values live in the check constraint and nowhere in
 * TypeScript. Structurally identical, and to be replaced by the shared type
 * the day it exists.
 */
export type SourceDocCompletionVia =
  | "booking"
  | "case_closed"
  | "import"
  | "superseded"
  | "manual"
  | "no_booking_required";

/**
 * One row of `ludwig.client_source_docs`, as far as cell and row show it
 * (ranks 1–7 of the entity profile plus the states).
 *
 * Freetexts — summary, DATEV reference, agent note — are deliberately absent:
 * a row shows no three sentences. They belong to `SourceDocumentFacts` (0076).
 */
export interface SourceDocumentVM {
  id: string;
  /**
   * Rank 1b. `NOT NULL` in the database and filled in **every** kind of
   * document, which is why it is required here: it is the last fallback of the
   * identifier and the only anchor a non-invoice always has.
   */
  fileName: string;
  /**
   * The discriminator. Widened by `declaration` against the type in
   * `document-form-mapping.ts`: the DB check and `SOURCE_DOC_TYPE_LABELS` know
   * the value, the TypeScript union is the type of what is *written* (finding
   * B10, confirmed by the app side). Reading, seven values are right.
   */
  sourceDocType?: SourceDocType | "declaration" | null;
  /** Fallback key of the **label**: with `other`/NULL the document form wins. */
  classDocumentForm?: string | null;
  /** Rank 1. Filled 50–95 % depending on the kind — without it the file name leads. */
  counterparty?: string | null;
  /**
   * Ranks 3 and 5. The caller sets it **when the subtype row exists**; whether
   * it is shown is decided by the registry, which compares it against
   * `sourceDocType`.
   */
  detail?: SourceDocumentDetail | null;
  /** Rank 4, ISO day. NULL stays NULL — never the upload day (GLOSSARY). */
  documentDate?: string | null;
  /** Rank 7, `NOT NULL`. The sort key of the document list. */
  receivedDate: string;
  /** `null` = still open. */
  completedAt?: string | null;
  /**
   * Why it is done. `null` **with `completedAt` set** means „done, reason not
   * recorded" (61 of 384) — not „open".
   */
  completedVia?: SourceDocCompletionVia | null;
  /** Freetext beside the badge, in its tooltip. */
  completedReason?: string | null;
  /** Axis `beleg_kategorie`. NULL shows **nothing**, never „unclassified". */
  docCategory?: DocCategory | null;
  /** Axis `beleg_richtung`. NULL means „not applicable" (GLOSSARY) — no badge. */
  docDirection?: DocDirection | null;
  /** Shown **only when ≠ `original`**: 83 % are, and the normal case is no news. */
  classDocumentKind?: string | null;
  /** Axis `dokumentgruppe`, only ever set on a collection document. */
  collectionKind?: string | null;
  /**
   * The processing of the invoice, axis `beleg` (83 % filled). A state of the
   * **specialization**, not of every document — a contract has none.
   */
  processingStatus?: string | null;
  /**
   * `source_docs.status`, axis `beleg_inbox` — the one state **every** kind of
   * document carries (profile finding B4). Almost constant in the stock
   * (99.7 % `classified`), which is why the list shows it and the row does not.
   */
  inboxStatus?: string | null;
  /**
   * How sure the classification is, axis `konfidenz`. **Not in the app's view
   * model yet** (0070 B1): it exists at the inbox, and the column shows „—"
   * until it is handed over.
   */
  classConfidence?: string | null;
  /**
   * File size in bytes. Also missing over there (0070 B1) — it matters at
   * exactly one place: 25 MB is where submitting fails.
   */
  sizeBytes?: number | null;
  /** Rank 6 — the case, as an inline mention. */
  caseNumber?: string | null;
  caseHref?: string | null;
  /** Without it the row is not a link. */
  href?: string | null;
}

/* ── Cutting ─────────────────────────────────────────────────────────────
   The limits are the p90 lengths of the entity profile. The full text always
   stays in the `title`. */

const MAX_COUNTERPARTY = 36;
const MAX_FILENAME_ROW = 48;
const MAX_REASON = 280;

/**
 * @when    A name or a freetext that has to fit into a row or a tooltip.
 * @instead A file name → clipMiddle, whose extension survives. Long prose in a
 *          cell that may fold open → LongText.
 */
export function clipEnd(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Cut in the middle, so the extension stays readable: „Rechnung-2026-08-…-4471.pdf".
 *
 * ponytail: local to the family, not a primitive — `LongText` folds open
 * (`<details>`), which is wrong for a file name in a table row. It becomes a
 * primitive the moment somebody outside this family needs it.
 *
 * @when    A file name, wherever it has to be shortened — row (48), card and
 *          drawer (88).
 * @instead A name or a sentence → clipEnd.
 */
export function clipMiddle(text: string, max: number): string {
  if (text.length <= max) return text;
  const head = Math.ceil((max - 1) / 2);
  const tail = Math.floor((max - 1) / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}

/**
 * A file name that has to survive a narrow column: the cut by character count
 * keeps the extension (`clipMiddle`), and the flex box keeps it too — the name
 * shrinks with an ellipsis, the suffix behind it does not. Without the second
 * half the middle cut would be pointless: the column would simply cut the
 * extension off again.
 */
function FileName({ value, max }: { value: string; max: number }) {
  const short = clipMiddle(value, max);
  const dot = short.lastIndexOf(".");
  const hasExtension = dot > 0 && short.length - dot <= 5;
  if (!hasExtension) return <span className="v2doc__keyname">{short}</span>;
  return (
    <>
      <span className="v2doc__keyname">{short.slice(0, dot)}</span>
      <span>{short.slice(dot)}</span>
    </>
  );
}

/* ── The two things every form of the family answers the same way ───────── */

/**
 * Rank 5 with its fallback chain: what the specialization fills in → the file
 * name → the short id. Four of the six lists build this chain today; without
 * it a non-invoice has no anchor to be recognized by.
 *
 * The last step is theoretical (`fileName` is `NOT NULL`) and stands here
 * because `BelegeTab` has it today.
 *
 * @when    A form has to name the document — row, cell, facts, drawer head.
 * @instead The label of its kind → `sourceDocTypeLabel()`. What the
 *          specialization fills into ranks 3 and 5 → resolveSourceDocumentDetail.
 */
export function sourceDocumentIdentifier(document: SourceDocumentVM): {
  value: string;
  mono: boolean;
} {
  const detail = resolveSourceDocumentDetail(document.sourceDocType, document.detail);
  if (detail?.identifier) return detail.identifier;
  if (document.fileName) return { value: document.fileName, mono: false };
  return { value: document.id.slice(0, 8), mono: true };
}

/**
 * The state every kind of document carries. `completedAt` set without a reason
 * is „Erledigt", never „Offen"; the axis carries both keys next to the six of
 * `completed_via` (see `status-registry.ts`).
 *
 * It is its own export because four forms need the same decision — row, cell,
 * facts, drawer head — and „is it done?" must not be answered twice.
 *
 * @when    Whether a document is done, wherever that state is shown.
 * @instead The processing of an invoice → StatusBadge with axis `beleg`. The
 *          classification of the document → SourceDocumentClass.
 */
export function SourceDocumentCompletion({ document }: { document: SourceDocumentVM }) {
  const status = document.completedAt ? (document.completedVia ?? "completed") : "open";
  return (
    <StatusBadge
      axis="beleg_erledigung"
      status={status}
      info={false}
      note={document.completedReason ? clipEnd(document.completedReason, MAX_REASON) : null}
    />
  );
}

/**
 * @when    A document named inside something else — the source behind a
 *          booking line, the document a case event refers to.
 * @instead A document in a list → SourceDocumentRow. Its classification alone →
 *          SourceDocumentClass. Its facts → SourceDocumentFacts. The document
 *          beside the work → SourceDocumentDrawer.
 */
export function SourceDocumentCell({
  document,
  href,
}: {
  document: SourceDocumentVM;
  href?: string;
}) {
  const ident = sourceDocumentIdentifier(document);
  const kind = sourceDocTypeLabel(document.sourceDocType, document.classDocumentForm);
  const target = href ?? document.href ?? undefined;
  const body = (
    <>
      <span className={ident.mono ? "v2mono" : "v2doc__key"} title={ident.value}>
        {ident.mono ? ident.value : <FileName value={ident.value} max={MAX_FILENAME_ROW} />}
      </span>
      {/* Kind and counterparty in one quiet line: the mention stands inside
          somebody else's sentence, where two words of context are the point. */}
      <span className="v2sub">
        {kind}
        {document.counterparty ? ` · ${clipEnd(document.counterparty, MAX_COUNTERPARTY)}` : ""}
      </span>
      <SourceDocumentCompletion document={document} />
    </>
  );
  if (target) {
    return (
      <a className="v2doc__cell v2link" href={target}>
        {body}
      </a>
    );
  }
  return <span className="v2doc__cell">{body}</span>;
}

/**
 * @when    How a document is classified — category, direction, character,
 *          document group — in a row, a card or a head.
 * @instead The state „is it done?" → part of SourceDocumentRow and
 *          SourceDocumentFacts. The processing of an invoice → StatusBadge
 *          with axis `beleg`.
 */
export function SourceDocumentClass({ document }: { document: SourceDocumentVM }) {
  // 83 % of all documents are `original` — the normal case is not worth a
  // badge, and `unknown` says nothing either.
  const character =
    document.classDocumentKind && document.classDocumentKind !== "original"
      ? formatDocumentKind(document.classDocumentKind)
      : null;

  // Every NULL here means something and none of them means „unknown": no
  // category is a container or unclassified (B3), no direction is „not
  // applicable" (GLOSSARY), no group is „not a collection document". All three
  // show nothing at all.
  const badges = [
    document.docCategory ? (
      <StatusBadge key="cat" axis="beleg_kategorie" status={document.docCategory} info={false} />
    ) : null,
    document.docDirection ? (
      <StatusBadge key="dir" axis="beleg_richtung" status={document.docDirection} info={false} />
    ) : null,
    // The character has no registry axis (finding B5) — it is a property, not
    // a state, and `Badge` is what a property gets.
    character ? (
      <Badge key="kind" tone="neutral">
        {character}
      </Badge>
    ) : null,
    document.collectionKind ? (
      <StatusBadge key="coll" axis="dokumentgruppe" status={document.collectionKind} info={false} />
    ) : null,
  ].filter(Boolean);

  if (badges.length === 0) return null;
  return <span className="v2doc__class">{badges}</span>;
}

/**
 * @when    A document in a list — the year, the case, the children of a split
 *          PDF, the inbox; the same row for every kind of document.
 * @instead Mentioned inside something else → SourceDocumentCell. Hundreds of
 *          rows with sorting, filters and paging → DataTable with a column set
 *          (0070). The document read on its own → SourceDocumentFacts,
 *          SourceDocumentDrawer.
 */
export function SourceDocumentRow({ document }: { document: SourceDocumentVM }) {
  const detail = resolveSourceDocumentDetail(document.sourceDocType, document.detail);
  const ident = sourceDocumentIdentifier(document);
  const kind = sourceDocTypeLabel(document.sourceDocType, document.classDocumentForm);
  // Rank 1 leads; without a counterparty the file name does (rank 1b) — and
  // then it is not repeated as the identifier below.
  const lead = document.counterparty
    ? {
        node: <span className="v2doc__keyname">{clipEnd(document.counterparty, MAX_COUNTERPARTY)}</span>,
        full: document.counterparty,
      }
    : {
        node: <FileName value={document.fileName} max={MAX_FILENAME_ROW} />,
        full: document.fileName,
      };

  // Where the file name already leads (rank 1b), it is not repeated as the
  // identifier three columns further right — one document, one anchor.
  const identRepeatsLead = !document.counterparty && ident.value === document.fileName;

  return (
    <Row className="v2doc__row">
      {/* Rank 1 · 1b · 2 — and the link that covers the whole row (I11): one
          focus stop, its own text, no `<a>` inside an `<a>`. */}
      <span className="v2doc__lead">
        <span className="v2main v2doc__key" title={lead.full}>
          {document.href ? (
            <Link className="v2rowlink" href={document.href}>
              {lead.node}
            </Link>
          ) : (
            lead.node
          )}
        </span>
        <span className="v2sub">{kind}</span>
      </span>

      {/* Rank 3 — the measure of the specialization. A bank statement has no
          amount: the place stays **empty**, it does not get an em dash. */}
      <span className="v2num">
        {detail?.measure ? (
          <Amount size="sm" value={detail.measure.value} currency={detail.measure.currency} />
        ) : null}
      </span>

      {/* Rank 4 — here an em dash is right: a document date exists for every
          kind of document, it was simply not read (97 % are filled). */}
      <Time value={document.documentDate ?? null} format="date" size="sm" />

      {/* Rank 5 — what the specialization fills in, else the file name, else
          the short id. */}
      <span
        className={ident.mono ? "v2mono v2doc__key" : "v2doc__key"}
        title={identRepeatsLead ? undefined : ident.value}
      >
        {identRepeatsLead ? null : ident.mono ? (
          ident.value
        ) : (
          <FileName value={ident.value} max={MAX_FILENAME_ROW} />
        )}
      </span>

      {/* Rank 6 — the case, one click away. */}
      <span className="v2doc__case">
        {document.caseNumber ? (
          document.caseHref ? (
            <a className="v2link" href={document.caseHref}>
              {document.caseNumber}
            </a>
          ) : (
            document.caseNumber
          )
        ) : null}
      </span>

      {/* Rank 7 — the sort key of the list. */}
      <Time value={document.receivedDate} format="date" size="sm" />

      {/* A carrier of its own, because `SourceDocumentClass` may return `null`:
          a missing grid cell would shift every column after it. */}
      <span className="v2doc__classcell">
        <SourceDocumentClass document={document} />
      </span>
      <SourceDocumentCompletion document={document} />
    </Row>
  );
}
