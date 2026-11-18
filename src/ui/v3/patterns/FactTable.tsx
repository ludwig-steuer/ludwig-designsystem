import type { Certainty } from "@/ludwig/modules/fact-records/domain/fact";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { HeadRow, Row, Table } from "../primitives/Table";
import { DateRange, Time } from "../primitives/Time";
import { ProvenanceSources, type ProvenanceSource } from "./Provenance";
import { StatusHeader } from "./StatusHeader";

/**
 * Facts with their value, how certain they are and where they come from, as
 * one compact table (0246).
 *
 * Two places ask for the same thing: the basis of a clarification (0238,
 * „Grundlage") and the facts an entry rests on in the review (app F678). An
 * open point of the one becomes a question of the other, so a fact has to look
 * the same in both — the second use is what made the clarification's table a
 * pattern (like `OpenPoints`, 0153).
 *
 * It knows no entity and no group: the caller sets a heading per group
 * („Rechnungsposition", „Geschäftspartner") and folds „Weitere Angaben" in a
 * `Disclosure`. It does not sort. Only the source is a target — the row is the
 * fact, the source the way to check it (0238).
 *
 * The certainty is a word, never a colour (F678): all five steps of the axis
 * `fact_certainty` are neutral. What is critical is an open point, and that is
 * `OpenPoints`.
 */

export interface FactTableRow {
  /**
   * Stable key — the fact's key, or the index where the app has none. Labels
   * may repeat: a contradiction is two rows with one label (F678).
   */
  key: string;
  /** The label in the firm's words, from the app — never the technical key. */
  label: string;
  /** The value as the app words it; `null` → „—". */
  value: string | null;
  /** The column exists only when at least one fact has a source. */
  sources?: readonly ProvenanceSource[];
  /** The word of the axis `fact_certainty`; the column exists only when one fact has one. */
  certainty?: Certainty | null;
  /** From when a long-lived fact holds (client, partner, series), ISO date. */
  validFrom?: string | null;
  /** Until when it holds, ISO date. */
  validTo?: string | null;
}

/**
 * „gilt 01.01. – 31.12.2026" under the value; an open end is one point with a
 * word, „gilt ab …" / „gilt bis …" — `Time` with `prefix`, as `DateRange`'s
 * own `@instead` says (acceptance 0246 S2).
 */
function Validity({ from, to }: { from: string | null; to: string | null }) {
  if (!from && !to) return null;
  return (
    <span className="v2sub v3fact__valid">
      {from && to ? (
        <>
          gilt <DateRange from={from} to={to} size="sm" />
        </>
      ) : (
        <Time value={from ?? to} format="date" size="sm" prefix={from ? "gilt ab" : "gilt bis"} />
      )}
    </span>
  );
}

/**
 * @when    Facts with their value, certainty and source — the basis of a
 *          clarification, the facts an entry rests on; `marked` shows which
 *          of them a result rests on.
 * @instead One record's fields as label and value → FieldList. Why one value
 *          stands as it stands → ProvenanceRows. Two states of one record →
 *          DiffView.
 */
export function FactTable({
  facts,
  marked,
}: {
  facts: readonly FactTableRow[];
  /**
   * Keys of the facts a result rests on, picked by the reader (0247): their
   * rows take the „selected" background, and each label becomes a focus
   * target (`data-fact-key`), so the caller can move focus there.
   */
  marked?: readonly string[];
}) {
  if (facts.length === 0) return null;
  const withSource = facts.some((f) => f.sources && f.sources.length > 0);
  const withCertainty = facts.some((f) => f.certainty);
  const cols = [
    "minmax(0, 1fr)",
    withSource ? "minmax(0, 1fr)" : "minmax(0, 1.4fr)",
    // A fixed track: every row is its own grid, so `max-content` sized the
    // column per row and the columns drifted apart (measured in 0246 S2).
    // rem, not ch: the head row sets a smaller type, and `ch` follows each
    // row's font — head and body drifted by 3 px. 6.5rem carries the head
    // „Sicherheit (i)" and the longest word „angenommen", and grows with zoom.
    ...(withCertainty ? ["6.5rem"] : []),
    ...(withSource ? ["minmax(0, 1.25fr)"] : []),
  ].join(" ");
  return (
    <Table cols={cols} density="compact">
      <HeadRow>
        <span>Bezeichnung</span>
        <span>Wert</span>
        {/* „Sicherheit" in the column, the axis' full name in its (i) dialog. */}
        {withCertainty ? <StatusHeader axis="fact_certainty" label="Sicherheit" /> : null}
        {withSource ? <span>Quelle</span> : null}
      </HeadRow>
      {facts.map((f) => {
        const certainty = f.certainty ? resolveStatus("fact_certainty", f.certainty) : null;
        return (
          <Row key={f.key} active={marked?.includes(f.key) ?? false}>
            <span className="v3fact__cell" data-fact-key={f.key} tabIndex={-1}>
              {f.label}
            </span>
            {/* Left like the label: a fact is mostly a word; figures in it keep tnum (V3). */}
            <span className="v3fact__cell lw-numeric">
              {f.value ?? (
                <span className="v2muted" title="kein Wert">
                  —
                </span>
              )}
              <Validity from={f.validFrom ?? null} to={f.validTo ?? null} />
            </span>
            {withCertainty ? (
              <span className="v3fact__cell v3fact__cert" title={certainty?.description}>
                {certainty?.label}
              </span>
            ) : null}
            {withSource ? (
              <span className="v3fact__cell v3fact__src">
                {f.sources && f.sources.length > 0 ? <ProvenanceSources sources={f.sources} /> : null}
              </span>
            ) : null}
          </Row>
        );
      })}
    </Table>
  );
}
