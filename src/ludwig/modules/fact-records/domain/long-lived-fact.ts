/**
 * F672 — Langlebige Fakten: was am Mandanten oder am Geschäftspartner über viele Fälle gilt, je Fakt mit der
 * Art seiner Gültigkeit. Regeln: `docs/concepts/booking-process.md` Abschnitt 7 („Validity of long-lived facts,
 * history and archive“).
 */
import { z } from "zod";
import { factSchemaWithoutValidity } from "./fact";
import { SUPPLY_KINDS, USES, type FactGroup } from "./fact-record";

/** Die Version, mit der geschrieben wird. */
export const LONG_LIVED_FACT_SCHEMA_VERSION = "long-lived-fact@1";

export const LONG_LIVED_SUBJECT_KINDS = ["client", "business_partner"] as const;
export type LongLivedSubjectKind = (typeof LONG_LIVED_SUBJECT_KINDS)[number];

/** `open`: gilt bis auf Weiteres · `fiscal_year`: gilt für ein Wirtschaftsjahr · `period`: gilt für einen Zeitraum. */
export const VALIDITY_KINDS = ["open", "fiscal_year", "period"] as const;
export type ValidityKind = (typeof VALIDITY_KINDS)[number];

interface LongLivedFactDefinition {
  subject_kind: LongLivedSubjectKind;
  validity: ValidityKind;
  value: z.ZodTypeAny;
}

// Regel für Änderungen (dieselbe wie beim Faktensatz): Innerhalb einer Version darf nur ein neuer, optionaler
// Schlüssel oder ein zusätzlicher Wert dazukommen. Umbenennen, Entfernen oder ein anderer Werttyp ist eine neue
// Version (`long-lived-fact@2`) mit eigenem Eintrag; gespeicherte Zeilen werden nie umgeschrieben, sie werden mit
// dem Schema ihrer Version gelesen.
export const LONG_LIVED_FACTS = {
  client_small_business: { subject_kind: "client", validity: "fiscal_year", value: z.boolean() },
  client_taxation_method: { subject_kind: "client", validity: "fiscal_year", value: z.enum(["accrual", "cash"]) },
  client_profit_method: {
    subject_kind: "client",
    validity: "fiscal_year",
    value: z.enum(["balance_sheet", "cash_basis"]),
  },
  client_output_profile: {
    subject_kind: "client",
    validity: "fiscal_year",
    value: z.enum(["taxable", "exempt", "mixed"]),
  },
  client_business_model: { subject_kind: "client", validity: "open", value: z.string().min(1).max(2000) },
  counterparty_country: {
    subject_kind: "business_partner",
    validity: "open",
    value: z.string().regex(/^[A-Z]{2}$/),
  },
  counterparty_is_business: { subject_kind: "business_partner", validity: "open", value: z.boolean() },
  counterparty_vat_id: { subject_kind: "business_partner", validity: "open", value: z.string().min(4).max(20) },
  counterparty_typical_supply: {
    subject_kind: "business_partner",
    validity: "open",
    value: z
      .object({
        supply_type: z.string().min(1).max(200),
        supply_kind: z.enum(SUPPLY_KINDS).optional(),
        use: z.enum(USES).optional(),
      })
      .strict(),
  },
} as const satisfies Record<string, LongLivedFactDefinition>;

export type LongLivedFactKey = keyof typeof LONG_LIVED_FACTS;

export const LONG_LIVED_FACT_KEYS = [
  "client_small_business",
  "client_taxation_method",
  "client_profit_method",
  "client_output_profile",
  "client_business_model",
  "counterparty_country",
  "counterparty_is_business",
  "counterparty_vat_id",
  "counterparty_typical_supply",
] as const satisfies readonly LongLivedFactKey[];

export function isLongLivedFactKey(key: string): key is LongLivedFactKey {
  return Object.hasOwn(LONG_LIVED_FACTS, key);
}

const FACT_GROUP_BY_SUBJECT_KIND: Record<LongLivedSubjectKind, FactGroup> = {
  client: "client",
  business_partner: "counterparty",
};

/** F681 — die Gruppe eines langlebigen Fakts ergibt sich aus seinem Gegenstand. */
export function longLivedFactGroup(key: LongLivedFactKey): FactGroup {
  return FACT_GROUP_BY_SUBJECT_KIND[LONG_LIVED_FACTS[key].subject_kind];
}

/** Der Fakt zu einem Schlüssel, ohne `valid_from` und `valid_to`: der Zeitraum steht in eigenen Spalten. */
export function longLivedFactSchema<Key extends LongLivedFactKey>(key: Key) {
  return factSchemaWithoutValidity<(typeof LONG_LIVED_FACTS)[Key]["value"]>(LONG_LIVED_FACTS[key].value);
}
export type LongLivedFact<Key extends LongLivedFactKey = LongLivedFactKey> = z.infer<
  ReturnType<typeof longLivedFactSchema<Key>>
>;

/** Je Version das Schema eines Schlüssels; eine neue Version bekommt hier ihren eigenen Eintrag. */
const LONG_LIVED_FACT_SCHEMAS = {
  "long-lived-fact@1": longLivedFactSchema,
} as const;

export function longLivedFactSchemaFor(schemaVersion: string, key: string): z.ZodTypeAny {
  if (!Object.hasOwn(LONG_LIVED_FACT_SCHEMAS, schemaVersion)) {
    throw new Error(`Unknown long-lived fact schema version: ${schemaVersion}`);
  }
  if (!isLongLivedFactKey(key)) throw new Error(`Unknown long-lived fact key: ${key}`);
  return LONG_LIVED_FACT_SCHEMAS[schemaVersion as keyof typeof LONG_LIVED_FACT_SCHEMAS](key);
}

/** Der Zeitraum, den ein neuer Wert ohne ausdrückliche Angabe bekommt. `validTo` ist einschließlich. */
export function defaultValidity(input: {
  key: LongLivedFactKey;
  referenceDate: string;
  fiscalYear?: { start: string; end: string };
}): { validFrom: string; validTo: string | null } {
  const validity: ValidityKind = LONG_LIVED_FACTS[input.key].validity;
  if (validity === "open") return { validFrom: input.referenceDate, validTo: null };
  if (validity === "fiscal_year") {
    if (!input.fiscalYear) throw new Error(`Fiscal year required for ${input.key}`);
    return { validFrom: input.fiscalYear.start, validTo: input.fiscalYear.end };
  }
  throw new Error(`Validity must be given explicitly for ${input.key}`);
}

/** Je Schlüssel Gegenstand und Gültigkeit, sortiert nach Schlüssel — der Vertrags-Snapshot der Version. */
export function describeLongLivedFacts(): {
  key: LongLivedFactKey;
  subject_kind: LongLivedSubjectKind;
  validity: ValidityKind;
}[] {
  return [...LONG_LIVED_FACT_KEYS]
    .sort()
    .map((key) => ({ key, subject_kind: LONG_LIVED_FACTS[key].subject_kind, validity: LONG_LIVED_FACTS[key].validity }));
}
