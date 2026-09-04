import type { ReactNode } from "react";

import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";

import { Amount } from "../../primitives/Amount";
import { MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import {
  SourceDocumentCompletion,
  clipEnd,
  clipMiddle,
  sourceDocumentIdentifier,
  type SourceDocumentVM,
} from "./SourceDocument";
import { resolveSourceDocumentDetail } from "./source-document-detail";

/**
 * The facts of a document — the generic ones, and what the specialization adds
 * (0076, rebuilt from 0052).
 *
 * 0052 built it as „the core facts" and showed four rows: supplier, invoice
 * number, invoice date, gross. Those are invoice fields. A contract has no
 * invoice number, a bank statement no gross amount — they got four em dashes
 * and the wrong labels. The app filled the same gap three times over, split by
 * kind of document (`SourceDocFactsCard`, `GlanceCard`, `ContractDetail`),
 * overlapping in everything generic. That is exactly the special path the
 * GLOSSARY forbids: *„new kind of document = new subtype + new discriminator
 * value + new renderer registry entry, NOT special paths in existing code."*
 *
 * So: **the same eight generic rows for every document, plus a block the
 * specialization contributes** — through `source-document-detail.ts`, under
 * the same condition as everywhere in this family (discriminator and subtype
 * row have to agree). Adding a kind of document means touching that one file
 * and no component.
 *
 * The group block is deliberately **not** a registry entry: 89 of 384
 * documents stand in a document group, 54 of them are invoices and not one of
 * the ten bank statements is among them. The group cuts across every kind of
 * document, so it hangs on the relation — `collectionKind` (it is an original)
 * or a parent (it is a partial document) — and appears for any kind.
 */

/** Freetext limits, p90 of the entity profile. The full text stays in the `title`. */
const MAX_SUMMARY = 260;
const MAX_FILENAME_CARD = 88;

/**
 * The group a document belongs to — either as the original of a collection or
 * as one of its parts. `null` is neither, and then there is no block.
 */
export type SourceDocumentGroup =
  | { childCount: number; completedChildCount: number }
  | { pages: string; parentTitle?: string; parentHref?: string };

/**
 * @when    The facts of a document, read-only — in its drawer, its card, its
 *          view; every kind of document, with the fields of its own kind
 *          underneath.
 * @instead A document in a list → SourceDocumentRow. Positions and input tax →
 *          0072. Changing a single value → InlineEdit in the view (0071). The
 *          original itself → SourceDocumentPreview.
 */
export function SourceDocumentFacts({
  document,
  summary,
  group,
  tone = "surface",
}: {
  /** The same row the list gets — kind, counterparty, both dates, completion, `detail`. */
  document: SourceDocumentVM;
  /**
   * The summary. The caller picks between `classCaseSummary` (what it means
   * for the case, 93 %) and `classSummary` (what the document says, 100 %) —
   * the component does not know the difference and must not guess it.
   */
  summary?: string | null;
  /** The group block, on the relation. `null` means the document is in none. */
  group?: SourceDocumentGroup | null;
  /** `bare` in the drawer, `surface` in the card. */
  tone?: "surface" | "soft" | "bare";
}) {
  const detail = resolveSourceDocumentDetail(document.sourceDocType, document.detail);
  const ident = sourceDocumentIdentifier(document);
  const kind = sourceDocTypeLabel(document.sourceDocType, document.classDocumentForm);

  // The eight generic rows, in this order, for every kind of document. Two of
  // them can be absent — the measure, where the kind has none (a bank
  // statement has no amount, and an em dash would claim it lost one), and the
  // summary, which not every document carries.
  const rows: [ReactNode, ReactNode][] = [
    ["Belegart", kind],
    ["Gegenpart", document.counterparty ?? <span className="v2muted">—</span>],
    ["Belegdatum", <Time key="doc" value={document.documentDate ?? null} format="date" />],
    ["Eingang", <Time key="rec" value={document.receivedDate} format="date" />],
    [
      "Kennung",
      ident.mono ? (
        <MonoCell key="id" value={ident.value} />
      ) : (
        <span key="id" title={ident.value}>
          {clipMiddle(ident.value, MAX_FILENAME_CARD)}
        </span>
      ),
    ],
  ];
  if (detail?.measure) {
    rows.push([
      "Betrag",
      <Amount key="m" value={detail.measure.value} currency={detail.measure.currency} />,
    ]);
  }
  rows.push(["Erledigung", <SourceDocumentCompletion key="done" document={document} />]);
  if (summary) {
    // A summary is a paragraph, not a value: it keeps its row, but the text
    // runs left and without `tnum` — the field column aligns numbers right (V3).
    rows.push([
      "Zusammenfassung",
      <p className="v2doc__prose" key="sum" title={summary}>
        {clipEnd(summary, MAX_SUMMARY)}
      </p>,
    ]);
  }

  const groupRows = group ? groupBlock(document, group) : [];

  return (
    <div className="v2doc__facts">
      <FieldList tone={tone} rows={rows} />
      {/* The block of the specialization. No entry, or a subtype row that
          contradicts the discriminator: no block — not one with a heading and
          „Keine Angaben." under it. */}
      {detail && detail.facts.length > 0 ? (
        <FieldList
          tone={tone}
          title={kind}
          rows={detail.facts.map((f) => [
            f.label,
            f.mono ? <MonoCell value={typeof f.value === "string" ? f.value : null} /> : f.value,
          ])}
        />
      ) : null}
      {groupRows.length > 0 ? (
        <FieldList tone={tone} title="Dokumentgruppe" rows={groupRows} />
      ) : null}
    </div>
  );
}

/**
 * The block on the relation — for an original with its parts, and for a part
 * with its original. It knows nothing about kinds of document, which is the
 * whole point: an invoice that is a partial document gets it, and a bank
 * statement that stands alone does not.
 */
function groupBlock(
  document: SourceDocumentVM,
  group: SourceDocumentGroup,
): [ReactNode, ReactNode][] {
  if ("childCount" in group) {
    const rows: [ReactNode, ReactNode][] = [];
    // No clamp type is the normal case in the data, not the exception: 8 of 12
    // originals carry `not_connected`, 4 carry nothing at all. Without a badge
    // the block still has to look complete, so it simply starts a row later.
    if (document.collectionKind) {
      rows.push([
        "Klammer",
        <StatusBadge key="k" axis="dokumentgruppe" status={document.collectionKind} info={false} />,
      ]);
    }
    rows.push(["Teilbelege", <span key="n" className="v2num">{group.childCount}</span>]);
    rows.push([
      "Erledigt",
      <span key="d" className="v2num">
        {group.completedChildCount} von {group.childCount}
      </span>,
    ]);
    return rows;
  }
  return [
    [
      "Ausschnitt",
      <span key="x">
        Seiten {group.pages}
        {group.parentTitle ? (
          <>
            {" aus "}
            {group.parentHref ? (
              <a className="v2link" href={group.parentHref}>
                {group.parentTitle}
              </a>
            ) : (
              group.parentTitle
            )}
          </>
        ) : null}
      </span>,
    ],
  ];
}
