import { z } from "zod";
import type { RawSearchParams } from "@/ludwig/shared";

export const ACCOUNT_TYPES = [
  "general_ledger",
  "creditor",
  "debtor",
  "revenue",
  "other",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_STATUSES = ["active", "inactive"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_SOURCES = ["imported", "system_allocated", "reference", "manual"] as const;
export type AccountSource = (typeof ACCOUNT_SOURCES)[number];

/**
 * Herkunft eines Kontos — reines Vokabular, kein Status: es gibt keinen
 * Fortschritt und keine Farbe. Deshalb bewusst NICHT in der Status-Registry,
 * aber hier zentral, weil Liste und Detailseite dieselben Labels brauchen.
 */
export const ACCOUNT_SOURCE_LABEL: Record<AccountSource, string> = {
  imported: "DATEV-Import",
  system_allocated: "System",
  // F52-T52.3: einheitlicher Wert für "aus dem SKR-Katalog aktiviert".
  reference: "SKR-Katalog",
  manual: "Manuell",
};

/** Herkunft anzeigen. Unbekannter DB-Wert fällt sichtbar als Rohwert durch. */
export function accountSourceLabel(source: string | null | undefined): string {
  if (!source) return "—";
  return ACCOUNT_SOURCE_LABEL[source as AccountSource] ?? source;
}

/**
 * Was wird gezeigt:
 * - ``client``: nur die DATEV-Konten dieses Mandanten (default).
 * - ``all``: client-Konten + SKR-Katalog der aktuellen SKR-Variante des
 *   Mandanten — Konten die im Katalog stehen, aber im Mandant nicht
 *   angelegt sind, werden mit Badge ``SKR-Katalog`` markiert.
 */
export const ACCOUNT_SCOPES = ["client", "all"] as const;
export type AccountScope = (typeof ACCOUNT_SCOPES)[number];

/**
 * SKR-Kontoklasse. Wird beim INSERT von Python aus ``classify_skr_class()``
 * (``apps/workflows/.../services/account_classification.py``) gesetzt;
 * vorher (vor PR1, Migration 20260513130000) war es eine STORED GENERATED
 * Spalte aus der inzwischen gedroppten SQL-Funktion ``classify_account()``.
 * Reihenfolge entspricht der natürlichen Sortierung in der UI
 * (Bilanz → GuV → Debitoren/Kreditoren → Sonstige).
 */
export const ACCOUNT_CLASSES = [
  "fixed_assets",
  "current_assets",
  "equity",
  "liabilities",
  "revenue",
  "revenue_self_consumption",
  "material_expense",
  "personnel_expense",
  "other_operating_expense",
  "other_expense_income",
  "carryforward",
  "debtor",
  "creditor",
  "other",
] as const;
export type AccountClass = (typeof ACCOUNT_CLASSES)[number];

// Hinweis: in SKR04 ist Klasse 6 inhaltlich aufgeteilt — 6000–6199 sind
// echter Personalaufwand, 6200–6999 sind sonst. betr. Aufwand. Daher
// kein „(6)" / „(7)"-Ziffer-Suffix mehr in den Labels (irreführend).
export const ACCOUNT_CLASS_LABEL: Record<AccountClass, string> = {
  fixed_assets: "Anlagevermögen",
  current_assets: "Umlaufvermögen",
  equity: "Eigenkapital",
  liabilities: "Verbindlichkeiten",
  revenue: "Erlöse",
  revenue_self_consumption: "Unentgeltliche Wertabgaben",
  material_expense: "Materialaufwand",
  personnel_expense: "Personalaufwand",
  other_operating_expense: "Sonstige betr. Aufwendungen",
  other_expense_income: "Sonstige Aufw./Erträge",
  carryforward: "Vorträge",
  debtor: "Debitoren",
  creditor: "Kreditoren",
  other: "Sonstige",
};

type BadgeKind = "info" | "success" | "warning" | "danger" | "neutral";
export const ACCOUNT_CLASS_KIND: Record<AccountClass, BadgeKind> = {
  fixed_assets: "neutral",
  current_assets: "neutral",
  equity: "info",
  liabilities: "warning",
  revenue: "success",
  revenue_self_consumption: "neutral",
  material_expense: "warning",
  personnel_expense: "warning",
  other_operating_expense: "info",
  other_expense_income: "neutral",
  carryforward: "neutral",
  debtor: "info",
  creditor: "info",
  other: "neutral",
};

export const ACCOUNT_SORT_KEYS = [
  "account_number",
  "account_name",
  "usage_booking_count",
  "last_booking_date",
] as const;
export type AccountSortKey = (typeof ACCOUNT_SORT_KEYS)[number];

export const ACCOUNT_SORT_DIRS = ["asc", "desc"] as const;
export type AccountSortDir = (typeof ACCOUNT_SORT_DIRS)[number];

export const ACCOUNT_VIEWS = ["flat", "grouped"] as const;
export type AccountView = (typeof ACCOUNT_VIEWS)[number];

export const ACCOUNT_PAGE_SIZES = [50, 100, 200] as const;
export type AccountPageSize = (typeof ACCOUNT_PAGE_SIZES)[number];

/**
 * Default-Sortrichtung pro Sort-Key — wenn der Benutzer eine andere
 * Spalte als Sortierschlüssel wählt, soll die fachlich erwartete
 * Reihenfolge angewendet werden (z. B. Buchungen absteigend).
 */
export const ACCOUNT_SORT_DEFAULT_DIR: Record<AccountSortKey, AccountSortDir> = {
  account_number: "asc",
  account_name: "asc",
  usage_booking_count: "desc",
  last_booking_date: "desc",
};

export interface AccountFilter {
  search?: string;
  scope: AccountScope;
  type?: AccountType;
  status?: AccountStatus;
  /** SKR-Klasse-Filter (skr_class). */
  skrClass?: AccountClass;
  /** Sortier-Schlüssel. Default: ``account_number``. */
  sort: AccountSortKey;
  /** Sortier-Richtung. Default je nach Sortschlüssel. */
  dir: AccountSortDir;
  /** Darstellungsmodus. ``grouped`` deaktiviert Pagination. */
  view: AccountView;
  /** Page-Größe (50/100/200). */
  pageSize: AccountPageSize;
  /**
   * Default ``true``: nur Konten mit mindestens einer Buchung
   * (= ``status='active'``) zeigen. Steuerberater haben typischerweise
   * keinen Bedarf, hunderte ungenutzte Konten zu sehen. Über
   * ``?withInactive=1`` einblendbar.
   */
  usedOnly: boolean;
}

export interface AccountRow {
  /** Eindeutiger Render-Key. ``client_<id>`` oder ``skr_<variant>_<number>``. */
  key: string;
  /** Quelle der Zeile — bestimmt Felder die NULL sein können + Badge. */
  origin: "client" | "skr_catalog";
  /** ``id`` aus client_ledger_accounts. NULL für SKR-Katalog. */
  id: string | null;
  accountNumber: string;
  accountName: string | null;
  accountingRole: AccountType | null;
  skrClass: AccountClass | null;
  description: string | null;
  /** Nur client: aktiv = mind. 1× bebucht; inactive = nie bebucht. */
  status: AccountStatus | null;
  /** Nur client: imported/system_allocated/reference/manual. */
  source: AccountSource | null;
  /** Nur client: wie oft auf das Konto gebucht wurde. */
  usageBookingCount: number | null;
  /** Nur client: Datum der letzten Buchung. */
  lastBookingDate: string | null;
  /**
   * Nur client: SKR-Basis-Kontonummer des verknüpften Katalog-Eintrags —
   * seit T52.1 über die FK ``account_framework_entry_id`` aufgelöst
   * (die redundante Textspalte ``skr_base_code`` ist gedroppt).
   */
  skrBaseCode: string | null;
  /** Nur skr_catalog: ``skr03`` oder ``skr04``. */
  accountFrameworkCode: string | null;
}

const FilterSchema = z.object({
  q: z.string().min(1).optional(),
  scope: z.enum(["client", "all"]).optional(),
  type: z.enum(ACCOUNT_TYPES).optional(),
  status: z.enum(ACCOUNT_STATUSES).optional(),
  class: z.enum(ACCOUNT_CLASSES).optional(),
  sort: z.enum(ACCOUNT_SORT_KEYS).optional(),
  dir: z.enum(ACCOUNT_SORT_DIRS).optional(),
  view: z.enum(ACCOUNT_VIEWS).optional(),
  pageSize: z.coerce.number().int().optional(),
  withInactive: z.string().optional(),
});

function coercePageSize(v: number | undefined): AccountPageSize {
  if (v === 100) return 100;
  if (v === 200) return 200;
  return 50;
}

export function parseAccountFilter(raw: RawSearchParams): AccountFilter {
  const parsed = FilterSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    scope: typeof raw.scope === "string" ? raw.scope : undefined,
    type: typeof raw.type === "string" ? raw.type : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    class: typeof raw.class === "string" ? raw.class : undefined,
    sort: typeof raw.sort === "string" ? raw.sort : undefined,
    dir: typeof raw.dir === "string" ? raw.dir : undefined,
    view: typeof raw.view === "string" ? raw.view : undefined,
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : undefined,
    withInactive: typeof raw.withInactive === "string" ? raw.withInactive : undefined,
  });
  if (!parsed.success) {
    return {
      scope: "client",
      sort: "account_number",
      dir: "asc",
      view: "flat",
      pageSize: 50,
      usedOnly: true,
    };
  }
  // explicit status overrides the default usedOnly toggle.
  const usedOnly =
    parsed.data.status === undefined &&
    parsed.data.withInactive !== "1";
  const sort: AccountSortKey = parsed.data.sort ?? "account_number";
  const dir: AccountSortDir = parsed.data.dir ?? ACCOUNT_SORT_DEFAULT_DIR[sort];
  return {
    search: parsed.data.q,
    scope: parsed.data.scope ?? "client",
    type: parsed.data.type,
    status: parsed.data.status,
    skrClass: parsed.data.class,
    sort,
    dir,
    view: parsed.data.view ?? "flat",
    pageSize: coercePageSize(parsed.data.pageSize),
    usedOnly,
  };
}
