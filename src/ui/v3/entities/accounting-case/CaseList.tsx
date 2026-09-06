import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { DataTable, type ListPatch } from "../../patterns/DataTable";
import type { TableDensity } from "../../primitives/Table";
import { caseColumns, caseTracks, type CaseColumn } from "./case-columns";

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

export type CaseListTab = "laufend" | "belege" | "klaerung" | "alle";

/**
 * Three of the four empty cases are a **success**, and they say so. Only
 * „alle" is a gap: a year without a single case has not started.
 */
const EMPTY: Record<CaseListTab, { title: string; description: string; done: boolean }> = {
  laufend: {
    title: "Kein Sachverhalt ist mehr offen.",
    description: "Alles, was in diesem Wirtschaftsjahr angefangen wurde, ist abgeschlossen.",
    done: true,
  },
  belege: {
    title: "Es fehlt keine Unterlage mehr.",
    description: "Kein Sachverhalt wartet auf einen Beleg vom Mandanten.",
    done: true,
  },
  klaerung: {
    title: "Nichts wartet auf Bearbeitung.",
    description: "Es gibt keine offene Frage und keinen Fall, der auf eine Entscheidung wartet.",
    done: true,
  },
  alle: {
    title: "In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt.",
    description: "Sobald ein Beleg eingeht oder eine Zahlung zugeordnet wird, entsteht der erste.",
    done: false,
  },
};

const TAB_TITLE: Record<CaseListTab, string> = {
  laufend: "Laufende Sachverhalte",
  belege: "Wartet auf Unterlagen",
  klaerung: "Zur Bearbeitung",
  alle: "Alle Sachverhalte",
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
  density,
  // Die zehn Spuren ergeben 1500 px, dazu neun Lücken à 10 und zweimal 18
  // Polster: 1626. Darunter scrollt die Tabelle waagerecht, statt den
  // Anzeigenamen zu quetschen.
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
  pager?: { page: number; pageSize: number; totalItems: number; totalPages: number };
  loading?: boolean;
  error?: { message: string; retry?: React.ReactNode };
  /**
   * The **fifth** empty case: empty because of the filter, not because of the
   * stock. The page today knows four tab texts and not this one — and this is
   * the one that says whether the clerk is finished (page profile, doubt 2).
   */
  filtered?: { summary: string; resetHref: string };
  head?: { title?: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode };
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
        title: head?.title ?? TAB_TITLE[tab],
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
      empty={{ title: empty.title, description: empty.description, done: empty.done }}
    />
  );
}

/** The track list of the list's own column set — head and rows read the same. */
export function caseListTracks(columns?: CaseColumn[]): string {
  return caseTracks(caseColumns(columns ? { columns } : {}));
}
