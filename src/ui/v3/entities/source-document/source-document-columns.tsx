import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { MonoCell } from "../../primitives/Cells";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import {
  SourceDocumentClass,
  SourceDocumentCompletion,
  clipMiddle,
  sourceDocumentIdentifier,
  type SourceDocumentVM,
} from "./SourceDocument";
import { resolveSourceDocumentDetail } from "./source-document-detail";

/**
 * The points of a document as cells — **one catalogue for three lists** (0070).
 *
 * Six lists show the same document. Three of them are long, filtered and paged
 * — the year's document list, Upload & Inbox, and „submit a document" — and
 * the profile's §8 cut decided them once: that is `DataTable` with one column
 * **set** each, not three components.
 *
 * The order of the points is the profile's and the same in all three sets;
 * `columns` **selects**, it never reorders. What separates the sets is which
 * question the list answers, and that is written at each set below.
 */

export type SourceDocumentColumn =
  | "counterparty"
  | "fileName"
  | "kind"
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
  | "size";

/** Ranks 1–7 of the profile, then the states. One order for every form. */
const ORDER: SourceDocumentColumn[] = [
  "counterparty",
  "fileName",
  "kind",
  "amount",
  "documentDate",
  "identifier",
  "case",
  "receivedDate",
  "classification",
  "confidence",
  "size",
  "processing",
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

/** Submitting: the size stands **only** here — 25 MB is where it fails. */
export const SUBMIT_COLUMNS: SourceDocumentColumn[] = [
  "fileName",
  "kind",
  "size",
  "inboxState",
];

export interface SourceDocumentColumnOptions {
  /** The row link; it sits on the leading point (`.v2rowlink`, I11). */
  href?: (document: SourceDocumentVM) => string;
  /** Passed through to `CaseCell`. */
  caseHref?: (caseId: string) => string;
  columns?: SourceDocumentColumn[];
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
}: SourceDocumentColumnOptions): ColumnDef<SourceDocumentVM>[] {
  const picked = new Set(columns);
  // Whichever of the two identity points comes first carries the row link.
  const lead: SourceDocumentColumn = picked.has("counterparty") ? "counterparty" : "fileName";

  const leading = (doc: SourceDocumentVM, text: string) =>
    href ? (
      <Link className="v2rowlink" href={href(doc)}>
        {text}
      </Link>
    ) : (
      text
    );

  const defs: Record<SourceDocumentColumn, ColumnDef<SourceDocumentVM>> = {
    counterparty: {
      key: "counterparty",
      header: "Gegenpart",
      // `px`, nicht `ch`: eine `ch`-Untergrenze rechnet sich aus der
      // **Schriftgröße der Zelle**, und der Spaltenkopf steht auf 12,5 px, die
      // Zeile auf 13,5. Gemessen liefen Kopf und Zeilen dadurch 10 px
      // auseinander — mit zwei dehnbaren Spuren verteilt sich der Rest
      // verschieden.
      width: "minmax(180px, 1fr)",
      sortable: true,
      // Filled 50–95 % depending on the kind. Without it the file name leads —
      // it is the one point every kind of document carries.
      cell: (d) => (
        <span className="v2doccol__lead" title={d.counterparty ?? d.fileName}>
          {leading(d, d.counterparty ?? clipMiddle(d.fileName, 48))}
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
          {lead === "fileName" ? leading(d, clipMiddle(d.fileName, 48)) : clipMiddle(d.fileName, 48)}
        </span>
      ),
    },
    kind: {
      key: "kind",
      header: "Belegart",
      width: "170px",
      cell: (d) => sourceDocTypeLabel(d.sourceDocType, d.classDocumentForm),
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
        return m ? <Amount value={m.value} currency={m.currency ?? "EUR"} /> : null;
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
      // Fest, nicht dehnbar: **eine** dehnbare Spur je Tabelle. Zwei teilen
      // den Rest, und wer den Rest teilt, teilt ihn in Kopf und Zeile
      // verschieden, sobald ihre Mindestmaße auseinandergehen.
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
      width: "220px",
      cell: (d) => <SourceDocumentClass document={d} />,
    },
    processing: {
      key: "processing",
      header: "Verarbeitung",
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
      width: "170px",
      cell: (d) => <SourceDocumentCompletion document={d} />,
    },
    inboxState: {
      key: "inboxState",
      header: "Zustand",
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
      // Shows „—" while the type does not carry it (finding B1) — the column
      // is **not** left out: an inbox without it would look complete while it
      // owes half the answer.
      cell: (d) =>
        d.classConfidence ? (
          <StatusBadge axis="konfidenz" status={d.classConfidence} />
        ) : (
          <span className="v2muted">—</span>
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

/** The grid track list for a column set — head and rows read the same string. */
export function sourceDocumentTracks(columns: ColumnDef<SourceDocumentVM>[]): string {
  return columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
}

/** „4,2 MB" — the 25 MB limit is what this number is read against. */
function formatBytes(bytes: number): string {
  const mb = bytes / 1_000_000;
  if (mb >= 1) return `${mb.toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} kB`;
}
