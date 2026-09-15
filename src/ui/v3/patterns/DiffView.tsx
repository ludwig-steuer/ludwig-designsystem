import type { ReactNode } from "react";

import { Disclosure } from "../primitives/Disclosure";

/**
 * Two states of one record, field by field (0179, roadmap B3).
 *
 * Five places ask the same question — what is different? The human against the
 * agent's proposal, the firm against the exported entry, the agent against its
 * own extraction, the condensation against the previous convention, the log
 * against any field. Each of them answered it with two lists side by side, in
 * which the reader had to find the differences.
 *
 * **It compares nothing.** `changed` comes from the caller: two `ReactNode`
 * cannot be compared, and whoever has the values also has the rule for when
 * they count as equal (E2).
 */

export interface DiffRow {
  key: string;
  label: ReactNode;
  before: ReactNode;
  after: ReactNode;
  /** The caller says it — the pattern compares nothing. */
  changed: boolean;
}

/** The word above a column, and what it stands for. */
export interface DiffSide {
  label: string;
  sub?: ReactNode;
}

function fieldsLabel(n: number): string {
  return n === 1 ? "1 unverändertes Feld" : `${n} unveränderte Felder`;
}

/**
 * @when    Two states of one record beside each other — before and after a
 *          correction, Ludwig against DATEV, proposal against release.
 * @instead Two **sets** of records against each other → ReconciliationTable.
 *          One state alone → FieldList. Who changed it and why →
 *          ProvenanceNote.
 */
export function DiffView({
  rows,
  before,
  after,
  unchanged = "fold",
  allEqual = "Unverändert übernommen.",
  tone = "surface",
}: {
  rows: readonly DiffRow[];
  before: DiffSide;
  after: DiffSide;
  /**
   * What happens to the fields that stayed the same. `fold` is the default:
   * they lie collapsed under the changed ones, because the question is what
   * is different — not what is not.
   */
  unchanged?: "fold" | "show" | "hide";
  /** The sentence when nothing is different. An empty table would not say it. */
  allEqual?: string;
  /** `bare` where a card already stands around it. */
  tone?: "surface" | "bare";
}) {
  const changedRows = rows.filter((r) => r.changed);
  const sameRows = rows.filter((r) => !r.changed);

  const list = (entries: readonly DiffRow[]) => (
    <div className="v3diff__rows">
      {entries.map((row) => (
        <div className="v3diff__row" key={row.key}>
          <span className="v3diff__label">{row.label}</span>
          <span className="v3diff__before">
            {/* The word only shows where the two states stand under each
                other — then the column heads no longer carry the assignment. */}
            <span className="v3diff__word">{before.label}</span>
            {row.before}
          </span>
          <span className="v3diff__after">
            <span className="v3diff__word">{after.label}</span>
            {row.after}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`v3diff${tone === "bare" ? " v3diff--bare" : ""}`}>
      <div className="v3diff__head">
        <span />
        <span>
          {before.label}
          {before.sub ? <span className="v2sub">{before.sub}</span> : null}
        </span>
        <span>
          {after.label}
          {after.sub ? <span className="v2sub">{after.sub}</span> : null}
        </span>
      </div>

      {changedRows.length > 0 ? list(changedRows) : <p className="v3diff__equal">{allEqual}</p>}

      {sameRows.length > 0 && unchanged !== "hide" ? (
        unchanged === "show" ? (
          list(sameRows)
        ) : (
          <Disclosure
            summary={
              <span className="v3diff__fold">
                {fieldsLabel(sameRows.length)}
                {changedRows.length > 0 ? (
                  <span className="v2sub">
                    {changedRows.length} von {rows.length} geändert
                  </span>
                ) : null}
              </span>
            }
          >
            {list(sameRows)}
          </Disclosure>
        )
      ) : null}
    </div>
  );
}
