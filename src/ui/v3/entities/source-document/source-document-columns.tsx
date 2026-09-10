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
  // **No `identifier`** (owner decision 2026-09-09, seen on 165 real rows):
  // in the majority of them it is a GUID file name — „40B503E7-AFD0-64… .pdf",
  // nothing anybody reads. Where a real invoice number stands, it is not the
  // question *this* list answers: „is there anything left to do with this
  // document", not „what is it called". It stays in the **catalogue** —
  // `STUCK_COLUMNS` never carried it, it shows `fileName`, which for a stuck
  // document is the only identity there is. Frees 170 px.
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
  /**
   * Passed through to `CaseCell`. It gets the case **number**, not the id:
   * `SourceDocumentVM` does not carry an id (L-207), and the two are provably
   * different in this repo (`document-number/fixtures.ts:35` holds
   * `caseId: "c-4412"` next to `caseNumber: "2026-0412"`). A caller that
   * builds `/cases/{id}` from it links into the void — build it from the
   * number, or wait for L-207.
   */
  caseHref?: (caseNumber: string) => string;
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
 * @when    One of the four long document lists is built with `DataTable`.
 * @instead A handful of documents beside other work → SourceDocumentList. One
 *          document mentioned elsewhere → SourceDocumentCell.
 */
export function sourceDocumentColumns({
  href,
  caseHref,
  columns = DOCUMENT_LIST_COLUMNS,
  lead: leadColumn,
  stuckVariant = "stuck",
}: SourceDocumentColumnOptions = {}): ColumnDef<SourceDocumentVM>[] {
  const picked = new Set(columns);
  // Whichever of the two identity points comes first carries the row link —
  // unless the caller says otherwise (the stuck list leads with the file).
  const lead: SourceDocumentColumn =
    leadColumn ?? (picked.has("counterparty") ? "counterparty" : "fileName");

  /** Does some other column of this set already print the file name? */
  const showsFileName = (d: SourceDocumentVM) =>
    picked.has("fileName") || (picked.has("counterparty") && !d.counterparty);

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
      cell: (d) => {
        // Mono only when the cell really shows the **file name** — a company
        // name is prose. The condition hangs on the content, not on the
        // column: written the other way round it put the file names in Inter
        // and the firms in mono (measured while fixing 0070, M2).
        const showsFile = !d.counterparty && !picked.has("fileName");
        const body = d.counterparty ? (
          <span className="v2doc__keyname">{d.counterparty}</span>
        ) : picked.has("fileName") ? (
          // The set already shows the file in its own column — falling back
          // to it here would print the same name twice in one row. Measured
          // in the stuck list, where a counterparty is the exception.
          <span className="v2muted">—</span>
        ) : (
          <FileName value={d.fileName} max={48} />
        );
        // **Only when it leads.** Wrapping unconditionally put a second
        // `.v2rowlink` in every row of the stuck set — the first one named
        // „—", because there is no counterparty. One target, one focus stop
        // (I11).
        //
        // Mono sits on **this** wrapper, not on one of its own: an extra span
        // made itself the flex child of `.v2doccol__lead`, and with
        // `min-width: auto` it did not shrink — the extension stood 180 px
        // outside its cell and 64 px over the neighbour, in the very story
        // that is meant to prove the opposite (acceptance 0070, second round).
        return (
          <span
            className={`v2doccol__lead${showsFile ? " v2mono" : ""}`}
            // The tooltip belongs to the **same branch** as the content. Built
            // unconditionally it promised a file where the cell deliberately
            // shows „—": measured in `Stuck`, row 1, text „—" with
            // `title="Scan-2026-09-01-14-32-08.pdf"` — the name of a file that
            // stands two columns further right anyway (acceptance 0070, M8).
            title={d.counterparty ?? (picked.has("fileName") ? undefined : d.fileName)}
          >
            {lead === "counterparty" ? leading(d, body) : body}
          </span>
        );
      },
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
        // The file name already stands in this row — printing it a second
        // time three columns further right says nothing new. `SourceDocumentRow`
        // has had this check since 0074; the catalogue did not.
        if (ident.isFileName && showsFileName(d)) return null;
        if (ident.isFileName) {
          // Mono like a key, cut like a file name: `MonoCell` prints its
          // value whole, and an 81-character name drove the row from 48 px
          // to 130 px (measured).
          return (
            <span className="v2mono v2doc__key" title={ident.value}>
              <FileName value={ident.value} max={32} />
            </span>
          );
        }
        return ident.mono ? (
          <MonoCell value={ident.value} />
        ) : (
          // The non-mono branch is „a sentence, not a number" — the subject of
          // a contract. A cut by character count is no cut at all here: it
          // left the value whole enough to wrap, and 29 characters drove the
          // row from 48,0 px to 66,8 px in a 170 px track (acceptance 0070).
          // The clip belongs to CSS, at the same shell the file-name branch
          // already uses — but at the **end**, not in the middle: for a
          // sentence the beginning carries the meaning, for a file name the
          // extension does.
          <span className="v2doc__key" title={ident.value}>
            <span className="v2doc__keyname">{ident.value}</span>
          </span>
        );
      },
    },
    case: {
      key: "case",
      header: "Sachverhalt",
      // 110 px since the cell shows the **number only** (0146). The old note
      // here said 170 px could not be helped: `.v2case__one` wraps, so the
      // name took its own line before anything shrank, and this row was the
      // one 71,7 px outlier in a list of 48 px rows. With no name there is
      // nothing to wrap — the outlier is gone, not managed.
      width: "110px",
      cell: (d) =>
        d.caseNumber ? (
          <CaseCell
            cases={[
              {
                // The number stands in for the id as long as the view model
                // has none (L-207). `CaseCell` reads `caseId` for the React
                // key and hands it to `caseHref` — both survive a number;
                // a route built on it does not, which is why `caseHref` says so.
                caseId: d.caseNumber,
                caseNumber: d.caseNumber,
                fiscalYear: null,
                title: null,
                // **Not invented.** The catalogue knows the case number, not
                // its kind — and a guessed kind put a wrong badge into the
                // cell and drove the row from 48 px to 71,7 px (acceptance
                // 0070, M2). `CaseLink.kind` may be `null` since then.
                kind: null,
                counterpartyName: d.counterparty ?? null,
                lifecycleStatus: null,
              },
            ]}
            href={caseHref ?? (() => d.caseHref ?? "#")}
            showState={false}
            // The number is the whole cell, and it carries the way. The title
            // this catalogue could offer is generic — it knows the number, not
            // the kind, so `caseTitle` falls back to a word that says nothing
            // and then gets cut off. Where the way leads is the caller's
            // business: the case page, or a drawer as a search param (L3).
            layout="number"
          />
        ) : (
          // **`CaseCell`s word, not our own.** Without a case the cell said
          // „—", and a dash claims the value is unknown; the case is not
          // unknown, there is none yet. `CaseCell` has the word and the
          // reasoning for exactly this (acceptance 0070, M4).
          // No `emptyHref`: „offen" is a statement about this document, not
          // an offer. A document list has no place to send anyone — the case
          // is created from the document itself, and that path does not exist
          // yet. A prop nobody fills is not built (spec-schreiben §8, A12).
          <CaseCell cases={[]} href={caseHref ?? (() => "#")} />
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
      // Four axes stand in this cell; one (i) would explain one of them.
      headerAside: (
        <>
          <StatusInfoButton axis="beleg_kategorie" />
          <StatusInfoButton axis="beleg_richtung" />
          <StatusInfoButton axis="dokumentgruppe" />
        </>
      ),
      // 232 px, not 220: at 220 the two badges of the classification
      // (102.1 + 121.0 px plus a 4-px gutter = 227.1) did not fit side by
      // side, the cell wrapped and the row grew to 73.2 px against the 47–48
      // of its neighbours — V1 asks for one row height (acceptance 0070, M1).
      width: "232px",
      cell: (d) => <SourceDocumentClass document={d} />,
    },
    processing: {
      key: "processing",
      header: "Verarbeitung",
      // Z4: a status column carries its (i) — and it belongs **here**, not in
      // `header`: a button inside the sort link would be invalid HTML. The
      // badges below carry none: the head already explains the axis, and the
      // same button in every row said the same thing four times over
      // (acceptance 0070, M3).
      headerAside: <StatusInfoButton axis="beleg" />,
      width: "160px",
      cell: (d) =>
        d.processingStatus ? (
          <StatusBadge axis="beleg" status={d.processingStatus} info={false} />
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
      cell: (d) => <StatusBadge axis="beleg_haenger" status={stuckState(d.hasInvoiceRow, stuckVariant)} info={false} />,
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
          <StatusBadge axis="beleg_inbox" status={d.inboxStatus} info={false} />
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
        d.byteSize == null ? (
          <span className="v2muted">—</span>
        ) : (
          <span className="v2num">{formatBytes(d.byteSize)}</span>
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
  // `.v2tbl` sits in a card with `padding: 12px 18px` (v3.css) — 36 px, not
  // the 70 an earlier note claimed. Measured while building 0085, and
  // confirmed by its acceptance on 2026-09-07 (the comment said „acceptance"
  // before there had been one).
  const PADDING = 36;
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

