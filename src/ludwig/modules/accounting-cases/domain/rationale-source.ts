/**
 * Begründungs-Quelle (rationale source) — die maschinenlesbare Konvention, mit
 * der ein Agent (oder Mensch) eine Buchungs-/Klärungs-Entscheidung belegt.
 *
 * Lebt als jsonb-Konvention in `client_journal_entry.proposal_rationale.sources`
 * bzw. in Audit-Payloads — KEIN eigenes Datenmodell (F03-T3.1). Diese Datei ist
 * die **eine** Quelle des Schemas; Schreibtools (F03-T3.2), UI (F03-T3.3) und
 * Audit (F03-T3.4) importieren sie. Siehe GLOSSARY „Begründungs-Quelle" +
 * `docs/topics/buchung.md` §5 F3.
 */
import { z } from "zod";

/** Alle Quell-Arten. `*_id`-Arten referenzieren eine Mandanten-Entität. */
export const RATIONALE_SOURCE_KINDS = [
  "source_doc",
  "contract",
  "bank_transaction",
  "clarification",
  "vendor_history",
  "ledger_account",
  "rule",
  "law",
  "web",
] as const;

export type RationaleSourceKind = (typeof RATIONALE_SOURCE_KINDS)[number];

/**
 * Arten, die eine `id` (Mandanten-Entität) tragen müssen.
 *
 * `vendor_history` und `rule` stehen bewusst NICHT hier (Bugreport 2026-08-22
 * #14/R9): die Kreditorenhistorie ist eine Aggregation über viele Buchungen,
 * die `get_booking_context` als Liste liefert — es gibt keinen Datensatz, auf
 * den eine uuid zeigen könnte. Der B9-Guard nennt `vendor_history` gleichzeitig
 * als zulässige Quelle; die Quelle war damit für genau die Buchungen nicht
 * angebbar, die sich auf sie stützen. Wer den Partner benennen will, hängt
 * zusätzlich eine `ledger_account`-Quelle an.
 */
export const ID_SOURCE_KINDS = [
  "source_doc",
  "contract",
  "bank_transaction",
  "clarification",
  "ledger_account",
] as const satisfies readonly RationaleSourceKind[];

function isIdKind(kind: RationaleSourceKind): boolean {
  return (ID_SOURCE_KINDS as readonly string[]).includes(kind);
}

/**
 * Eine Begründungs-Quelle. Regeln:
 * - `*_id`-Arten (source_doc/contract/bank_transaction/clarification/
 *   vendor_history/rule) brauchen `id` (uuid); `contract.id` ist die
 *   `source_doc_id` des Vertrags.
 * - `law` braucht `citation`, `web` braucht `url`.
 * - `quote`/`citation` max 500 Zeichen.
 */
export const RationaleSourceSchema = z
  .object({
    kind: z.enum(RATIONALE_SOURCE_KINDS),
    id: z.string().uuid().optional(),
    url: z.string().url().max(2000).optional(),
    citation: z.string().trim().max(500).optional(),
    quote: z.string().trim().max(500).optional(),
  })
  .superRefine((v, ctx) => {
    if (isIdKind(v.kind) && !v.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id"],
        message: `Quelle '${v.kind}' braucht eine id.`,
      });
    }
    if (v.kind === "law" && !v.citation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["citation"],
        message: "Quelle 'law' braucht eine citation.",
      });
    }
    if (v.kind === "web" && !v.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["url"],
        message: "Quelle 'web' braucht eine url.",
      });
    }
  });

export type RationaleSource = z.infer<typeof RationaleSourceSchema>;

/** Bis zu 12 Quellen je Entscheidung — genug zum Belegen, ohne Wildwuchs. */
export const RationaleSourcesSchema = z.array(RationaleSourceSchema).max(12);
