/**
 * F668 — Ein Fakt: Wert, Sicherheit als Kategorie und die Quellen, die ihn tragen.
 * Die Sicherheit legt fest, welche Quellen mindestens dabei sein müssen.
 */
import { z } from "zod";
import { FactSourceSchema, type FactSource, type FactSourceKind } from "./fact-source";

export const CERTAINTIES = ["confirmed", "explicit", "inferred", "assumed", "unknown"] as const;
export type Certainty = (typeof CERTAINTIES)[number];

/** Quellenarten, die `confirmed` tragen: ein Mensch oder eine Behörde hat den Wert bestätigt. */
const CONFIRMING_SOURCE_KINDS = [
  "clarification",
  "external_service",
  "accounting_review",
] as const satisfies readonly FactSourceKind[];

/** Höchstens so viele Quellen je Fakt und je offenem Punkt. */
export const FACT_SOURCES_MAX = 12;

interface FactCore {
  // Optional nur für den Typ: bei generischem Wertschema leitet zod `value` als optional ab.
  value?: unknown;
  certainty: Certainty;
  sources: FactSource[];
}

/** Die Sicherheit bestimmt, ob ein Wert da sein muss und welche Quellen mindestens dabei sind. */
function checkCertainty(fact: FactCore, ctx: z.RefinementCtx): void {
  if (fact.certainty === "unknown" && fact.value !== null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["value"], message: "Certainty 'unknown' needs a null value." });
  }
  if (fact.certainty !== "unknown" && fact.value === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: `Certainty '${fact.certainty}' needs a value.`,
    });
  }
  const sourcesIssue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sources"], message });
  if (
    fact.certainty === "confirmed" &&
    !fact.sources.some((source) => (CONFIRMING_SOURCE_KINDS as readonly FactSourceKind[]).includes(source.kind))
  ) {
    sourcesIssue(
      "Certainty 'confirmed' needs a source of kind 'clarification', 'external_service' or 'accounting_review'.",
    );
  }
  if (fact.certainty === "explicit" && !fact.sources.some((source) => source.id && (source.locator || source.quote))) {
    sourcesIssue("Certainty 'explicit' needs a source with an id and a locator or quote.");
  }
  if (fact.certainty === "inferred" && fact.sources.length === 0) {
    sourcesIssue("Certainty 'inferred' needs at least one source.");
  }
  if (fact.certainty === "assumed" && !fact.sources.some((source) => source.kind === "default")) {
    sourcesIssue("Certainty 'assumed' needs a source of kind 'default'.");
  }
}

const factCoreShape = <ValueSchema extends z.ZodTypeAny>(valueSchema: ValueSchema) => ({
  value: valueSchema.nullable(),
  certainty: z.enum(CERTAINTIES),
  sources: z.array(FactSourceSchema).max(FACT_SOURCES_MAX),
});

export function factSchema<ValueSchema extends z.ZodTypeAny>(valueSchema: ValueSchema) {
  return z
    .object({
      ...factCoreShape(valueSchema),
      valid_from: z.string().date().optional(),
      valid_to: z.string().date().optional(),
    })
    .strict()
    .superRefine((fact, ctx) => checkCertainty(fact, ctx));
}

/** F672 — derselbe Fakt ohne `valid_from` und `valid_to`: beim langlebigen Fakt steht der Zeitraum in Spalten. */
export function factSchemaWithoutValidity<ValueSchema extends z.ZodTypeAny>(valueSchema: ValueSchema) {
  return z
    .object(factCoreShape(valueSchema))
    .strict()
    .superRefine((fact, ctx) => checkCertainty(fact, ctx));
}
