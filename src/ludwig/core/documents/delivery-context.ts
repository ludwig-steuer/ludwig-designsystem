/**
 * F566 — was die Anlieferung aus DATEV Unternehmen online am Beleg mitbringt
 * (`client_source_docs.delivery_context`, jsonb, Schlüssel in snake_case).
 *
 * Ein Ort für drei Seiten: der Intake-Vertrag prüft den Rechnungskopf mit
 * `datevInvoiceHeaderSchema`, der Schreibkern legt ihn mit `headerToJson` ab,
 * Buchungskontext, `document_context` und Belegseite lesen mit `readDelivery`.
 * Rein, ohne DB — liegt in `core`, weil Vertrag (`intake`), Schreibkern
 * (`accounting-cases`) und Leser (`booking-v2`, `agent`) es teilen und jedes
 * Modul als Heimat einen Zyklus erzeugt (`module-map.json`).
 */
import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Datum erwartet als yyyy-mm-dd");

/**
 * Der Rechnungskopf aus DATEV mit UNSEREN Namen und Formaten — das Plugin
 * wandelt um, der Server nimmt nur dieses Format (Owner 2026-10-27). Zweite
 * Quelle zum Gegenprüfen der Extraktion, nie ihr Ersatz.
 */
export const datevInvoiceHeaderSchema = z
  .object({
    invoiceNumber: z.string().trim().min(1).max(100),
    invoiceDate: isoDate,
    serviceDate: isoDate,
    /** Brutto, negativ bei Gutschrift. */
    grossAmount: z
      .number()
      .finite()
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "höchstens 2 Nachkommastellen"),
    currency: z.string().regex(/^[A-Z]{3}$/, "Währung erwartet als ISO-Code in Großbuchstaben (EUR)"),
    vatRatePercent: z.number().min(0).max(100),
    partnerName: z.string().trim().min(1).max(200),
    partnerVatId: z.string().trim().min(1).max(20),
    iban: z.string().trim().min(1).max(34),
    bic: z.string().trim().min(1).max(11),
    customerNumber: z.string().trim().min(1).max(50),
    bookingText: z.string().trim().min(1).max(200),
    account: z.string().regex(/^\d{1,9}$/, "Konto erwartet als 1–9 Ziffern"),
    contraAccount: z.string().regex(/^\d{1,9}$/, "Gegenkonto erwartet als 1–9 Ziffern"),
    taxKey: z.string().regex(/^\d{1,4}$/, "BU-Schlüssel erwartet als 1–4 Ziffern"),
  })
  .partial()
  .strict();

export type DatevInvoiceHeader = z.infer<typeof datevInvoiceHeaderSchema>;

/** Vertrag (camelCase) → jsonb (snake_case). */
const HEADER_JSON_KEYS = {
  invoiceNumber: "invoice_number",
  invoiceDate: "invoice_date",
  serviceDate: "service_date",
  grossAmount: "gross_amount",
  currency: "currency",
  vatRatePercent: "vat_rate_percent",
  partnerName: "partner_name",
  partnerVatId: "partner_vat_id",
  iban: "iban",
  bic: "bic",
  customerNumber: "customer_number",
  bookingText: "booking_text",
  account: "account",
  contraAccount: "contra_account",
  taxKey: "tax_key",
} as const satisfies Record<keyof DatevInvoiceHeader, string>;

type HeaderKey = keyof typeof HEADER_JSON_KEYS;
const HEADER_KEYS = Object.keys(HEADER_JSON_KEYS) as HeaderKey[];

export function headerToJson(header: DatevInvoiceHeader): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const key of HEADER_KEYS) {
    const value = header[key];
    if (value !== undefined) out[HEADER_JSON_KEYS[key]] = value;
  }
  return out;
}

function headerFromJson(raw: unknown): DatevInvoiceHeader | null {
  if (!raw || typeof raw !== "object") return null;
  const json = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of HEADER_KEYS) {
    const value = json[HEADER_JSON_KEYS[key]];
    if (value !== undefined && value !== null) out[key] = value;
  }
  return Object.keys(out).length ? (out as DatevInvoiceHeader) : null;
}

