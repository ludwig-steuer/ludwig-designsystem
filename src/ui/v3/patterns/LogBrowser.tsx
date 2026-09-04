"use client";

import { useState } from "react";

import { Button } from "../primitives/Button";
import { EmptyState } from "../primitives/EmptyState";
import { FilterBar } from "../primitives/FilterBar";
import { FilterChips, SearchInput, Segmented } from "../primitives/Nav";
import { LogList, type LogEntry } from "./Log";

/**
 * View, severity and search over a log (0054).
 *
 * Three places do this differently today: a Fachlich/Technisch/Beide switch at
 * the document, three views in the URL at the batch, an eleven-field form in
 * the admin. None of them counts, and none says what the filter is hiding.
 *
 * It filters **locally** what the page has loaded and asks no server: the
 * scope — which client, which document, which period — stays with the page and
 * its URL (I4, R7). The browser does not know where the rows came from.
 */

export interface LogFilterState {
  /** 1 Verlauf · 2 Protokoll · 3 Technik (Z6) — a view shows every row up to its depth. */
  view: 1 | 2 | 3;
  severity: "all" | "warning" | "error";
  search: string;
}

const VIEWS = [1, 2, 3] as const;
const DEFAULT_VIEW_LABELS: [string, string, string] = ["Verlauf", "Protokoll", "Technik"];

const SEVERITIES = [
  { key: "all", label: "Alle" },
  { key: "warning", label: "ab Warnung" },
  { key: "error", label: "nur Fehler" },
] as const;

/** A row without depth reads as 2 — visible, but not in the short form (0053). */
function inView(entry: LogEntry, view: 1 | 2 | 3): boolean {
  return (entry.depth ?? 2) <= view;
}

function inSeverity(entry: LogEntry, severity: LogFilterState["severity"]): boolean {
  if (severity === "all") return true;
  if (severity === "error") return entry.level === "error";
  return entry.level === "warning" || entry.level === "error";
}

/** Everything a person can read in the row — the code included, it is the filter key. */
function matches(entry: LogEntry, needle: string): boolean {
  if (!needle) return true;
  const haystack = [
    entry.message,
    entry.detail,
    entry.code,
    entry.source,
    entry.actor?.label,
    ...(entry.refs?.map((r) => r.label) ?? []),
  ];
  return haystack.some((v) => v?.toLowerCase().includes(needle));
}

/**
 * @when    A log someone has to narrow down: the story without the innards,
 *          only what went wrong, or every row mentioning one document.
 * @instead The rows as they are, without a head → LogList. Narrowing that hits
 *          the server (period, client, resource) → FilterBar at the page, which
 *          holds it in the URL. The story of one object → Timeline.
 */
