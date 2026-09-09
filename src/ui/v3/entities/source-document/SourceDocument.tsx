import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";
// The record, under a name that does not collide with the component family.
import type { SourceDocumentVM as MirrorDocument } from "@/ludwig/modules/source-docs/domain/source-document-vm";
import type { SourceDocCompletionVia } from "@/ludwig/modules/source-docs/domain/document-form-labels";

import { Amount } from "../../primitives/Amount";
import { Link } from "../../primitives/Link";
import { Row } from "../../primitives/Table";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import { resolveSourceDocumentDetail } from "./source-document-detail";

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
 * Die sechs Wege, auf denen ein Beleg erledigt wird — **aus der Domäne**.
 *
 * Sie standen hier als lokale Union, weil `SOURCE_DOC_COMPLETION_VIA` drüben
 * fehlte (Befund L-47). Seit 2026-09-07 gibt es sie (App-Commit `7184a8ac`);
 * der Re-Export hält die Importe der Aufrufer.
 */
export type { SourceDocCompletionVia };

/**
 * A source document, as this family shows it — **from the mirror**.
 *
 * The record lived only here until 2026-09-07: as long as it did, the app
 * could not read it as a contract, and every divergence surfaced at assembly
 * time (finding L-93). `62a2d0fa` moved it to
 * `source-docs/domain/source-document-vm.ts`, and this interface is what the
 * **display** adds on top of it.
 *
 * Four fields stay here, and each for its own reason: `href` and `caseHref`
 * are routes — the caller owns them, they are no part of the record;
 * `caseNumber` and `hasInvoiceRow` are data the record does not carry yet
 * (finding **L-207**), and the row needs both.
 *
 * `detail` is **not** the mirror's. Over there it is the four core facts of an
 * invoice; here it is a union over the kinds of document, and it carries what
 * the specialization block shows (`net`, `vat`, `processingStatus`, and the
 * contract's own fields). The richer one wins, because dropping it would lose
 * what 0076 draws — finding **L-208**: the app should lift this union, not the
 * invoice half of it.
 */
export interface SourceDocumentVM extends MirrorDocument {
  /**
   * Whether the document already has an invoice row. Two booleans decide the
   * axis `beleg_haenger` — this one and which of the two stuck lists is shown
   * — and only the caller knows the first. Nothing else in this family reads
   * it.
   */
  hasInvoiceRow?: boolean;
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
 * A page range as the reader says it: „Seite 5" for one, „Seiten 4–5" for
 * several.
 *
 * It exists because the range was a **string** until 0076's rework, and both
 * places that rendered it wrote „Seiten {pages}" — so **68 of 99** part
 * documents on staging read „Seiten 5". A single-page excerpt is the normal
 * case, not the exception; the plural was wrong more often than right.
 *
 * Two lines above one of those places, `pageCount` already did it correctly.
 * The rule the two together give: whoever knows the number picks the word —
 * never the caller, who would then pick a different one.
 *
 * @when    A page range has to be named — the excerpt line, the facts row.
 * @instead A count of pages („23 Seiten") → the caller has the number and the same choice.
 */
export function pageRangeLabel(from: number, to?: number): string {
  return to !== undefined && to !== from ? `Seiten ${from}–${to}` : `Seite ${from}`;
}

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
 *
 * @when    A file name stands in a column that can get narrow — a document
 *          row, the identifier line of a card.
 * @instead Any other text that has to shrink → `.v2trunc` with a `title`.
 *          The whole identifier of a document → sourceDocumentIdentifier.
 */
export function FileName({ value, max }: { value: string; max: number }) {
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
  /**
   * The fallback took the file name. Callers need to know, because a file
   * name is not a key: it is set in mono like one, but it has to be **cut in
   * the middle** so the extension survives — and it must not be printed a
   * second time in a row that already leads with it.
   */
  isFileName?: boolean;
} {
  const detail = resolveSourceDocumentDetail(document.sourceDocType, document.detail);
  if (detail?.identifier) return detail.identifier;
  // Mono, like everywhere else a file name stands: the same name was set in
  // mono in its own column and in proportional type here — one document, two
  // typefaces in one row.
  if (document.fileName) return { value: document.fileName, mono: true, isFileName: true };
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
    <span className="v2doccompl">
      <StatusBadge
        axis="beleg_erledigung"
        status={status}
        info={false}
        note={document.completedReason ? clipEnd(document.completedReason, MAX_REASON) : null}
      />
      {/* „Done" means **when and how** (catalogue table of the spec).
          The way stood there, the date did not — and „done" without a date is
          the half of the answer one cannot check (acceptance 0070, M5). */}
      {document.completedAt ? <Time value={document.completedAt} format="date" /> : null}
    </span>
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
      ? document.classDocumentKind
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
    // The character **has** an axis since 2026-09-07 (`beleg_charakter`,
    // App-Commit `7184a8ac`, finding L-37). It was a `Badge` with a raw word
    // while it had none — now it is a state like the three around it, with
    // the axis' own wording and its explanation.
    character ? (
      <StatusBadge key="kind" axis="beleg_charakter" status={character} info={false} />
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
        {identRepeatsLead ? null : ident.isFileName || !ident.mono ? (
          // A file name gets cut in the middle even in mono — a key does not.
          <FileName value={ident.value} max={MAX_FILENAME_ROW} />
        ) : (
          ident.value
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
