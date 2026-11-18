/**
 * F668 — Faktensatz: die Primärfakten eines Ereignis-Splits als ein JSON-Objekt, versioniert.
 * Regeln: `docs/concepts/booking-process.md` Abschnitte 2, 5 und 7.
 */
import { z } from "zod";
import { factSchema } from "./fact";

/** Die Version, mit der geschrieben wird. */
export const FACT_RECORD_SCHEMA_VERSION = "fact-record@1";

const countryCode = z.string().regex(/^[A-Z]{2}$/);
const COUNTRY_CODE_TYPE = "country_code";

// Der Katalog enthält nur Primärfakten: beobachtet oder von jemandem festgestellt. Was sich aus anderen Fakten
// berechnen lässt, gehört nicht hinein, sondern in die Ableitung des Buchungsmoduls.
export const FACT_KEYS = [
  "direction",
  "supply_kind",
  "supply_type",
  "use",
  "supplier_country",
  "recipient_country",
  "ship_from_country",
  "ship_to_country",
  "counterparty_is_business",
  "counterparty_vat_id",
  "service_date",
  "stated_tax_rate",
  "stated_tax_amount",
  "reverse_charge_notice",
  "invoice_formally_valid",
  "usage",
  "special_regime",
  "client_small_business",
  "client_taxation_method",
] as const;
export type FactKey = (typeof FACT_KEYS)[number];

/** F681 — wozu ein Fakt gehört; die Faktenansicht gliedert danach. */
export const FACT_GROUPS = ["document", "line", "counterparty", "client", "payment", "series"] as const;
export type FactGroup = (typeof FACT_GROUPS)[number];

export const FACT_GROUP_BY_KEY: Record<FactKey, FactGroup> = {
  direction: "document",
  supplier_country: "document",
  recipient_country: "document",
  ship_from_country: "document",
  ship_to_country: "document",
  service_date: "document",
  reverse_charge_notice: "document",
  invoice_formally_valid: "document",
  special_regime: "document",
  supply_kind: "line",
  supply_type: "line",
  use: "line",
  usage: "line",
  stated_tax_rate: "line",
  stated_tax_amount: "line",
  counterparty_is_business: "counterparty",
  counterparty_vat_id: "counterparty",
  client_small_business: "client",
  client_taxation_method: "client",
};

export const SUPPLY_KINDS = ["goods", "service"] as const;
export type SupplyKind = (typeof SUPPLY_KINDS)[number];

export const USES = ["consumed", "resale", "production_input", "fixed_asset", "private", "recharged"] as const;
export type Use = (typeof USES)[number];

/** Wert je Fakt: das Schema und sein Name im Vertrags-Snapshot (`describeFacts`). */
const FACT_VALUES = {
  direction: { value_type: "enum(inbound|outbound)", schema: z.enum(["inbound", "outbound"]) },
  supply_kind: { value_type: "enum(goods|service)", schema: z.enum(SUPPLY_KINDS) },
  // Stufe 1: deutscher freier Text, was gekauft wurde (Leitkonzept Abschnitt 7).
  supply_type: { value_type: "string(1..200)", schema: z.string().min(1).max(200) },
  use: {
    value_type: "enum(consumed|resale|production_input|fixed_asset|private|recharged)",
    schema: z.enum(USES),
  },
  supplier_country: { value_type: COUNTRY_CODE_TYPE, schema: countryCode },
  recipient_country: { value_type: COUNTRY_CODE_TYPE, schema: countryCode },
  ship_from_country: { value_type: COUNTRY_CODE_TYPE, schema: countryCode },
  ship_to_country: { value_type: COUNTRY_CODE_TYPE, schema: countryCode },
  counterparty_is_business: { value_type: "boolean", schema: z.boolean() },
  counterparty_vat_id: { value_type: "string(4..20)", schema: z.string().min(4).max(20) },
  service_date: { value_type: "date", schema: z.string().date() },
  stated_tax_rate: { value_type: "number(0..100)", schema: z.number().min(0).max(100) },
  stated_tax_amount: { value_type: "decimal_string", schema: z.string().regex(/^-?\d+\.\d{2}$/) },
  reverse_charge_notice: { value_type: "boolean", schema: z.boolean() },
  invoice_formally_valid: { value_type: "boolean", schema: z.boolean() },
  usage: { value_type: "enum(taxable|exempt|mixed)", schema: z.enum(["taxable", "exempt", "mixed"]) },
  special_regime: {
    value_type: "enum(none|margin_scheme|small_business_supplier)",
    schema: z.enum(["none", "margin_scheme", "small_business_supplier"]),
  },
  client_small_business: { value_type: "boolean", schema: z.boolean() },
  client_taxation_method: { value_type: "enum(accrual|cash)", schema: z.enum(["accrual", "cash"]) },
} as const satisfies Record<FactKey, { value_type: string; schema: z.ZodTypeAny }>;

