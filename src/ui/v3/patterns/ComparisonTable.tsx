"use client";

import { DeviationCell, AmountCell, type CellTone } from "../primitives/Cells";
import { StateIcon } from "./Review";
import { Card, CardHead, HeadRow, Table, rowCells } from "../primitives/Table";

/**
 * „Sieht der Monat aus wie sonst?" as a table (F123 T123.5, design `DR:599–629`).
 *
 * Four month columns, an average, a deviation. The row carries its state icon
 * on the left: open, acknowledged, or too young for a statement.
 *
 * The color step is computed by the domain (`deviationTone`), not by this
 * component — the same scale is used in step 1 and step 6, and it must be
 * changeable in one place.
 */

export interface ComparisonRow {
  key: string;
  label: string;
  /** `count` shows item counts, `amount` euros. */
  unit: "count" | "amount";
  m3: number | null;
  m2: number | null;
  m1: number | null;
  avg: number | null;
  current: number;
  deviationPct: number | null;
  tone: CellTone;
  /** The calculation in plain words — the tooltip. */
  explanation: string;
  flagged: boolean;
  tooYoung: boolean;
  acknowledged?: boolean;
}

const NUM = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function cell(v: number | null, unit: "count" | "amount") {
  if (v === null) return <span className="v2num v2muted">—</span>;
  return unit === "amount" ? <AmountCell value={v} /> : <span className="v2num">{NUM.format(v)}</span>;
}

/**
 * @when    Monthly values against three previous months, deviation per row.
 * @instead Single value without history → KpiTile.
 */
export function ComparisonTable({
  title,
  sub,
  monatsLabels,
  rows,
  selectedKey,
  onSelect,
  empty = "Keine Zeilen zu vergleichen.",
}: {
  title: string;
  sub?: string;
  /** The three previous months, in the same order as `m3`…`m1`. */
  monatsLabels: [string, string, string, string];
  rows: ComparisonRow[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
  empty?: string;
}) {
  const flagged = rows.filter((r) => r.flagged && !r.acknowledged).length;
  return (
    <Card>
      <CardHead
        title={title}
        sub={
          sub ??
          (flagged === 0
            ? "Nichts auffällig gegen die letzten drei Monate"
            : `${flagged} auffällig gegen die letzten drei Monate`)
        }
      />
      <Table cols="20px minmax(0,1.4fr) 96px 96px 96px 104px 104px 88px" minWidth={860}>
        <HeadRow>
          <span />
          <span>Zeile</span>
          <span className="v2num">{monatsLabels[0]}</span>
          <span className="v2num">{monatsLabels[1]}</span>
          <span className="v2num">{monatsLabels[2]}</span>
          <span className="v2num">Ø 3 Mon.</span>
          <span className="v2num">{monatsLabels[3]}</span>
          <span className="v2num">Abw.</span>
        </HeadRow>
        {rows.length === 0 ? (
          <div className="v2tbl__empty">{empty}</div>
        ) : (
          rows.map((r) => {
            const content = (
              <>
                <span style={{ display: "flex", justifyContent: "center" }}>
                  <StateIcon
                    state={
                      r.acknowledged ? "done" : r.tooYoung ? "info" : r.flagged ? "warning" : "done"
                    }
                    title={
                      r.acknowledged
                        ? "quittiert"
                        : r.tooYoung
                          ? "zu jung für einen Vergleich"
                          : r.flagged
                            ? "auffällig"
                            : "im Rahmen"
                    }
                  />
                </span>
                <span className="v2main">{r.label}</span>
                {cell(r.m3, r.unit)}
                {cell(r.m2, r.unit)}
                {cell(r.m1, r.unit)}
                {r.tooYoung ? <span className="v2num v2muted">—</span> : cell(r.avg, r.unit)}
                {cell(r.current, r.unit)}
                <DeviationCell
                  pct={r.tooYoung ? null : r.deviationPct}
                  tone={r.acknowledged ? "muted" : r.tone}
                  explanation={r.explanation}
                />
              </>
            );
            // Only what stands out has a detail — the rest is plain information.
            if (!onSelect || !r.flagged) {
              return (
                <tr className="v2tbl__row" key={r.key} title={r.explanation}>
                  {rowCells(content)}
                </tr>
              );
            }
            return (
              // The button sits in the first cell and covers the row — a `<tr>`
              // cannot be a button, and a row that is one is no longer a row
              // (0106).
              <tr
                key={r.key}
                title={r.explanation}
                className={`v2tbl__row is-clickable${r.key === selectedKey ? " is-active" : ""}`}
              >
                {rowCells(content, (node) => (
                  <button type="button" className="v2rowbtn" onClick={() => onSelect(r.key)}>
                    {node}
                  </button>
                ))}
              </tr>
            );
          })
        )}
      </Table>
    </Card>
  );
}
