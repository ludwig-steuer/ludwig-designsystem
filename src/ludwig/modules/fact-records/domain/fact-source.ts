/**
 * F668 — Quelle eines Fakts: ein Verweis mit Art, Kennung, Fundstelle, Zitat und Anzeigetext, kein Etikett.
 * Arten und Grundfelder kommen aus dem Quellenformat der Buchungsbegründung (`core/accounting/rationale-source`).
 */
import { z } from "zod";
import { RATIONALE_SOURCE_KINDS, RationaleSourceObjectSchema } from "@/ludwig/core/accounting/rationale-source";

export const FACT_SOURCE_KINDS = [
  ...RATIONALE_SOURCE_KINDS,
  "business_partner",
  "client_profile",
  "external_service",
  "default",
  // F681: die Buchhaltung hat den Wert in der Abnahme festgestellt; die Person steht im `label`.
  "accounting_review",
] as const;
export type FactSourceKind = (typeof FACT_SOURCE_KINDS)[number];

/** Arten, die auf einen Datensatz des Mandanten zeigen und deshalb eine `id` tragen. */
export const FACT_SOURCE_KINDS_WITH_ID = [
  "source_doc",
  "contract",
  "bank_transaction",
  "clarification",
  "ledger_account",
  "business_partner",
] as const satisfies readonly FactSourceKind[];

const unitInterval = z.number().min(0).max(1);

/** Fundstelle in der Quelle: Fläche auf einer Seite, Rechnungszeile oder ein benanntes Feld. */
export const FactSourceLocatorSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("page_box"),
      page: z.number().int().min(1),
      box: z.tuple([unitInterval, unitInterval, unitInterval, unitInterval]),
    })
    .strict(),
  z.object({ type: z.literal("invoice_line"), line_id: z.string().uuid() }).strict(),
  z.object({ type: z.literal("field"), name: z.string().min(1).max(100) }).strict(),
]);
export type FactSourceLocator = z.infer<typeof FactSourceLocatorSchema>;

export const FactSourceSchema = RationaleSourceObjectSchema.extend({
  kind: z.enum(FACT_SOURCE_KINDS),
  locator: FactSourceLocatorSchema.optional(),
  label: z.string().min(1).max(200),
  observed_at: z.string().datetime({ offset: true }).optional(),
  // F734: die Lesung des Beleglesers, aus der die Quelle stammt (`client_document_reading.id`).
  reading_id: z.string().uuid().optional(),
})
  .strict()
  .superRefine((source, ctx) => {
    if ((FACT_SOURCE_KINDS_WITH_ID as readonly string[]).includes(source.kind) && !source.id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["id"], message: `Source '${source.kind}' needs an id.` });
    }
    if (source.kind === "law" && !source.citation) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["citation"], message: "Source 'law' needs a citation." });
    }
    if (source.kind === "web" && !source.url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["url"], message: "Source 'web' needs a url." });
    }
    if (source.kind === "client_profile" && source.locator?.type !== "field") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locator"],
        message: "Source 'client_profile' needs a locator of type 'field'.",
      });
    }
    if (source.kind === "external_service" && !source.observed_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["observed_at"],
        message: "Source 'external_service' needs observed_at.",
      });
    }
    if (source.kind === "accounting_review" && !source.observed_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["observed_at"],
        message: "Source 'accounting_review' needs observed_at.",
      });
    }
  });
export type FactSource = z.infer<typeof FactSourceSchema>;
