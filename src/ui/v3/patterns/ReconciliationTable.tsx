"use client";

import { useState, type ReactNode } from "react";

import { formatCount } from "../format";
import { TextButton } from "../primitives/TextButton";
import { DataTable, type ColumnDef, type TableGroup } from "./DataTable";

/**
 * Two sources, pair by pair (0161, roadmap B1): does source A agree with
 * source B — and where not?
 *
 * The app answers that question three times by hand today (batch review,
 * replay, bank coverage), and each time the agreeing pairs stand as loud as
 * the few that differ. Here the differences come first, by criticality, and
 * the agreeing pairs are one line with a number until someone asks for them —
 * the decision `CheckItems` made for passed checks (0148).
 *
 * The pattern knows no entity: both sides are cells the caller renders, and
 * the word of the state comes from the caller's registry axis. `kind` only
 * orders and groups.
 */

export type PairKind = "left_only" | "right_only" | "changed" | "split" | "unclear" | "same";

export interface ReconciliationPair {
  key: string;
  /** Orders and groups — it says nothing; the word is `state`. */
  kind: PairKind;
  /** `null` means: missing on this side. A sentence stands there, not a dash. */
  left: ReactNode | null;
  right: ReactNode | null;
  /** The word of the match, from the caller's axis (`StatusBadge`). */
  state: ReactNode;
  /** What differs, in a few words — the field-by-field view is B3. */
  difference?: ReactNode;
  /** The way to resolve it. */
  action?: ReactNode;
}

/** Criticality first (A7): a side that is missing outweighs a side that differs. */
const ORDER: readonly Exclude<PairKind, "same">[] = ["left_only", "right_only", "changed", "split", "unclear"];

const pairs = (n: number) => `${formatCount(n)} ${n === 1 ? "Paar" : "Paare"}`;

/**
 * @when    Two sources claim the same thing and the question is where they
 *          disagree — an export against DATEV, bookings against bank lines.
 * @instead Monthly values against previous months → ComparisonTable. One
 *          record before and after, field by field → DiffView (B3). One source
 *          as a list → DataTable.
 */
export function ReconciliationTable({
  title,
  sub,
  leftLabel,
  rightLabel,
  pairs: all,
  pairHref,
  showSame = false,
  loading,
  error,
}: {
  title: string;
  sub?: string;
  /** The two sources — column heads, and the sentence of a missing side. */
  leftLabel: string;
  rightLabel: string;
  /** In any order; the pattern orders them. */
  pairs: readonly ReconciliationPair[];
  /** The way into the detail; rows are links, as in every `DataTable`. */
  pairHref?: (pair: ReconciliationPair) => string;
  /** Begin with the agreeing pairs open. */
  showSame?: boolean;
  loading?: boolean;
  error?: { message: string; retry?: ReactNode };
}) {
  const [open, setOpen] = useState(showSame);
  const deviating = ORDER.flatMap((kind) => all.filter((p) => p.kind === kind));
  const same = all.filter((p) => p.kind === "same");

  const missing = (label: string) => <span className="v2muted">{`nicht in ${label}`}</span>;
  const columns: ColumnDef<ReconciliationPair>[] = [
    { key: "left", header: leftLabel, cell: (p) => p.left ?? missing(leftLabel) },
    { key: "state", header: "Abgleich", width: "max-content", cell: (p) => p.state },
    { key: "right", header: rightLabel, cell: (p) => p.right ?? missing(rightLabel) },
    { key: "difference", header: "Unterschied", cell: (p) => p.difference ?? null },
  ];
  if (all.some((p) => p.action)) {
    columns.push({ key: "action", header: "Weg", width: "max-content", cell: (p) => p.action ?? null });
  }

  const toggle = (
    <TextButton tone="quiet" onClick={() => setOpen(!open)}>
      {open ? "ausblenden" : "anzeigen"}
    </TextButton>
  );
  const groups: TableGroup<ReconciliationPair>[] = [];
  if (deviating.length > 0) {
    groups.push({ key: "deviating", label: "Abweichungen", rows: deviating, aside: formatCount(deviating.length) });
  }
  // Agreeing pairs are a number until someone asks: closed, the section is its
  // own sentence (`emptyHint`), and the way to open it stands in its head.
  if (same.length > 0 && (deviating.length > 0 || open)) {
    groups.push({
      key: "same",
      label: "Übereinstimmend",
      rows: open ? same : [],
      emptyHint: `${pairs(same.length)} ${same.length === 1 ? "stimmt" : "stimmen"} überein.`,
      aside: toggle,
    });
  }

  return (
    <DataTable<ReconciliationPair>
      columns={columns}
      rowKey={(p) => p.key}
      head={{
        title,
        ...(sub ? { sub } : {}),
        meta:
          all.length === 0
            ? "keine Paare"
            : `${formatCount(deviating.length)} ${deviating.length === 1 ? "Abweichung" : "Abweichungen"} · ${formatCount(same.length)} übereinstimmend`,
      }}
      groups={groups}
      empty={
        all.length === 0
          ? { title: "Keine Paare zum Abgleichen." }
          : // Nothing differs: the success with its number, not an empty section.
            { title: `Alle ${pairs(all.length)} stimmen überein.`, done: true, action: toggle }
      }
      {...(pairHref ? { rowHref: pairHref } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
    />
  );
}
