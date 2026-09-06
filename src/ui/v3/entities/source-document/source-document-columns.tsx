import { formatDocumentForm } from "@/ludwig/modules/source-docs/domain/document-form-labels";
import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";
import type { ReactNode } from "react";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { Amount } from "../../primitives/Amount";
import { MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import { formatBytes } from "../../format";
import {
  FileName,
  SourceDocumentClass,
  SourceDocumentCompletion,
  clipMiddle,
  sourceDocumentIdentifier,
  type SourceDocumentVM,
} from "./SourceDocument";
import { resolveSourceDocumentDetail } from "./source-document-detail";

/**
 * The points of a document as cells — **one catalogue for four lists** (0070).
 *
 * Six lists show the same document. Four of them are long, filtered and paged
 * — the year's document list, Upload & Inbox, „submit a document" and the two
 * tabs of the stuck documents — and the profile's §8 cut decided them once:
 * that is `DataTable` with one column **set** each, not four components. The
 * two stuck tabs share one set with a variant, because they differ only in
 * population and empty case.
 *
 * The order of the points is the profile's and the same in every set;
 * `columns` **selects**, it never reorders. What separates the sets is which
 * question the list answers, and that is written at each set below. What the
 * order cannot decide is **which point leads** — the stuck list leads with
 * the file although it carries the counterparty, so that is a prop.
 */

export type SourceDocumentColumn =
  | "counterparty"
  | "fileName"
  | "kind"
  | "form"
  | "amount"
  | "documentDate"
  | "identifier"
  | "case"
  | "receivedDate"
  | "classification"
  | "processing"
  | "completed"
  | "inboxState"
  | "confidence"
  | "size"
  | "stuckState";

/** Ranks 1–7 of the profile, then the states. One order for every form. */
const ORDER: SourceDocumentColumn[] = [
  "counterparty",
  "fileName",
  "kind",
  "form",
  "amount",
  "documentDate",
  "identifier",
  "case",
  "receivedDate",
  "classification",
  "confidence",
  "size",
  "processing",
  "stuckState",
  "inboxState",
  "completed",
];

/**
 * The year's list: „no unfinished document is left behind in the year." The
 * completion is the question, everything before it is the identity.
 */
export const DOCUMENT_LIST_COLUMNS: SourceDocumentColumn[] = [
  "counterparty",
  "kind",
  "amount",
  "documentDate",
  "identifier",
  "case",
  "receivedDate",
  "classification",
  "processing",
  "completed",
];

/**
 * Upload & Inbox: **the file leads.** The inbox knows neither year nor case,
 * and the counterparty is the *result* of the classification — putting it
 * first would promise an answer the row does not have yet.
 */
export const INBOX_COLUMNS: SourceDocumentColumn[] = [
  "fileName",
  "classification",
  "confidence",
  "inboxState",
];

/**
 * Submitting: the size stands **only** here — 25 MB is where it fails.
 *
 * The second column is the **form**, not the kind. The population of this
 * list is „`status='classified'` **and** a qualifying document form" — the
 * form is the criterion someone checks here, and the two are different axes
 * that the GLOSSARY keeps apart on purpose (profile „Listen").
 */
export const SUBMIT_COLUMNS: SourceDocumentColumn[] = [
  "fileName",
  "form",
  "size",
  "inboxState",
];

/**
 * Stuck documents: „nothing disappears quietly." Two populations — still
 * running (`inflight`) and stuck (`stuck`) — with the same columns and the
 * same order; what differs is the population and the empty case, so it is
 * **one** set with a variant, not two (profile §8).
 *
 * It leads with the **file**, although the counterparty is in the set: a
 * document that gets stuck usually has no counterparty yet — that is the
 * result of the extraction that did not happen.
 */
export const STUCK_COLUMNS: SourceDocumentColumn[] = [
  "fileName",
  "classification",
  "counterparty",
  "receivedDate",
  "case",
  "stuckState",
];

export interface SourceDocumentColumnOptions {
  /** The row link; it sits on the leading point (`.v2rowlink`, I11). */
  href?: (document: SourceDocumentVM) => string;
  /** Passed through to `CaseCell`. */
  caseHref?: (caseId: string) => string;
  columns?: SourceDocumentColumn[];
  /**
   * Which point carries the row link. Without it the counterparty leads
   * whenever it is in the set — which is right for four of the five sets and
   * **wrong** for the stuck one: it leads with the file and carries the
   * counterparty further right (profile „Listen").
   */
  lead?: "counterparty" | "fileName";
  /**
   * Which of the two stuck lists — it decides what the axis `beleg_haenger`
   * says about the same document. Only read by the column `stuckState`.
   */
  stuckVariant?: StuckVariant;
}

export type StuckVariant = "stuck" | "inflight";

/**
 * The four-way table of the axis `beleg_haenger` out of its two inputs.
 *
 * The app writes the same four cases inline in `StuckDocumentsTable`; a
 * derivation the UI needs belongs in `domain/` (finding L-81). Until it moves
 * there it stands here **once**, not twice.
 */
function stuckState(hasInvoiceRow: boolean | undefined, variant: StuckVariant): string {
  if (variant === "inflight") return hasInvoiceRow ? "wird_extrahiert" : "wird_klassifiziert";
  return hasInvoiceRow ? "datum_fehlt" : "nicht_extrahiert";
}

/**
 * @when    One of the three long document lists is built with `DataTable`.
 * @instead A handful of documents beside other work → SourceDocumentList. One
 *          document mentioned elsewhere → SourceDocumentCell.
 */
export function sourceDocumentColumns({
  href,
  caseHref,
  columns = DOCUMENT_LIST_COLUMNS,
  lead: leadColumn,
  stuckVariant = "stuck",
}: SourceDocumentColumnOptions): ColumnDef<SourceDocumentVM>[] {
  const picked = new Set(columns);
  // Whichever of the two identity points comes first carries the row link —
  // unless the caller says otherwise (the stuck list leads with the file).
  const lead: SourceDocumentColumn =
    leadColumn ?? (picked.has("counterparty") ? "counterparty" : "fileName");

  const leading = (doc: SourceDocumentVM, content: ReactNode) =>
    href ? (
      <Link className="v2rowlink" href={href(doc)}>
        {content}
      </Link>
    ) : (
      content
    );

  const defs: Record<SourceDocumentColumn, ColumnDef<SourceDocumentVM>> = {
    counterparty: {
      key: "counterparty",
      header: "Gegenpart",
      // `px`, never `ch`: a `ch` minimum is computed from the **font size of
      // the element**, and the column head stands at 12.5 px, the row at
      // 13.5. Measured, head and rows drifted 10 px apart. The number of
      // flexible tracks has nothing to do with it — measured again, two
      // flexible tracks with a px floor run exactly together (Δ 0), one
      // flexible track with a `ch` floor drifts by 5.4 px.
      width: "minmax(180px, 1fr)",
      sortable: true,
      // Filled 50–95 % depending on the kind. Without it the file name leads —
      // it is the one point every kind of document carries.
      // Without a counterparty the file name leads — and then as `FileName`,
      // not as plain text: a `text-overflow` on the parent cuts off exactly
      // what the middle cut is there to keep. Measured, „.pdf" stood 69 px
      // outside its cell, in the story that was meant to prove the opposite.
      cell: (d) => (
        <span className="v2doccol__lead" title={d.counterparty ?? d.fileName}>
          {leading(
            d,
            d.counterparty ? (
              <span className="v2doc__keyname">{d.counterparty}</span>
            ) : picked.has("fileName") ? (
              // The set already shows the file in its own column — falling
              // back to it here would print the same name twice in one row.
              // Measured in the stuck list, where a counterparty is the
              // exception, not the rule.
              <span className="v2muted">—</span>
            ) : (
              <FileName value={d.fileName} max={48} />
            ),
          )}
        </span>
      ),
    },
    fileName: {
      key: "fileName",
      header: "Datei",
      width: "minmax(200px, 1fr)",
      sortable: true,
      cell: (d) => (
        <span className="v2doccol__lead v2mono" title={d.fileName}>
          {lead === "fileName" ? (
            leading(d, <FileName value={d.fileName} max={48} />)
          ) : (
            <FileName value={d.fileName} max={48} />
          )}
        </span>
      ),
    },
    kind: {
      key: "kind",
      header: "Belegart",
      width: "170px",
      cell: (d) => sourceDocTypeLabel(d.sourceDocType, d.classDocumentForm),
    },
    form: {
      key: "form",
      header: "Belegform",
      width: "170px",
      // **Not** the kind. The two are separate axes (GLOSSARY): the kind is
      // what the document is in Ludwig (invoice, contract, statement), the
      // form is what the classifier read out of the paper — and the form is
      // what decides whether a document qualifies for submitting.
      cell: (d) => formatDocumentForm(d.classDocumentForm),
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: "130px",
      align: "end",
      sortable: true,
      // Empty, not an em dash, where the kind of document has no measure: a
      // contract has no gross amount, and „—" would claim it should.
      cell: (d) => {
        const m = resolveSourceDocumentDetail(d.sourceDocType, d.detail)?.measure;
        // No silent EUR: the family writes it down one file over („`currency:
        // null` is a decimal without one"), and a made-up „€" on a foreign
        // invoice is a wrong fact, not a formatting default.
        return m ? <Amount value={m.value} currency={m.currency} size="sm" /> : null;
      },
    },
    documentDate: {
      key: "documentDate",
      header: "Belegdatum",
      width: "120px",
      sortable: true,
      // NULL stays NULL — never the upload day (GLOSSARY).
      cell: (d) => <Time value={d.documentDate ?? null} format="date" length="short" size="sm" />,
    },
    identifier: {
      key: "identifier",
      header: "Kennung",
      // Fixed, because nothing here has to grow: the identifier is a number
      // of known length. (It is **not** fixed because a second flexible track
      // would be a problem — that was the wrong lesson; see `counterparty`.)
      width: "170px",
      cell: (d) => {
        const ident = sourceDocumentIdentifier(d);
        return ident.mono ? (
          <MonoCell value={ident.value} />
        ) : (
          <span title={ident.value}>{clipMiddle(ident.value, 32)}</span>
        );
      },
    },
    case: {
      key: "case",
      header: "Sachverhalt",
      width: "170px",
      cell: (d) =>
        d.caseNumber ? (
          <CaseCell
            cases={[
              {
                caseId: d.caseNumber,
                caseNumber: d.caseNumber,
                fiscalYear: null,
                title: null,
                kind: "incoming_invoice",
                counterpartyName: d.counterparty ?? null,
                lifecycleStatus: null,
              },
            ]}
            href={caseHref ?? (() => d.caseHref ?? "#")}
            showState={false}
          />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    receivedDate: {
      key: "receivedDate",
      header: "Eingang",
      width: "120px",
      sortable: true,
      cell: (d) => <Time value={d.receivedDate} format="date" length="short" size="sm" />,
    },
    classification: {
      key: "classification",
      header: "Einordnung",
      headerAside: <StatusInfoButton axis="beleg_kategorie" />,
      width: "220px",
      cell: (d) => <SourceDocumentClass document={d} />,
    },
    processing: {
      key: "processing",
      header: "Verarbeitung",
      // Z4: a status column carries its (i) — and it belongs **here**, not in
      // `header`: a button inside the sort link would be invalid HTML.
      headerAside: <StatusInfoButton axis="beleg" />,
      width: "160px",
      cell: (d) =>
        d.processingStatus ? (
          <StatusBadge axis="beleg" status={d.processingStatus} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    completed: {
      key: "completed",
      header: "Erledigt",
      headerAside: <StatusInfoButton axis="beleg_erledigung" />,
      width: "170px",
      cell: (d) => <SourceDocumentCompletion document={d} />,
    },
    stuckState: {
      key: "stuckState",
      header: "Beleg-Zustand",
      headerAside: <StatusInfoButton axis="beleg_haenger" />,
      width: "170px",
      cell: (d) => <StatusBadge axis="beleg_haenger" status={stuckState(d.hasInvoiceRow, stuckVariant)} />,
    },
    inboxState: {
      key: "inboxState",
      // **Not** „Zustand": Z4 forbids the empty word, and this column says
      // one specific thing — how far the classification of this document got.
      header: "Erkennung",
      headerAside: <StatusInfoButton axis="beleg_inbox" />,
      width: "190px",
      cell: (d) =>
        d.inboxStatus ? (
          <StatusBadge axis="beleg_inbox" status={d.inboxStatus} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    confidence: {
      key: "confidence",
      header: "Konfidenz",
      width: "140px",
      align: "end",
      // A **number**, not a badge. `class_confidence` is a share between 0
      // and 1; the axis `konfidenz` that looks like it fits belongs to the
      // booking proposal and would answer a document classification with
      // „Bitte Konto und Steuerschlüssel prüfen". Until this axis exists
      // (finding L-80) the share stands the way the app's own document tabs
      // already write it.
      cell: (d) =>
        d.classConfidence == null ? (
          <span className="v2muted">—</span>
        ) : (
          <span className="v2num">{Math.round(d.classConfidence * 100)} %</span>
        ),
    },
    size: {
      key: "size",
      header: "Größe",
      width: "110px",
      align: "end",
      cell: (d) =>
        d.sizeBytes == null ? (
          <span className="v2muted">—</span>
        ) : (
          <span className="v2num">{formatBytes(d.sizeBytes)}</span>
        ),
    },
  };
  return ORDER.filter((c) => picked.has(c)).map((c) => defs[c]);
}

/**
 * The grid track list for a column set — head and rows read the same string.
 *
 * @when    A `Table` is framed around `sourceDocumentColumns()` by hand.
 * @instead `DataTable` builds it itself — it is the usual way.
 */
export function sourceDocumentTracks(columns: ColumnDef<SourceDocumentVM>[]): string {
  return columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
}

/**
 * The width below which the table has to scroll instead of cutting a column
 * off. Every fixed track plus the floor of every flexible one, the gutters
 * between them and the card padding.
 *
 * It exists because the caller cannot know it: measured, `INBOX_COLUMNS`
 * without a `minWidth` lost 132 px of its last column at 700 px — no
 * scrollbar, the state simply gone, and the card clips. A number someone has
 * to work out by hand is a number that will be wrong.
 *
 * @when    A document list is built and needs its `minWidth`.
 * @instead A list whose columns never change → write the number down.
 */
export function sourceDocumentMinWidth(columns: ColumnDef<SourceDocumentVM>[]): number {
  const GUTTER = 10;
  const PADDING = 70;
  const floor = (width: string | undefined): number => {
    if (!width) return 0;
    const min = /minmax\(\s*(\d+)px/.exec(width);
    if (min?.[1]) return Number(min[1]);
    const px = /^(\d+)px$/.exec(width.trim());
    return px?.[1] ? Number(px[1]) : 0;
  };
  const tracks = columns.reduce((sum, c) => sum + floor(c.width), 0);
  return tracks + GUTTER * Math.max(0, columns.length - 1) + PADDING;
}

