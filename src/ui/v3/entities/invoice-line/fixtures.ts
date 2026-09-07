import type { InvoiceLineItem } from "@/ludwig/modules/invoices/domain/invoice";

import type { InvoiceLineLabels } from "./invoice-line";

/**
 * The stock behind every invoice-line story: one invoice with 22 positions —
 * the maximum measured in staging (p50 1 · p90 5 · p99 17 · max 22).
 *
 * One file for all three story files, so the row, the facts and the list show
 * the same invoice. Numbers and names are invented; the shape, the fill rates
 * and the spelling mess of the units come from the profile
 * (`docs/entitaeten/invoice-line.md`).
 */

/** Everything a line has, at its empty value — a story overrides what it shows. */
const BLANK: InvoiceLineItem = {
  position: 1,
  itemName: null,
  productDescription: null,
  productCode: null,
  serviceDate: null,
  quantity: null,
  unit: null,
  unitPriceValue: null,
  lineDiscountValue: null,
  taxRatePercent: null,
  taxValue: null,
  lineTotalNetValue: null,
  fxUnitPriceValue: null,
  fxLineDiscountValue: null,
  fxTaxValue: null,
  fxLineTotalNetValue: null,
  lineSpecialType: "none",
  fundUsageNature: "expense",
  accountingSubject: null,
  fundUsageConfidence: 0.95,
  fundUsageReasoning: null,
  vatSpecialCase: "none",
  vatLegalReference: null,
  vatExtractedRatePercent: null,
  taxCandidateKeys: null,
  vatEvidence: null,
  vatNotes: null,
  historyCandidates: null,
  lineNotes: [],
  source: "extracted",
  disabled: false,
  collapseDecisionJson: null,
};

/** One line, built from the blank one — everything not given stays at its default. */
export function line(over: Partial<InvoiceLineItem> & { position: number }): InvoiceLineItem {
  return { ...BLANK, ...over };
}

/** The words, as the app will hand them in once L-99 has an axis. */
export const LABELS: InvoiceLineLabels = {
  source: {
    virtual_fallback: "aus den Summen erzeugt",
    virtual_aggregate: "Sammelposition",
  },
  fundUsageNature: {
    expense: "Aufwand",
    goods: "Ware",
    investment: "Investition",
    mixed: "gemischt",
    unknown: "unklar",
  },
  lineSpecialType: {
    service_fee: "Servicegebühr",
    transport_cost: "Fracht",
    summary_total: "Summenzeile",
    summary_tax: "Steuersumme",
    deposit: "Pfand",
  },
  vatSpecialCase: {
    reverse_charge_non_eu: "Reverse Charge (Drittland)",
    reverse_charge_eu_service: "Reverse Charge (EU-Leistung)",
    small_business_exemption: "Kleinunternehmer",
    exempt_other: "steuerfrei (sonstige)",
  },
};

/** The ordinary line: a name, a description, a quantity, 19 %. */
export const SIMPLE = line({
  position: 1,
  itemName: "Kopierpapier A4, 80 g",
  productDescription: "Weiß, holzfrei, 500 Blatt je Ries",
  productCode: "PAP-80-A4",
  quantity: 20,
  unit: "Ries",
  unitPriceValue: 4.19,
  taxRatePercent: 19,
  taxValue: 15.92,
  lineTotalNetValue: 83.8,
  accountingSubject: "Büromaterial für den laufenden Betrieb",
  fundUsageReasoning:
    "Verbrauchsmaterial ohne Anlagecharakter, Betrag unter der Grenze für geringwertige Wirtschaftsgüter.",
  serviceDate: "2026-08-26",
  fundUsageConfidence: 0.97,
  taxCandidateKeys: ["9", "8"],
  lineNotes: ["Menge weicht von der Bestellung ab (bestellt: 24)."],
});

/** The shortest line there is — half of all invoices have exactly one. */
export const MINIMAL = line({
  position: 1,
  itemName: "Beratungsleistung August 2026",
  taxRatePercent: 19,
  lineTotalNetValue: 1_800,
  accountingSubject: "Beratung, laufender Aufwand",
  fundUsageConfidence: 0.92,
});

