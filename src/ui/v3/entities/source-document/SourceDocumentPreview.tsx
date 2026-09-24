import { Callout } from "../../primitives/Callout";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { EmptyState } from "../../primitives/EmptyState";
import { formatCount } from "../../format";
import { pageRangeLabel } from "./SourceDocument";

/**
 * The original, as Ludwig reads it (F285). The loader in the app decides the
 * kind with the same switch the upload uses; this form only draws it.
 *
 * - `pdf` — paper, in the browser's viewer.
 * - `rows` — a data file (statement XLSX/CSV/CAMT/STA, EXTF batch or account
 *   list) as the rows its parser returns, **as strings**: the original shows
 *   what was read, not what Ludwig made of it, so no `Amount` in here.
 * - `file` — there is nothing to show: a sentence and, where there is one,
 *   the file.
 */
export type SourceDocumentOriginal =
  | { kind: "pdf"; url: string }
  | {
      kind: "rows";
      /** The reader's profile — „VR-Bank MT940-XLSX", „CAMT.053", „DATEV-Buchungsstapel". */
      formatLabel: string;
      /** One line above the table: account, period, balances, „n Buchungen". */
      head: ReadonlyArray<readonly [label: string, value: string]>;
      /** `numeric` aligns the column right with tabular figures (V3). */
      columns: ReadonlyArray<{ label: string; numeric?: boolean }>;
      /** At most 200 — the loader caps, `total` says how many there are. */
      rows: ReadonlyArray<ReadonlyArray<string>>;
      total: number;
      /** The parser's warnings — nowhere else visible. */
      warnings: readonly string[];
      downloadUrl: string;
      fileName: string;
    }
  | { kind: "file"; reason: string; downloadUrl: string | null; fileName: string };

/**
 * The original of a document, in a frame (0075).
 *
 * A document *has* an original — that is what sets it apart from every other
 * entity, and why it stands second in drawer, card and view, right after the
 * head (0052, zone 2).
 *
 * Two rules make this an entity form rather than an `<iframe>` at the call
 * site: a missing preview is **said in a sentence** instead of drawn as a grey
 * box, and a partial document says **which pages of which original** one is
 * looking at. Every fifth document in the data is a partial one, cut out of a
 * collection PDF (`split_page_range`, 20 %) — without that line the reader
 * sees three pages and does not know they are pages 5–7 of 24.
 *
 * It deliberately cannot: **load** (the caller hands over `url` or `null`),
 * **render** a PDF itself (the browser does that; whoever wants to page
 * through opens the original), **show a placeholder** where there is nothing,
 * and **zoom** into the excerpt — the partial document is already a file of
 * its own, `excerpt` describes it, it cuts nothing.
 *
 * @when    The original of a document, large — in its drawer, its card, its
 *          view; with `excerpt` for a document cut out of a collection PDF.
 * @instead The frame around it with head, facts and a way out →
 *          SourceDocumentDrawer. The facts without the original →
 *          SourceDocumentFacts. A document mentioned in a sentence →
 *          SourceDocumentCell.
 */
