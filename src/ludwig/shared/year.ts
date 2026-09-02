import type { RawSearchParams } from "./pagination";

/**
 * Year filter (one calendar year). The Mandant-Band sets `?year=YYYY`
 * globally for the active Mandant; lists translate it into a date range
 * over their relevant date column (`invoice_date`, `booking_date`).
 *
 * Explicit `?from=…&to=…` always wins — it represents a manual filter
 * the user has applied on top of the band default.
 */

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

export function parseYear(raw: RawSearchParams): number | null {
  const v = typeof raw.year === "string" ? raw.year : undefined;
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < MIN_YEAR || n > MAX_YEAR) return null;
  return n;
}

export function yearToDateRange(year: number): { from: string; to: string } {
  const yyyy = String(year).padStart(4, "0");
  return { from: `${yyyy}-01-01`, to: `${yyyy}-12-31` };
}

/**
 * Resolve the effective from/to date range for a list reader:
 *   - explicit from/to from the raw search params win
 *   - else, fall back to the Year-Band selection
 *   - else, no filter (return both undefined)
 */
export function resolveDateRange(
  raw: RawSearchParams,
  fallbackYear: number | null,
): { dateFrom: string | undefined; dateTo: string | undefined } {
  const fromRaw = typeof raw.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.from) ? raw.from : undefined;
  const toRaw = typeof raw.to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.to) ? raw.to : undefined;
  if (fromRaw || toRaw) {
    return { dateFrom: fromRaw, dateTo: toRaw };
  }
  if (fallbackYear != null) {
    const r = yearToDateRange(fallbackYear);
    return { dateFrom: r.from, dateTo: r.to };
  }
  return { dateFrom: undefined, dateTo: undefined };
}