/** Everything at once: virtual, disabled, special case, special type. */
export const DEVIATIONS = line({
  position: 7,
  itemName: "Sammelposition aus 4 Einzelzeilen",
  productDescription: "Der Beleg wurde zusammengefasst, die Einzelzeilen bleiben im Prüfpfad.",
  quantity: 1,
  unit: "Pos",
  unitPriceValue: 612.4,
  taxRatePercent: 0,
  lineTotalNetValue: 612.4,
  source: "virtual_aggregate",
  disabled: true,
  vatSpecialCase: "reverse_charge_non_eu",
  lineSpecialType: "summary_total",
  fundUsageNature: "mixed",
  fundUsageConfidence: 0.81,
  accountingSubject: "Sammelposition, Aufteilung offen",
  vatLegalReference: "§ 13b Abs. 2 Nr. 1 UStG",
  collapseDecisionJson: { collapsed: [1, 2, 4] },
});

/**
 * The line that pushes every limit: a name of 254 characters, an accounting
 * subject of 400 and a reasoning of 297 — the three long texts of the profile at
 * their measured maximum (251 / 392 / 295), plus a unit nobody spells alike.
 */
export const LONG = line({
  position: 12,
  itemName:
    "Wartung und Instandhaltung der Klimatechnik in Halle 2 einschließlich Filterwechsel, Dichtheitsprüfung nach Kälteanlagenverordnung, Protokollierung der Messwerte, Reinigung der Kondensatoren sowie Austausch von zwei Umwälzpumpen inklusive Anfahrt und Ent",
  productDescription:
    "Leistungszeitraum August 2026, Einsatzbericht 4471-B liegt dem Beleg bei und weicht in der Stundenzahl ab.",
  quantity: 2.5,
  unit: "Stck",
  unitPriceValue: 148.5,
  taxRatePercent: 19,
  taxValue: 70.54,
  lineTotalNetValue: 371.25,
  fundUsageNature: "investment",
  vatSpecialCase: "exempt_other",
  accountingSubject:
    "Instandhaltung der technischen Anlagen: die beiden Umwälzpumpen sind Ersatzbeschaffung und kein nachträglicher Herstellungsaufwand, weil sie den Nutzungswert der Anlage nicht erhöhen und die Nutzungsdauer nicht verlängern; die Filter- und Dichtheitsprüfung ist ohnehin laufender Aufwand, und der Einsatzbericht weist keine Erweiterung der Anlage aus, sondern allein ihren Erhalt im bisherigen Umfang.",
  fundUsageReasoning:
    "Der Austausch ersetzt vorhandene Teile gleicher Art und Güte. Eine Aktivierung käme nur bei einer wesentlichen Verbesserung in Betracht, die der Einsatzbericht nicht ausweist; die abweichende Stundenzahl betrifft die Anfahrt und nicht den Umfang der Leistung, sie ändert die Einordnung also nicht.",
  fundUsageConfidence: 0.74,
});

/** No name at all — the row has to say something anyway. */
export const NAMELESS = line({
  position: 18,
  productDescription: "Zuschlag Kleinmenge\nBerechnet je Auftrag",
  quantity: 1,
  unit: "STK",
  unitPriceValue: 12,
  taxRatePercent: 19,
  lineTotalNetValue: 12,
  lineSpecialType: "service_fee",
  fundUsageConfidence: 0.88,
});

/** In foreign currency — 20 of 726 lines carry the mirror. */
export const FOREIGN = line({
  position: 4,
  itemName: "Lizenz Projektsoftware, 12 Monate",
  quantity: 3,
  unit: "Lizenz",
  unitPriceValue: 372.5,
  taxRatePercent: 0,
  lineTotalNetValue: 1_117.5,
  fxUnitPriceValue: 399,
  fxTaxValue: 0,
  fxLineTotalNetValue: 1_197,
  vatSpecialCase: "reverse_charge_eu_service",
  vatLegalReference: "§ 13b Abs. 1 UStG",
  accountingSubject: "Softwarelizenz, laufender Aufwand",
  fundUsageConfidence: 0.96,
  taxCandidateKeys: ["94", "91"],
});

