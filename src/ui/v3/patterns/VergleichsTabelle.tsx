"use client";

import { DeviationCell, AmountCell, type CellTone } from "../primitives/Cells";
import { StateIcon } from "./Review";
import { Card, CardHead, HeadRow, Table } from "../primitives/Table";

/**
 * „Sieht der Monat aus wie sonst?" als Tabelle (F123 T123.5, Design `DR:599–629`).
 *
 * Vier Monatsspalten, ein Schnitt, eine Abweichung. Die Zeile trägt ihr
 * Zustands-Icon links: offen, quittiert oder zu jung für eine Aussage.
 *
 * Die Farbstufe rechnet die Domain (`deviationTone`), nicht diese Komponente —
 * dieselbe Skala steht in Schritt 1 und Schritt 6, und sie soll an einer
 * Stelle geändert werden können.
 */

export interface VergleichsZeile {
  key: string;
  label: string;
  /** `count` zeigt Stückzahlen, `amount` Euro. */
  unit: "count" | "amount";
  m3: number | null;
  m2: number | null;
  m1: number | null;
  avg: number | null;
  current: number;
  deviationPct: number | null;
  tone: CellTone;
  /** Die Rechnung im Klartext — der Tooltip. */
  explanation: string;
  flagged: boolean;
  tooYoung: boolean;
  acknowledged?: boolean;
}

const ZAHL = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function zelle(v: number | null, unit: "count" | "amount") {
  if (v === null) return <span className="v2num v2muted">—</span>;
  return unit === "amount" ? <AmountCell value={v} /> : <span className="v2num">{ZAHL.format(v)}</span>;
}

/**
 * @when    Monthly values against three previous months, deviation per row.
 * @instead Single value without history → KpiTile.
 */
export function VergleichsTabelle({
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
  /** Die drei Vormonate, in derselben Reihenfolge wie `m3`…`m1`. */
  monatsLabels: [string, string, string, string];
  rows: VergleichsZeile[];
  selectedKey?: string;
  onSelect?: (key: string) => void;
  empty?: string;
}) {
  const auffaellig = rows.filter((r) => r.flagged && !r.acknowledged).length;
  return (
    <Card>
      <CardHead
        title={title}
        sub={
          sub ??
          (auffaellig === 0
            ? "Nichts auffällig gegen die letzten drei Monate"
            : `${auffaellig} auffällig gegen die letzten drei Monate`)
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
            const inhalt = (
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
                {zelle(r.m3, r.unit)}
                {zelle(r.m2, r.unit)}
                {zelle(r.m1, r.unit)}
                {r.tooYoung ? <span className="v2num v2muted">—</span> : zelle(r.avg, r.unit)}
                {zelle(r.current, r.unit)}
                <DeviationCell
                  pct={r.tooYoung ? null : r.deviationPct}
                  tone={r.acknowledged ? "muted" : r.tone}
                  explanation={r.explanation}
                />
              </>
            );
            // Nur was auffällt, hat ein Detail — der Rest ist eine Auskunft.
            if (!onSelect || !r.flagged) {
              return (
                <div className="v2tbl__row" key={r.key} title={r.explanation}>
                  {inhalt}
                </div>
              );
            }
            return (
              <div
                key={r.key}
                role="button"
                tabIndex={0}
                title={r.explanation}
                className={`v2tbl__row is-clickable${r.key === selectedKey ? " is-active" : ""}`}
                onClick={() => onSelect(r.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(r.key);
                  }
                }}
              >
                {inhalt}
              </div>
            );
          })
        )}
      </Table>
    </Card>
  );
}
