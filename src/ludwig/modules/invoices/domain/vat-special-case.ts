/**
 * Der umsatzsteuerliche Sonderfall einer Position, in Worten.
 *
 * Der Wertebereich gehört dem Interpreter: `VatSpecialCase` in
 * `apps/invoice-interpreter/.../invoice_interpretation/public_models.py` — 22
 * Werte samt Paragraph als Kommentar. Hier steht, wie ein Mensch sie liest;
 * die Werte selbst bleiben englisch (Naming-Regel).
 *
 * **Eine Tabelle, nicht zwei.** Bis 2026-09-10 stand eine halbe Liste im
 * Positionen-Tab, und sie traf die häufigsten Werte nicht: `reverse_charge_eu_service`
 * (33 Positionen auf Staging), `small_business_exemption` (23) und `exempt_other`
 * (19) fehlten, dafür standen drei Werte drin, die der Interpreter nie schreibt
 * (`reverse_charge_eu_intra`, `tax_exempt_*`, `small_business`). Wer einen davon
 * erwischte, sah den Rohwert.
 *
 * Unbekanntes bleibt sichtbar: `vatSpecialCaseLabel` gibt den Rohwert zurück,
 * statt einen Sonderfall zu verschweigen.
 */
export const VAT_SPECIAL_CASE_LABEL: Record<string, string> = {
  none: "Regelbesteuerung",
  // Reverse Charge — § 13b UStG
  reverse_charge_domestic: "§ 13b inländisch (Reverse-Charge)",
  reverse_charge_eu_service: "§ 13b EU-Dienstleistung (Reverse-Charge)",
  reverse_charge_non_eu: "§ 13b Drittland (Reverse-Charge)",
  // Innergemeinschaftlicher Erwerb
  intra_eu_acquisition: "Innergemeinschaftlicher Erwerb (§ 1a)",
  // Steuerbefreiungen, § 4 UStG
  exempt_rental: "Steuerfrei: Vermietung (§ 4 Nr. 12)",
  exempt_financial: "Steuerfrei: Finanzumsatz (§ 4 Nr. 8)",
  exempt_insurance: "Steuerfrei: Versicherung (§ 4 Nr. 10/11)",
  exempt_medical: "Steuerfrei: Heilbehandlung (§ 4 Nr. 14)",
  exempt_educational: "Steuerfrei: Bildung (§ 4 Nr. 21/22)",
  exempt_cultural: "Steuerfrei: Kultur (§ 4 Nr. 20)",
  exempt_export_non_eu: "Steuerfrei: Ausfuhr Drittland (§ 4 Nr. 1a)",
  exempt_intra_eu_delivery: "Steuerfrei: innergemeinschaftliche Lieferung (§ 4 Nr. 1b)",
  exempt_other: "Steuerfrei: sonstiger Fall (§ 4)",
  // § 19 Kleinunternehmer
  small_business_exemption: "Kleinunternehmer (§ 19)",
  // Differenzbesteuerung
  margin_scheme: "Differenzbesteuerung (§ 25a)",
  travel_margin_scheme: "Reiseleistung (§ 25)",
  // Einfuhr
  import_vat: "Einfuhrumsatzsteuer",
  customs_duty: "Zoll",
  // Sonstiges
  pass_through: "Durchlaufender Posten (§ 10)",
  flat_rate_farming: "Land- und Forstwirtschaft (§ 24)",
  non_deductible_partial: "Teilweise nicht abziehbar (Bewirtung, Geschenke)",
  unknown: "Unklar",
};

/**
 * Der Sonderfall als Wort. `none` und leer sind **kein** Sonderfall und geben
 * `null` — der Regelfall ist keine Nachricht.
 */
export function vatSpecialCaseLabel(value: string | null | undefined): string | null {
  if (!value || value === "none") return null;
  return VAT_SPECIAL_CASE_LABEL[value] ?? value;
}