const REST: InvoiceLineItem[] = [
  line({
    position: 2,
    itemName: "Toner HP 415A, schwarz",
    productDescription: "Original, Reichweite 2.400 Seiten",
    productCode: "TON-415A-BK",
    quantity: 4,
    unit: "St",
    unitPriceValue: 89.9,
    taxRatePercent: 19,
    taxValue: 68.32,
    lineTotalNetValue: 359.6,
    accountingSubject: "Verbrauchsmaterial EDV",
    fundUsageConfidence: 0.98,
    taxCandidateKeys: ["9"],
  }),
  line({
    position: 3,
    itemName: "Ordner breit, Rücken 80 mm",
    quantity: 30,
    unit: "Stück",
    unitPriceValue: 2.35,
    taxRatePercent: 19,
    lineTotalNetValue: 70.5,
    fundUsageNature: "goods",
    fundUsageConfidence: 0.99,
  }),
  FOREIGN,
  line({
    position: 5,
    itemName: "Versandkosten",
    quantity: 1,
    unit: "Pos",
    unitPriceValue: 9.9,
    taxRatePercent: 19,
    lineTotalNetValue: 9.9,
    lineSpecialType: "transport_cost",
    fundUsageConfidence: 0.94,
  }),
  line({
    position: 6,
    itemName: "Pfand Transportbehälter",
    quantity: 2,
    unit: "STK",
    unitPriceValue: 15,
    taxRatePercent: 19,
    lineTotalNetValue: 30,
    lineSpecialType: "deposit",
    fundUsageNature: "goods",
    fundUsageConfidence: 0.9,
  }),
  DEVIATIONS,
  line({
    position: 8,
    itemName: "Schreibblock A5, kariert",
    quantity: 25,
    unit: "Stk",
    unitPriceValue: 1.79,
    taxRatePercent: 19,
    lineTotalNetValue: 44.75,
    fundUsageNature: "goods",
    fundUsageConfidence: 0.99,
  }),
  line({
    position: 9,
    itemName: "Kaffee, gemahlen, 1 kg",
    productDescription: "Für die Teeküche",
    quantity: 6,
    unit: "kg",
    unitPriceValue: 14.5,
    taxRatePercent: 7,
    taxValue: 6.09,
    lineTotalNetValue: 87,
    fundUsageNature: "unknown",
    fundUsageConfidence: 0.7,
    accountingSubject: "Bewirtung oder freiwillige Sozialleistung — nicht entschieden",
    fundUsageReasoning:
      "Ohne Anlass lässt sich nicht sagen, ob es sich um Bewirtungsaufwand oder um Aufmerksamkeiten an Arbeitnehmer handelt.",
  }),
  line({
    position: 10,
    itemName: "Reinigungsservice August",
    quantity: 1,
    unit: "Pauschale",
    unitPriceValue: 480,
    taxRatePercent: 19,
    lineTotalNetValue: 480,
    fundUsageConfidence: 0.95,
    serviceDate: "2026-08-31",
  }),
  line({
    position: 11,
    itemName: "Etiketten, selbstklebend",
    quantity: 12,
    unit: "Rolle",
    unitPriceValue: 6.4,
    taxRatePercent: 19,
    lineTotalNetValue: 76.8,
    fundUsageNature: "goods",
    fundUsageConfidence: 0.97,
  }),
  LONG,
  line({
    position: 13,
    itemName: "Ersatzteil Umwälzpumpe",
    productCode: "UP-25-60",
    quantity: 2,
    unit: "ST",
    unitPriceValue: 214.9,
    taxRatePercent: 19,
    lineTotalNetValue: 429.8,
    fundUsageNature: "investment",
    fundUsageConfidence: 0.86,
    accountingSubject: "Ersatzbeschaffung technische Anlage",
  }),
  line({
    position: 14,
    itemName: "Anfahrtspauschale",
    quantity: 2,
    unit: "Fahrt",
    unitPriceValue: 45,
    taxRatePercent: 19,
    lineTotalNetValue: 90,
    lineSpecialType: "service_fee",
    fundUsageConfidence: 0.93,
  }),
  line({
    position: 15,
    itemName: "Entsorgung Altteile",
    quantity: 1,
    unit: "Pos",
    unitPriceValue: 68,
    taxRatePercent: 19,
    lineTotalNetValue: 68,
    fundUsageConfidence: 0.91,
  }),
  line({
    position: 16,
    itemName: "Arbeitsschutzhandschuhe",
    quantity: 10,
    unit: "Paar",
    unitPriceValue: 3.9,
    taxRatePercent: 19,
    lineTotalNetValue: 39,
    fundUsageNature: "goods",
    fundUsageConfidence: 0.98,
  }),
  line({
    position: 17,
    itemName: "Rabatt Jahresvereinbarung",
    productDescription: "Gutschrift auf die Positionen 1 bis 8",
    quantity: 1,
    unit: "Pos",
    unitPriceValue: -120,
    taxRatePercent: 19,
    lineTotalNetValue: -120,
    fundUsageConfidence: 0.89,
  }),
  NAMELESS,
  line({
    position: 19,
    itemName: "Schulung Arbeitssicherheit",
    quantity: 8,
    unit: "h",
    unitPriceValue: 95,
    taxRatePercent: 19,
    lineTotalNetValue: 760,
    serviceDate: "2026-08-19",
    fundUsageConfidence: 0.95,
    accountingSubject: "Fortbildung der Belegschaft",
  }),
  line({
    position: 20,
    itemName: "Zwischensumme Waren",
    quantity: 1,
    unit: "Pos",
    unitPriceValue: 0,
    taxRatePercent: 19,
    lineTotalNetValue: 0,
    lineSpecialType: "summary_tax",
    disabled: true,
    source: "virtual_fallback",
    fundUsageConfidence: 0.8,
  }),
  line({
    position: 21,
    itemName: "Kleinteile laut Anlage",
    productDescription: "Aus den Summen erzeugt, weil der Beleg keine Einzelzeilen führt.",
    quantity: 1,
    unit: "Pos",
    unitPriceValue: 156.4,
    taxRatePercent: 19,
    lineTotalNetValue: 156.4,
    source: "virtual_fallback",
    fundUsageNature: "unknown",
    fundUsageConfidence: 0.72,
  }),
  line({
    position: 22,
    itemName: "Servicepauschale Jahresvertrag",
    quantity: 1,
    unit: "Pos",
    unitPriceValue: 240,
    taxRatePercent: 19,
    lineTotalNetValue: 240,
    lineSpecialType: "service_fee",
    fundUsageConfidence: 0.94,
  }),
];

