import type { ReactNode } from "react";

import { Link } from "../primitives/Link";
import { Card, CardHead } from "../primitives/Table";
import { StateIcon, stateLabel, type StateKind } from "./Review";

/**
 * Periods with gaps (0162, roadmap B2): which period is covered, which is
 * open, where a gap is.
 *
 * Every other view of time in the set shows what exists — an event on a day,
 * a value in a month. A missing statement for May does not exist, so nothing
 * showed it. Here every period of every subject is a cell, and a gap is a cell
 * with a statement: an icon, and a sentence for hover and screen reader.
 *
 * The pattern knows no axis: the caller turns `kontoauszug_erwartung`,
 * `zyklus` or the batch state into a `StateKind` and a sentence.
 */

export interface PeriodColumn {
  key: string;
  label: string;
  /** The running period — marked, and announced as the current date. */
  current?: boolean;
}

export interface PeriodCell {
  state: StateKind;
  /** The sentence — hover and screen reader. Required: an icon alone says nothing (V7). */
  title: string;
  /** A short value in the cell: a batch number, a count. */
  label?: ReactNode;
  /** The way into the period. */
  href?: string;
}

export interface PeriodRow {
  key: string;
  /** The subject whose coverage is asked — a payment account, a client. */
  label: ReactNode;
  /** A missing key means: not intended for this subject, not „missing". */
  cells: Partial<Record<string, PeriodCell>>;
  /** On the right, in the caller's words: „11 von 12", „1 Lücke". */
  summary?: ReactNode;
}

/** The legend follows criticality, and names only what occurs. */
const LEGEND_ORDER: readonly StateKind[] = [
  "error",
  "warning",
  "question",
  "returned",
  "open",
  "edited",
  "info",
  "done",
  "skipped",
];

/**
 * @when    Which periods are covered, which are open, where a gap is —
 *          statements per month, fiscal years, the periods of batches.
 * @instead Values over time → BarChart. Months against previous months →
 *          ComparisonTable. What happened on which day → Timeline.
 */
export function PeriodGrid({
  title,
  sub,
  periods,
  rows,
  empty = "Nichts, dessen Zeiträume sich prüfen ließen.",
}: {
  title: string;
  sub?: string;
  /** The columns, in order. */
  periods: readonly PeriodColumn[];
  rows: readonly PeriodRow[];
  /** The sentence without rows, with its reason. */
  empty?: string;
}) {
  const used = new Set<StateKind>();
  for (const row of rows) {
    for (const period of periods) {
      const cell = row.cells[period.key];
      if (cell) used.add(cell.state);
    }
  }
  const withSummary = rows.some((r) => r.summary !== undefined);

  return (
    <Card>
      <CardHead title={title} {...(sub ? { sub } : {})} />
      {rows.length === 0 ? (
        <p className="v3period__empty">{empty}</p>
      ) : (
        <div className="v3period">
          <table className="v3period__grid">
            <thead>
              <tr>
                <th scope="col" className="v3period__subject">
                  <span className="v2vh">Gegenstand</span>
                </th>
                {periods.map((p) => (
                  <th
                    key={p.key}
                    scope="col"
                    className={p.current ? "is-current" : undefined}
                    {...(p.current ? { "aria-current": "date" as const } : {})}
                  >
                    {p.label}
                  </th>
                ))}
                {withSummary ? (
                  <th scope="col" className="v3period__summary">
                    <span className="v2vh">Zusammenfassung</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className="v3period__subject">
                    {row.label}
                  </th>
                  {periods.map((p) => (
                    <td key={p.key} className={p.current ? "is-current" : undefined}>
                      <Cell cell={row.cells[p.key]} />
                    </td>
                  ))}
                  {withSummary ? <td className="v3period__summary">{row.summary ?? null}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="v3period__legend" aria-label="Legende">
            {LEGEND_ORDER.filter((s) => used.has(s)).map((s) => (
              <li key={s}>
                <span aria-hidden="true">
                  <StateIcon state={s} />
                </span>
                {stateLabel(s)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/** One period of one subject. Without a cell nothing is drawn — but the screen reader hears why. */
function Cell({ cell }: { cell: PeriodCell | undefined }) {
  if (!cell) return <span className="v2vh">nicht vorgesehen</span>;
  const body = (
    <>
      <StateIcon state={cell.state} title={cell.title} />
      {cell.label ? <span className="v3period__label">{cell.label}</span> : null}
    </>
  );
  return cell.href ? (
    <Link href={cell.href} className="v3period__cell" title={cell.title}>
      {body}
    </Link>
  ) : (
    <span className="v3period__cell" title={cell.title}>
      {body}
    </span>
  );
}
