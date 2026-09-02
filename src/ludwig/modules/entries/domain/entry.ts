import { z } from "zod";
import type { RawSearchParams } from "@/ludwig/shared";

/** Spiegel der DB-Werte (client_journal_entry_origin_check). Das Journal ist
 *  Ludwigs Vorschlagssystem — DATEV-Fremdbuchungen leben im Spiegel
 *  (`client_datev_mirror_entries`), nicht hier (K11, 2026-08-05).
 *  `client_import` ist die Gegenrichtung: der Mandant hat in seiner eigenen
 *  Software gebucht, Ludwig ist der Weg nach DATEV (F69). */
export const ENTRY_ORIGIN = [
  "ai_proposed",
  "manual",
  "system_reversal",
  "recurring_rule",
  "client_import",
] as const;
export type EntryOrigin = (typeof ENTRY_ORIGIN)[number];

export const ENTRY_STATUS = ["proposed", "accepted", "posted", "reversed"] as const;
export type EntryStatus = (typeof ENTRY_STATUS)[number];

/**
 * Abgeleitete Anzeige-Stufe „Weg nach DATEV" (2026-08-14) — KEINE Spalte.
 * Kombiniert `status` mit den Export-/Spiegel-Fakten am Journal-Entry:
 * `exported_at` (an DATEV übergeben — eine Behauptung, Push-204 ≠ angekommen)
 * und `datev_mirror_entry_id` (im DATEV-Spiegel wiedergefunden — der Beweis).
 * Deshalb bleiben das getrennte Signale und werden nur fürs UI linearisiert.
 */
export const ENTRY_DATEV_STAGE = ["proposed", "accepted", "exported", "in_datev", "reversed"] as const;
export type EntryDatevStage = (typeof ENTRY_DATEV_STAGE)[number];

export function deriveEntryDatevStage(e: {
  status: EntryStatus;
  exportedAt: string | null;
  datevMirrorEntryId: string | null;
}): EntryDatevStage {
  if (e.status === "reversed") return "reversed";
  // `posted` heißt heute „ist in DATEV bereits Ist" (Status-Registry) — gleiche
  // Endstufe wie ein Spiegel-Match.
  if (e.datevMirrorEntryId !== null || e.status === "posted") return "in_datev";
  if (e.exportedAt !== null) return "exported";
  return e.status === "accepted" ? "accepted" : "proposed";
}

export interface JournalEntryListItem {
  entryId: string;
  clientId: string;
  cycleId: string;
  bookingDate: string;
  amount: number;
  currency: string;
  debitAccountNumber: string | null;
  debitAccountName: string | null;
  creditAccountNumber: string | null;
  creditAccountName: string | null;
  vatKey: string | null;
  vatRatePercent: number | null;
  belegfeld1: string | null;
  buchungstext: string | null;
  origin: EntryOrigin;
  status: EntryStatus;
  exportedAt: string | null;
  datevMirrorEntryId: string | null;
  isLocked: boolean;
  /** Sachverhalt über accounting_event → case. NULL bei DATEV-Import-Sätzen. */
  caseId: string | null;
  caseNumber: string | null;
  caseFiscalYear: number | null;
}

export interface EntryFilter {
  cycleId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: EntryStatus[];
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const EntryFilterRawSchema = z.object({
  cycle: z.string().uuid().optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  status: z.string().optional(),
});

export function parseEntryFilter(raw: RawSearchParams): EntryFilter {
  const parsed = EntryFilterRawSchema.safeParse({
    cycle: typeof raw.cycle === "string" ? raw.cycle : undefined,
    from: typeof raw.from === "string" ? raw.from : undefined,
    to: typeof raw.to === "string" ? raw.to : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
  });
  if (!parsed.success) return {};

  const status = parsed.data.status
    ? (parsed.data.status
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is EntryStatus => (ENTRY_STATUS as readonly string[]).includes(s)) as EntryStatus[])
    : undefined;

  return {
    cycleId: parsed.data.cycle,
    dateFrom: parsed.data.from,
    dateTo: parsed.data.to,
    status: status && status.length > 0 ? status : undefined,
  };
}
