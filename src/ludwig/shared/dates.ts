import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

/**
 * Domain dates (Belegdatum, Fälligkeit, Buchungsdatum) travel as ISO date
 * strings (YYYY-MM-DD) inside the system. Parse only at the display
 * boundary; never use `new Date()` for date-only business concepts.
 */

export type IsoDate = string;
export type IsoDateTime = string;

export function formatGermanDate(iso: IsoDate): string {
  return format(parseISO(iso), "dd.MM.yyyy", { locale: de });
}

export function formatGermanDateTime(iso: IsoDateTime): string {
  return format(parseISO(iso), "dd.MM.yyyy HH:mm", { locale: de });
}
