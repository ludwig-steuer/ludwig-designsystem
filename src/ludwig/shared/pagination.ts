import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

export interface PageRequest {
  page: number;
  pageSize: number;
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

export function parsePageRequest(raw: RawSearchParams): PageRequest {
  const parsed = PageRequestSchema.safeParse({
    page: typeof raw.page === "string" ? raw.page : undefined,
    size: typeof raw.size === "string" ? raw.size : undefined,
  });
  if (!parsed.success) return { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE };
  return { page: parsed.data.page, pageSize: parsed.data.size };
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
