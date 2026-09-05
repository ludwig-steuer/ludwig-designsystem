import type { ReactNode } from "react";

import { Disclosure } from "../primitives/Disclosure";
import { MonoCell } from "../primitives/Cells";
import { EmptyRow, HeadRow, Row, Table } from "../primitives/Table";
import { Link } from "../primitives/Link";
import { Skeleton } from "../primitives/Skeleton";
import { Time } from "../primitives/Time";
import { StatusBadge } from "./StatusBadge";
import { axisLegend, resolveStatus } from "@/ludwig/ui/status/status-registry";

/**
 * The log as a table — one row every source maps onto (0053).
 *
 * Five places in the app build this table today, with four time formats and
 * three level badges. What they share is the row, not the origin (`web-ui.md`
 * R7): time, severity, actor, message, details.
 *
 * Business and technical are not two components and not two rows, but a
 * **depth** on the row (Z6) — read by `LogBrowser`, ignored here.
 *
 * A server component on purpose: it holds no state, and folding the details
 * open is native (`<details>`).
 */

export type LogLevel = "debug" | "verbose" | "info" | "warning" | "error";

export interface LogEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  /** One sentence, German — what a person reads. */
  message: string;
  /** Registry axis `log_level`. Missing in every row → the column disappears. */
  level?: LogLevel;
  /** Who caused it. `kind` is a value of the axis `actor_kind`; `label` the person or job name. */
  actor?: { kind: string; label?: string };
  /** Writing process or module: „Classifier", „web", „bridge". */
  source?: string;
  /** Stable key: action · step_kind · step_code. The technical column, and the filter key. */
  code?: string;
  /** 1 Verlauf · 2 Protokoll · 3 Technik (Z6). Missing → 2. Read by `LogBrowser`, ignored here. */
  depth?: 1 | 2 | 3;
  /** What it concerns: document, case, entry. Without `href` plain text. */
  refs?: { label: string; href?: string }[];
  /** One line under the message: gate reason, reviewer comment. */
  detail?: string;
  /** Structured details, folded away as JSON. */
  payload?: unknown;
  /** One extra cell: confidence, amount, gate result. */
  right?: ReactNode;
}

/**
 * The columns in their fixed order. Everything but time and message drops out
 * when no row carries the field — a source without severity shows no empty
 * severity column.
 */
const COLUMNS = [
  { key: "at", label: "Zeit", width: "150px", always: true },
  { key: "level", label: "Schwere", width: "132px" },
  { key: "actor", label: "Akteur", width: "132px" },
  { key: "source", label: "Quelle", width: "120px" },
  { key: "message", label: "Meldung", width: "minmax(260px, 1fr)", always: true },
  { key: "code", label: "Code", width: "170px" },
  { key: "refs", label: "Bezug", width: "160px" },
  { key: "right", label: "Zusatz", width: "120px" },
] as const;

type ColumnKey = (typeof COLUMNS)[number]["key"];

/** Roughly what the fixed columns need before the row starts to squeeze. */
const MIN_WIDTH: Record<ColumnKey, number> = {
  at: 150,
  level: 132,
  actor: 132,
  source: 120,
  message: 260,
  code: 170,
  refs: 160,
  right: 120,
};

/** An empty object is no payload — it would fold open onto „{}". */
function hasPayload(payload: unknown): boolean {
  if (payload === null || payload === undefined) return false;
  if (Array.isArray(payload)) return payload.length > 0;
  if (typeof payload === "object") return Object.keys(payload as object).length > 0;
  return true;
}

function carries(entries: LogEntry[], key: ColumnKey): boolean {
  switch (key) {
    case "level":
      return entries.some((e) => e.level !== undefined);
    case "actor":
      return entries.some((e) => e.actor !== undefined);
    case "source":
      return entries.some((e) => e.source !== undefined && e.source !== "");
    case "code":
      return entries.some((e) => e.code !== undefined && e.code !== "");
    case "refs":
      return entries.some((e) => e.refs !== undefined && e.refs.length > 0);
    case "right":
      return entries.some((e) => e.right !== undefined && e.right !== null);
    default:
      return true;
  }
}

/** The actor in words, never in color alone: label, else the axis label, else the raw value. */
function actorText(actor: NonNullable<LogEntry["actor"]>): string {
  if (actor.label) return actor.label;
  return resolveStatus("actor_kind", actor.kind).label;
}

