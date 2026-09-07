import { caseKindLabel, type CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { Amount } from "../../primitives/Amount";
import { Badge } from "../../primitives/Badge";
import { Link } from "../../primitives/Link";
import { MonoCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";
import { caseIdentifier, caseTitle } from "./case-title";

/**
 * The ten points of a case as cells — **once**, for the short list and for
 * `DataTable` (0096, cut of the Freigabe).
 *
 * The order is the decision of this spec and the same across every form of
 * the family: what the row shows, the card shows too, in the same place. So
 * `columns` **selects**, it never reorders — a caller who could reorder would
 * break the one thing the family agrees on.
 *
 * Two things this file deliberately does not do:
 *
 * - **It does not compose `CaseCell`.** The cell carries its own link, and the
 *   row link would wrap it — `<a>` inside `<a>`. Both share `case-title.ts`
 *   instead, which is where the naming rule actually lives.
 * - **It does not colour the kind.** `CASE_KIND_LABEL` says in its own comment
 *   that it is not a status; the app colours `recurring_charge` anyway
 *   (finding L-53). Until an axis decides, the kind is a badge without tone.
 */

export type CaseColumn =
  | "name"
  | "state"
  | "number"
  | "amount"
  | "counterparty"
  | "disposition"
  | "kind"
  | "clarifications"
  | "openedAt"
  | "exportState"
  | "fiscalYear"
  | "documents"
  | "bankTransactions";

/** The order of the points, from the checked profile. Ranks 1–10, then 20 and the two counters. */
const ORDER: CaseColumn[] = [
  "name",
  "state",
  "number",
  "amount",
  "counterparty",
  "disposition",
  "kind",
  "clarifications",
  "documents",
  "bankTransactions",
  "openedAt",
  "exportState",
  "fiscalYear",
];

/** The ten of the main list. `fiscalYear` and the two counters are opt-in. */
const DEFAULT_COLUMNS: CaseColumn[] = ORDER.filter(
  (c) => c !== "fiscalYear" && c !== "documents" && c !== "bankTransactions",
);

export interface CaseColumnOptions {
  /** Where a case leads. The row link sits on the display name (I11). */
  href?: (item: CaseListItem) => string;
  /**
   * Where the counterparty leads. A **function of the case**, because
   * `CaseListItem` carries no partner id — finding **L-69**; 47 % are
   * resolved, and the caller is the one who knows which.
   */
  counterpartyHref?: (item: CaseListItem) => string | undefined;
  columns?: CaseColumn[];
}

/**
 * @when    A case list is built with `DataTable` — sortable, selectable, paged
 *          (p90 190 open cases per client and year).
 * @instead A short list of a handful of rows → CaseRow. One case mentioned in
 *          a foreign view → CaseCell.
 */
export function caseColumns({
  href,
  counterpartyHref,
  columns = DEFAULT_COLUMNS,
}: CaseColumnOptions): ColumnDef<CaseListItem>[] {
  const picked = new Set(columns);
  const defs: Record<CaseColumn, ColumnDef<CaseListItem>> = {
    name: {
      key: "name",
      header: "Sachverhalt",
      // A **floor**, not `minmax(0, …)`: the nine fixed tracks plus gutters
      // and padding come to 1396 px, so inside a 1398-px frame rank 1 was
      // left with **2 px**. And in **px**, never in `ch`: a `ch` minimum is
      // computed from the font size of the element, and the column head
      // stands at 12.5 px while the row stands at 13.5 — measured, head and
      // rows drifted 6 px apart (the lesson of 0070).
      width: "minmax(200px, 1fr)",
      sortable: true,
      cell: (c) => {
        const name = caseTitle(c);
        return (
          <span className="v2main v2caserow__name" title={name}>
            {href ? (
              // One focus stop, its own text, no anchor inside an anchor: the
              // link covers the row through `.v2rowlink::after` (I11).
              <Link className="v2rowlink" href={href(c)}>
                {name}
              </Link>
            ) : (
              name
            )}
          </span>
        );
      },
    },
    state: {
      key: "state",
      header: "Stand",
      // Z4: a status column carries its (i) — **once**, in `headerAside`. The
      // badges below pass `info={false}`: the same button in every row costs
      // a focus stop per row (190 rows at p90 → 570 of them) and eats the
      // width the longest word needs (acceptance 0096, M2).
      // — a button inside the sort link would be invalid HTML. Until now the
      // stories hung it into their own head by hand and covered the gap
      // (finding M9 of the acceptance of 0070, family-wide).
      headerAside: <StatusInfoButton axis="sachverhalt" />,
      // 190 px, not 160: „Wartet auf Unterlagen" measures 179 px, and a state
      // that bursts its column is the colour without the word (V7).
      width: "190px",
      cell: (c) =>
        c.lifecycleStatus ? (
          <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    number: {
      key: "number",
      header: "Nummer",
      width: "110px",
      sortable: true,
      // `caseIdentifier`, not the raw number: a case without one still has to
      // be nameable, and the em dash would say „none" — it has an identity,
      // it just has no number (acceptance 0096, M6).
      cell: (c) => <MonoCell value={caseIdentifier(c)} />,
    },
    amount: {
      key: "amount",
      header: "Betrag",
      width: "130px",
      align: "end",
      sortable: true,
      cell: (c) => <Amount value={c.totalAmount} currency={(c.currency as "EUR") ?? "EUR"} />,
    },
    counterparty: {
      key: "counterparty",
      header: "Gegenpart",
      width: "180px",
      cell: (c) => {
        // Rank 5 stands from S on, not from M: 483 cases have a title, but only
        // 15 name the counterparty in it. In 467 of 483 rank 1 would not carry
        // it — so this is not a duplication.
        if (!c.counterpartyName) return <span className="v2muted">—</span>;
        const to = counterpartyHref?.(c);
        // The 180-px track carries 24 characters; the range is p50 14 · p90 27
        // · max 57. Without clipping the cell wrapped and the row grew by 39 %
        // at p90 and 83 % at the maximum — V1 asks for one row height
        // (acceptance 0096, M1). Rank 1 has had its own rule all along.
        return (
          <span className="v2trunc" title={c.counterpartyName}>
            {to ? <Link href={to}>{c.counterpartyName}</Link> : c.counterpartyName}
          </span>
        );
      },
    },
    disposition: {
      key: "disposition",
      header: "Wer ist dran",
      headerAside: <StatusInfoButton axis="disposition" />,
      width: "150px",
      cell: (c) =>
        c.disposition ? (
          <StatusBadge axis="disposition" status={c.disposition} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    kind: {
      key: "kind",
      header: "Art",
      width: "160px",
      cell: (c) => <Badge tone="neutral">{caseKindLabel(c.kind)}</Badge>,
    },
    clarifications: {
      key: "clarifications",
      header: "Klärung",
      width: "120px",
      cell: (c) =>
        // A count, with its word — never a bare number (V7). And no
        // `StatusBadge`: the axis `klaerung` is an urgency per question, this
        // is a count over the case.
        // No clarification is **not a missing value** but the answer zero —
        // „0 offen" or „—" would be noise in a column that only speaks when
        // there is something to report.
        c.openClarificationsCount > 0 ? (
          <span className="v2caserow__count">{c.openClarificationsCount} offen</span>
        ) : null,
    },
    documents: {
      key: "documents",
      header: "Belege",
      width: "100px",
      align: "end",
      cell: (c) => <span className="v2num">{c.documentEventsCount}</span>,
    },
    bankTransactions: {
      key: "bankTransactions",
      header: "Zahlungen",
      width: "110px",
      align: "end",
      cell: (c) => <span className="v2num">{c.bankEventsCount}</span>,
    },
    openedAt: {
      key: "openedAt",
      header: "Eröffnet",
      width: "110px",
      sortable: true,
      cell: (c) => <Time value={c.openedAt} format="date" length="short" size="sm" />,
    },
    exportState: {
      key: "exportState",
      header: "Export",
      headerAside: <StatusInfoButton axis="export_case" />,
      width: "150px",
      cell: (c) =>
        c.exportStatus ? (
          <StatusBadge axis="export_case" status={c.exportStatus} info={false} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    fiscalYear: {
      key: "fiscalYear",
      header: "Jahr",
      width: "80px",
      align: "end",
      // Rank 20 — only where the list crosses financial years, which is the
      // partner tab. Everywhere else the page sets it.
      cell: (c) => <span className="v2num">{c.fiscalYear ?? "—"}</span>,
    },
  };
  return ORDER.filter((c) => picked.has(c)).map((c) => defs[c]);
}

/**
 * The grid track list for a column set — head and rows read the same string.
 *
 * @when    A `Table` is framed around `caseColumns()`.
 * @instead `DataTable` builds it itself.
 */
export function caseTracks(columns: ColumnDef<CaseListItem>[]): string {
  return columns.map((c) => c.width ?? "minmax(0, 1fr)").join(" ");
}
