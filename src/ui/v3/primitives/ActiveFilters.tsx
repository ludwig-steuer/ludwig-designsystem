"use client";

import { ActionIcon } from "../Icons";
import { formatCount } from "../format";
import { Link } from "./Link";
import { TextButton } from "./TextButton";

/**
 * What the list shows right now (0209, F329 rank 5): every filter that is set
 * as a chip with its value in words — „Belegdatum 01.–31.08.", „Hartje KG" —
 * each one removable on its own, the count „12 von 335" before them, and
 * „Alle zurücksetzen" once two or more are set. It stands **over the list**,
 * not only in the empty state: a filter nobody sees is a filter somebody
 * forgets.
 */

export interface ActiveFilter {
  key: string;
  /** The filter in words: dimension and value („Betrag 1.000–2.000 €"). */
  label: string;
  onRemove?: () => void;
  /** Server-form alternative: the page without this filter. */
  removeHref?: string;
}

/**
 * @when    Showing which filters narrow a list, each removable — above the
 *          table, under the filter bar.
 * @instead Choosing a filter → FilterChips / FilterBar. Nothing narrowed →
 *          it renders nothing; the list head says „335 Belege".
 */
export function ActiveFilters({
  filters,
  result,
  onResetAll,
  resetAllHref,
}: {
  filters: readonly ActiveFilter[];
  result: { shown: number; total: number; unit?: readonly [one: string, other: string] };
  onResetAll?: () => void;
  resetAllHref?: string;
}) {
  // The count stands whenever the list is narrowed — also when the only
  // filters are pressed chips above (quick filter, category) that need no chip here.
  if (filters.length === 0 && result.shown === result.total) return null;
  return (
    <div className="v3actf" role="group" aria-label="Aktive Filter">
      <span className="v3actf__count" aria-live="polite">
        {formatCount(result.shown)} von {result.unit ? formatCount(result.total, result.unit) : formatCount(result.total)}
      </span>
      {filters.map((f) => {
        const body = (
          <>
            <span>{f.label}</span>
            <ActionIcon action="remove" size={12} />
          </>
        );
        const name = `Filter „${f.label}" entfernen`;
        return f.removeHref ? (
          <Link key={f.key} href={f.removeHref} className="v3actf__chip" aria-label={name}>
            {body}
          </Link>
        ) : (
          <button key={f.key} type="button" className="v3actf__chip" aria-label={name} onClick={f.onRemove}>
            {body}
          </button>
        );
      })}
      {filters.length >= 2 ? (
        resetAllHref ? (
          <Link href={resetAllHref} className="v2link v2link--quiet">
            Alle zurücksetzen
          </Link>
        ) : (
          <TextButton tone="quiet" onClick={onResetAll}>
            Alle zurücksetzen
          </TextButton>
        )
      ) : null}
    </div>
  );
}
