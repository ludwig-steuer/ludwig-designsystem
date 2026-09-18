import { formatGermanDate } from "@/ludwig/shared";

import type { InvoiceDetail } from "./invoice";

/**
 * F239 — der Reiter „E-Rechnung" der Belegseite (R37): die Werte, die Ludwig
 * aus dem eingebetteten XML gelesen und gespeichert hat, als Label/Wert-Zeilen.
 * Kein neues Parsen; eine Zeile ohne Wert entfällt.
 */

/** Stammen die Werte aus der eingebetteten E-Rechnung? Nur dann gibt es den Reiter. */
export function isEmbeddedXmlInvoice(invoice: Pick<InvoiceDetail, "extractionSource"> | null | undefined): boolean {
  return invoice?.extractionSource === "embedded_xml";
}

const text = (v: string | null | undefined): string | null => (v && v.trim() !== "" ? v.trim() : null);

/** Teile einer Zeile mit „ · " verbinden, leere fallen weg; ohne Teil keine Zeile. */
const zeile = (label: string, ...teile: Array<string | null>): Array<[string, string]> => {
  const werte = teile.filter((t): t is string => t !== null);
  return werte.length === 0 ? [] : [[label, werte.join(" · ")]];
};

const mit = (prefix: string, v: string | null | undefined) => (text(v) ? `${prefix} ${text(v)}` : null);
const datum = (v: string | null | undefined) => (text(v) ? formatGermanDate(text(v)!) : null);

export function eInvoiceFacts(
  invoice: Pick<
    InvoiceDetail,
    | "vendorName"
    | "vendorAddress"
    | "vendorUstId"
    | "vendorTaxId"
    | "customerName"
    | "customerAddress"
    | "customerTaxId"
    | "customerId"
    | "invoiceNumber"
    | "invoiceDate"
    | "dueDate"
    | "servicePeriod"
    | "paymentTerm"
  >,
): Array<[label: string, value: string]> {
  return [
    ...zeile(
      "Aussteller",
      text(invoice.vendorName),
      text(invoice.vendorAddress),
      mit("USt-IdNr.", invoice.vendorUstId),
      mit("Steuernummer", invoice.vendorTaxId),
    ),
    ...zeile(
      "Empfänger",
      text(invoice.customerName),
      text(invoice.customerAddress),
      mit("USt-IdNr./Steuernummer", invoice.customerTaxId),
      mit("Kundennummer", invoice.customerId),
    ),
    ...zeile("Rechnungsnummer", text(invoice.invoiceNumber)),
    ...zeile("Rechnungsdatum", datum(invoice.invoiceDate)),
    ...zeile("Fällig am", datum(invoice.dueDate)),
    ...zeile("Leistungszeitraum", text(invoice.servicePeriod)),
    ...zeile("Zahlungsbedingungen", text(invoice.paymentTerm)),
  ];
}
