/**
 * F237 — Zahlung ohne Beleg: Zweck und Umsatzsteuer beim Mandanten erfragen.
 *
 * Der Agent stellt die Frage an einem Bank-Sachverhalt ohne Beleg; die
 * Antworten legt der Server fest (S13), Freitext bleibt zusätzlich offen.
 * 19 %/7 % schreibt die Freigabe „Vorsteuer ohne Beleg" (F222), „ohne" lässt
 * den Satz brutto (buchung.md R12).
 */

export const PAYMENT_WITHOUT_DOCUMENT_QUESTION_TYPE = "payment_without_document";

/** Reihenfolge = Anzeige. Der Text IST der gespeicherte Antwortwert (S13). */
export const PAYMENT_WITHOUT_DOCUMENT_OPTIONS = {
  vat19: "Mit 19 % Umsatzsteuer buchen — Vorsteuer ohne Beleg freigeben, Beleg bleibt nachzureichen",
  vat7: "Mit 7 % Umsatzsteuer buchen — Vorsteuer ohne Beleg freigeben, Beleg bleibt nachzureichen",
  noVat: "Ohne Umsatzsteuer brutto auf den Aufwand buchen",
} as const;

export type ClientVatTreatment = { kind: "rate"; ratePercent: 19 | 7 } | { kind: "none" };

/** Option → Steuerbehandlung; Freitext oder unbekannter Wert → null. */
export function vatTreatmentOfAnswer(value: string | null | undefined): ClientVatTreatment | null {
  if (value === PAYMENT_WITHOUT_DOCUMENT_OPTIONS.vat19) return { kind: "rate", ratePercent: 19 };
  if (value === PAYMENT_WITHOUT_DOCUMENT_OPTIONS.vat7) return { kind: "rate", ratePercent: 7 };
  if (value === PAYMENT_WITHOUT_DOCUMENT_OPTIONS.noVat) return { kind: "none" };
  return null;
}
