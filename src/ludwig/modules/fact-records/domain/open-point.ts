/**
 * F668 — Offener Punkt: ein Fakt, der fehlt, widersprüchlich oder unsicher ist, mit Grund und der Partei,
 * die am Zug ist. Er hängt am Ereignis-Split, nicht am Sachverhalt.
 */
import { z } from "zod";
import { FACT_SOURCES_MAX } from "./fact";
import { FACT_KEYS } from "./fact-record";
import { FactSourceSchema } from "./fact-source";

export const OPEN_POINT_REASONS = ["missing", "contradictory", "uncertain"] as const;
export type OpenPointReason = (typeof OPEN_POINT_REASONS)[number];

/** Die Reihenfolge ist die Leiter: Programm und Einzelaufruf eines Modells, dann der Agent, dann die Kanzlei. */
export const OPEN_POINT_RESOLVERS = ["server", "agent", "accounting"] as const;
export type OpenPointResolver = (typeof OPEN_POINT_RESOLVERS)[number];

export const OPEN_POINT_STATES = ["open", "resolved"] as const;
export type OpenPointState = (typeof OPEN_POINT_STATES)[number];

export const OPEN_POINT_RESOLVED_BY = ["server", "agent", "human"] as const;
export type OpenPointResolvedBy = (typeof OPEN_POINT_RESOLVED_BY)[number];

/** `not_required`: die Ableitung braucht den Fakt nicht mehr, weil ein anderer Fakt den Zweig geändert hat. */
export const OPEN_POINT_RESOLUTIONS = ["answered", "not_required"] as const;
export type OpenPointResolution = (typeof OPEN_POINT_RESOLUTIONS)[number];

export const OpenPointInputSchema = z
  .object({
    fact_key: z.enum(FACT_KEYS),
    reason: z.enum(OPEN_POINT_REASONS),
    detail: z.string().min(1).max(500),
    evidence: z.array(FactSourceSchema).max(FACT_SOURCES_MAX),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (input.reason === "contradictory" && input.evidence.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidence"],
        message: "Reason 'contradictory' needs at least two evidence entries.",
      });
    }
  });
export type OpenPointInput = z.infer<typeof OpenPointInputSchema>;

/** Die nächste Partei auf der Leiter; bei `accounting` ist Schluss. */
export function nextResolver(current: OpenPointResolver): OpenPointResolver | null {
  return OPEN_POINT_RESOLVERS[OPEN_POINT_RESOLVERS.indexOf(current) + 1] ?? null;
}