/**
 * Die p90-Bezeichnung: 92 Zeichen, also die Grenze, an der die Zelle noch
 * stehen muss (p50 34 · p90 93 · max 251). Sie steht nicht in `ALL` — sie ist die
 * Messlatte der Zeile, nicht Teil der Rechnung.
 */
export const P90 = line({
  position: 2,
  itemName:
    "Wartungsvertrag Klimatechnik Halle 2, Grundleistung je Quartal inklusive Anfahrt und Bericht",
  productDescription: "Abrechnung nach Aufwand, Nachweis liegt bei.",
  quantity: 1,
  unit: "Quartal",
  unitPriceValue: 640,
  taxRatePercent: 19,
  lineTotalNetValue: 640,
  fundUsageConfidence: 0.93,
});

/**
 * Eine **aktive** Summenzeile — `summary_total`, nicht deaktiviert. Sie ist
 * der Fall, für den es die Probe im Fuß gibt: der Beleg führt seine eigene
 * Summe als Position, sie zählt mit, und dadurch weicht die Summe der
 * Positionen vom Nettobetrag der Rechnung ab. Im Bestand gibt es 40 solcher
 * Zeilen. Sie steht **nicht** in `ALL`.
 */
export const SUMMARY_TOTAL = line({
  position: 23,
  itemName: "Zwischensumme Rechnung",
  productDescription: "Der Beleg führt seine eigene Summe als Position.",
  quantity: 1,
  unit: "Pos",
  unitPriceValue: 1_475.6,
  taxRatePercent: 19,
  lineTotalNetValue: 1_475.6,
  lineSpecialType: "summary_total",
  fundUsageNature: "unknown",
  fundUsageConfidence: 0.83,
});

/** All 22, in the order of the document. */
export const ALL: InvoiceLineItem[] = [SIMPLE, ...REST].sort((a, b) => a.position - b.position);

/** The five that a p90 invoice has. */
export const FIVE: InvoiceLineItem[] = ALL.slice(0, 5);
