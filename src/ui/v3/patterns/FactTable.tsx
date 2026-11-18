import { HeadRow, Row, Table } from "../primitives/Table";
import { ProvenanceSources, type ProvenanceSource } from "./Provenance";

/**
 * Facts with their value and where they come from, as one compact table
 * (0246).
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
}

/**
 * @when    Facts with their value and source — the basis of a clarification,
 *          the facts an entry rests on.
 * @instead One record's fields as label and value → FieldList. Why one value
 *          stands as it stands → ProvenanceRows. Two states of one record →
 *          DiffView.
 */
export function FactTable({ facts }: { facts: readonly FactTableRow[] }) {
  if (facts.length === 0) return null;
  const withSource = facts.some((f) => f.sources && f.sources.length > 0);
  return (
    <Table
      cols={withSource ? "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr)" : "minmax(0, 1fr) minmax(0, 1.4fr)"}
      density="compact"
    >
      <HeadRow>
        <span>Bezeichnung</span>
        <span>Wert</span>
        {withSource ? <span>Quelle</span> : null}
      </HeadRow>
      {facts.map((f) => (
        <Row key={f.key}>
          <span className="v3fact__cell">{f.label}</span>
          {/* Left like the label: a fact is mostly a word; figures in it keep tnum (V3). */}
          <span className="v3fact__cell lw-numeric">
            {f.value ?? (
              <span className="v2muted" title="kein Wert">
                —
              </span>
            )}
          </span>
          {withSource ? (
            <span className="v3fact__cell v3fact__src">
              {f.sources && f.sources.length > 0 ? <ProvenanceSources sources={f.sources} /> : null}
            </span>
          ) : null}
        </Row>
      ))}
    </Table>
  );
}
