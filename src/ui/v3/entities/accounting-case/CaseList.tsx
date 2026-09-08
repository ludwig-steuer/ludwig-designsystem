import {
  CASE_LIST_TAB_LABEL,
  type CaseListItem,
  type CaseListTab as AnyCaseListTab,
} from "@/ludwig/modules/accounting-cases/domain/case";
import { DataTable, type ListPatch } from "../../patterns/DataTable";
import type { TableDensity } from "../../primitives/Table";
import { caseColumns, type CaseColumn } from "./case-columns";

/**
 * The stock of one financial year (0082).
 *
 * **The tab is the empty case.** That is the whole decision of this component.
 * The four tabs of the case list differ — measured in the entity profile — in
 * nothing but their population: same order, same columns, same filters, no
 * bulk action anywhere. What comes apart is the sentence that stands there
 * when nothing does, and that sentence is the answer to „am I finished?".
 *
 * So this is one component with one prop, not four lists. Everything else it
 * hands through: `DataTable` owns the card, the sorting, the pager and the
 * five states; `caseColumns()` owns the points; the tab bar and the filter
 * bar stay with the **page**, which is the only place that knows the counts of
 * all four populations.
 */

/**
 * The four tabs that are a **table**. Narrowed from the mirror, not rewritten:
 * `offen` shows bank rows and `schliessen` shows cards with the one bulk
 * action, so neither is this component (see „Kann bewusst nicht"). A seventh
 * tab added in the app therefore reaches this list by itself, and the app
 * stops paying for the same narrowing a second time (`cases/page.tsx`
 * repeated it, and got in through a cast).
 */
export type CaseListTab = Exclude<AnyCaseListTab, "offen" | "schliessen">;

/**
 * Three of the four empty cases are a **success**, and they say so. Only
 * „alle" is a gap: a year without a single case has not started.
 */
/**
 * The count turns „nothing to do" into a **result** (L6, T6) — and it is a
 * different sentence in each tab: 117 closed cases and 117 cases whose papers
 * are all in are two different statements, so the number cannot be one clause
 * appended to all four. Without it every sentence still stands on its own; the
 * caller who has the count (the page has it, it is in its own tab bar) says
 * more with it.
 */
const EMPTY: Record<
  CaseListTab,
  { title: string; description: (count?: number) => string; done: boolean }
> = {
  laufend: {
    title: "Kein Sachverhalt ist mehr offen.",
    description: (n) =>
      n === undefined
        ? "Alles, was in diesem Wirtschaftsjahr angefangen wurde, ist abgeschlossen."
        : `Alle ${n} Sachverhalte dieses Wirtschaftsjahres sind abgeschlossen.`,
    done: true,
  },
  belege: {
    title: "Es fehlt keine Unterlage mehr.",
    description: (n) =>
      n === undefined
        ? "Kein Sachverhalt wartet auf einen Beleg vom Mandanten."
        : `Bei allen ${n} Sachverhalten liegt die Unterlage vor.`,
    done: true,
  },
  klaerung: {
    title: "Nichts wartet auf Bearbeitung.",
    description: (n) =>
      n === undefined
        ? "Es gibt keine offene Frage und keinen Fall, der auf eine Entscheidung wartet."
        : `Alle ${n} Sachverhalte sind bearbeitet — keine offene Frage, keine wartende Entscheidung.`,
    done: true,
  },
  alle: {
    // No count here: this tab is empty because the stock is empty, so the
    // number would be nought — and „0 Sachverhalte" says less than the sentence.
    title: "In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt.",
    description: () =>
      "Sobald ein Beleg eingeht oder eine Zahlung zugeordnet wird, entsteht der erste.",
    done: false,
  },
};

/**
 * @when    The case list of a financial year, in any of its four tabs.
 * @instead A handful of cases beside other work → CaseRow. The tab „Zum
 *          Schließen", which shows cards and has the one bulk action →
 *          CaseCard (0081). One case named elsewhere → CaseCell.
 */
export function CaseList({
  tab,
  cases,
  href,
  counterpartyHref,
  columns,
  listHref,
  sort,
  pager,
  loading,
  error,
  filtered,
  head,
  emptyCount,
  density,
  // The ten tracks add up to 1500 px, plus nine 10-px gutters and twice 18 px
  // of padding: 1626. Below that the table scrolls sideways instead of
  // squeezing the display name.
  minWidth = 1630,
}: {
  /** Which population — and with it, which empty case. */
  tab: CaseListTab;
  /** The rows of **this page**, already sorted and filtered. */
  cases: CaseListItem[];
  href?: (item: CaseListItem) => string;
  counterpartyHref?: (item: CaseListItem) => string | undefined;
  columns?: CaseColumn[];
  /** Sorting and paging travel through the URL, not through local state. */
  listHref?: (patch: ListPatch) => string;
  sort?: { key: string; dir: "asc" | "desc" };
  /** Like `DataTable` — `pageSizeOptions` included, or the page-size switch
   *  cannot be reached through this component at all. */
  pager?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    pageSizeOptions?: number[];
  };
  loading?: boolean;
  error?: { message: string; retry?: React.ReactNode };
  /**
   * The **fifth** empty case: empty because of the filter, not because of the
   * stock. The page today knows four tab texts and not this one — and this is
   * the one that says whether the clerk is finished (page profile, doubt 2).
   */
  filtered?: { summary: string; resetHref: string };
  head?: { title?: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode };
  /**
   * The stock behind an empty **success** — „Alle 117 … sind abgeschlossen."
   * Without it the sentence stands without a number; the tab „alle" ignores
   * it, because there the stock is what is missing.
   */
  emptyCount?: number;
  density?: TableDensity;
  minWidth?: number;
}) {
  const cols = caseColumns({
    ...(href ? { href } : {}),
    ...(counterpartyHref ? { counterpartyHref } : {}),
    ...(columns ? { columns } : {}),
  });
  const empty = EMPTY[tab];

  return (
    <DataTable<CaseListItem>
      rows={cases}
      columns={cols}
      rowKey={(c) => c.caseId}
      head={{
        title: head?.title ?? CASE_LIST_TAB_LABEL[tab],
        ...(head?.sub !== undefined ? { sub: head.sub } : {}),
        ...(head?.actions !== undefined ? { actions: head.actions } : {}),
      }}
      minWidth={minWidth}
      {...(density ? { density } : {})}
      {...(listHref ? { href: listHref } : {})}
      {...(sort ? { sort } : {})}
      {...(pager ? { pager } : {})}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      {...(filtered ? { filtered } : {})}
      empty={{ title: empty.title, description: empty.description(emptyCount), done: empty.done }}
    />
  );
}