export function LogBrowser({
  entries,
  initialView = 2,
  viewLabels = DEFAULT_VIEW_LABELS,
  more,
  onChange,
  order,
  loading,
  emptyText,
}: {
  /** Everything the page has loaded; the browser filters locally. */
  entries: LogEntry[];
  /** The batch opens on 1, the admin on 3 — the default is the middle. */
  initialView?: 1 | 2 | 3;
  viewLabels?: [string, string, string];
  /** „Ältere laden" at the foot. Without it, and with `hasMore: false`, no button. */
  more?: { hasMore: boolean; loading?: boolean; onLoad: () => void };
  /** Every change of view, severity or search — so the page can mirror it into the URL. */
  onChange?: (state: LogFilterState) => void;
  order?: "newest" | "oldest";
  loading?: boolean;
  /** Passed through — the empty text **without** a filter. */
  emptyText?: string;
}) {
  const [view, setView] = useState<1 | 2 | 3>(initialView);
  const [severity, setSeverity] = useState<LogFilterState["severity"]>("all");
  const [search, setSearch] = useState("");

  const needle = search.trim().toLowerCase();
  const shown = entries.filter(
    (e) => inView(e, view) && inSeverity(e, severity) && matches(e, needle),
  );

  // Every counter reckons with the other two filters — so the number says what
  // you get when you click, not what exists somewhere.
  const viewCounts = VIEWS.map(
    (v) => entries.filter((e) => inView(e, v) && inSeverity(e, severity) && matches(e, needle)).length,
  );
  const severityCounts = SEVERITIES.map(
    (s) => entries.filter((e) => inView(e, view) && inSeverity(e, s.key) && matches(e, needle)).length,
  );

  // The view is not a filter — there is always one. Only these two can be reset.
  const activeCount = (severity === "all" ? 0 : 1) + (search.trim() ? 1 : 0);
  const hasLevels = entries.some((e) => e.level !== undefined);
  /** The nearest deeper view that would show something — the way out of an empty view. */
  const wider = VIEWS.find((v) => v > view && (viewCounts[v - 1] ?? 0) > 0) ?? null;

  function change(next: Partial<LogFilterState>) {
    const state: LogFilterState = { view, severity, search, ...next };
    if (next.view !== undefined) setView(next.view);
    if (next.severity !== undefined) setSeverity(next.severity);
    if (next.search !== undefined) setSearch(next.search);
    onChange?.(state);
  }

  const loadMore = more?.hasMore ? (
    <Button
      variant="secondary"
      size="sm"
      onClick={more.onLoad}
      loading={more.loading}
      loadingLabel="Lädt …"
    >
      Ältere laden
    </Button>
  ) : null;

  return (
    <div className="v2logb">
      <div className="v2log__head">
        <FilterBar
          activeCount={activeCount}
          onReset={
            activeCount > 0 ? () => change({ severity: "all", search: "" }) : undefined
          }
        >
          <Segmented
            ariaLabel="Sicht"
            active={String(view)}
            options={VIEWS.map((v, i) => ({
              key: String(v),
              label: viewLabels[i] ?? "",
              count: viewCounts[i],
            }))}
            onPick={(key) => change({ view: Number(key) as 1 | 2 | 3 })}
          />
          {hasLevels ? (
            <FilterChips
              label="Schwere"
              active={severity}
              options={SEVERITIES.map((s, i) => ({
                key: s.key,
                label: s.label,
                count: severityCounts[i],
              }))}
              onPick={(key) => change({ severity: key as LogFilterState["severity"] })}
            />
          ) : null}
          {/* Escape empties the field — `type="search"` alone does not do it in
              every browser, and the input itself carries no key handler. */}
          <div onKeyDown={(e) => e.key === "Escape" && change({ search: "" })}>
            <SearchInput
              placeholder="Im Protokoll suchen"
              value={search}
              onChange={(value) => change({ search: value })}
            />
          </div>
        </FilterBar>
      </div>

      {entries.length > 0 && shown.length === 0 ? (
        <EmptyState
          inline
          title={emptyAfterFilter(viewLabels[view - 1] ?? "", severity, search, entries.length)}
          description="Der Filter greift nur, was geladen ist."
          action={
            <>
              {activeCount > 0 ? (
                <Button size="sm" onClick={() => change({ severity: "all", search: "" })}>
                  Filter zurücksetzen
                </Button>
              ) : null}
              {/* When the view alone is what hides the rows, resetting helps
                  nothing — then the way out is the view that holds them. */}
              {wider === null ? null : (
                <Button
                  size="sm"
                  variant={activeCount > 0 ? "secondary" : "primary"}
                  onClick={() => change({ view: wider })}
                >
                  {`Zu „${viewLabels[wider - 1]}“ wechseln`}
                </Button>
              )}
              {loadMore}
            </>
          }
        />
      ) : (
        <LogList entries={shown} order={order} loading={loading} emptyText={emptyText} />
      )}

      {shown.length > 0 && loadMore ? <div className="v2log__foot">{loadMore}</div> : null}
    </div>
  );
}

/** Says which of the three filters is hiding the rows — and out of how many. */
function emptyAfterFilter(
  viewLabel: string,
  severity: LogFilterState["severity"],
  search: string,
  loaded: number,
): string {
  const parts = [`Nichts in „${viewLabel}"`];
  if (severity !== "all") parts.push(SEVERITIES.find((s) => s.key === severity)!.label);
  if (search.trim()) parts.push(`zu „${search.trim()}"`);
  return `${parts.join(" ")} — in den ${loaded} geladenen Einträgen.`;
}