const optionalFact = <Key extends FactKey>(key: Key) =>
  factSchema<(typeof FACT_VALUES)[Key]["schema"]>(FACT_VALUES[key].schema).optional();

/** Jeder Schlüssel ist optional: ein fehlender Schlüssel heißt „noch nicht betrachtet“. */
export const FactRecordFactsSchema = z
  .object({
    direction: optionalFact("direction"),
    supply_kind: optionalFact("supply_kind"),
    supply_type: optionalFact("supply_type"),
    use: optionalFact("use"),
    supplier_country: optionalFact("supplier_country"),
    recipient_country: optionalFact("recipient_country"),
    ship_from_country: optionalFact("ship_from_country"),
    ship_to_country: optionalFact("ship_to_country"),
    counterparty_is_business: optionalFact("counterparty_is_business"),
    counterparty_vat_id: optionalFact("counterparty_vat_id"),
    service_date: optionalFact("service_date"),
    stated_tax_rate: optionalFact("stated_tax_rate"),
    stated_tax_amount: optionalFact("stated_tax_amount"),
    reverse_charge_notice: optionalFact("reverse_charge_notice"),
    invoice_formally_valid: optionalFact("invoice_formally_valid"),
    usage: optionalFact("usage"),
    special_regime: optionalFact("special_regime"),
    client_small_business: optionalFact("client_small_business"),
    client_taxation_method: optionalFact("client_taxation_method"),
  } satisfies Record<FactKey, z.ZodTypeAny>)
  .strict();
export type FactRecordFacts = z.infer<typeof FactRecordFactsSchema>;

// Regel für Änderungen: Innerhalb einer Version darf nur ein neuer, optionaler Schlüssel dazukommen. Umbenennen,
// Entfernen oder ein anderer Werttyp ist eine neue Version (`fact-record@2`) mit eigenem Eintrag; gespeicherte
// Zeilen werden nie umgeschrieben, sie werden mit dem Schema ihrer Version gelesen.
export const FACT_RECORD_SCHEMAS = {
  "fact-record@1": FactRecordFactsSchema,
} as const;
export type FactRecordSchemaVersion = keyof typeof FACT_RECORD_SCHEMAS;

export function factRecordSchemaFor(schemaVersion: string): (typeof FACT_RECORD_SCHEMAS)[FactRecordSchemaVersion] {
  if (!Object.hasOwn(FACT_RECORD_SCHEMAS, schemaVersion)) {
    throw new Error(`Unknown fact record schema version: ${schemaVersion}`);
  }
  return FACT_RECORD_SCHEMAS[schemaVersion as FactRecordSchemaVersion];
}

/** Je Schlüssel Werttyp und Gruppe, sortiert nach Schlüssel — der Vertrags-Snapshot der Version. */
export function describeFacts(): { key: FactKey; value_type: string; group: FactGroup }[] {
  return [...FACT_KEYS]
    .sort()
    .map((key) => ({ key, value_type: FACT_VALUES[key].value_type, group: FACT_GROUP_BY_KEY[key] }));
}
