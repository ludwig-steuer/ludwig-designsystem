import { caseKindLabel, type CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import type { ColumnDef } from "../../patterns/DataTable";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Amount } from "../../primitives/Amount";
import { Badge } from "../../primitives/Badge";
import { Link } from "../../primitives/Link";
import { MonoCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";
import { caseTitle } from "./case-title";

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
      // Ein **Boden**, nicht `minmax(0, …)`: die neun festen Spuren ergeben
      // mit Lücken und Polster 1396 px, und in einem 1398-px-Rahmen blieben
      // dem Rang 1 damit **2 px**. Und in **px**, nicht in `ch`: eine
      // `ch`-Untergrenze rechnet sich aus der Schriftgröße des Elements, und
      // der Spaltenkopf steht auf 12,5 px, die Zeile auf 13,5 — gemessen
      // liefen Kopf und Zeilen dadurch 6 px auseinander (0070).
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
      // 190, nicht 160: „Wartet auf Unterlagen" misst 179 px, und ein Zustand,
      // der seine Spalte sprengt, ist die Farbe ohne das Wort (V7).
      width: "190px",
      cell: (c) =>
        c.lifecycleStatus ? (
          <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} />
        ) : (
          <span className="v2muted">—</span>
        ),
    },
    number: {
      key: "number",
      header: "Nummer",
      width: "110px",
      sortable: true,
      cell: (c) => <MonoCell value={c.caseNumber} />,
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
        return to ? <Link href={to}>{c.counterpartyName}</Link> : c.counterpartyName;
      },
    },
    disposition: {
      key: "disposition",
      header: "Wer ist dran",
      width: "150px",
      cell: (c) =>
        c.disposition ? (
          <StatusBadge axis="disposition" status={c.disposition} />
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
        // Keine Klärung ist **kein fehlender Wert**, sondern die Antwort null —
        // „0 offen" oder „—" wäre Lärm in einer Spalte, die nur meldet, wenn
        // es etwas zu melden gibt.
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
      width: "150px",
      cell: (c) =>
        c.exportStatus ? (
          <StatusBadge axis="export_case" status={c.exportStatus} />
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
