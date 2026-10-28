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

/**
 * yyyy-mm-dd um `months` Monate zurück, Tag auf Monatsende geklemmt
 * (31.03. minus 1 Monat → 28./29.02., nicht 02./03.03.).
 */
export function monthsBefore(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y!, m! - 1 - months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d!, lastDay));
  return target.toISOString().slice(0, 10);
}
