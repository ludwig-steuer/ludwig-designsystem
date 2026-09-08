import type { ReactNode } from "react";

import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";

import { Amount } from "../../primitives/Amount";
import { MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Time } from "../../primitives/Time";
import { StateIcon } from "../../patterns/Review";
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
 * A value the document is **missing** and someone has to supply — the
 * document date above all: „Datum fehlt" is the most common defect of the
 * stock (axis `beleg_haenger`) and the main job of the detail page.
 *
 * It stands **at the value**, not as a list somewhere else: a defect that is
 * shown away from the field it belongs to leaves the field looking merely
 * empty, and an empty field looks like nothing to do.
 */
export interface SourceDocumentGap {
  /** Which row it belongs to — the label of the field, matched verbatim. */
  field: string;
  /** What is wrong and what follows from it (T5). */
  hint: string;
  /** The way to fix it. Without it the gap is named but not actionable. */
  action?: ReactNode;
}

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
  missing,
  tone = "surface",
  provenance,
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
  /**
   * What is missing and has to be filled in. Each entry names the row it
   * belongs to; the value there is replaced by the defect with its way out.
   * An empty list and an absent prop are the same thing — nothing missing.
   */
  missing?: readonly SourceDocumentGap[];
  /** `bare` in the drawer, `surface` in the card. */
  tone?: "surface" | "soft" | "bare";
  /**
   * The three points of provenance and filing (0120): how sure the
   * classification is, whether a person corrected it, and where the document
   * sits in DATEV. **One prop, not three** — they answer one question („where
   * does this classification come from, where does the document live"), and
   * the entity profile ranks them together at 13, 14 and 16.
   *
   * Off in the card (M), on in the detail and the drawer (L). The values come
   * from `document`, not from props of their own: a form that takes values it
   * already holds is a pass-through.
   */
  provenance?: boolean;
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

  // A gap replaces the value of its row. Matching by the German label is the
  // narrowest contract the caller can meet without this component exporting
  // its row keys — and an unmatched gap is not silently dropped: it stands at
  // the end, because a defect nobody sees is worse than one in the wrong row.
  const gaps = new Map((missing ?? []).map((m) => [m.field, m]));
  const shown = new Set<string>();
  const withGaps: [ReactNode, ReactNode][] = rows.map(([label, value]) => {
    const gap = typeof label === "string" ? gaps.get(label) : undefined;
    if (!gap) return [label, value];
    shown.add(gap.field);
    return [label, <Gap key={`gap-${gap.field}`} gap={gap} />];
  });
  for (const m of missing ?? []) {
    if (!shown.has(m.field)) withGaps.push([m.field, <Gap key={`gap-${m.field}`} gap={m} />]);
  }

  const groupRows = group ? groupBlock(document, group) : [];
  const provenanceRows = provenance ? provenanceBlock(document) : [];

  return (
    <div className="v2doc__facts">
      <FieldList tone={tone} rows={withGaps} />
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
      {provenanceRows.length > 0 ? (
        <FieldList tone={tone} title="Herkunft und Ablage" rows={provenanceRows} />
      ) : null}
    </div>
  );
}

/**
 * Where the classification comes from, and where the document is filed (0120).
 *
 * Three points, and each one may be absent for a different reason — so each
 * decides for itself whether it has a row:
 *
 * - **Confidence** is filled on every document (100 %) and is a **number**,
 *   not a badge: the axis `konfidenz` belongs to the booking proposal, not
 *   here (finding L-80, settled with 0070).
 * - **Corrected by hand** shows only when it is set (3 %). The column comment
 *   says as much — „is not null → Hinweis"; an empty row would turn „nobody
 *   touched it" into „we do not know".
 * - **The DATEV filing** is three columns and one row, read digit by digit.
 *   It is missing on 35 % of documents, and then it has no row either: a
 *   document that is not filed is not a document with an unknown filing.
 */
function provenanceBlock(d: SourceDocumentVM): [ReactNode, ReactNode][] {
  const rows: [ReactNode, ReactNode][] = [];
  if (d.classConfidence !== null && d.classConfidence !== undefined) {
    rows.push(["Erkennungssicherheit", `${Math.round(d.classConfidence * 100)} %`]);
  }
  if (d.classOverriddenAt) {
    rows.push([
      "Von Hand korrigiert",
      <Time key="ovr" value={d.classOverriddenAt} format="date" />,
    ]);
  }
  // System, folder and id are one statement about one place — three rows would
  // make the reader assemble them.
  const filing = [d.datevRefSystem, d.datevRefFolder, d.datevRefId].filter(Boolean);
  if (filing.length > 0) {
    rows.push(["DATEV-Ablage", <MonoCell key="datev" value={filing.join(" · ")} />]);
  }
  return rows;
}

/**
 * A missing value, in place of the value. It is **not** an empty field and not
 * an em dash: both say „there is nothing here", and this says „there is
 * something here that is not filled in yet, and here is how".
 */
function Gap({ gap }: { gap: SourceDocumentGap }) {
  return (
    <span className="v2doc__gap">
      {/* `warning`, not `error`: a missing document date is a defect in the
          record, not a broken pipeline — the axis `beleg_haenger` grades it
          the same way (`datum_fehlt` is `warning`, `nicht_extrahiert` is
          `danger`). */}
      <StateIcon state="warning" title="fehlt" />
      <span>
        {gap.hint}
        {gap.action ? <> {gap.action}</> : null}
      </span>
    </span>
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