/** Was unsere Extraktion zum Vergleich beiträgt — fehlt ein Wert, wird nicht verglichen. */
export interface ExtractedHeaderFacts {
  invoiceNumber: string | null;
  invoiceDate: string | null;
  grossAmount: number | string | null;
  vatRatePercent: number | string | null;
}

/** Der eine Steuersatz der Positionen — mehrere Sätze (oder keiner) heißt: nicht vergleichbar. */
export function singleVatRate(rates: ReadonlyArray<number | string | null>): number | null {
  const distinct = [...new Set(rates.filter((r) => r !== null && r !== "").map(Number))];
  return distinct.length === 1 ? distinct[0]! : null;
}

const normalizeNumber = (v: string) => v.replace(/\s+/g, "").toUpperCase();
const toNumber = (v: number | string | null | undefined) => (v === null || v === undefined || v === "" ? null : Number(v));

/**
 * Welche Kopffelder DATEV anders sieht als unsere Extraktion. Ein Feld, das auf
 * einer Seite fehlt, ist keine Abweichung — verglichen wird nur, was beide haben.
 */
export function compareDatevHeader(header: DatevInvoiceHeader, extraction: ExtractedHeaderFacts): string[] {
  const out: string[] = [];
  if (header.invoiceNumber && extraction.invoiceNumber && normalizeNumber(header.invoiceNumber) !== normalizeNumber(extraction.invoiceNumber)) {
    out.push("invoiceNumber");
  }
  if (header.invoiceDate && extraction.invoiceDate && header.invoiceDate !== extraction.invoiceDate.slice(0, 10)) {
    out.push("invoiceDate");
  }
  const gross = toNumber(extraction.grossAmount);
  if (header.grossAmount !== undefined && gross !== null && Math.abs(header.grossAmount - gross) > 0.01 + 1e-9) {
    out.push("grossAmount");
  }
  const rate = toNumber(extraction.vatRatePercent);
  if (header.vatRatePercent !== undefined && rate !== null && header.vatRatePercent !== rate) {
    out.push("vatRatePercent");
  }
  return out;
}

/** Die Anlieferung, wie Agent und Oberfläche sie sehen (camelCase). */
export interface DeliveryView {
  kost1?: string;
  kost2?: string;
  datevNote?: string;
  datevBooked?: boolean;
  datevPaid?: boolean;
  datevPaidAt?: string;
  datevApproved?: boolean;
  datevApprovedAt?: string;
  datevInvoiceHeader?: DatevInvoiceHeader;
  /** Nur mit Rechnungskopf: die Felder, in denen DATEV und Extraktion auseinanderliegen. */
  datevHeaderMismatches?: string[];
}

/** jsonb-Schlüssel → Feld der Sicht; `note` und `source_label` gehören nicht dazu (eigene Felder am Beleg). */
const VIEW_KEYS = {
  kost1: "kost1",
  kost2: "kost2",
  datev_note: "datevNote",
  datev_booked: "datevBooked",
  datev_paid: "datevPaid",
  datev_paid_at: "datevPaidAt",
  datev_approved: "datevApproved",
  datev_approved_at: "datevApprovedAt",
} as const;

/**
 * `delivery_context` als Block für Agent und Oberfläche. Ohne Kostenstelle,
 * DATEV-Notiz, Status oder Rechnungskopf: `null` — der Block entfällt.
 */
export function readDelivery(raw: unknown, extraction: ExtractedHeaderFacts | null): DeliveryView | null {
  if (!raw || typeof raw !== "object") return null;
  const json = raw as Record<string, unknown>;
  const view: Record<string, unknown> = {};
  for (const [jsonKey, viewKey] of Object.entries(VIEW_KEYS)) {
    const value = json[jsonKey];
    if (value !== undefined && value !== null && value !== "") view[viewKey] = value;
  }
  const header = headerFromJson(json.datev_invoice_header);
  if (header) {
    view.datevInvoiceHeader = header;
    view.datevHeaderMismatches = extraction ? compareDatevHeader(header, extraction) : [];
  }
  return Object.keys(view).length ? (view as DeliveryView) : null;
}
