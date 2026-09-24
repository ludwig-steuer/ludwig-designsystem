/**
 * F280 — Dateikorb: die Anlieferungsmenge eines Mandanten zwischen zwei
 * Freigaben. Der Korb ist nicht der Stapel: Stapel = Buchungszeitraum,
 * Korb = Anlieferung (belege.md R38).
 */

/** Zustände eines Korbs — deckungsgleich mit dem DB-CHECK `client_file_baskets.state`. */
export const FILE_BASKET_STATE = ["open", "submitted", "released", "completed"] as const;
export type FileBasketState = (typeof FILE_BASKET_STATE)[number];

/** Hinweise beim Abschicken — nie ein Blocker (Registry-Achse `file_basket_warning`). */
export const FILE_BASKET_WARNING_CODE = [
  "processing_pending",
  "classification_failed",
  "extraction_failed",
  "review_needed",
  "awaiting_input",
  "unsplit_collection",
  "partner_not_found",
  "date_outside_open_batch",
  "client_batch_ambiguous",
] as const;
export type FileBasketWarningCode = (typeof FILE_BASKET_WARNING_CODE)[number];

export interface FileBasketWarning {
  code: FileBasketWarningCode;
  count: number;
  /** Höchstens 20 — die UI verlinkt die ersten drei. */
  sourceDocIds: string[];
}

export interface FileBasket {
  id: string;
  clientId: string;
  /** `YYYY-NNNN` — angezeigt über `formatFileBasketNumber`. */
  basketNumber: string;
  state: FileBasketState;
  periodFrom: string;
  periodTo: string | null;
  openedAt: string;
  submittedAt: string | null;
  submittedBy: string | null;
  releasedAt: string | null;
  completedAt: string | null;
  warnings: FileBasketWarning[];
}

export interface FileBasketListItem {
  id: string;
  basketNumber: string;
  state: FileBasketState;
  periodFrom: string;
  periodTo: string | null;
  docCount: number;
  completedCount: number;
}

export interface FileBasketDocCounts {
  total: number;
  completed: number;
  repairRequired: number;
}

/** UI-Nummer eines Korbs: `2026-0003` → `K-2026-0003`. */
export function formatFileBasketNumber(n: string): string;
export function formatFileBasketNumber(n: string | null): string | null;
export function formatFileBasketNumber(n: string | null): string | null {
  return n ? `K-${n}` : null;
}
