/**
 * Der Spezial-Typ einer Position, in Worten.
 *
 * Der Wertebereich gehört dem Interpreter: `LineSpecialType` in
 * `apps/shared/src/buchassi_shared/interpretation.py`. Hier steht, wie ein
 * Mensch die Werte liest; die Werte selbst bleiben englisch (Naming-Regel).
 *
 * Unbekanntes bleibt sichtbar: `lineSpecialTypeLabel` gibt den Rohwert zurück.
 * `summary_*` sind Summen-Fußzeilen, die der Interpreter vor der Persistenz
 * entfernen soll — tauchen sie trotzdem auf, bekommen sie ein Wort.
 */
export const LINE_SPECIAL_TYPES = [
  "none",
  "transport_cost",
  "payment_fee",
  "late_fee",
  "discount",
  "skonto",
  "deposit",
  "service_fee",
  "assembly",
  "warranty_extension",
  "duty_or_tax",
  "rounding",
  "reference_only",
  "summary_subtotal",
  "summary_tax",
  "summary_total",
] as const;
export type LineSpecialType = (typeof LINE_SPECIAL_TYPES)[number];

export const LINE_SPECIAL_TYPE_LABEL: Record<LineSpecialType, string> = {
  none: "Reguläre Position",
  transport_cost: "Transportkosten",
  payment_fee: "Zahlungsgebühr",
  late_fee: "Mahn-/Verzugsgebühr",
  discount: "Rabatt",
  skonto: "Skonto",
  deposit: "Pfand",
  service_fee: "Bearbeitungsgebühr",
  assembly: "Montage / Inbetriebnahme",
  warranty_extension: "Garantieverlängerung",
  duty_or_tax: "Zoll / Einfuhrabgabe",
  rounding: "Rundungsdifferenz",
  reference_only: "Nur Referenz (nicht buchbar)",
  summary_subtotal: "Summenzeile: Zwischensumme (netto)",
  summary_tax: "Summenzeile: Umsatzsteuer",
  summary_total: "Summenzeile: Gesamtbetrag",
};

/**
 * Der Spezial-Typ als Wort. `none` und leer sind **kein** Spezial-Typ und
 * geben `null`.
 */
export function lineSpecialTypeLabel(value: string | null | undefined): string | null {
  if (!value || value === "none") return null;
  return (LINE_SPECIAL_TYPE_LABEL as Record<string, string>)[value] ?? value;
}
