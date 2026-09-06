import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

export type SortDir = "asc" | "desc";

/**
 * Sortierwunsch aus der URL, **bereits gegen eine Whitelist geprüft**.
 *
 * `key` ist nie ein roher URL-Wert: `parsePageRequest` gibt ihn nur heraus,
 * wenn er in der Whitelist der aufrufenden Liste steht. Die Query bildet ihn
 * anschließend auf eine Spalte ab — es geht kein Nutzer-String in ein
 * ORDER BY.
 */
export interface SortRequest<K extends string = string> {
  key: K;
  dir: SortDir;
}

export interface PageRequest<K extends string = string> {
  page: number;
  pageSize: number;
  /** Fehlt, wenn nichts angefordert wurde oder der Wunsch nicht erlaubt war. */
  sort?: SortRequest<K>;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Generic search-params shape every list page receives via Server
 * Component props. Filter modules add their own keys on top.
 */
export type RawSearchParams = Record<string, string | string[] | undefined>;

const PageRequestSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  size: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

/**
 * `?sort=…&dir=…` lesen und gegen die Whitelist der Liste prüfen.
 *
 * Ein unbekannter Schlüssel ergibt `undefined` statt eines Fehlers: ein alter
 * Bookmark oder ein Tippfehler in der URL soll die Seite nicht zerlegen,
 * sondern auf der Standard-Sortierung landen. `dir` ist alles außer `asc`
 * gleich `desc` — Listen zeigen üblicherweise das Jüngste zuerst.
 */
export function parseSortRequest<K extends string>(
  raw: RawSearchParams,
  allowed: readonly K[],
): SortRequest<K> | undefined {
  const key = typeof raw.sort === "string" ? raw.sort : undefined;
  if (key === undefined) return undefined;
  if (!(allowed as readonly string[]).includes(key)) return undefined;
  return { key: key as K, dir: raw.dir === "asc" ? "asc" : "desc" };
}

/**
 * Seite, Größe und (optional) Sortierung aus den Such-Parametern.
 *
 * Ohne `allowedSortKeys` wird `?sort=` ignoriert — eine Liste, die keine
 * Whitelist mitgibt, ist nicht sortierbar. Das ist Absicht: die Whitelist ist
 * die Grenze zwischen URL und ORDER BY.
 */
export function parsePageRequest<K extends string = never>(
  raw: RawSearchParams,
  allowedSortKeys?: readonly K[],
): PageRequest<K> {
  const parsed = PageRequestSchema.safeParse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    size: typeof raw.size === "string" ? raw.size : undefined,
  });
  const sort = allowedSortKeys ? parseSortRequest(raw, allowedSortKeys) : undefined;
  if (!parsed.success) return { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE, sort };
  return { page: parsed.data.page, pageSize: parsed.data.size, sort };
}

/**
 * Inclusive zero-based range for Supabase `.range(from, to)`.
 */
export function pageRange(page: PageRequest): { from: number; to: number } {
  const from = (page.page - 1) * page.pageSize;
  return { from, to: from + page.pageSize - 1 };
}

export function totalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * Build a URL with the same search params as `current`, overriding only
 * the keys in `overrides`. `null`/`undefined` removes the key. Used by
 * pagination + filter UI to preserve adjacent state when navigating.
 */
export function withSearchParams(
  current: RawSearchParams,
  overrides: Record<string, string | number | null | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, value);
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value == null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}