/**
 * @when    „Who did what, when — and what ran in between?" — hundreds of rows
 *          with severity, actor, code and payload: an audit trail, the trace
 *          of a document, the steps of a run, the events of a batch.
 * @instead The story of one object, where a gap is a statement → Timeline;
 *          the Timeline tells the story, the Log proves it. Filtering by view,
 *          severity or search → LogBrowser. Three extra columns of your own →
 *          Table. Working on a picked row → MasterDetail.
 */
export function LogList({
  entries,
  order = "newest",
  emptyText = "Noch nichts protokolliert.",
  loading,
}: {
  /** Unsorted is fine — the component sorts by `at`, equal times keep their input order. */
  entries: LogEntry[];
  /** A run is read from the front, an audit from the end. */
  order?: "newest" | "oldest";
  emptyText?: string;
  loading?: boolean;
}) {
  if (loading) return <Skeleton lines={5} label="Protokoll wird geladen …" />;

  const shown = COLUMNS.filter((c) => ("always" in c && c.always) || carries(entries, c.key));
  const cols = shown.map((c) => c.width).join(" ");
  const minWidth = shown.reduce((sum, c) => sum + MIN_WIDTH[c.key], 0);
  // `sort` is stable, so rows with the same timestamp keep the order they came
  // in — two sources mixed into one list stay readable.
  const sorted = [...entries].sort((a, b) =>
    order === "newest" ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at),
  );

  return (
    <Table cols={cols} minWidth={minWidth}>
      <HeadRow>
        {shown.map((c) => (
          <span
            key={c.key}
            className={c.key === "right" ? "v2num" : undefined}
            // The axis explanation sits on the column head, not on every row.
            title={c.key === "level" ? levelLegend() : undefined}
          >
            {c.label}
          </span>
        ))}
      </HeadRow>
      {sorted.length === 0 ? (
        <EmptyRow>{emptyText}</EmptyRow>
      ) : (
        sorted.map((e) => <LogRow key={e.id} entry={e} shown={shown.map((c) => c.key)} />)
      )}
    </Table>
  );
}

/** All five values of the axis, from the registry — no second list of words. */
function levelLegend(): string {
  return axisLegend("log_level")
    .map((l) => `${l.label}: ${l.meaning}`)
    .join(" · ");
}

/**
 * The row stays internal: a log row without its table is a `TimelineItem`, and
 * a second `@when` for it would only ask the same question twice.
 */
function LogRow({ entry, shown }: { entry: LogEntry; shown: ColumnKey[] }) {
  const cells: Record<ColumnKey, ReactNode> = {
    at: <Time value={entry.at} format="dateTime" size="sm" />,
    level:
      entry.level === undefined ? null : (
        // No info button per row: at two hundred rows that would be noise —
        // the column head carries the axis instead.
        <StatusBadge axis="log_level" status={entry.level} info={false} />
      ),
    actor: entry.actor ? <span>{actorText(entry.actor)}</span> : null,
    source: <MonoCell value={entry.source ?? null} tone="muted" />,
    message: (
      <div>
        <div className="v2log__msg">{entry.message}</div>
        {entry.detail ? <div className="v2sub">{entry.detail}</div> : null}
        {hasPayload(entry.payload) ? (
          <div className="v2log__pay">
            <Disclosure summary="Einzelheiten" tone="quiet">
              <pre className="v2log__json">{JSON.stringify(entry.payload, null, 2)}</pre>
            </Disclosure>
          </div>
        ) : null}
      </div>
    ),
    code: <MonoCell value={entry.code ?? null} />,
    refs: entry.refs?.length ? (
      <span className="v2log__refs">
        {entry.refs.map((r, i) => (
          <span key={`${r.label}-${i}`}>
            {i > 0 ? " · " : null}
            {r.href ? <Link href={r.href}>{r.label}</Link> : r.label}
          </span>
        ))}
      </span>
    ) : (
      <span className="v2muted">—</span>
    ),
    right: entry.right,
  };

  return (
    <Row className="v2log__row">
      {shown.map((key) => (
        // `v2num` has to sit on the grid child itself — on an inline span
        // `text-align: right` would move nothing (V3).
        <div className={`v2log__cell${key === "right" ? " v2num" : ""}`} key={key}>
          {cells[key]}
        </div>
      ))}
    </Row>
  );
}
