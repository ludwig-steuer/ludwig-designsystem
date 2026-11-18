/**
 * F678a — Faktenansicht: was eine Ansicht über die Fakten einer Buchung zeigt, fertig für die Anzeige. Bezeichnungen,
 * Werte, Beträge und Datumswerte sind deutsche Zeichenketten; die Ansicht rechnet und übersetzt nicht. Reiner Typ
 * mit Schema, ohne Server-Code; das Designsystem spiegelt diese Datei. Regeln:
 * `docs/backlog/F678-fact-view-design-brief.md`.
 */
import { z } from "zod";
import { CERTAINTIES } from "./fact";
import { FACT_GROUPS, FACT_KEYS } from "./fact-record";
import { FACT_SOURCE_KINDS } from "./fact-source";
import { OPEN_POINT_REASONS } from "./open-point";

/**
 * Wie der Buchungssatz entschieden wurde (`client_journal_entry.origin_method`). Eigene Liste, weil dieses Modul kein
 * anderes importiert; ein Test hält sie gleich mit `ORIGIN_METHODS` aus `modules/entries`.
 */
export const FACT_VIEW_ORIGIN_METHODS = ["rule", "derivation", "model_call", "model_agent", "human", "import"] as const;
export type OriginMethodValue = (typeof FACT_VIEW_ORIGIN_METHODS)[number];

/** `no_fact_record`: Buchung ohne Faktensatz (aus der Zeit vor v3); die Ansicht zeigt dann einen Hinweis. */
export const FACT_VIEW_STATES = ["ok", "no_fact_record"] as const;
export type FactViewState = (typeof FACT_VIEW_STATES)[number];

/** Wer an einem offenen Punkt am Zug ist. Programm und Agent erscheinen beide als Ludwig. */
export const FACT_VIEW_PARTIES_ON_TURN = ["ludwig", "accounting", "client"] as const;
export type FactViewPartyOnTurn = (typeof FACT_VIEW_PARTIES_ON_TURN)[number];

export const FACT_VIEW_ENTRY_SIDES = ["debit", "credit"] as const;
export type FactViewEntrySide = (typeof FACT_VIEW_ENTRY_SIDES)[number];

/** Eine Quelle für die Anzeige. `locator` ist fertiger Text („S. 2“, „Position 3“, „Feld Belegrichtung“). */
export const FactViewSourceSchema = z
  .object({
    kind: z.enum(FACT_SOURCE_KINDS),
    label: z.string().min(1),
    href: z.string().min(1).optional(),
    quote: z.string().min(1).optional(),
    locator: z.string().min(1).optional(),
  })
  .strict();
export type FactViewSource = z.infer<typeof FactViewSourceSchema>;

const FactViewEntryLineSchema = z
  .object({
    side: z.enum(FACT_VIEW_ENTRY_SIDES),
    /** „Nummer Name“. */
    account: z.string().min(1),
    amount: z.string().min(1),
    taxKey: z.string().nullable(),
    text: z.string().nullable(),
  })
  .strict();

const FactViewEntrySchema = z
  .object({
    lines: z.array(FactViewEntryLineSchema),
    originMethod: z.enum(FACT_VIEW_ORIGIN_METHODS),
    /** Der Satz ruht auf einem offenen Punkt oder auf einer Annahme. */
    provisional: z.boolean(),
    assumedCount: z.number().int().min(0),
  })
  .strict();

const FactViewResultSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    value: z.string().min(1),
    basedOn: z.array(z.enum(FACT_KEYS)),
  })
  .strict();

const FactViewOpenPointSchema = z
  .object({
    id: z.string().min(1),
    factKey: z.enum(FACT_KEYS),
    label: z.string().min(1),
    reason: z.enum(OPEN_POINT_REASONS),
    detail: z.string().min(1),
    onTurn: z.enum(FACT_VIEW_PARTIES_ON_TURN),
    blocksHandover: z.boolean(),
    evidence: z.array(FactViewSourceSchema.extend({ value: z.string().min(1).optional() }).strict()),
  })
  .strict();

const FactViewFactSchema = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    value: z.string().min(1),
    certainty: z.enum(CERTAINTIES),
    sources: z.array(FactViewSourceSchema),
    validFrom: z.string().min(1).optional(),
    validTo: z.string().min(1).optional(),
    usedForResult: z.boolean(),
    decidedByAgent: z.boolean(),
  })
  .strict();

const FactViewGroupSchema = z.object({ group: z.enum(FACT_GROUPS), facts: z.array(FactViewFactSchema) }).strict();

export const FactViewSchema = z
  .object({
    entry: FactViewEntrySchema.nullable(),
    state: z.enum(FACT_VIEW_STATES),
    result: z.array(FactViewResultSchema),
    openPoints: z.array(FactViewOpenPointSchema),
    groups: z.array(FactViewGroupSchema),
  })
  .strict()
  .superRefine((view, ctx) => {
    // Rückverweis: eine Ergebniszeile nennt nur Fakten, die das Ergebnis bestimmt haben und in der Ansicht stehen.
    const usedKeys = new Set(
      view.groups.flatMap((group) => group.facts.filter((fact) => fact.usedForResult).map((fact) => fact.key)),
    );
    view.result.forEach((row, rowIndex) => {
      row.basedOn.forEach((key, keyIndex) => {
        if (usedKeys.has(key)) return;
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["result", rowIndex, "basedOn", keyIndex],
          message: `Result row '${row.key}' is based on '${key}', which is not a fact used for the result.`,
        });
      });
    });
  });
export type FactView = z.infer<typeof FactViewSchema>;