export function SourceDocumentPreview({
  original: given,
  url,
  unavailableReason,
  title = "Beleg",
  fileName,
  pageCount,
  excerpt,
}: {
  /** The original by kind (F285). Wins over `url`/`unavailableReason`. */
  original?: SourceDocumentOriginal | null;
  /**
   * Signed URL of a PDF. `null` means **there is none**, not „still loading".
   *
   * @deprecated Use `original: { kind: "pdf", url }`. Stays for one release.
   */
  url?: string | null;
  /**
   * Why there is none, in one sentence.
   *
   * @deprecated Use `original: { kind: "file", reason, … }`. Stays for one release.
   */
  unavailableReason?: string | null;
  /**
   * Heading of the frame. „Vertrag" at a contract — the **kind of document**,
   * from the caller's `sourceDocTypeLabel()`, never derived in here.
   */
  title?: string;
  /** Names the frame for a screen reader: „Vorschau von RE-4471.pdf". */
  fileName?: string | null;
  /** Page count of the document — meta beside the title. */
  pageCount?: number | null;
  /**
   * The excerpt: `split_page_range` plus, where known, the way to the
   * collection original. `null` is a whole document — and says nothing.
   */
  excerpt?: { from: number; to?: number; parentTitle?: string; parentHref?: string } | null;
  /**
   * **Gone with the owner decision of 2026-09-07.** There was `md` (62vh) and
   * `lg` (78vh); at 1440 × 900 the taller one pushed „Belegdaten" below the
   * fold, and the rank order of the page profile says the read-out values
   * stand beside the original, not under it. One height for every place the
   * preview appears: `clamp(320px, 62vh, 900px)`.
   *
   * @deprecated Ignored. It stays for one release so no caller breaks.
   */
  height?: "md" | "lg";
}) {
  const original: SourceDocumentOriginal =
    given ??
    (url
      ? { kind: "pdf", url }
      : {
          kind: "file",
          reason: unavailableReason ?? "Für diesen Beleg gibt es keine Vorschau.",
          downloadUrl: null,
          fileName: fileName ?? "",
        });
  const download =
    original.kind !== "pdf" && original.downloadUrl ? (
      <a className="v2link" href={original.downloadUrl} download={original.fileName || true}>
        Datei herunterladen
      </a>
    ) : undefined;
  const meta =
    original.kind === "rows"
      ? original.formatLabel
      : original.kind === "pdf" && pageCount
        ? `${pageCount} ${pageCount === 1 ? "Seite" : "Seiten"}`
        : undefined;

  return (
    <Card>
      <CardHead
        title={title}
        sub={excerpt ? <ExcerptLine excerpt={excerpt} /> : undefined}
        meta={meta}
        actions={download}
      />
      {original.kind === "pdf" ? (
        <iframe
          className="v2doc__orig"
          src={original.url}
          // Without a name of its own the frame is a nameless box to a screen
          // reader — and „Vorschau" alone does not say of what.
          title={fileName ? `Vorschau von ${fileName}` : `Vorschau: ${title}`}
        />
      ) : original.kind === "rows" ? (
        <OriginalRows original={original} />
      ) : (
        // A sentence, never a placeholder in the shape of a document: a grey
        // box would be a claim about something that is not there.
        <EmptyState inline title="Keine Vorschau" description={original.reason} />
      )}
    </Card>
  );
}

/**
 * The rows of a data file, in the frame's height; the table scrolls inside.
 *
 * Every row is its own grid (`Table`), so the tracks cannot size to their
 * content — they are sized from it instead: the longest value of a column in
 * `ch`, text columns share the rest in that proportion.
 */
function OriginalRows({ original }: { original: Extract<SourceDocumentOriginal, { kind: "rows" }> }) {
  const { head, columns, rows, total, warnings, downloadUrl, fileName } = original;
  const cols = columns
    .map((c, i) => {
      const len = Math.max(c.label.length, ...rows.map((r) => r[i]?.length ?? 0), 4);
      return c.numeric ? `${len + 2}ch` : `minmax(${Math.min(len, 12)}ch, ${Math.min(len, 60)}fr)`;
    })
    .join(" ");
  const more = total - rows.length;
  return (
    <div className="v2doc__orig v2doc__rows">
      {head.length > 0 ? (
        <dl className="v2doc__rowshead">
          {head.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <Table cols={cols} density="compact">
        <HeadRow>
          {columns.map((c) => (
            <th key={c.label} className={c.numeric ? "v2num" : undefined}>
              {c.label}
            </th>
          ))}
        </HeadRow>
        {rows.map((r, i) => (
          <Row key={i}>
            {columns.map((c, j) => (
              <td key={c.label} className={c.numeric ? "v2num" : undefined}>
                {r[j] ?? ""}
              </td>
            ))}
          </Row>
        ))}
      </Table>
      {rows.length === 0 ? <p className="v2doc__rowsnote">Die Datei enthält keine Zeilen.</p> : null}
      {more > 0 ? (
        <p className="v2doc__rowsnote">
          … {formatCount(more)} weitere {more === 1 ? "Zeile" : "Zeilen"} —{" "}
          <a className="v2link" href={downloadUrl} download={fileName || true}>
            Datei herunterladen
          </a>
        </p>
      ) : null}
      {warnings.length > 0 ? (
        <div className="v2doc__rowsnote">
          <Callout tone="soft">
            {warnings.length === 1 ? (
              warnings[0]
            ) : (
              <ul className="v2doc__warnings">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </Callout>
        </div>
      ) : null}
    </div>
  );
}

/** The excerpt line — a page range and where it was cut from — the range comes ready-made. */
function ExcerptLine({
  excerpt,
}: {
  excerpt: { from: number; to?: number; parentTitle?: string; parentHref?: string };
}) {
  return (
    <>
      {pageRangeLabel(excerpt.from, excerpt.to)}
      {excerpt.parentTitle ? (
        <>
          {" aus "}
          {excerpt.parentHref ? (
            <a className="v2link" href={excerpt.parentHref}>
              {excerpt.parentTitle}
            </a>
          ) : (
            excerpt.parentTitle
          )}
        </>
      ) : (
        " des Originals"
      )}
    </>
  );
}
